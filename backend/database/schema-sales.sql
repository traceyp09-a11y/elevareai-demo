-- =====================================================
-- SALES & REVENUE ANALYTICS MODULE - DATABASE SCHEMA
-- =====================================================
-- Purpose: Track sales pipeline, deals, revenue, and team performance
-- Created: 2024-11-09

-- Sales Representatives Table
CREATE TABLE IF NOT EXISTS sales_reps (
    rep_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    territory TEXT,
    role TEXT, -- SDR, AE, Sales Manager, VP Sales
    hire_date TEXT,
    quota_annual REAL,
    is_active INTEGER DEFAULT 1
);

-- Sales Opportunities (Pipeline)
CREATE TABLE IF NOT EXISTS sales_opportunities (
    opportunity_id TEXT PRIMARY KEY,
    opportunity_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    rep_id TEXT,
    stage TEXT, -- Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
    probability REAL, -- 0-100
    amount REAL,
    expected_close_date TEXT,
    created_date TEXT,
    last_activity_date TEXT,
    lead_source TEXT, -- Inbound, Outbound, Referral, Marketing, Partner
    industry TEXT,
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunities_rep ON sales_opportunities(rep_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON sales_opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_created ON sales_opportunities(created_date);

-- Closed Deals
CREATE TABLE IF NOT EXISTS sales_deals (
    deal_id TEXT PRIMARY KEY,
    opportunity_id TEXT,
    rep_id TEXT,
    account_name TEXT NOT NULL,
    deal_value REAL NOT NULL,
    close_date TEXT NOT NULL,
    contract_term_months INTEGER,
    deal_type TEXT, -- New Business, Upsell, Renewal, Cross-sell
    payment_terms TEXT, -- Annual, Monthly, Quarterly
    mrr REAL, -- Monthly Recurring Revenue
    arr REAL, -- Annual Recurring Revenue
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(opportunity_id),
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE INDEX IF NOT EXISTS idx_deals_rep ON sales_deals(rep_id);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON sales_deals(close_date);

-- Sales Quotas (Quarterly)
CREATE TABLE IF NOT EXISTS sales_quotas (
    quota_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rep_id TEXT NOT NULL,
    quarter TEXT NOT NULL, -- Q1 2024, Q2 2024, etc.
    quota_amount REAL NOT NULL,
    quota_type TEXT, -- Revenue, Deals, MRR
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE INDEX IF NOT EXISTS idx_quotas_rep_quarter ON sales_quotas(rep_id, quarter);

-- Sales Forecasts
CREATE TABLE IF NOT EXISTS sales_forecasts (
    forecast_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rep_id TEXT NOT NULL,
    forecast_period TEXT NOT NULL, -- 2024-10, 2024-11, etc.
    forecast_amount REAL NOT NULL,
    forecast_category TEXT, -- Commit, Best Case, Pipeline
    submitted_date TEXT NOT NULL,
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_period ON sales_forecasts(forecast_period);

-- Sales Activities (Calls, Meetings, Emails)
CREATE TABLE IF NOT EXISTS sales_activities (
    activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    rep_id TEXT NOT NULL,
    opportunity_id TEXT,
    activity_type TEXT, -- Call, Meeting, Email, Demo
    activity_date TEXT NOT NULL,
    duration_minutes INTEGER,
    outcome TEXT, -- Completed, No Show, Rescheduled
    FOREIGN KEY (rep_id) REFERENCES sales_reps(rep_id),
    FOREIGN KEY (opportunity_id) REFERENCES sales_opportunities(opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_activities_rep_date ON sales_activities(rep_id, activity_date);

-- Leads
CREATE TABLE IF NOT EXISTS sales_leads (
    lead_id TEXT PRIMARY KEY,
    lead_source TEXT, -- Website, Event, Referral, Cold Outreach
    lead_status TEXT, -- New, Contacted, Qualified, Unqualified, Converted
    created_date TEXT NOT NULL,
    converted_date TEXT,
    converted_to_opportunity_id TEXT,
    assigned_rep_id TEXT,
    industry TEXT,
    company_size TEXT, -- SMB, Mid-Market, Enterprise
    estimated_value REAL,
    FOREIGN KEY (assigned_rep_id) REFERENCES sales_reps(rep_id),
    FOREIGN KEY (converted_to_opportunity_id) REFERENCES sales_opportunities(opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON sales_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON sales_leads(created_date);

-- Marketing Campaigns (for attribution)
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    campaign_id TEXT PRIMARY KEY,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT, -- Email, Webinar, Event, Content, Paid Ads
    start_date TEXT,
    end_date TEXT,
    budget REAL,
    leads_generated INTEGER,
    opportunities_created INTEGER,
    pipeline_value REAL,
    revenue_attributed REAL
);

-- Revenue Bookings
CREATE TABLE IF NOT EXISTS revenue_bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    booking_amount REAL NOT NULL,
    revenue_type TEXT, -- New, Expansion, Renewal
    recognition_start_date TEXT,
    recognition_end_date TEXT,
    FOREIGN KEY (deal_id) REFERENCES sales_deals(deal_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON revenue_bookings(booking_date);

-- Customer Contracts
CREATE TABLE IF NOT EXISTS customer_contracts (
    contract_id TEXT PRIMARY KEY,
    account_name TEXT NOT NULL,
    contract_value REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    renewal_date TEXT,
    contract_status TEXT, -- Active, Expired, Renewed, Churned
    payment_terms TEXT,
    auto_renew INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_contracts_renewal ON customer_contracts(renewal_date);

-- Sales KPI Snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS sales_kpi_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date TEXT NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    win_rate REAL,
    avg_sales_cycle_days REAL,
    pipeline_velocity REAL,
    avg_quota_attainment REAL,
    avg_deal_size REAL,
    cac REAL,
    revenue_per_rep REAL,
    forecast_accuracy REAL,
    lead_conversion_rate REAL,
    mrr_growth_rate REAL
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_date ON sales_kpi_snapshots(snapshot_date);
