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

export class SalesKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * Get all Sales KPIs for a given period
   */
  getAllKPIs(startDate: string, endDate: string) {
    return {
      winRate: this.calculateWinRate(startDate, endDate),
      avgSalesCycleLength: this.calculateAvgSalesCycleLength(startDate, endDate),
      pipelineVelocity: this.calculatePipelineVelocity(startDate, endDate),
      quotaAttainment: this.calculateQuotaAttainment(startDate, endDate),
      avgDealSize: this.calculateAvgDealSize(startDate, endDate),
      customerAcquisitionCost: this.calculateCAC(startDate, endDate),
      revenuePerRep: this.calculateRevenuePerRep(startDate, endDate),
      forecastAccuracy: this.calculateForecastAccuracy(startDate, endDate),
      leadConversionRate: this.calculateLeadConversionRate(startDate, endDate),
      mrrGrowthRate: this.calculateMRRGrowthRate(startDate, endDate)
    };
  }

  /**
   * KPI 1: Win Rate (%)
   * Formula: (Closed Won Opportunities / Total Closed Opportunities) × 100
   * Benchmark: ≥25%
   */
  calculateWinRate(startDate: string, endDate: string): KPIResult {
    const closedWon = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_opportunities
      WHERE stage = 'Closed Won'
        AND DATE(last_activity_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const totalClosed = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_opportunities
      WHERE stage IN ('Closed Won', 'Closed Lost')
        AND DATE(last_activity_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const winRate = totalClosed.count > 0 ? (closedWon.count / totalClosed.count) * 100 : 0;
    const benchmark = 25;

    return {
      name: 'Win Rate',
      value: parseFloat(winRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: winRate >= 30 ? 'Excellent' : winRate >= 25 ? 'Good' : winRate >= 20 ? 'Warning' : 'Critical',
      formula: '(Closed Won Opportunities / Total Closed Opportunities) × 100',
      dataPoints: {
        closedWonCount: closedWon.count,
        totalClosedCount: totalClosed.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 2: Average Sales Cycle Length (days)
   * Formula: Average days from opportunity creation to close
   * Benchmark: ≤45 days
   */
  calculateAvgSalesCycleLength(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(JULIANDAY(o.last_activity_date) - JULIANDAY(o.created_date)) as avg_days
      FROM sales_opportunities o
      WHERE o.stage = 'Closed Won'
        AND DATE(o.last_activity_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { avg_days: number | null };

    const avgDays = result.avg_days || 0;
    const benchmark = 45;

    return {
      name: 'Average Sales Cycle Length',
      value: parseFloat(avgDays.toFixed(1)),
      unit: ' days',
      benchmark,
      status: avgDays <= 30 ? 'Excellent' : avgDays <= 45 ? 'Good' : avgDays <= 60 ? 'Warning' : 'Critical',
      formula: 'Average (Close Date - Creation Date) for Closed Won opportunities',
      dataPoints: {
        averageDays: avgDays,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 3: Pipeline Velocity ($ per day)
   * Formula: (Number of Opportunities × Average Deal Size × Win Rate) / Sales Cycle Length
   * Benchmark: ≥$50,000/day
   */
  calculatePipelineVelocity(startDate: string, endDate: string): KPIResult {
    const winRate = this.calculateWinRate(startDate, endDate);
    const avgDealSize = this.calculateAvgDealSize(startDate, endDate);
    const salesCycle = this.calculateAvgSalesCycleLength(startDate, endDate);

    const opportunitiesCount = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_opportunities
      WHERE stage NOT IN ('Closed Lost')
        AND DATE(created_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const velocity = salesCycle.value > 0
      ? (opportunitiesCount.count * avgDealSize.value * (winRate.value / 100)) / salesCycle.value
      : 0;

    const benchmark = 50000;

    return {
      name: 'Pipeline Velocity',
      value: parseFloat(velocity.toFixed(0)),
      unit: ' $/day',
      benchmark,
      status: velocity >= 75000 ? 'Excellent' : velocity >= 50000 ? 'Good' : velocity >= 30000 ? 'Warning' : 'Critical',
      formula: '(Opportunities × Avg Deal Size × Win Rate) / Sales Cycle Days',
      dataPoints: {
        opportunitiesCount: opportunitiesCount.count,
        avgDealSize: avgDealSize.value,
        winRate: winRate.value,
        salesCycleDays: salesCycle.value,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 4: Quota Attainment (%)
   * Formula: (Actual Revenue / Quota) × 100
   * Benchmark: ≥100%
   */
  calculateQuotaAttainment(startDate: string, endDate: string): KPIResult {
    // Determine quarter from date range
    const quarter = this.getQuarterFromDate(endDate);

    const result = this.db.prepare(`
      SELECT
        SUM(d.deal_value) as actual_revenue,
        AVG(q.quota_amount) as avg_quota
      FROM sales_deals d
      LEFT JOIN sales_quotas q ON d.rep_id = q.rep_id AND q.quarter = ?
      WHERE DATE(d.close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(quarter, startDate, endDate) as { actual_revenue: number | null, avg_quota: number | null };

    const actualRevenue = result.actual_revenue || 0;
    const avgQuota = result.avg_quota || 1;
    const attainment = (actualRevenue / avgQuota) * 100;
    const benchmark = 100;

    return {
      name: 'Quota Attainment',
      value: parseFloat(attainment.toFixed(1)),
      unit: '%',
      benchmark,
      status: attainment >= 110 ? 'Excellent' : attainment >= 100 ? 'Good' : attainment >= 80 ? 'Warning' : 'Critical',
      formula: '(Actual Revenue / Quota Target) × 100',
      dataPoints: {
        actualRevenue,
        avgQuota,
        quarter,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 5: Average Deal Size ($)
   * Formula: Total Deal Value / Number of Deals
   * Benchmark: ≥$50,000
   */
  calculateAvgDealSize(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT
        AVG(deal_value) as avg_size,
        COUNT(*) as deal_count
      FROM sales_deals
      WHERE DATE(close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { avg_size: number | null, deal_count: number };

    const avgSize = result.avg_size || 0;
    const benchmark = 50000;

    return {
      name: 'Average Deal Size',
      value: parseFloat(avgSize.toFixed(0)),
      unit: ' $',
      benchmark,
      status: avgSize >= 75000 ? 'Excellent' : avgSize >= 50000 ? 'Good' : avgSize >= 30000 ? 'Warning' : 'Critical',
      formula: 'Total Deal Value / Number of Closed Won Deals',
      dataPoints: {
        avgDealSize: avgSize,
        dealCount: result.deal_count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 6: Customer Acquisition Cost - CAC ($)
   * Formula: (Sales + Marketing Expenses) / Number of New Customers
   * Benchmark: ≤$15,000
   */
  calculateCAC(startDate: string, endDate: string): KPIResult {
    // Get marketing campaign costs
    const marketingCost = this.db.prepare(`
      SELECT COALESCE(SUM(budget), 0) as total_budget
      FROM marketing_campaigns
      WHERE DATE(start_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_budget: number };

    // Estimate sales costs (salaries + overhead) - using rep count × average cost
    const repCount = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_reps
      WHERE is_active = 1
    `).get() as { count: number };

    const estimatedMonthlySalesCost = repCount.count * 12000; // $12k per rep per month
    const monthsInPeriod = 3; // Q4 2024
    const totalSalesCost = estimatedMonthlySalesCost * monthsInPeriod;

    // Get new customers
    const newCustomers = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_deals
      WHERE deal_type = 'New Business'
        AND DATE(close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const totalCost = marketingCost.total_budget + totalSalesCost;
    const cac = newCustomers.count > 0 ? totalCost / newCustomers.count : 0;
    const benchmark = 15000;

    return {
      name: 'Customer Acquisition Cost (CAC)',
      value: parseFloat(cac.toFixed(0)),
      unit: ' $',
      benchmark,
      status: cac <= 12000 ? 'Excellent' : cac <= 15000 ? 'Good' : cac <= 20000 ? 'Warning' : 'Critical',
      formula: '(Sales Expenses + Marketing Expenses) / New Customers Acquired',
      dataPoints: {
        marketingCost: marketingCost.total_budget,
        salesCost: totalSalesCost,
        totalCost,
        newCustomers: newCustomers.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 7: Revenue per Sales Rep ($)
   * Formula: Total Revenue / Number of Active Sales Reps
   * Benchmark: ≥$500,000
   */
  calculateRevenuePerRep(startDate: string, endDate: string): KPIResult {
    const totalRevenue = this.db.prepare(`
      SELECT COALESCE(SUM(deal_value), 0) as total
      FROM sales_deals
      WHERE DATE(close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total: number };

    const activeReps = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_reps
      WHERE is_active = 1
    `).get() as { count: number };

    const revenuePerRep = activeReps.count > 0 ? totalRevenue.total / activeReps.count : 0;
    const benchmark = 500000;

    return {
      name: 'Revenue per Sales Rep',
      value: parseFloat(revenuePerRep.toFixed(0)),
      unit: ' $',
      benchmark,
      status: revenuePerRep >= 650000 ? 'Excellent' : revenuePerRep >= 500000 ? 'Good' : revenuePerRep >= 350000 ? 'Warning' : 'Critical',
      formula: 'Total Revenue / Number of Active Sales Reps',
      dataPoints: {
        totalRevenue: totalRevenue.total,
        activeReps: activeReps.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 8: Forecast Accuracy (%)
   * Formula: (Actual Revenue / Forecasted Revenue) × 100
   * Benchmark: 90-110% (within 10% of forecast)
   */
  calculateForecastAccuracy(startDate: string, endDate: string): KPIResult {
    const actualRevenue = this.db.prepare(`
      SELECT COALESCE(SUM(deal_value), 0) as total
      FROM sales_deals
      WHERE DATE(close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total: number };

    const forecastedRevenue = this.db.prepare(`
      SELECT COALESCE(SUM(forecast_amount), 1) as total
      FROM sales_forecasts
      WHERE forecast_period >= ? AND forecast_period <= ?
        AND forecast_category = 'Commit'
    `).get(startDate.substring(0, 7), endDate.substring(0, 7)) as { total: number };

    const accuracy = (actualRevenue.total / forecastedRevenue.total) * 100;
    const benchmark = 100;

    return {
      name: 'Forecast Accuracy',
      value: parseFloat(accuracy.toFixed(1)),
      unit: '%',
      benchmark,
      status: accuracy >= 95 && accuracy <= 105 ? 'Excellent' : accuracy >= 90 && accuracy <= 110 ? 'Good' : accuracy >= 80 && accuracy <= 120 ? 'Warning' : 'Critical',
      formula: '(Actual Revenue / Forecasted Revenue) × 100',
      dataPoints: {
        actualRevenue: actualRevenue.total,
        forecastedRevenue: forecastedRevenue.total,
        variance: actualRevenue.total - forecastedRevenue.total,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 9: Lead Conversion Rate (%)
   * Formula: (Converted Leads / Total Leads) × 100
   * Benchmark: ≥15%
   */
  calculateLeadConversionRate(startDate: string, endDate: string): KPIResult {
    const convertedLeads = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_leads
      WHERE lead_status = 'Converted'
        AND DATE(converted_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const totalLeads = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM sales_leads
      WHERE DATE(created_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const conversionRate = totalLeads.count > 0 ? (convertedLeads.count / totalLeads.count) * 100 : 0;
    const benchmark = 15;

    return {
      name: 'Lead Conversion Rate',
      value: parseFloat(conversionRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: conversionRate >= 20 ? 'Excellent' : conversionRate >= 15 ? 'Good' : conversionRate >= 10 ? 'Warning' : 'Critical',
      formula: '(Converted Leads / Total Leads) × 100',
      dataPoints: {
        convertedLeads: convertedLeads.count,
        totalLeads: totalLeads.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 10: MRR Growth Rate (%)
   * Formula: ((Current MRR - Previous MRR) / Previous MRR) × 100
   * Benchmark: ≥10% quarterly
   */
  calculateMRRGrowthRate(startDate: string, endDate: string): KPIResult {
    const currentMRR = this.db.prepare(`
      SELECT COALESCE(SUM(mrr), 0) as total
      FROM sales_deals
      WHERE DATE(close_date) <= DATE(?)
    `).get(endDate) as { total: number };

    const previousMRR = this.db.prepare(`
      SELECT COALESCE(SUM(mrr), 1) as total
      FROM sales_deals
      WHERE DATE(close_date) < DATE(?)
    `).get(startDate) as { total: number };

    const growthRate = previousMRR.total > 0 ? ((currentMRR.total - previousMRR.total) / previousMRR.total) * 100 : 0;
    const benchmark = 10;

    return {
      name: 'MRR Growth Rate',
      value: parseFloat(growthRate.toFixed(1)),
      unit: '%',
      benchmark,
      status: growthRate >= 15 ? 'Excellent' : growthRate >= 10 ? 'Good' : growthRate >= 5 ? 'Warning' : 'Critical',
      formula: '((Current Period MRR - Previous Period MRR) / Previous Period MRR) × 100',
      dataPoints: {
        currentMRR: currentMRR.total,
        previousMRR: previousMRR.total,
        mrrChange: currentMRR.total - previousMRR.total,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * Helper: Get quarter from date
   */
  private getQuarterFromDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `Q${quarter} ${year}`;
  }
}
