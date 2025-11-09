-- =====================================================
-- CUSTOMER SUCCESS & EXPERIENCE MODULE - DATABASE SCHEMA
-- =====================================================
-- Purpose: Track customer health, satisfaction, retention, and expansion
-- Created: 2024-11-09

-- Customers (Accounts)
CREATE TABLE IF NOT EXISTS cs_customers (
    customer_id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    industry TEXT,
    company_size TEXT, -- SMB, Mid-Market, Enterprise
    signup_date TEXT NOT NULL,
    contract_start_date TEXT,
    contract_end_date TEXT,
    contract_value_annual REAL,
    mrr REAL,
    arr REAL,
    account_status TEXT, -- Active, At Risk, Churned, Expansion
    csm_id TEXT,
    health_score INTEGER, -- 0-100
    last_health_update TEXT
);

CREATE INDEX IF NOT EXISTS idx_customers_status ON cs_customers(account_status);
CREATE INDEX IF NOT EXISTS idx_customers_csm ON cs_customers(csm_id);
CREATE INDEX IF NOT EXISTS idx_customers_health ON cs_customers(health_score);

-- Customer Success Managers
CREATE TABLE IF NOT EXISTS cs_managers (
    csm_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    region TEXT,
    max_accounts INTEGER,
    current_accounts INTEGER,
    is_active INTEGER DEFAULT 1
);

-- NPS Surveys
CREATE TABLE IF NOT EXISTS cs_nps_surveys (
    survey_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    survey_date TEXT NOT NULL,
    nps_score INTEGER, -- 0-10
    nps_category TEXT, -- Detractor (0-6), Passive (7-8), Promoter (9-10)
    feedback_text TEXT,
    follow_up_completed INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_nps_date ON cs_nps_surveys(survey_date);
CREATE INDEX IF NOT EXISTS idx_nps_customer ON cs_nps_surveys(customer_id);

-- CSAT Surveys
CREATE TABLE IF NOT EXISTS cs_csat_surveys (
    survey_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    survey_date TEXT NOT NULL,
    interaction_type TEXT, -- Support Ticket, Onboarding, QBR, Feature Release
    csat_score INTEGER, -- 1-5
    feedback_text TEXT,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_csat_date ON cs_csat_surveys(survey_date);

-- CES (Customer Effort Score) Surveys
CREATE TABLE IF NOT EXISTS cs_ces_surveys (
    survey_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    survey_date TEXT NOT NULL,
    interaction_type TEXT, -- Support, Onboarding, Setup, Training
    ces_score INTEGER, -- 1-7 (1=Very Difficult, 7=Very Easy)
    feedback_text TEXT,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_ces_date ON cs_ces_surveys(survey_date);

-- Support Tickets
CREATE TABLE IF NOT EXISTS cs_support_tickets (
    ticket_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    created_date TEXT NOT NULL,
    resolved_date TEXT,
    priority TEXT, -- Low, Medium, High, Critical
    category TEXT, -- Bug, Feature Request, Question, Training
    status TEXT, -- Open, In Progress, Resolved, Closed
    first_response_time_hours REAL,
    resolution_time_hours REAL,
    csat_score INTEGER, -- Post-resolution CSAT
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_customer ON cs_support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON cs_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON cs_support_tickets(created_date);

-- Product Usage/Adoption
CREATE TABLE IF NOT EXISTS cs_product_usage (
    usage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    usage_date TEXT NOT NULL,
    daily_active_users INTEGER,
    weekly_active_users INTEGER,
    monthly_active_users INTEGER,
    feature_adoption_score REAL, -- 0-100
    login_frequency REAL, -- Logins per user per week
    time_in_product_minutes REAL,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_usage_customer_date ON cs_product_usage(customer_id, usage_date);

-- Customer Onboarding
CREATE TABLE IF NOT EXISTS cs_onboarding (
    onboarding_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    target_completion_date TEXT,
    actual_completion_date TEXT,
    time_to_first_value_days INTEGER,
    onboarding_status TEXT, -- In Progress, Completed, Stalled
    completion_percentage INTEGER,
    kickoff_completed INTEGER DEFAULT 0,
    training_completed INTEGER DEFAULT 0,
    first_use_case_live INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_customer ON cs_onboarding(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON cs_onboarding(onboarding_status);

-- Expansion Opportunities
CREATE TABLE IF NOT EXISTS cs_expansion_opps (
    expansion_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    identified_date TEXT NOT NULL,
    expansion_type TEXT, -- Upsell, Cross-sell, Additional Users
    estimated_arr_increase REAL,
    stage TEXT, -- Identified, Qualified, Proposal, Closed Won, Closed Lost
    probability INTEGER, -- 0-100
    expected_close_date TEXT,
    actual_close_date TEXT,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_expansion_customer ON cs_expansion_opps(customer_id);
CREATE INDEX IF NOT EXISTS idx_expansion_stage ON cs_expansion_opps(stage);

-- Churn Events
CREATE TABLE IF NOT EXISTS cs_churn_events (
    churn_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    churn_date TEXT NOT NULL,
    churn_reason TEXT,
    churn_category TEXT, -- Price, Product, Support, Competition, Business Closure
    arr_lost REAL,
    mrr_lost REAL,
    preventable INTEGER, -- 0=No, 1=Yes
    exit_interview_completed INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_churn_date ON cs_churn_events(churn_date);
CREATE INDEX IF NOT EXISTS idx_churn_reason ON cs_churn_events(churn_category);

-- Customer Health Score History
CREATE TABLE IF NOT EXISTS cs_health_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL,
    assessment_date TEXT NOT NULL,
    health_score INTEGER, -- 0-100
    usage_score INTEGER, -- 0-100
    engagement_score INTEGER, -- 0-100
    support_score INTEGER, -- 0-100
    adoption_score INTEGER, -- 0-100
    risk_factors TEXT, -- JSON array of risk indicators
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_health_history_customer ON cs_health_history(customer_id, assessment_date);

-- Quarterly Business Reviews (QBRs)
CREATE TABLE IF NOT EXISTS cs_qbrs (
    qbr_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    qbr_date TEXT NOT NULL,
    quarter TEXT, -- Q1 2024, Q2 2024, etc.
    attendees_count INTEGER,
    executive_sponsor_present INTEGER DEFAULT 0,
    success_plan_created INTEGER DEFAULT 0,
    action_items_count INTEGER,
    satisfaction_rating INTEGER, -- 1-5
    renewal_risk_discussed INTEGER DEFAULT 0,
    expansion_discussed INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES cs_customers(customer_id)
);

CREATE INDEX IF NOT EXISTS idx_qbr_customer ON cs_qbrs(customer_id);
CREATE INDEX IF NOT EXISTS idx_qbr_date ON cs_qbrs(qbr_date);

-- Customer Success KPI Snapshots
CREATE TABLE IF NOT EXISTS cs_kpi_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    nps_score REAL,
    csat_score REAL,
    ces_score REAL,
    churn_rate REAL,
    customer_ltv REAL,
    net_revenue_retention REAL,
    avg_health_score REAL,
    time_to_first_value_days REAL,
    product_adoption_rate REAL,
    avg_ticket_resolution_hours REAL
);

CREATE INDEX IF NOT EXISTS idx_cs_kpi_snapshots_date ON cs_kpi_snapshots(snapshot_date);
