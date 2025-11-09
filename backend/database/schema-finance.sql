-- Finance Module Database Schema
-- Comprehensive financial data for 10 key finance KPIs
-- Created: 2025-11-09

-- ===========================================
-- 1. GENERAL LEDGER
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_general_ledger (
    gl_id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date TEXT NOT NULL,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_category TEXT NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
    account_subcategory TEXT,
    debit_amount REAL DEFAULT 0,
    credit_amount REAL DEFAULT 0,
    description TEXT,
    reference_number TEXT,
    department TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_gl_date ON fin_general_ledger(transaction_date);
CREATE INDEX idx_fin_gl_account ON fin_general_ledger(account_code);
CREATE INDEX idx_fin_gl_category ON fin_general_ledger(account_category);

-- ===========================================
-- 2. INCOME STATEMENT (P&L)
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_income_statement (
    income_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    revenue REAL NOT NULL,
    cost_of_goods_sold REAL NOT NULL,
    gross_profit REAL NOT NULL,
    operating_expenses REAL NOT NULL,
    operating_income REAL NOT NULL,
    interest_expense REAL DEFAULT 0,
    interest_income REAL DEFAULT 0,
    tax_expense REAL NOT NULL,
    net_income REAL NOT NULL,
    ebitda REAL NOT NULL,
    depreciation_amortization REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_income_period ON fin_income_statement(period_start, period_end);

-- ===========================================
-- 3. BALANCE SHEET
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_balance_sheet (
    balance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    -- Assets
    cash_and_equivalents REAL NOT NULL,
    accounts_receivable REAL NOT NULL,
    inventory REAL NOT NULL,
    prepaid_expenses REAL DEFAULT 0,
    current_assets REAL NOT NULL,
    fixed_assets REAL NOT NULL,
    accumulated_depreciation REAL NOT NULL,
    intangible_assets REAL DEFAULT 0,
    total_assets REAL NOT NULL,
    -- Liabilities
    accounts_payable REAL NOT NULL,
    short_term_debt REAL NOT NULL,
    accrued_expenses REAL DEFAULT 0,
    current_liabilities REAL NOT NULL,
    long_term_debt REAL NOT NULL,
    total_liabilities REAL NOT NULL,
    -- Equity
    shareholders_equity REAL NOT NULL,
    retained_earnings REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_balance_date ON fin_balance_sheet(snapshot_date);

-- ===========================================
-- 4. CASH FLOW STATEMENT
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_cash_flow (
    cashflow_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    -- Operating Activities
    net_income REAL NOT NULL,
    depreciation_amortization REAL NOT NULL,
    changes_in_working_capital REAL NOT NULL,
    operating_cash_flow REAL NOT NULL,
    -- Investing Activities
    capex REAL DEFAULT 0,
    asset_purchases REAL DEFAULT 0,
    investing_cash_flow REAL NOT NULL,
    -- Financing Activities
    debt_proceeds REAL DEFAULT 0,
    debt_repayment REAL DEFAULT 0,
    equity_issued REAL DEFAULT 0,
    dividends_paid REAL DEFAULT 0,
    financing_cash_flow REAL NOT NULL,
    -- Summary
    net_cash_flow REAL NOT NULL,
    beginning_cash REAL NOT NULL,
    ending_cash REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_cashflow_period ON fin_cash_flow(period_start, period_end);

-- ===========================================
-- 5. ACCOUNTS RECEIVABLE AGING
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_ar_aging (
    ar_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    invoice_amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    amount_outstanding REAL NOT NULL,
    days_outstanding INTEGER,
    aging_bucket TEXT, -- 0-30, 31-60, 61-90, 90+
    status TEXT DEFAULT 'Open', -- Open, Partial, Paid, Written Off
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_ar_status ON fin_ar_aging(status);
CREATE INDEX idx_fin_ar_bucket ON fin_ar_aging(aging_bucket);

-- ===========================================
-- 6. ACCOUNTS PAYABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_ap (
    ap_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL UNIQUE,
    vendor_name TEXT NOT NULL,
    invoice_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    invoice_amount REAL NOT NULL,
    amount_paid REAL DEFAULT 0,
    amount_outstanding REAL NOT NULL,
    days_until_due INTEGER,
    status TEXT DEFAULT 'Open', -- Open, Partial, Paid
    payment_terms TEXT, -- Net 30, Net 60, etc.
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_ap_status ON fin_ap(status);
CREATE INDEX idx_fin_ap_vendor ON fin_ap(vendor_name);

-- ===========================================
-- 7. BUDGET vs ACTUAL
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_budget (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    department TEXT NOT NULL,
    category TEXT NOT NULL,
    budgeted_amount REAL NOT NULL,
    actual_amount REAL DEFAULT 0,
    variance REAL,
    variance_pct REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_budget_period ON fin_budget(period);
CREATE INDEX idx_fin_budget_dept ON fin_budget(department);

-- ===========================================
-- 8. DEBT SCHEDULE
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_debt_schedule (
    debt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_name TEXT NOT NULL,
    lender TEXT NOT NULL,
    loan_type TEXT, -- Term Loan, Revolver, Bond, etc.
    original_amount REAL NOT NULL,
    current_balance REAL NOT NULL,
    interest_rate REAL NOT NULL,
    maturity_date TEXT NOT NULL,
    payment_frequency TEXT, -- Monthly, Quarterly, Annual
    is_current_liability BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_debt_type ON fin_debt_schedule(loan_type);

-- ===========================================
-- 9. REVENUE BY PRODUCT/SERVICE
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_revenue_streams (
    revenue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    product_category TEXT NOT NULL,
    product_name TEXT,
    revenue_amount REAL NOT NULL,
    cost_amount REAL NOT NULL,
    gross_margin REAL NOT NULL,
    units_sold INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_revenue_period ON fin_revenue_streams(period);
CREATE INDEX idx_fin_revenue_category ON fin_revenue_streams(product_category);

-- ===========================================
-- 10. OPERATING EXPENSES
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_operating_expenses (
    expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    expense_category TEXT NOT NULL, -- Salaries, Marketing, R&D, G&A, etc.
    expense_subcategory TEXT,
    amount REAL NOT NULL,
    department TEXT,
    is_fixed_cost BOOLEAN DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_opex_period ON fin_operating_expenses(period);
CREATE INDEX idx_fin_opex_category ON fin_operating_expenses(expense_category);

-- ===========================================
-- 11. FINANCIAL RATIOS SNAPSHOTS
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_kpi_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_value REAL NOT NULL,
    benchmark_value REAL,
    status TEXT, -- Excellent, Good, Warning, Critical
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_kpi_date ON fin_kpi_snapshots(snapshot_date);
CREATE INDEX idx_fin_kpi_name ON fin_kpi_snapshots(kpi_name);

-- ===========================================
-- 12. TAX RECORDS
-- ===========================================
CREATE TABLE IF NOT EXISTS fin_tax_records (
    tax_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_period TEXT NOT NULL,
    tax_type TEXT NOT NULL, -- Income Tax, Sales Tax, Payroll Tax, etc.
    taxable_amount REAL NOT NULL,
    tax_rate REAL NOT NULL,
    tax_amount REAL NOT NULL,
    payment_due_date TEXT,
    payment_date TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Paid, Overdue
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fin_tax_period ON fin_tax_records(tax_period);
CREATE INDEX idx_fin_tax_type ON fin_tax_records(tax_type);
