-- Administration Module Database Schema
-- Comprehensive IT/Admin data for 10 key administration KPIs
-- Created: 2025-11-09

-- ===========================================
-- 1. IT SYSTEM UPTIME/AVAILABILITY
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_system_uptime (
    uptime_id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_name TEXT NOT NULL,
    date TEXT NOT NULL,
    total_minutes INTEGER NOT NULL,
    downtime_minutes INTEGER DEFAULT 0,
    uptime_percentage REAL NOT NULL,
    incidents INTEGER DEFAULT 0,
    category TEXT, -- Infrastructure, Application, Network, Database
    criticality TEXT, -- Critical, High, Medium, Low
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_uptime_date ON admin_system_uptime(date);
CREATE INDEX idx_admin_uptime_system ON admin_system_uptime(system_name);

-- ===========================================
-- 2. HELP DESK TICKETS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_helpdesk_tickets (
    ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_number TEXT NOT NULL UNIQUE,
    created_date TEXT NOT NULL,
    resolved_date TEXT,
    category TEXT NOT NULL, -- Hardware, Software, Network, Access, Other
    priority TEXT NOT NULL, -- Critical, High, Medium, Low
    status TEXT NOT NULL, -- Open, In Progress, Resolved, Closed
    resolution_time_minutes INTEGER,
    first_response_time_minutes INTEGER,
    employee_id TEXT,
    department TEXT,
    assigned_to TEXT,
    satisfaction_rating INTEGER, -- 1-5
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_tickets_date ON admin_helpdesk_tickets(created_date);
CREATE INDEX idx_admin_tickets_status ON admin_helpdesk_tickets(status);
CREATE INDEX idx_admin_tickets_priority ON admin_helpdesk_tickets(priority);

-- ===========================================
-- 3. IT COSTS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_it_costs (
    cost_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    cost_category TEXT NOT NULL, -- Hardware, Software, Personnel, Cloud, Network, Security
    cost_subcategory TEXT,
    amount REAL NOT NULL,
    vendor TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    department TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_costs_period ON admin_it_costs(period);
CREATE INDEX idx_admin_costs_category ON admin_it_costs(cost_category);

-- ===========================================
-- 4. CYBERSECURITY INCIDENTS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_security_incidents (
    incident_id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_date TEXT NOT NULL,
    incident_type TEXT NOT NULL, -- Malware, Phishing, Unauthorized Access, Data Breach, DDoS, Other
    severity TEXT NOT NULL, -- Critical, High, Medium, Low
    status TEXT NOT NULL, -- Detected, Investigating, Contained, Resolved
    affected_systems INTEGER DEFAULT 0,
    affected_users INTEGER DEFAULT 0,
    resolution_time_hours REAL,
    cost_impact REAL DEFAULT 0,
    data_compromised BOOLEAN DEFAULT 0,
    reported_to_authorities BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_security_date ON admin_security_incidents(incident_date);
CREATE INDEX idx_admin_security_type ON admin_security_incidents(incident_type);

-- ===========================================
-- 5. SOFTWARE LICENSES
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_software_licenses (
    license_id INTEGER PRIMARY KEY AUTOINCREMENT,
    software_name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    license_type TEXT, -- Per User, Per Device, Enterprise, Subscription
    total_licenses INTEGER NOT NULL,
    licenses_in_use INTEGER NOT NULL,
    cost_per_license REAL,
    annual_cost REAL,
    renewal_date TEXT,
    category TEXT, -- Productivity, Development, Security, Database, Other
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_licenses_software ON admin_software_licenses(software_name);

-- ===========================================
-- 6. DATA BACKUPS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_data_backups (
    backup_id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_date TEXT NOT NULL,
    backup_type TEXT NOT NULL, -- Full, Incremental, Differential
    system_name TEXT NOT NULL,
    data_size_gb REAL NOT NULL,
    duration_minutes INTEGER,
    status TEXT NOT NULL, -- Success, Failed, Partial
    error_message TEXT,
    retention_days INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_backups_date ON admin_data_backups(backup_date);
CREATE INDEX idx_admin_backups_status ON admin_data_backups(status);

-- ===========================================
-- 7. IT PROJECTS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_it_projects (
    project_id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    start_date TEXT NOT NULL,
    planned_end_date TEXT NOT NULL,
    actual_end_date TEXT,
    status TEXT NOT NULL, -- Planning, In Progress, Completed, On Hold, Cancelled
    budget REAL,
    actual_cost REAL,
    project_manager TEXT,
    department TEXT,
    priority TEXT, -- Critical, High, Medium, Low
    completion_percentage INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_projects_status ON admin_it_projects(status);
CREATE INDEX idx_admin_projects_dates ON admin_it_projects(planned_end_date);

-- ===========================================
-- 8. EMPLOYEE IT SATISFACTION
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_employee_satisfaction (
    survey_id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_date TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    department TEXT,
    overall_satisfaction INTEGER, -- 1-5 scale
    system_performance_rating INTEGER,
    support_quality_rating INTEGER,
    tool_availability_rating INTEGER,
    comments TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_satisfaction_date ON admin_employee_satisfaction(survey_date);

-- ===========================================
-- 9. INFRASTRUCTURE CAPACITY
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_infrastructure_capacity (
    capacity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    measurement_date TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- Server CPU, Memory, Storage, Network Bandwidth
    resource_name TEXT NOT NULL,
    total_capacity REAL NOT NULL,
    used_capacity REAL NOT NULL,
    utilization_percentage REAL NOT NULL,
    unit TEXT, -- %, GB, Mbps, etc.
    threshold_warning REAL,
    threshold_critical REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_capacity_date ON admin_infrastructure_capacity(measurement_date);
CREATE INDEX idx_admin_capacity_type ON admin_infrastructure_capacity(resource_type);

-- ===========================================
-- 10. IT ASSETS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_it_assets (
    asset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_tag TEXT NOT NULL UNIQUE,
    asset_type TEXT NOT NULL, -- Laptop, Desktop, Server, Mobile, Network Device, Other
    make TEXT,
    model TEXT,
    serial_number TEXT,
    purchase_date TEXT,
    purchase_cost REAL,
    assigned_to TEXT,
    department TEXT,
    status TEXT, -- In Use, Available, Maintenance, Retired
    warranty_expiry TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_assets_type ON admin_it_assets(asset_type);
CREATE INDEX idx_admin_assets_status ON admin_it_assets(status);

-- ===========================================
-- 11. KPI SNAPSHOTS
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_kpi_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_value REAL NOT NULL,
    benchmark_value REAL,
    status TEXT, -- Excellent, Good, Warning, Critical
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_kpi_date ON admin_kpi_snapshots(snapshot_date);
CREATE INDEX idx_admin_kpi_name ON admin_kpi_snapshots(kpi_name);

-- ===========================================
-- 12. EMPLOYEE HEADCOUNT (for per-employee calculations)
-- ===========================================
CREATE TABLE IF NOT EXISTS admin_employee_count (
    count_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    total_employees INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_empcount_period ON admin_employee_count(period);
