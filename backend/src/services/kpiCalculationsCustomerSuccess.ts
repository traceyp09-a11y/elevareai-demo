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

export class CustomerSuccessKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  /**
   * Get all Customer Success KPIs for a given period
   */
  getAllKPIs(startDate: string, endDate: string) {
    return {
      nps: this.calculateNPS(startDate, endDate),
      csat: this.calculateCSAT(startDate, endDate),
      ces: this.calculateCES(startDate, endDate),
      churnRate: this.calculateChurnRate(startDate, endDate),
      customerLTV: this.calculateCustomerLTV(startDate, endDate),
      netRevenueRetention: this.calculateNetRevenueRetention(startDate, endDate),
      avgHealthScore: this.calculateAvgHealthScore(startDate, endDate),
      timeToFirstValue: this.calculateTimeToFirstValue(startDate, endDate),
      productAdoptionRate: this.calculateProductAdoptionRate(startDate, endDate),
      avgTicketResolution: this.calculateAvgTicketResolution(startDate, endDate)
    };
  }

  /**
   * KPI 1: Net Promoter Score (NPS)
   * Formula: % Promoters (9-10) - % Detractors (0-6)
   * Benchmark: ≥50
   */
  calculateNPS(startDate: string, endDate: string): KPIResult {
    const surveys = this.db.prepare(`
      SELECT nps_score
      FROM cs_nps_surveys
      WHERE DATE(survey_date) BETWEEN DATE(?) AND DATE(?)
    `).all(startDate, endDate) as Array<{ nps_score: number }>;

    const totalSurveys = surveys.length;

    if (totalSurveys === 0) {
      return {
        name: 'Net Promoter Score (NPS)',
        value: 0,
        unit: '',
        benchmark: 50,
        status: 'Critical',
        formula: '% Promoters (9-10) - % Detractors (0-6)',
        dataPoints: { totalSurveys: 0, promoters: 0, passives: 0, detractors: 0 }
      };
    }

    const promoters = surveys.filter(s => s.nps_score >= 9).length;
    const detractors = surveys.filter(s => s.nps_score <= 6).length;
    const passives = surveys.filter(s => s.nps_score === 7 || s.nps_score === 8).length;

    const nps = ((promoters / totalSurveys) * 100) - ((detractors / totalSurveys) * 100);
    const benchmark = 50;

    return {
      name: 'Net Promoter Score (NPS)',
      value: parseFloat(nps.toFixed(1)),
      unit: '',
      benchmark,
      status: nps >= 70 ? 'Excellent' : nps >= 50 ? 'Good' : nps >= 30 ? 'Warning' : 'Critical',
      formula: '% Promoters (9-10) - % Detractors (0-6)',
      dataPoints: {
        totalSurveys,
        promoters,
        passives,
        detractors,
        promoterPercent: parseFloat(((promoters / totalSurveys) * 100).toFixed(1)),
        detractorPercent: parseFloat(((detractors / totalSurveys) * 100).toFixed(1)),
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 2: Customer Satisfaction (CSAT)
   * Formula: Average of CSAT scores (1-5 scale)
   * Benchmark: ≥4.0
   */
  calculateCSAT(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(csat_score) as avg_csat, COUNT(*) as count
      FROM cs_csat_surveys
      WHERE DATE(survey_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { avg_csat: number | null, count: number };

    const avgCSAT = result.avg_csat || 0;
    const benchmark = 4.0;

    return {
      name: 'Customer Satisfaction (CSAT)',
      value: parseFloat(avgCSAT.toFixed(2)),
      unit: '/5.0',
      benchmark,
      status: avgCSAT >= 4.5 ? 'Excellent' : avgCSAT >= 4.0 ? 'Good' : avgCSAT >= 3.5 ? 'Warning' : 'Critical',
      formula: 'Average of all CSAT survey scores (1-5 scale)',
      dataPoints: {
        avgScore: avgCSAT,
        totalSurveys: result.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 3: Customer Effort Score (CES)
   * Formula: Average of CES scores (1-7 scale, higher is better)
   * Benchmark: ≥5.5
   */
  calculateCES(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(ces_score) as avg_ces, COUNT(*) as count
      FROM cs_ces_surveys
      WHERE DATE(survey_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { avg_ces: number | null, count: number };

    const avgCES = result.avg_ces || 0;
    const benchmark = 5.5;

    return {
      name: 'Customer Effort Score (CES)',
      value: parseFloat(avgCES.toFixed(2)),
      unit: '/7.0',
      benchmark,
      status: avgCES >= 6.0 ? 'Excellent' : avgCES >= 5.5 ? 'Good' : avgCES >= 5.0 ? 'Warning' : 'Critical',
      formula: 'Average of CES survey scores (1=Very Difficult, 7=Very Easy)',
      dataPoints: {
        avgScore: avgCES,
        totalSurveys: result.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 4: Churn Rate (%)
   * Formula: (Customers Lost / Total Customers at Start) × 100
   * Benchmark: ≤5% (monthly) or ≤15% (quarterly)
   */
  calculateChurnRate(startDate: string, endDate: string): KPIResult {
    // Count customers at start of period
    const customersAtStart = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM cs_customers
      WHERE DATE(signup_date) < DATE(?)
        AND (account_status != 'Churned' OR NOT EXISTS (
          SELECT 1 FROM cs_churn_events
          WHERE cs_churn_events.customer_id = cs_customers.customer_id
            AND DATE(churn_date) < DATE(?)
        ))
    `).get(startDate, startDate) as { count: number };

    // Count customers churned during period
    const customersChurned = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM cs_churn_events
      WHERE DATE(churn_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { count: number };

    const churnRate = customersAtStart.count > 0
      ? (customersChurned.count / customersAtStart.count) * 100
      : 0;

    const benchmark = 5; // Monthly benchmark

    return {
      name: 'Churn Rate',
      value: parseFloat(churnRate.toFixed(2)),
      unit: '%',
      benchmark,
      status: churnRate <= 3 ? 'Excellent' : churnRate <= 5 ? 'Good' : churnRate <= 8 ? 'Warning' : 'Critical',
      formula: '(Customers Churned / Customers at Period Start) × 100',
      dataPoints: {
        customersAtStart: customersAtStart.count,
        customersChurned: customersChurned.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 5: Customer Lifetime Value (LTV)
   * Formula: Average ARR × (1 / Churn Rate) × Gross Margin %
   * Benchmark: ≥$100,000
   */
  calculateCustomerLTV(startDate: string, endDate: string): KPIResult {
    const avgARR = this.db.prepare(`
      SELECT AVG(arr) as avg_arr
      FROM cs_customers
      WHERE account_status = 'Active'
        AND arr IS NOT NULL AND arr > 0
    `).get() as { avg_arr: number | null };

    const churnRateKPI = this.calculateChurnRate(startDate, endDate);
    const annualChurnRate = churnRateKPI.value * 4; // Convert quarterly to annual
    const grossMargin = 0.80; // Assume 80% gross margin for SaaS

    const avgCustomerARR = avgARR.avg_arr || 0;
    const customerLifetimeYears = annualChurnRate > 0 ? 1 / (annualChurnRate / 100) : 5;
    const ltv = avgCustomerARR * customerLifetimeYears * grossMargin;

    const benchmark = 100000;

    return {
      name: 'Customer Lifetime Value (LTV)',
      value: parseFloat(ltv.toFixed(0)),
      unit: ' $',
      benchmark,
      status: ltv >= 150000 ? 'Excellent' : ltv >= 100000 ? 'Good' : ltv >= 70000 ? 'Warning' : 'Critical',
      formula: 'Avg ARR × Customer Lifetime (years) × Gross Margin (80%)',
      dataPoints: {
        avgARR: avgCustomerARR,
        annualChurnRate: annualChurnRate,
        customerLifetimeYears: parseFloat(customerLifetimeYears.toFixed(1)),
        grossMargin: grossMargin,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 6: Net Revenue Retention (NRR) %
   * Formula: ((Start ARR + Expansion - Churn) / Start ARR) × 100
   * Benchmark: ≥110%
   */
  calculateNetRevenueRetention(startDate: string, endDate: string): KPIResult {
    // ARR at start of period
    const startARR = this.db.prepare(`
      SELECT COALESCE(SUM(arr), 0) as total_arr
      FROM cs_customers
      WHERE DATE(signup_date) < DATE(?)
        AND account_status = 'Active'
    `).get(startDate) as { total_arr: number };

    // Expansion ARR during period
    const expansionARR = this.db.prepare(`
      SELECT COALESCE(SUM(estimated_arr_increase), 0) as total_expansion
      FROM cs_expansion_opps
      WHERE stage = 'Closed Won'
        AND DATE(actual_close_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_expansion: number };

    // Churned ARR during period
    const churnedARR = this.db.prepare(`
      SELECT COALESCE(SUM(arr_lost), 0) as total_churn
      FROM cs_churn_events
      WHERE DATE(churn_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { total_churn: number };

    const nrr = startARR.total_arr > 0
      ? ((startARR.total_arr + expansionARR.total_expansion - churnedARR.total_churn) / startARR.total_arr) * 100
      : 100;

    const benchmark = 110;

    return {
      name: 'Net Revenue Retention (NRR)',
      value: parseFloat(nrr.toFixed(1)),
      unit: '%',
      benchmark,
      status: nrr >= 120 ? 'Excellent' : nrr >= 110 ? 'Good' : nrr >= 100 ? 'Warning' : 'Critical',
      formula: '((Starting ARR + Expansion ARR - Churned ARR) / Starting ARR) × 100',
      dataPoints: {
        startingARR: startARR.total_arr,
        expansionARR: expansionARR.total_expansion,
        churnedARR: churnedARR.total_churn,
        endingARR: startARR.total_arr + expansionARR.total_expansion - churnedARR.total_churn,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 7: Average Customer Health Score
   * Formula: Average of latest health scores across all active customers
   * Benchmark: ≥75
   */
  calculateAvgHealthScore(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(health_score) as avg_health, COUNT(*) as count
      FROM cs_customers
      WHERE account_status = 'Active'
        AND health_score IS NOT NULL
    `).get() as { avg_health: number | null, count: number };

    const avgHealth = result.avg_health || 0;
    const benchmark = 75;

    // Count by health category
    const healthDistribution = this.db.prepare(`
      SELECT
        SUM(CASE WHEN health_score >= 80 THEN 1 ELSE 0 END) as healthy,
        SUM(CASE WHEN health_score >= 60 AND health_score < 80 THEN 1 ELSE 0 END) as at_risk,
        SUM(CASE WHEN health_score < 60 THEN 1 ELSE 0 END) as critical
      FROM cs_customers
      WHERE account_status = 'Active'
        AND health_score IS NOT NULL
    `).get() as { healthy: number, at_risk: number, critical: number };

    return {
      name: 'Average Customer Health Score',
      value: parseFloat(avgHealth.toFixed(1)),
      unit: '/100',
      benchmark,
      status: avgHealth >= 80 ? 'Excellent' : avgHealth >= 75 ? 'Good' : avgHealth >= 60 ? 'Warning' : 'Critical',
      formula: 'Average health score across all active customers',
      dataPoints: {
        avgHealthScore: avgHealth,
        totalCustomers: result.count,
        healthyCustomers: healthDistribution.healthy,
        atRiskCustomers: healthDistribution.at_risk,
        criticalCustomers: healthDistribution.critical,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 8: Time to First Value (days)
   * Formula: Average days from signup to first meaningful product usage
   * Benchmark: ≤14 days
   */
  calculateTimeToFirstValue(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(time_to_first_value_days) as avg_days, COUNT(*) as count
      FROM cs_onboarding
      WHERE onboarding_status = 'Completed'
        AND DATE(actual_completion_date) BETWEEN DATE(?) AND DATE(?)
        AND time_to_first_value_days IS NOT NULL
    `).get(startDate, endDate) as { avg_days: number | null, count: number };

    const avgDays = result.avg_days || 0;
    const benchmark = 14;

    return {
      name: 'Time to First Value',
      value: parseFloat(avgDays.toFixed(1)),
      unit: ' days',
      benchmark,
      status: avgDays <= 10 ? 'Excellent' : avgDays <= 14 ? 'Good' : avgDays <= 21 ? 'Warning' : 'Critical',
      formula: 'Average days from customer signup to first valuable product usage',
      dataPoints: {
        avgTimeToValue: avgDays,
        completedOnboardings: result.count,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 9: Product Adoption Rate (%)
   * Formula: Average feature adoption score across active customers
   * Benchmark: ≥70%
   */
  calculateProductAdoptionRate(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(feature_adoption_score) as avg_adoption
      FROM cs_product_usage
      WHERE DATE(usage_date) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as { avg_adoption: number | null };

    const avgAdoption = result.avg_adoption || 0;
    const benchmark = 70;

    return {
      name: 'Product Adoption Rate',
      value: parseFloat(avgAdoption.toFixed(1)),
      unit: '%',
      benchmark,
      status: avgAdoption >= 80 ? 'Excellent' : avgAdoption >= 70 ? 'Good' : avgAdoption >= 50 ? 'Warning' : 'Critical',
      formula: 'Average feature adoption score across all active customers',
      dataPoints: {
        avgAdoptionScore: avgAdoption,
        period: { startDate, endDate }
      }
    };
  }

  /**
   * KPI 10: Average Support Ticket Resolution Time (hours)
   * Formula: Average time from ticket creation to resolution
   * Benchmark: ≤24 hours
   */
  calculateAvgTicketResolution(startDate: string, endDate: string): KPIResult {
    const result = this.db.prepare(`
      SELECT AVG(resolution_time_hours) as avg_hours, COUNT(*) as count
      FROM cs_support_tickets
      WHERE status IN ('Resolved', 'Closed')
        AND DATE(resolved_date) BETWEEN DATE(?) AND DATE(?)
        AND resolution_time_hours IS NOT NULL
    `).get(startDate, endDate) as { avg_hours: number | null, count: number };

    const avgHours = result.avg_hours || 0;
    const benchmark = 24;

    return {
      name: 'Avg Support Ticket Resolution Time',
      value: parseFloat(avgHours.toFixed(1)),
      unit: ' hours',
      benchmark,
      status: avgHours <= 12 ? 'Excellent' : avgHours <= 24 ? 'Good' : avgHours <= 48 ? 'Warning' : 'Critical',
      formula: 'Average hours from ticket creation to resolution',
      dataPoints: {
        avgResolutionHours: avgHours,
        ticketsResolved: result.count,
        period: { startDate, endDate }
      }
    };
  }
}
