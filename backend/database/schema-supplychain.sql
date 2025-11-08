-- Supply Chain Analytics Schema
-- Tables for tracking procurement, logistics, inventory, and supply chain performance

-- ========== Orders & Fulfillment ==========

CREATE TABLE IF NOT EXISTS sc_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,
    order_type TEXT NOT NULL, -- 'Purchase Order', 'Sales Order'
    order_date DATE NOT NULL,
    requested_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    customer_id INTEGER,
    supplier_id INTEGER,
    total_value DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT NOT NULL, -- 'Pending', 'Confirmed', 'In Transit', 'Delivered', 'Cancelled'
    priority TEXT, -- 'Normal', 'Rush', 'Critical'
    delivery_location TEXT,
    on_time INTEGER DEFAULT 0, -- Boolean: 1 if delivered on/before requested date
    in_full INTEGER DEFAULT 0, -- Boolean: 1 if complete order delivered
    accurate INTEGER DEFAULT 1, -- Boolean: 1 if order correct (no errors)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sc_order_lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    line_number INTEGER NOT NULL,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity_ordered INTEGER NOT NULL,
    quantity_delivered INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES sc_orders(order_id)
);

-- ========== Shipments & Transportation ==========

CREATE TABLE IF NOT EXISTS sc_shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_id TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    carrier TEXT NOT NULL,
    tracking_number TEXT,
    ship_date DATE NOT NULL,
    estimated_delivery_date DATE NOT NULL,
    actual_delivery_date DATE,
    origin_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    weight_kg DECIMAL(10,2),
    freight_cost DECIMAL(10,2) NOT NULL,
    shipment_mode TEXT, -- 'Air', 'Ocean', 'Ground', 'Rail'
    on_time INTEGER DEFAULT 0,
    damaged INTEGER DEFAULT 0,
    status TEXT DEFAULT 'In Transit',
    FOREIGN KEY (order_id) REFERENCES sc_orders(order_id)
);

-- ========== Inventory Management ==========

CREATE TABLE IF NOT EXISTS sc_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT NOT NULL,
    product_name TEXT NOT NULL,
    warehouse_id INTEGER NOT NULL,
    quantity_on_hand INTEGER NOT NULL,
    quantity_allocated INTEGER DEFAULT 0,
    quantity_available INTEGER NOT NULL, -- on_hand - allocated
    reorder_point INTEGER NOT NULL,
    reorder_quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    inventory_value DECIMAL(12,2) NOT NULL,
    last_count_date DATE,
    snapshot_date DATE NOT NULL,
    UNIQUE(product_code, warehouse_id, snapshot_date)
);

CREATE TABLE IF NOT EXISTS sc_inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_id TEXT UNIQUE NOT NULL,
    product_code TEXT NOT NULL,
    warehouse_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL, -- 'Receipt', 'Issue', 'Transfer', 'Adjustment'
    quantity INTEGER NOT NULL, -- Positive for receipts, negative for issues
    unit_cost DECIMAL(10,2),
    movement_date DATE NOT NULL,
    reference_document TEXT, -- PO, SO, Transfer Order, etc.
    notes TEXT
);

-- ========== Suppliers & Procurement ==========

CREATE TABLE IF NOT EXISTS sc_suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER UNIQUE NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT, -- 'Raw Material', 'Finished Goods', 'MRO', 'Service'
    country TEXT,
    lead_time_days INTEGER,
    payment_terms TEXT,
    quality_rating DECIMAL(3,2), -- 0-5 scale
    delivery_rating DECIMAL(3,2), -- 0-5 scale
    cost_competitiveness DECIMAL(3,2), -- 0-5 scale
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sc_purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    po_date DATE NOT NULL,
    required_date DATE NOT NULL,
    delivery_date DATE,
    po_value DECIMAL(12,2) NOT NULL,
    status TEXT NOT NULL,
    lead_time_days INTEGER,
    on_time INTEGER DEFAULT 0,
    FOREIGN KEY (supplier_id) REFERENCES sc_suppliers(supplier_id)
);

-- ========== Warehousing ==========

CREATE TABLE IF NOT EXISTS sc_warehouses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    warehouse_id INTEGER UNIQUE NOT NULL,
    warehouse_name TEXT NOT NULL,
    location TEXT NOT NULL,
    total_capacity_sqm DECIMAL(10,2) NOT NULL,
    used_capacity_sqm DECIMAL(10,2) DEFAULT 0,
    capacity_utilization_pct DECIMAL(5,2) DEFAULT 0,
    warehouse_type TEXT, -- 'Distribution Center', 'Fulfillment Center', 'Cross-Dock'
    operational_cost_monthly DECIMAL(12,2)
);

-- ========== Demand & Forecasting ==========

CREATE TABLE IF NOT EXISTS sc_demand_forecast (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT NOT NULL,
    forecast_date DATE NOT NULL,
    forecast_period TEXT NOT NULL, -- 'Week', 'Month', 'Quarter'
    forecasted_demand INTEGER NOT NULL,
    actual_demand INTEGER,
    forecast_accuracy_pct DECIMAL(5,2),
    UNIQUE(product_code, forecast_date, forecast_period)
);

-- ========== Backorders & Stockouts ==========

CREATE TABLE IF NOT EXISTS sc_backorders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backorder_id TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    product_code TEXT NOT NULL,
    quantity_backordered INTEGER NOT NULL,
    backorder_date DATE NOT NULL,
    expected_fulfillment_date DATE,
    actual_fulfillment_date DATE,
    customer_id INTEGER,
    status TEXT DEFAULT 'Open', -- 'Open', 'Partial', 'Fulfilled', 'Cancelled'
    FOREIGN KEY (order_id) REFERENCES sc_orders(order_id)
);

-- ========== Returns & Reverse Logistics ==========

CREATE TABLE IF NOT EXISTS sc_returns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    return_id TEXT UNIQUE NOT NULL,
    original_order_id TEXT NOT NULL,
    return_date DATE NOT NULL,
    product_code TEXT NOT NULL,
    quantity_returned INTEGER NOT NULL,
    return_reason TEXT NOT NULL,
    return_value DECIMAL(10,2) NOT NULL,
    restocking_fee DECIMAL(10,2) DEFAULT 0,
    reverse_logistics_cost DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Received', 'Restocked', 'Disposed'
    FOREIGN KEY (original_order_id) REFERENCES sc_orders(order_id)
);

-- ========== Supply Chain Costs ==========

CREATE TABLE IF NOT EXISTS sc_costs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cost_date DATE NOT NULL,
    cost_category TEXT NOT NULL, -- 'Transportation', 'Warehousing', 'Inventory Carrying', 'Procurement', 'Returns', 'Other'
    cost_subcategory TEXT,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    notes TEXT
);

-- ========== Accounts Receivable (for DSO calculation) ==========

CREATE TABLE IF NOT EXISTS sc_accounts_receivable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    customer_id INTEGER NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    invoice_amount DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    amount_outstanding DECIMAL(12,2) NOT NULL,
    days_outstanding INTEGER,
    status TEXT DEFAULT 'Open', -- 'Open', 'Partial', 'Paid', 'Overdue'
    FOREIGN KEY (order_id) REFERENCES sc_orders(order_id)
);

-- ========== KPI Snapshots ==========

CREATE TABLE IF NOT EXISTS sc_kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_value DECIMAL(12,4) NOT NULL,
    target_value DECIMAL(12,4),
    variance DECIMAL(12,4),
    notes TEXT,
    UNIQUE(snapshot_date, kpi_name)
);

-- ========== Indexes for Performance ==========

CREATE INDEX IF NOT EXISTS idx_sc_orders_date ON sc_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sc_orders_status ON sc_orders(status);
CREATE INDEX IF NOT EXISTS idx_sc_orders_type ON sc_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_sc_shipments_dates ON sc_shipments(ship_date, actual_delivery_date);
CREATE INDEX IF NOT EXISTS idx_sc_inventory_product ON sc_inventory(product_code, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_sc_inventory_date ON sc_inventory(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_sc_po_supplier ON sc_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sc_po_dates ON sc_purchase_orders(po_date, required_date);
CREATE INDEX IF NOT EXISTS idx_sc_backorders_status ON sc_backorders(status);
CREATE INDEX IF NOT EXISTS idx_sc_returns_date ON sc_returns(return_date);
CREATE INDEX IF NOT EXISTS idx_sc_ar_status ON sc_accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_sc_costs_date ON sc_costs(cost_date);
