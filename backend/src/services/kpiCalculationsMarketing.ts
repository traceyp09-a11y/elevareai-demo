import Database from 'better-sqlite3';

interface KPIResult {
  name: string;
  value: number;
  unit: string;
  benchmark: number;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  formula: string;
  dataPoints: any;
}

export class MarketingKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * Get all Marketing KPIs for a given period
   */
  getAllKPIs(startDate: string, endDate: string) {
    return {
      marketingROI: this.calculateMarketingROI(startDate, endDate),
      costPerLead: this.calculateCostPerLead(startDate, endDate),
      mqlToSqlConversion: this.calculateMQLToSQLConversion(startDate, endDate),
      customerAcquisitionCost: this.calculateCAC(startDate, endDate),
      mqlsGenerated: this.calculateMQLsGenerated(startDate, endDate),
      campaignEffectiveness: this.calculateCampaignEffectiveness(startDate, endDate),
      leadToCustomerRate: this.calculateLeadToCustomerRate(startDate, endDate),
      avgDealSize: this.calculateAvgDealSize(startDate, endDate),
      channelROI: this.calculateChannelROI(startDate, endDate),
      contentEngagement: this.calculateContentEngagement(startDate, endDate)
    };
  }

  /**
   * KPI 1: Marketing ROI (Return on Marketing Investment)
   * Formula: (Revenue from Marketing - Marketing Cost) / Marketing Cost × 100
   * Benchmark: ≥500% (5:1 return)
   */
  calculateMarketingROI(startDate: string, endDate: string): KPIResult {
    const revenueData = this.db.prepare(`
      SELECT COALESCE(SUM(actual_revenue), 0) as total_revenue
      FROM mkt_leads
      WHERE customer_date BETWEEN DATE(?) AND DATE(?)
        AND lead_stage = 'Customer'
    `).get(startDate, endDate) as { total_revenue: number };

    const costData = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_cost
      FROM mkt_spend
      WHERE period_month BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_cost: number };

    const revenue = revenueData.total_revenue || 0;
    const cost = costData.total_cost || 1; // Avoid division by zero
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    const benchmark = 500;

    return {
      name: 'Marketing ROI (ROMI)',
      value: parseFloat(roi.toFixed(1)),
      unit: '%',
      benchmark,
      status: roi >= 600 ? 'Excellent' : roi >= 500 ? 'Good' : roi >= 300 ? 'Warning' : 'Critical',
      formula: '(Revenue from Marketing - Marketing Cost) / Marketing Cost × 100',
      dataPoints: {
        totalRevenue: revenue,
        totalCost: cost,
        netReturn: revenue - cost,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 2: Cost Per Lead (CPL)
   * Formula: Total Marketing Spend / Total Leads Generated
   * Benchmark: ≤$200
   */
  calculateCostPerLead(startDate: string, endDate: string): KPIResult {
    const costData = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_cost
      FROM mkt_spend
      WHERE period_month BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_cost: number };

    const leadsData = this.db.prepare(`
      SELECT COUNT(*) as total_leads
      FROM mkt_leads
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_leads: number };

    const cost = costData.total_cost || 0;
    const leads = leadsData.total_leads || 1; // Avoid division by zero
    const cpl = cost / leads;
    const benchmark = 200;

    return {
      name: 'Cost Per Lead (CPL)',
      value: parseFloat(cpl.toFixed(2)),
      unit: ' $',
      benchmark,
      status: cpl <= 150 ? 'Excellent' : cpl <= 200 ? 'Good' : cpl <= 300 ? 'Warning' : 'Critical',
      formula: 'Total Marketing Spend / Total Leads Generated',
      dataPoints: {
        totalCost: cost,
        totalLeads: leads,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 3: MQL to SQL Conversion Rate
   * Formula: (SQLs / MQLs) × 100
   * Benchmark: ≥40%
   */
  calculateMQLToSQLConversion(startDate: string, endDate: string): KPIResult {
    const mqlData = this.db.prepare(`
      SELECT COUNT(*) as mql_count
      FROM mkt_leads
      WHERE mql_date BETWEEN DATE(?) AND DATE(?)
        AND mql_date IS NOT NULL
    `).get(startDate, endDate) as { mql_count: number };

    const sqlData = this.db.prepare(`
      SELECT COUNT(*) as sql_count
      FROM mkt_leads
      WHERE mql_date BETWEEN DATE(?) AND DATE(?)
        AND sql_date IS NOT NULL
    `).get(startDate, endDate) as { sql_count: number };

    const mqls = mqlData.mql_count || 1; // Avoid division by zero
    const sqls = sqlData.sql_count || 0;
    const conversionRate = (sqls / mqls) * 100;
    const benchmark = 40;

    return {
      name: 'MQL to SQL Conversion Rate',
      value: parseFloat(conversionRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: conversionRate >= 50 ? 'Excellent' : conversionRate >= 40 ? 'Good' : conversionRate >= 25 ? 'Warning' : 'Critical',
      formula: '(Sales Qualified Leads / Marketing Qualified Leads) × 100',
      dataPoints: {
        mqls: mqls,
        sqls: sqls,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 4: Customer Acquisition Cost (CAC)
   * Formula: (Total Marketing + Sales Costs) / New Customers Acquired
   * Benchmark: ≤$15,000
   */
  calculateCAC(startDate: string, endDate: string): KPIResult {
    const marketingCost = this.db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total_cost
      FROM mkt_spend
      WHERE period_month BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_cost: number };

    // Estimate sales costs as 50% of marketing costs (simplified)
    const totalCost = marketingCost.total_cost * 1.5;

    const customersData = this.db.prepare(`
      SELECT COUNT(*) as customer_count
      FROM mkt_leads
      WHERE customer_date BETWEEN DATE(?) AND DATE(?)
        AND lead_stage = 'Customer'
    `).get(startDate, endDate) as { customer_count: number };

    const customers = customersData.customer_count || 1; // Avoid division by zero
    const cac = totalCost / customers;
    const benchmark = 15000;

    return {
      name: 'Customer Acquisition Cost (CAC)',
      value: parseFloat(cac.toFixed(0)),
      unit: ' $',
      benchmark,
      status: cac <= 12000 ? 'Excellent' : cac <= 15000 ? 'Good' : cac <= 20000 ? 'Warning' : 'Critical',
      formula: '(Total Marketing + Sales Costs) / New Customers Acquired',
      dataPoints: {
        marketingCost: marketingCost.total_cost,
        totalCost: totalCost,
        newCustomers: customers,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 5: Marketing Qualified Leads (MQLs) Generated
   * Formula: Count of MQLs in period
   * Benchmark: ≥100 per quarter
   */
  calculateMQLsGenerated(startDate: string, endDate: string): KPIResult {
    const mqlData = this.db.prepare(`
      SELECT COUNT(*) as mql_count
      FROM mkt_leads
      WHERE mql_date BETWEEN DATE(?) AND DATE(?)
        AND mql_date IS NOT NULL
    `).get(startDate, endDate) as { mql_count: number };

    const mqls = mqlData.mql_count || 0;
    const benchmark = 100;

    return {
      name: 'Marketing Qualified Leads (MQLs)',
      value: mqls,
      unit: '',
      benchmark,
      status: mqls >= 150 ? 'Excellent' : mqls >= 100 ? 'Good' : mqls >= 50 ? 'Warning' : 'Critical',
      formula: 'Count of leads that meet MQL criteria in period',
      dataPoints: {
        mqlsGenerated: mqls,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 6: Campaign Effectiveness Rate
   * Formula: (Campaigns Meeting Goals / Total Campaigns) × 100
   * Benchmark: ≥70%
   */
  calculateCampaignEffectiveness(startDate: string, endDate: string): KPIResult {
    const totalCampaigns = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM mkt_campaigns
      WHERE start_date BETWEEN DATE(?) AND DATE(?)
        AND status IN ('Active', 'Completed')
    `).get(startDate, endDate) as { count: number };

    // Successful campaigns: those with actual leads >= 80% of target
    const successfulCampaigns = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM mkt_campaigns c
      LEFT JOIN (
        SELECT campaign_id, COUNT(*) as leads_generated
        FROM mkt_leads
        GROUP BY campaign_id
      ) l ON c.campaign_id = l.campaign_id
      WHERE c.start_date BETWEEN DATE(?) AND DATE(?)
        AND c.status IN ('Active', 'Completed')
        AND c.target_leads > 0
        AND COALESCE(l.leads_generated, 0) >= (c.target_leads * 0.8)
    `).get(startDate, endDate) as { count: number };

    const total = totalCampaigns.count || 1; // Avoid division by zero
    const successful = successfulCampaigns.count || 0;
    const effectiveness = (successful / total) * 100;
    const benchmark = 70;

    return {
      name: 'Campaign Effectiveness Rate',
      value: parseFloat(effectiveness.toFixed(1)),
      unit: '%',
      benchmark,
      status: effectiveness >= 80 ? 'Excellent' : effectiveness >= 70 ? 'Good' : effectiveness >= 50 ? 'Warning' : 'Critical',
      formula: '(Campaigns Meeting Goals / Total Active Campaigns) × 100',
      dataPoints: {
        totalCampaigns: total,
        successfulCampaigns: successful,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 7: Lead-to-Customer Conversion Rate
   * Formula: (Customers / Total Leads) × 100
   * Benchmark: ≥10%
   */
  calculateLeadToCustomerRate(startDate: string, endDate: string): KPIResult {
    const leadsData = this.db.prepare(`
      SELECT COUNT(*) as total_leads
      FROM mkt_leads
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_leads: number };

    const customersData = this.db.prepare(`
      SELECT COUNT(*) as customer_count
      FROM mkt_leads
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
        AND lead_stage = 'Customer'
    `).get(startDate, endDate) as { customer_count: number };

    const leads = leadsData.total_leads || 1; // Avoid division by zero
    const customers = customersData.customer_count || 0;
    const conversionRate = (customers / leads) * 100;
    const benchmark = 10;

    return {
      name: 'Lead-to-Customer Conversion Rate',
      value: parseFloat(conversionRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: conversionRate >= 15 ? 'Excellent' : conversionRate >= 10 ? 'Good' : conversionRate >= 5 ? 'Warning' : 'Critical',
      formula: '(Customers Won / Total Leads Generated) × 100',
      dataPoints: {
        totalLeads: leads,
        customersWon: customers,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 8: Average Deal Size (Marketing-Sourced)
   * Formula: Total Revenue / Number of Customers
   * Benchmark: ≥$50,000
   */
  calculateAvgDealSize(startDate: string, endDate: string): KPIResult {
    const dealsData = this.db.prepare(`
      SELECT
        COALESCE(SUM(actual_revenue), 0) as total_revenue,
        COUNT(*) as deal_count
      FROM mkt_leads
      WHERE customer_date BETWEEN DATE(?) AND DATE(?)
        AND lead_stage = 'Customer'
        AND actual_revenue > 0
    `).get(startDate, endDate) as { total_revenue: number; deal_count: number };

    const revenue = dealsData.total_revenue || 0;
    const deals = dealsData.deal_count || 1; // Avoid division by zero
    const avgDealSize = revenue / deals;
    const benchmark = 50000;

    return {
      name: 'Avg Deal Size (Marketing-Sourced)',
      value: parseFloat(avgDealSize.toFixed(0)),
      unit: ' $',
      benchmark,
      status: avgDealSize >= 75000 ? 'Excellent' : avgDealSize >= 50000 ? 'Good' : avgDealSize >= 30000 ? 'Warning' : 'Critical',
      formula: 'Total Revenue from Marketing-Sourced Deals / Number of Deals',
      dataPoints: {
        totalRevenue: revenue,
        dealCount: deals,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 9: Best Channel ROI
   * Formula: Find channel with highest ROI
   * Benchmark: ≥400%
   */
  calculateChannelROI(startDate: string, endDate: string): KPIResult {
    const channelData = this.db.prepare(`
      SELECT
        l.channel,
        COALESCE(SUM(l.actual_revenue), 0) as revenue,
        COALESCE(SUM(s.amount), 0) as cost
      FROM mkt_leads l
      LEFT JOIN mkt_spend s ON l.channel = s.channel
        AND DATE(s.period_month) BETWEEN DATE(?) AND DATE(?)
      WHERE l.customer_date BETWEEN DATE(?) AND DATE(?)
        AND l.lead_stage = 'Customer'
      GROUP BY l.channel
      ORDER BY revenue DESC
      LIMIT 1
    `).get(startDate, endDate, startDate, endDate) as { channel: string; revenue: number; cost: number } | undefined;

    const revenue = channelData?.revenue || 0;
    const cost = channelData?.cost || 1; // Avoid division by zero
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    const benchmark = 400;
    const bestChannel = channelData?.channel || 'N/A';

    return {
      name: 'Best Channel ROI',
      value: parseFloat(roi.toFixed(1)),
      unit: '%',
      benchmark,
      status: roi >= 500 ? 'Excellent' : roi >= 400 ? 'Good' : roi >= 200 ? 'Warning' : 'Critical',
      formula: '(Channel Revenue - Channel Cost) / Channel Cost × 100',
      dataPoints: {
        bestChannel: bestChannel,
        channelRevenue: revenue,
        channelCost: cost,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 10: Content Engagement Rate
   * Formula: (Engaged Users / Total Reach) × 100
   * Benchmark: ≥15%
   */
  calculateContentEngagement(startDate: string, endDate: string): KPIResult {
    const contentData = this.db.prepare(`
      SELECT
        COALESCE(SUM(page_views + downloads + shares), 0) as engagements,
        COALESCE(SUM(unique_visitors), 0) as reach
      FROM mkt_content
      WHERE publish_date BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { engagements: number; reach: number };

    const engagements = contentData.engagements || 0;
    const reach = contentData.reach || 1; // Avoid division by zero
    const engagementRate = (engagements / reach) * 100;
    const benchmark = 15;

    return {
      name: 'Content Engagement Rate',
      value: parseFloat(engagementRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: engagementRate >= 20 ? 'Excellent' : engagementRate >= 15 ? 'Good' : engagementRate >= 10 ? 'Warning' : 'Critical',
      formula: '(Page Views + Downloads + Shares) / Unique Visitors × 100',
      dataPoints: {
        totalEngagements: engagements,
        totalReach: reach,
        period: { startDate, endDate }
      }
    };
  }
}
