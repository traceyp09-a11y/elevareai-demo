-- ElevareIQ-MVP Operations Module
-- Additional tables for comprehensive Operations analytics

-- Production Orders
CREATE TABLE IF NOT EXISTS ops_production_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    facility_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    quantity_ordered INTEGER NOT NULL,
    quantity_produced INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed, Cancelled
    priority TEXT, -- Low, Medium, High, Urgent
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Equipment/Machinery
CREATE TABLE IF NOT EXISTS ops_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_id TEXT UNIQUE NOT NULL,
    equipment_name TEXT NOT NULL,
    facility_id INTEGER NOT NULL,
    equipment_type TEXT, -- CNC, Press, Conveyor, Forklift, etc.
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    status TEXT DEFAULT 'Operational', -- Operational, Down, Maintenance, Retired
    oee_target DECIMAL(5,2) DEFAULT 85.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Equipment Downtime Tracking
CREATE TABLE IF NOT EXISTS ops_downtime (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    downtime_id TEXT UNIQUE NOT NULL,
    equipment_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    downtime_type TEXT NOT NULL, -- Breakdown, Planned Maintenance, Changeover, No Demand
    reason TEXT,
    impact_hours DECIMAL(6,2),
    production_loss_units INTEGER,
    resolved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES ops_equipment(id)
);

-- Quality Inspections
CREATE TABLE IF NOT EXISTS ops_quality_inspections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id TEXT UNIQUE NOT NULL,
    production_order_id INTEGER NOT NULL,
    inspection_date DATE NOT NULL,
    inspector_id INTEGER,
    units_inspected INTEGER NOT NULL,
    units_passed INTEGER NOT NULL,
    units_failed INTEGER NOT NULL,
    defect_types TEXT, -- JSON list of defect types
    corrective_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_order_id) REFERENCES ops_production_orders(id),
    FOREIGN KEY (inspector_id) REFERENCES employees(id)
);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS ops_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT UNIQUE NOT NULL,
    facility_id INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    item_category TEXT, -- Raw Material, WIP, Finished Goods, MRO
    transaction_type TEXT NOT NULL, -- Receipt, Issue, Transfer, Adjustment, Count
    transaction_date DATE NOT NULL,
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    balance_after DECIMAL(12,2),
    supplier_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Shipments and Deliveries
CREATE TABLE IF NOT EXISTS ops_shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id TEXT UNIQUE NOT NULL,
    facility_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    promised_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    shipment_status TEXT DEFAULT 'Pending', -- Pending, Shipped, In Transit, Delivered, Delayed
    units_ordered INTEGER NOT NULL,
    units_shipped INTEGER NOT NULL,
    on_time BOOLEAN,
    carrier TEXT,
    tracking_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Vendor/Supplier Performance
CREATE TABLE IF NOT EXISTS ops_vendors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id TEXT UNIQUE NOT NULL,
    vendor_name TEXT NOT NULL,
    vendor_category TEXT, -- Raw Materials, Components, Services, Equipment
    contact_email TEXT,
    contact_phone TEXT,
    rating DECIMAL(3,2) DEFAULT 3.0, -- 1-5 scale
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ops_vendor_deliveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id TEXT UNIQUE NOT NULL,
    vendor_id INTEGER NOT NULL,
    facility_id INTEGER NOT NULL,
    po_number TEXT,
    order_date DATE NOT NULL,
    expected_date DATE NOT NULL,
    actual_delivery_date DATE,
    on_time BOOLEAN,
    quality_rating DECIMAL(3,2), -- 1-5 scale
    units_ordered INTEGER NOT NULL,
    units_received INTEGER NOT NULL,
    units_rejected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES ops_vendors(id),
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Work Orders and Maintenance
CREATE TABLE IF NOT EXISTS ops_work_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_order_id TEXT UNIQUE NOT NULL,
    equipment_id INTEGER NOT NULL,
    work_order_type TEXT NOT NULL, -- Preventive, Corrective, Predictive, Emergency
    created_date DATE NOT NULL,
    scheduled_date DATE,
    completion_date DATE,
    status TEXT DEFAULT 'Open', -- Open, In Progress, Completed, Cancelled
    technician_id INTEGER,
    labor_hours DECIMAL(6,2),
    parts_cost DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    priority TEXT, -- Low, Medium, High, Critical
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES ops_equipment(id),
    FOREIGN KEY (technician_id) REFERENCES employees(id)
);

-- Cycle Time Tracking
CREATE TABLE IF NOT EXISTS ops_cycle_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    product_category TEXT,
    avg_cycle_time_hours DECIMAL(6,2) NOT NULL,
    target_cycle_time_hours DECIMAL(6,2),
    orders_completed INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Capacity Utilization
CREATE TABLE IF NOT EXISTS ops_capacity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date DATE NOT NULL,
    facility_id INTEGER NOT NULL,
    department TEXT,
    available_hours DECIMAL(10,2) NOT NULL,
    used_hours DECIMAL(10,2) NOT NULL,
    utilization_percent DECIMAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Operations KPI Snapshots
CREATE TABLE IF NOT EXISTS ops_kpi_snapshots (
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
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON ops_production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_date ON ops_production_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON ops_equipment(status);
CREATE INDEX IF NOT EXISTS idx_downtime_equipment ON ops_downtime(equipment_id);
CREATE INDEX IF NOT EXISTS idx_downtime_dates ON ops_downtime(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_quality_date ON ops_quality_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON ops_inventory(transaction_date);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON ops_inventory(item_category);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON ops_shipments(shipment_status);
CREATE INDEX IF NOT EXISTS idx_shipments_delivery ON ops_shipments(actual_delivery_date);
CREATE INDEX IF NOT EXISTS idx_vendor_deliveries_date ON ops_vendor_deliveries(actual_delivery_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON ops_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_capacity_date ON ops_capacity(record_date);
CREATE INDEX IF NOT EXISTS idx_ops_kpi_snapshots_date ON ops_kpi_snapshots(snapshot_date);
