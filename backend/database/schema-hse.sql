-- ElevareIQ-MVP HSE (Health, Safety & Environment) Module
-- Additional tables for comprehensive HSE analytics

-- Near Miss Reports
CREATE TABLE IF NOT EXISTS hse_near_misses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    near_miss_id TEXT UNIQUE NOT NULL,
    report_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    reported_by_employee_id INTEGER,
    description TEXT NOT NULL,
    potential_severity TEXT, -- Minor, Moderate, Severe, Critical
    hazard_type TEXT, -- Slip/Trip, Fall from Height, Struck By, Chemical, Electrical, etc.
    corrective_action TEXT,
    action_completed BOOLEAN DEFAULT 0,
    action_completion_date DATE,
    investigation_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (reported_by_employee_id) REFERENCES employees(id)
);

-- PPE (Personal Protective Equipment) Compliance Audits
CREATE TABLE IF NOT EXISTS hse_ppe_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT UNIQUE NOT NULL,
    audit_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    auditor_id INTEGER,
    total_employees_observed INTEGER NOT NULL,
    compliant_employees INTEGER NOT NULL,
    non_compliant_employees INTEGER NOT NULL,
    ppe_type TEXT, -- Hard Hat, Safety Glasses, Gloves, Hearing Protection, Respirator, etc.
    violations_noted TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (auditor_id) REFERENCES employees(id)
);

-- Environmental Compliance Tracking
CREATE TABLE IF NOT EXISTS hse_environmental_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    metric_type TEXT NOT NULL, -- Emissions, Waste, Water Usage, Energy Consumption, etc.
    metric_value DECIMAL(12,4),
    unit_of_measure TEXT, -- kg, tons, gallons, kWh, etc.
    regulatory_limit DECIMAL(12,4),
    compliant BOOLEAN DEFAULT 1,
    violation_notes TEXT,
    corrective_action TEXT,
    action_completion_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Safety Audits and Inspections
CREATE TABLE IF NOT EXISTS hse_safety_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT UNIQUE NOT NULL,
    audit_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    audit_type TEXT NOT NULL, -- Internal, External, Regulatory, OSHA
    auditor_name TEXT,
    auditor_organization TEXT,
    areas_inspected TEXT, -- JSON list of areas
    total_items_checked INTEGER NOT NULL,
    items_passed INTEGER NOT NULL,
    items_failed INTEGER NOT NULL,
    critical_findings INTEGER DEFAULT 0,
    overall_score DECIMAL(5,2), -- Percentage
    findings_summary TEXT,
    corrective_actions_required INTEGER DEFAULT 0,
    report_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Incident Investigations (extends safety_incidents)
CREATE TABLE IF NOT EXISTS hse_incident_investigations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    investigation_opened_date DATE NOT NULL,
    investigation_closed_date DATE,
    investigation_status TEXT DEFAULT 'Open', -- Open, In Progress, Closed
    lead_investigator_id INTEGER,
    team_members TEXT, -- JSON list of employee IDs
    root_cause TEXT,
    contributing_factors TEXT,
    corrective_actions TEXT,
    preventive_actions TEXT,
    target_completion_date DATE,
    actual_completion_date DATE,
    follow_up_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES safety_incidents(id),
    FOREIGN KEY (lead_investigator_id) REFERENCES employees(id)
);

-- Hazard Identification and Reporting
CREATE TABLE IF NOT EXISTS hse_hazard_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hazard_id TEXT UNIQUE NOT NULL,
    report_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    reported_by_employee_id INTEGER,
    hazard_type TEXT, -- Physical, Chemical, Biological, Ergonomic, Psychosocial
    hazard_category TEXT, -- Slip/Trip, Fall from Height, Struck By, Chemical, Electrical, etc.
    location_description TEXT,
    severity_level TEXT, -- Low, Medium, High, Critical
    probability TEXT, -- Rare, Unlikely, Possible, Likely, Almost Certain
    risk_rating INTEGER, -- Calculated from severity x probability (1-25 scale)
    description TEXT,
    photos_attached BOOLEAN DEFAULT 0,
    immediate_action_taken TEXT,
    status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
    resolution_date DATE,
    corrective_action TEXT,
    preventive_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (reported_by_employee_id) REFERENCES employees(id)
);

-- Emergency Preparedness (Drills and Readiness)
CREATE TABLE IF NOT EXISTS hse_emergency_drills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drill_id TEXT UNIQUE NOT NULL,
    drill_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    drill_type TEXT NOT NULL, -- Fire, Evacuation, Chemical Spill, Medical Emergency, Natural Disaster
    planned_or_unannounced TEXT DEFAULT 'Planned', -- Planned, Unannounced
    participants_expected INTEGER,
    participants_actual INTEGER,
    duration_minutes INTEGER,
    evacuation_time_minutes DECIMAL(5,2),
    target_evacuation_time DECIMAL(5,2),
    drill_coordinator_id INTEGER,
    performance_rating TEXT, -- Excellent, Good, Satisfactory, Needs Improvement
    issues_identified TEXT,
    strengths_identified TEXT,
    corrective_actions TEXT,
    next_drill_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (drill_coordinator_id) REFERENCES employees(id)
);

-- Safety Training Certifications (extends training_enrollments)
CREATE TABLE IF NOT EXISTS hse_safety_certifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    certification_type TEXT NOT NULL, -- OSHA 10, OSHA 30, First Aid, CPR, Forklift, etc.
    certification_number TEXT,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    status TEXT DEFAULT 'Active', -- Active, Expired, Pending Renewal
    issuing_organization TEXT,
    renewal_required BOOLEAN DEFAULT 1,
    renewal_notified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Safety Observations (Positive & Negative)
CREATE TABLE IF NOT EXISTS hse_safety_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    observation_id TEXT UNIQUE NOT NULL,
    observation_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    observer_id INTEGER,
    observation_type TEXT, -- Safe Behavior, At-Risk Behavior, Safe Condition, At-Risk Condition
    severity TEXT, -- Low, Medium, High
    description TEXT,
    employee_involved_id INTEGER,
    immediate_action TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    closed_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (observer_id) REFERENCES employees(id),
    FOREIGN KEY (employee_involved_id) REFERENCES employees(id)
);

-- Chemical Inventory and SDS Management
CREATE TABLE IF NOT EXISTS hse_chemical_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chemical_id TEXT UNIQUE NOT NULL,
    facility_id INTEGER NOT NULL,
    chemical_name TEXT NOT NULL,
    cas_number TEXT,
    manufacturer TEXT,
    quantity_on_hand DECIMAL(10,2),
    unit_of_measure TEXT,
    storage_location TEXT,
    hazard_class TEXT, -- Flammable, Corrosive, Toxic, etc.
    sds_on_file BOOLEAN DEFAULT 0,
    sds_last_updated DATE,
    expiration_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- HSE KPI Snapshots (specific to HSE metrics)
CREATE TABLE IF NOT EXISTS hse_kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    facility_id INTEGER,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(12,4),
    calculation_details TEXT, -- JSON string with calculation breakdown
    benchmark_value DECIMAL(12,4),
    target_value DECIMAL(12,4),
    status TEXT, -- On Target, Warning, Critical
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    UNIQUE(snapshot_date, facility_id, kpi_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_near_misses_date ON hse_near_misses(report_date);
CREATE INDEX IF NOT EXISTS idx_near_misses_facility ON hse_near_misses(facility_id);
CREATE INDEX IF NOT EXISTS idx_ppe_audits_date ON hse_ppe_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_ppe_audits_facility ON hse_ppe_audits(facility_id);
CREATE INDEX IF NOT EXISTS idx_env_metrics_date ON hse_environmental_metrics(record_date);
CREATE INDEX IF NOT EXISTS idx_env_metrics_facility ON hse_environmental_metrics(facility_id);
CREATE INDEX IF NOT EXISTS idx_safety_audits_date ON hse_safety_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_safety_audits_facility ON hse_safety_audits(facility_id);
CREATE INDEX IF NOT EXISTS idx_incident_investigations_status ON hse_incident_investigations(investigation_status);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_date ON hse_hazard_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_hazard_reports_status ON hse_hazard_reports(status);
CREATE INDEX IF NOT EXISTS idx_emergency_drills_date ON hse_emergency_drills(drill_date);
CREATE INDEX IF NOT EXISTS idx_safety_certs_expiration ON hse_safety_certifications(expiration_date);
CREATE INDEX IF NOT EXISTS idx_safety_obs_date ON hse_safety_observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_hse_kpi_snapshots_date ON hse_kpi_snapshots(snapshot_date);
