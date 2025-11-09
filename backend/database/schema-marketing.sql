-- ============================================
-- Marketing Analytics Schema
-- TitanBuild Manufacturing & Logistics
-- ============================================
-- Tracks marketing campaigns, leads, spend, ROI, and channel performance

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS mkt_campaigns (
    campaign_id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL, -- Email, Social Media, Paid Search, Display Ads, Content Marketing, Events, Webinar, Trade Show
    channel TEXT NOT NULL, -- Google Ads, LinkedIn, Facebook, Email, Organic Search, Direct, Referral
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL, -- Planning, Active, Paused, Completed, Cancelled
    budget REAL NOT NULL,
    actual_spend REAL DEFAULT 0,
    target_leads INTEGER,
    target_revenue REAL,
    description TEXT,
    campaign_manager TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Leads
CREATE TABLE IF NOT EXISTS mkt_leads (
    lead_id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    lead_source TEXT NOT NULL, -- Website, Social Media, Email, Event, Referral, Paid Ad, Organic Search
    channel TEXT NOT NULL,
    company_name TEXT,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    industry TEXT,
    company_size TEXT, -- 1-50, 51-200, 201-1000, 1001+
    lead_score INTEGER DEFAULT 0, -- 0-100
    lead_stage TEXT NOT NULL, -- Raw Lead, MQL, SQL, Opportunity, Customer, Lost
    mql_date DATE, -- Marketing Qualified Lead date
    sql_date DATE, -- Sales Qualified Lead date
    opportunity_date DATE,
    customer_date DATE,
    lost_date DATE,
    estimated_value REAL,
    actual_revenue REAL,
    lead_owner TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Marketing Spend by Channel
CREATE TABLE IF NOT EXISTS mkt_spend (
    spend_id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_month DATE NOT NULL, -- First day of month
    channel TEXT NOT NULL,
    category TEXT NOT NULL, -- Paid Media, Content Creation, Events, Software/Tools, Agency Fees, Personnel
    amount REAL NOT NULL,
    budget REAL NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Performance Metrics
CREATE TABLE IF NOT EXISTS mkt_campaign_metrics (
    metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER NOT NULL,
    metric_date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    mqls_generated INTEGER DEFAULT 0,
    sqls_generated INTEGER DEFAULT 0,
    opportunities_generated INTEGER DEFAULT 0,
    customers_won INTEGER DEFAULT 0,
    revenue_generated REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Email Marketing Metrics
CREATE TABLE IF NOT EXISTS mkt_email_campaigns (
    email_campaign_id INTEGER PRIMARY KEY AUTOINCREMENT,
    campaign_id INTEGER,
    campaign_name TEXT NOT NULL,
    send_date DATE NOT NULL,
    emails_sent INTEGER NOT NULL,
    emails_delivered INTEGER NOT NULL,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    spam_complaints INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    revenue_attributed REAL DEFAULT 0,
    subject_line TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Social Media Performance
CREATE TABLE IF NOT EXISTS mkt_social_media (
    social_id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL, -- LinkedIn, Facebook, Twitter, Instagram, YouTube
    post_date DATE NOT NULL,
    post_type TEXT NOT NULL, -- Organic, Paid, Sponsored
    campaign_id INTEGER,
    content_type TEXT, -- Article, Video, Image, Infographic, Poll
    impressions INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    engagement INTEGER DEFAULT 0, -- likes, comments, shares combined
    clicks INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    cost REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Content Marketing Performance
CREATE TABLE IF NOT EXISTS mkt_content (
    content_id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_title TEXT NOT NULL,
    content_type TEXT NOT NULL, -- Blog Post, White Paper, Case Study, eBook, Video, Webinar, Infographic
    publish_date DATE NOT NULL,
    channel TEXT, -- Website, LinkedIn, Email, YouTube
    campaign_id INTEGER,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    time_on_page REAL DEFAULT 0, -- seconds
    downloads INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    author TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Website Traffic & Conversions
CREATE TABLE IF NOT EXISTS mkt_website_traffic (
    traffic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    traffic_date DATE NOT NULL,
    source TEXT NOT NULL, -- Organic Search, Paid Search, Social, Direct, Referral, Email
    sessions INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    pageviews INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0, -- percentage
    avg_session_duration REAL DEFAULT 0, -- seconds
    conversions INTEGER DEFAULT 0,
    conversion_rate REAL DEFAULT 0, -- percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing Attribution (Multi-touch)
CREATE TABLE IF NOT EXISTS mkt_attribution (
    attribution_id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    campaign_id INTEGER NOT NULL,
    touchpoint_sequence INTEGER NOT NULL, -- 1st touch, 2nd touch, etc.
    touchpoint_date DATE NOT NULL,
    channel TEXT NOT NULL,
    attribution_credit REAL NOT NULL, -- percentage (0-100)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES mkt_leads(lead_id),
    FOREIGN KEY (campaign_id) REFERENCES mkt_campaigns(campaign_id)
);

-- Marketing Budget vs Actual
CREATE TABLE IF NOT EXISTS mkt_budget (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    fiscal_quarter TEXT NOT NULL, -- Q1 2024, Q2 2024, etc.
    channel TEXT NOT NULL,
    budgeted_amount REAL NOT NULL,
    actual_spend REAL DEFAULT 0,
    variance REAL DEFAULT 0,
    variance_percent REAL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Marketing KPI Snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS mkt_kpi_snapshots (
    snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    kpi_name TEXT NOT NULL,
    kpi_value REAL NOT NULL,
    target_value REAL,
    status TEXT, -- Good, Warning, Critical
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON mkt_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON mkt_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON mkt_leads(lead_stage);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON mkt_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_dates ON mkt_leads(mql_date, sql_date, customer_date);
CREATE INDEX IF NOT EXISTS idx_spend_period ON mkt_spend(period_month);
CREATE INDEX IF NOT EXISTS idx_metrics_campaign ON mkt_campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON mkt_campaign_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_email_date ON mkt_email_campaigns(send_date);
CREATE INDEX IF NOT EXISTS idx_social_date ON mkt_social_media(post_date);
CREATE INDEX IF NOT EXISTS idx_content_date ON mkt_content(publish_date);
CREATE INDEX IF NOT EXISTS idx_traffic_date ON mkt_website_traffic(traffic_date);
CREATE INDEX IF NOT EXISTS idx_attribution_lead ON mkt_attribution(lead_id);
CREATE INDEX IF NOT EXISTS idx_budget_quarter ON mkt_budget(fiscal_quarter);
