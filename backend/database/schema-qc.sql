-- Quality Control (QC) Analytics Database Schema
-- ElevareIQ-MVP Platform
-- Tracks quality inspections, defects, NCRs, CAPAs, returns, and quality costs

-- Table 1: Quality Inspections
CREATE TABLE IF NOT EXISTS qc_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id TEXT UNIQUE NOT NULL,
    inspection_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    production_order_id INTEGER,
    inspector_id INTEGER,
    inspection_type TEXT NOT NULL, -- Incoming, In-Process, Final, Source
    lot_number TEXT,
    units_inspected INTEGER NOT NULL,
    units_passed INTEGER NOT NULL,
    units_failed INTEGER NOT NULL,
    sample_size INTEGER,
    inspection_level TEXT, -- Normal, Tightened, Reduced
    aql_target DECIMAL(5,2),
    actual_defect_rate DECIMAL(5,2),
    pass_fail_status TEXT, -- Pass, Fail, Conditional
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (inspector_id) REFERENCES employees(id)
);

-- Table 2: Defects and Non-Conformances
CREATE TABLE IF NOT EXISTS qc_defects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    defect_id TEXT UNIQUE NOT NULL,
    inspection_id INTEGER,
    defect_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    production_order_id INTEGER,
    part_number TEXT,
    lot_number TEXT,
    defect_type TEXT NOT NULL, -- Critical, Major, Minor
    defect_category TEXT, -- Dimensional, Visual, Functional, Material
    defect_description TEXT NOT NULL,
    quantity_affected INTEGER NOT NULL,
    root_cause TEXT,
    disposition TEXT, -- Scrap, Rework, Use-As-Is, Return to Supplier
    cost_impact DECIMAL(10,2),
    detected_by_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inspection_id) REFERENCES qc_inspections(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (detected_by_id) REFERENCES employees(id)
);

-- Table 3: Non-Conformance Reports (NCR)
CREATE TABLE IF NOT EXISTS qc_ncr (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ncr_id TEXT UNIQUE NOT NULL,
    ncr_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    reported_by_id INTEGER NOT NULL,
    ncr_type TEXT, -- Supplier, Internal, Customer
    severity TEXT, -- Critical, Major, Minor
    product_affected TEXT,
    quantity_affected INTEGER,
    description TEXT NOT NULL,
    root_cause_analysis TEXT,
    containment_action TEXT,
    assigned_to_id INTEGER,
    status TEXT DEFAULT 'Open', -- Open, Investigation, CAPA Required, Closed
    closure_date DATE,
    days_to_closure INTEGER,
    effectiveness_verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (reported_by_id) REFERENCES employees(id),
    FOREIGN KEY (assigned_to_id) REFERENCES employees(id)
);

-- Table 4: Corrective and Preventive Actions (CAPA)
CREATE TABLE IF NOT EXISTS qc_capa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    capa_id TEXT UNIQUE NOT NULL,
    ncr_id INTEGER,
    capa_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    capa_type TEXT NOT NULL, -- Corrective, Preventive
    priority TEXT, -- High, Medium, Low
    description TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    corrective_action TEXT NOT NULL,
    preventive_action TEXT,
    assigned_to_id INTEGER NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    status TEXT DEFAULT 'Open', -- Open, In Progress, Completed, Verified
    effectiveness_rating INTEGER, -- 1-5 scale
    verification_date DATE,
    verified_by_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ncr_id) REFERENCES qc_ncr(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (assigned_to_id) REFERENCES employees(id),
    FOREIGN KEY (verified_by_id) REFERENCES employees(id)
);

-- Table 5: Customer Returns and RMAs
CREATE TABLE IF NOT EXISTS qc_customer_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rma_number TEXT UNIQUE NOT NULL,
    return_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    lot_number TEXT,
    quantity_returned INTEGER NOT NULL,
    return_reason TEXT NOT NULL,
    failure_mode TEXT,
    root_cause TEXT,
    disposition TEXT, -- Credit, Replace, Repair, Reject
    credit_amount DECIMAL(10,2),
    ncr_created BOOLEAN DEFAULT 0,
    ncr_id INTEGER,
    warranty_claim BOOLEAN DEFAULT 0,
    processed_by_id INTEGER,
    resolution_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (ncr_id) REFERENCES qc_ncr(id),
    FOREIGN KEY (processed_by_id) REFERENCES employees(id)
);

-- Table 6: Supplier Quality Metrics
CREATE TABLE IF NOT EXISTS qc_supplier_quality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT UNIQUE NOT NULL,
    record_date DATE NOT NULL,
    vendor_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    receipt_id TEXT,
    part_number TEXT NOT NULL,
    lot_number TEXT,
    quantity_received INTEGER NOT NULL,
    quantity_inspected INTEGER NOT NULL,
    quantity_accepted INTEGER NOT NULL,
    quantity_rejected INTEGER NOT NULL,
    reject_reason TEXT,
    ppb_defects INTEGER, -- Parts Per Billion
    supplier_notification_sent BOOLEAN DEFAULT 0,
    corrective_action_required BOOLEAN DEFAULT 0,
    inspector_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (inspector_id) REFERENCES employees(id)
);

-- Table 7: Scrap Tracking
CREATE TABLE IF NOT EXISTS qc_scrap (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scrap_id TEXT UNIQUE NOT NULL,
    scrap_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    production_order_id INTEGER,
    part_number TEXT NOT NULL,
    lot_number TEXT,
    quantity_scrapped INTEGER NOT NULL,
    scrap_reason TEXT NOT NULL,
    scrap_category TEXT, -- Material, Process, Design, Handling
    material_cost DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    total_scrap_cost DECIMAL(10,2),
    responsible_department TEXT,
    ncr_created BOOLEAN DEFAULT 0,
    ncr_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (ncr_id) REFERENCES qc_ncr(id)
);

-- Table 8: Rework Tracking
CREATE TABLE IF NOT EXISTS qc_rework (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rework_id TEXT UNIQUE NOT NULL,
    rework_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    production_order_id INTEGER,
    part_number TEXT NOT NULL,
    lot_number TEXT,
    quantity_reworked INTEGER NOT NULL,
    original_defect TEXT NOT NULL,
    rework_operation TEXT NOT NULL,
    rework_hours DECIMAL(6,2),
    labor_cost DECIMAL(10,2),
    material_cost DECIMAL(10,2),
    total_rework_cost DECIMAL(10,2),
    rework_success BOOLEAN DEFAULT 1,
    performed_by_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (performed_by_id) REFERENCES employees(id)
);

-- Table 9: Quality Audits
CREATE TABLE IF NOT EXISTS qc_audits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_id TEXT UNIQUE NOT NULL,
    audit_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    audit_type TEXT NOT NULL, -- Internal, External, Supplier, Customer
    audit_scope TEXT, -- ISO 9001, AS9100, IATF 16949, Product Audit
    auditor_name TEXT NOT NULL,
    lead_auditor_id INTEGER,
    total_findings INTEGER NOT NULL,
    critical_findings INTEGER DEFAULT 0,
    major_findings INTEGER DEFAULT 0,
    minor_findings INTEGER DEFAULT 0,
    observations INTEGER DEFAULT 0,
    overall_score DECIMAL(5,2),
    pass_fail TEXT, -- Pass, Conditional Pass, Fail
    certification_status TEXT,
    next_audit_date DATE,
    report_issued_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (lead_auditor_id) REFERENCES employees(id)
);

-- Table 10: Measurement System Analysis (MSA)
CREATE TABLE IF NOT EXISTS qc_measurement_systems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    msa_id TEXT UNIQUE NOT NULL,
    study_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    equipment_name TEXT NOT NULL,
    measurement_type TEXT, -- Gage R&R, Linearity, Bias, Stability
    characteristic_measured TEXT NOT NULL,
    study_type TEXT, -- Crossed, Nested
    operators INTEGER,
    parts INTEGER,
    trials INTEGER,
    grr_percent DECIMAL(5,2), -- %GRR
    reproducibility_percent DECIMAL(5,2),
    repeatability_percent DECIMAL(5,2),
    pass_fail TEXT, -- Pass (<10%), Marginal (10-30%), Fail (>30%)
    calibration_due_date DATE,
    performed_by_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id),
    FOREIGN KEY (performed_by_id) REFERENCES employees(id)
);

-- Table 11: Cost of Quality (COQ) Tracking
CREATE TABLE IF NOT EXISTS qc_cost_of_quality (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT UNIQUE NOT NULL,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    cost_category TEXT NOT NULL, -- Prevention, Appraisal, Internal Failure, External Failure
    cost_subcategory TEXT,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    sales_period DECIMAL(12,2), -- Sales for the period
    copq_percentage DECIMAL(5,2), -- COQ as % of sales
    department TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Table 12: QC KPI Snapshots (historical tracking)
CREATE TABLE IF NOT EXISTS qc_kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    facility_id INTEGER,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(10,2) NOT NULL,
    target_value DECIMAL(10,2),
    benchmark_value DECIMAL(10,2),
    status TEXT, -- On-Target, Below-Target, Above-Target
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_qc_inspections_date ON qc_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_qc_inspections_facility ON qc_inspections(facility_id);
CREATE INDEX IF NOT EXISTS idx_qc_defects_date ON qc_defects(defect_date);
CREATE INDEX IF NOT EXISTS idx_qc_defects_type ON qc_defects(defect_type);
CREATE INDEX IF NOT EXISTS idx_qc_ncr_status ON qc_ncr(status);
CREATE INDEX IF NOT EXISTS idx_qc_ncr_date ON qc_ncr(ncr_date);
CREATE INDEX IF NOT EXISTS idx_qc_capa_status ON qc_capa(status);
CREATE INDEX IF NOT EXISTS idx_qc_capa_due ON qc_capa(due_date);
CREATE INDEX IF NOT EXISTS idx_qc_returns_date ON qc_customer_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_qc_supplier_date ON qc_supplier_quality(record_date);
CREATE INDEX IF NOT EXISTS idx_qc_scrap_date ON qc_scrap(scrap_date);
CREATE INDEX IF NOT EXISTS idx_qc_rework_date ON qc_rework(rework_date);
CREATE INDEX IF NOT EXISTS idx_qc_audits_date ON qc_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_qc_msa_date ON qc_measurement_systems(study_date);
CREATE INDEX IF NOT EXISTS idx_qc_coq_date ON qc_cost_of_quality(record_date);
CREATE INDEX IF NOT EXISTS idx_qc_coq_category ON qc_cost_of_quality(cost_category);
CREATE INDEX IF NOT EXISTS idx_qc_kpi_date ON qc_kpi_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_qc_kpi_name ON qc_kpi_snapshots(kpi_name);
