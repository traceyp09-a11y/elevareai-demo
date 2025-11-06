-- ElevareIQ-MVP Database Schema
-- Demo Company: TitanBuild Manufacturing & Logistics

-- Company Information
CREATE TABLE IF NOT EXISTS company (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    founded_year INTEGER,
    headquarters TEXT,
    num_facilities INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Facilities/Locations
CREATE TABLE IF NOT EXISTS facilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Manufacturing, Logistics, Construction, Office
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    employee_count INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    hire_date DATE NOT NULL,
    termination_date DATE,
    status TEXT DEFAULT 'Active', -- Active, Terminated, On Leave
    department TEXT NOT NULL,
    job_title TEXT NOT NULL,
    job_level TEXT NOT NULL, -- Entry, Mid, Senior, Manager, Director, VP
    facility_id INTEGER,
    manager_id INTEGER,
    base_salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    employment_type TEXT, -- Full-time, Part-time, Contract
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- Recruitment Pipeline
CREATE TABLE IF NOT EXISTS job_postings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    facility_id INTEGER,
    job_level TEXT,
    posted_date DATE NOT NULL,
    filled_date DATE,
    status TEXT DEFAULT 'Open', -- Open, Filled, Cancelled
    num_applicants INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Candidates and Offers
CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id TEXT UNIQUE NOT NULL,
    job_posting_id INTEGER NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    applied_date DATE NOT NULL,
    interview_date DATE,
    offer_date DATE,
    offer_accepted BOOLEAN,
    offer_declined_reason TEXT,
    start_date DATE,
    recruited_employee_id INTEGER, -- Links to employees table if hired
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id),
    FOREIGN KEY (recruited_employee_id) REFERENCES employees(id)
);

-- Turnover/Separations
CREATE TABLE IF NOT EXISTS separations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    separation_date DATE NOT NULL,
    separation_type TEXT NOT NULL, -- Voluntary, Involuntary, Retirement, Layoff
    reason TEXT,
    department TEXT,
    job_level TEXT,
    tenure_years DECIMAL(4,2),
    exit_interview_completed BOOLEAN DEFAULT 0,
    rehire_eligible BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Attendance/Absences
CREATE TABLE IF NOT EXISTS absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    absence_date DATE NOT NULL,
    absence_type TEXT NOT NULL, -- Sick, Personal, NCNS (No Call No Show), FMLA
    hours_missed DECIMAL(5,2),
    approved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Safety Incidents
CREATE TABLE IF NOT EXISTS safety_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT UNIQUE NOT NULL,
    incident_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    employee_id INTEGER,
    incident_type TEXT NOT NULL, -- First Aid, Medical Treatment, Lost Time, Restricted Work, Fatality
    severity TEXT, -- Minor, Moderate, Severe, Critical
    description TEXT,
    recordable BOOLEAN DEFAULT 1, -- OSHA recordable
    lost_work_days INTEGER DEFAULT 0,
    direct_cost DECIMAL(10,2),
    estimated_indirect_cost DECIMAL(10,2),
    investigation_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Training Programs
CREATE TABLE IF NOT EXISTS training_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Safety, Technical, Leadership, Compliance
    duration_hours DECIMAL(5,2),
    cost_per_employee DECIMAL(8,2),
    provider TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Training Enrollments
CREATE TABLE IF NOT EXISTS training_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    enrollment_date DATE NOT NULL,
    completion_date DATE,
    status TEXT DEFAULT 'Enrolled', -- Enrolled, In Progress, Completed, Failed
    pre_assessment_score DECIMAL(5,2),
    post_assessment_score DECIMAL(5,2),
    certification_earned BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (program_id) REFERENCES training_programs(id)
);

-- Employee Engagement Surveys
CREATE TABLE IF NOT EXISTS engagement_surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id TEXT UNIQUE NOT NULL,
    survey_name TEXT NOT NULL,
    survey_date DATE NOT NULL,
    total_employees INTEGER,
    responses_received INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    response_date DATE NOT NULL,
    job_satisfaction_score INTEGER, -- 1-5 scale per category (5 questions each)
    manager_effectiveness_score INTEGER,
    career_growth_score INTEGER,
    company_culture_score INTEGER,
    work_life_balance_score INTEGER,
    total_score INTEGER,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES engagement_surveys(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    review_period TEXT, -- Q1 2024, Annual 2024, etc.
    review_date DATE NOT NULL,
    reviewer_id INTEGER,
    overall_rating DECIMAL(3,2), -- 1.0 to 5.0 scale
    productivity_rating DECIMAL(3,2),
    quality_rating DECIMAL(3,2),
    teamwork_rating DECIMAL(3,2),
    leadership_rating DECIMAL(3,2),
    promotion_recommended BOOLEAN DEFAULT 0,
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (reviewer_id) REFERENCES employees(id)
);

-- Labor Hours Tracking
CREATE TABLE IF NOT EXISTS labor_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    regular_hours DECIMAL(10,2),
    overtime_hours DECIMAL(10,2),
    total_hours DECIMAL(10,2),
    num_employees INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Production/Output Data
CREATE TABLE IF NOT EXISTS production_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    units_produced INTEGER,
    defect_count INTEGER,
    rework_count INTEGER,
    labor_hours DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Financial Data
CREATE TABLE IF NOT EXISTS financial_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fiscal_period TEXT NOT NULL, -- 2024-Q1, 2024-Q2, etc.
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(15,2),
    operating_income DECIMAL(15,2),
    total_labor_costs DECIMAL(15,2),
    recruitment_costs DECIMAL(10,2),
    training_costs DECIMAL(10,2),
    benefits_costs DECIMAL(15,2),
    safety_costs DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- HR Budget
CREATE TABLE IF NOT EXISTS hr_budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fiscal_year INTEGER NOT NULL,
    category TEXT NOT NULL, -- Recruitment, Training, Benefits, Compensation, Technology
    budgeted_amount DECIMAL(12,2),
    actual_spend DECIMAL(12,2),
    variance DECIMAL(12,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- KPI Snapshots (Pre-calculated for performance)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(12,4),
    calculation_details TEXT, -- JSON string with calculation breakdown
    benchmark_value DECIMAL(12,4),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, kpi_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_separations_date ON separations(separation_date);
CREATE INDEX IF NOT EXISTS idx_absences_date ON absences(absence_date);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON safety_incidents(incident_date);
CREATE INDEX IF NOT EXISTS idx_candidates_applied ON candidates(applied_date);
CREATE INDEX IF NOT EXISTS idx_labor_hours_date ON labor_hours(record_date);
CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_date ON kpi_snapshots(snapshot_date);
