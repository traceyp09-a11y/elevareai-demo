import Database from 'better-sqlite3';
import { subMonths, subDays, format, addMonths } from 'date-fns';

interface PredictiveInsight {
  type: 'warning' | 'opportunity' | 'critical' | 'info';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  relatedMetrics: string[];
}

interface RiskScore {
  facilityId: number;
  facilityName: string;
  department?: string;
  overallRisk: number; // 0-100
  incidentRisk: number;
  complianceRisk: number;
  behavioralRisk: number;
  trend: 'improving' | 'stable' | 'declining';
  predictedIncidents: number;
}

interface TrendForecast {
  metric: string;
  currentValue: number;
  forecast: Array<{
    month: string;
    predicted: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
}

interface Anomaly {
  date: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export class PredictiveAnalyticsService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 1. Calculate Risk Scores for Facilities and Departments
  calculateRiskScores(): RiskScore[] {
    const facilities = this.db.prepare('SELECT id, name, type FROM facilities').all() as any[];
    const riskScores: RiskScore[] = [];

    facilities.forEach(facility => {
      // Incident Risk (40% weight)
      const recentIncidents = this.db.prepare(`
        SELECT COUNT(*) as count FROM safety_incidents
        WHERE facility_id = ? AND incident_date >= date('now', '-90 days')
      `).get(facility.id) as any;

      const incidentTrend = this.calculateIncidentTrend(facility.id);
      const incidentRisk = Math.min(100, (recentIncidents.count * 5) + (incidentTrend > 0 ? 20 : 0));

      // Compliance Risk (30% weight)
      const ppeCompliance = this.db.prepare(`
        SELECT AVG(CAST(compliant_employees AS FLOAT) / CAST(total_employees_observed AS FLOAT) * 100) as avg
        FROM hse_ppe_audits
        WHERE facility_id = ? AND audit_date >= date('now', '-90 days')
      `).get(facility.id) as any;

      const envCompliance = this.db.prepare(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN compliant = 1 THEN 1 ELSE 0 END) as compliant
        FROM hse_environmental_metrics
        WHERE facility_id = ? AND record_date >= date('now', '-90 days')
      `).get(facility.id) as any;

      const avgCompliance = ((ppeCompliance.avg || 95) + (envCompliance.total > 0 ? (envCompliance.compliant / envCompliance.total * 100) : 95)) / 2;
      const complianceRisk = 100 - avgCompliance;

      // Behavioral Risk (30% weight)
      const nearMisses = this.db.prepare(`
        SELECT COUNT(*) as count FROM hse_near_misses
        WHERE facility_id = ? AND report_date >= date('now', '-90 days')
      `).get(facility.id) as any;

      const hazardReports = this.db.prepare(`
        SELECT COUNT(*) as count,
               SUM(CASE WHEN status = 'Open' OR status = 'In Progress' THEN 1 ELSE 0 END) as open
        FROM hse_hazard_reports
        WHERE facility_id = ? AND report_date >= date('now', '-90 days')
      `).get(facility.id) as any;

      const behavioralRisk = Math.min(100, (
        (nearMisses.count < 10 ? 30 : nearMisses.count > 30 ? 10 : 20) +
        (hazardReports.open > 0 ? (hazardReports.open / hazardReports.count * 50) : 0)
      ));

      // Overall Risk (weighted average)
      const overallRisk = (
        incidentRisk * 0.4 +
        complianceRisk * 0.3 +
        behavioralRisk * 0.3
      );

      // Predict incidents for next 30 days using trend analysis
      const predictedIncidents = Math.max(0, Math.round(
        recentIncidents.count * 0.33 * (1 + incidentTrend / 100)
      ));

      // Determine trend
      let trend: 'improving' | 'stable' | 'declining';
      if (incidentTrend < -10) trend = 'improving';
      else if (incidentTrend > 10) trend = 'declining';
      else trend = 'stable';

      riskScores.push({
        facilityId: facility.id,
        facilityName: facility.name,
        overallRisk: Math.round(overallRisk),
        incidentRisk: Math.round(incidentRisk),
        complianceRisk: Math.round(complianceRisk),
        behavioralRisk: Math.round(behavioralRisk),
        trend,
        predictedIncidents
      });
    });

    return riskScores.sort((a, b) => b.overallRisk - a.overallRisk);
  }

  // Calculate incident trend (% change)
  private calculateIncidentTrend(facilityId: number): number {
    const recent = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE facility_id = ? AND incident_date >= date('now', '-30 days')
    `).get(facilityId) as any;

    const previous = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE facility_id = ? AND incident_date >= date('now', '-60 days') AND incident_date < date('now', '-30 days')
    `).get(facilityId) as any;

    if (previous.count === 0) return recent.count > 0 ? 100 : 0;
    return ((recent.count - previous.count) / previous.count) * 100;
  }

  // 2. Forecast TRIR and LTIFR for next 6 months
  forecastSafetyMetrics(): TrendForecast[] {
    const forecasts: TrendForecast[] = [];

    // Get historical TRIR data
    const trirHistory = this.getHistoricalTRIR();
    const trirForecast = this.generateForecast('TRIR', trirHistory, 6);
    forecasts.push(trirForecast);

    // Get historical LTIFR data
    const ltifrHistory = this.getHistoricalLTIFR();
    const ltifrForecast = this.generateForecast('LTIFR', ltifrHistory, 6);
    forecasts.push(ltifrForecast);

    return forecasts;
  }

  private getHistoricalTRIR(): Array<{ month: string; value: number }> {
    const data = [];
    for (let i = 12; i >= 0; i--) {
      const startDate = format(subMonths(new Date(), i + 1), 'yyyy-MM-01');
      const endDate = format(subMonths(new Date(), i), 'yyyy-MM-01');

      const incidents = this.db.prepare(`
        SELECT COUNT(*) as count FROM safety_incidents
        WHERE incident_date >= ? AND incident_date < ? AND recordable = 1
      `).get(startDate, endDate) as any;

      const hours = this.db.prepare(`
        SELECT SUM(total_hours) as total FROM labor_hours
        WHERE record_date >= ? AND record_date < ?
      `).get(startDate, endDate) as any;

      const trir = hours.total > 0 ? (incidents.count * 200000) / hours.total : 0;

      data.push({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        value: trir
      });
    }
    return data;
  }

  private getHistoricalLTIFR(): Array<{ month: string; value: number }> {
    const data = [];
    for (let i = 12; i >= 0; i--) {
      const startDate = format(subMonths(new Date(), i + 1), 'yyyy-MM-01');
      const endDate = format(subMonths(new Date(), i), 'yyyy-MM-01');

      const lti = this.db.prepare(`
        SELECT COUNT(*) as count FROM safety_incidents
        WHERE incident_date >= ? AND incident_date < ? AND lost_work_days > 0
      `).get(startDate, endDate) as any;

      const hours = this.db.prepare(`
        SELECT SUM(total_hours) as total FROM labor_hours
        WHERE record_date >= ? AND record_date < ?
      `).get(startDate, endDate) as any;

      const ltifr = hours.total > 0 ? (lti.count * 1000000) / hours.total : 0;

      data.push({
        month: format(subMonths(new Date(), i), 'MMM yyyy'),
        value: ltifr
      });
    }
    return data;
  }

  private generateForecast(metric: string, history: Array<{ month: string; value: number }>, months: number): TrendForecast {
    const values = history.map(h => h.value);
    const n = values.length;

    // Simple linear regression for trend
    const xSum = (n * (n + 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, y, i) => sum + y * (i + 1), 0);
    const xSquareSum = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
    const intercept = (ySum - slope * xSum) / n;

    // Calculate standard deviation for confidence intervals
    const predictions = values.map((_, i) => intercept + slope * (i + 1));
    const errors = values.map((v, i) => v - predictions[i]);
    const variance = errors.reduce((sum, e) => sum + e * e, 0) / n;
    const stdDev = Math.sqrt(variance);

    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const predicted = intercept + slope * (n + i);
      const confidence = Math.max(60, 95 - i * 5); // Confidence decreases over time

      forecast.push({
        month: format(addMonths(new Date(), i), 'MMM yyyy'),
        predicted: Math.max(0, predicted),
        confidence,
        upperBound: Math.max(0, predicted + 1.96 * stdDev),
        lowerBound: Math.max(0, predicted - 1.96 * stdDev)
      });
    }

    return {
      metric,
      currentValue: values[values.length - 1],
      forecast
    };
  }

  // 3. Detect Anomalies in Safety Data
  detectAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect incident spikes
    const incidentAnomalies = this.detectIncidentAnomalies();
    anomalies.push(...incidentAnomalies);

    // Detect compliance drops
    const complianceAnomalies = this.detectComplianceAnomalies();
    anomalies.push(...complianceAnomalies);

    // Detect unusual patterns in near misses
    const nearMissAnomalies = this.detectNearMissAnomalies();
    anomalies.push(...nearMissAnomalies);

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private detectIncidentAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Get daily incident counts for last 90 days
    for (let i = 0; i < 90; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const count = this.db.prepare(`
        SELECT COUNT(*) as count FROM safety_incidents WHERE incident_date = ?
      `).get(date) as any;

      // Calculate expected value (moving average of previous 30 days)
      const avgCount = this.db.prepare(`
        SELECT AVG(daily_count) as avg FROM (
          SELECT DATE(incident_date) as date, COUNT(*) as daily_count
          FROM safety_incidents
          WHERE incident_date >= date(?, '-30 days') AND incident_date < ?
          GROUP BY DATE(incident_date)
        )
      `).get(date, date) as any;

      const expected = avgCount.avg || 0.5;
      const deviation = ((count.count - expected) / (expected + 0.1)) * 100;

      if (count.count > 0 && deviation > 200) {
        anomalies.push({
          date,
          metric: 'Incidents',
          actualValue: count.count,
          expectedValue: expected,
          deviation,
          severity: count.count >= 3 ? 'critical' : 'high',
          description: `Unusual spike: ${count.count} incidents (expected ~${expected.toFixed(1)})`
        });
      }
    }

    return anomalies.slice(0, 5); // Top 5 most recent
  }

  private detectComplianceAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for sudden PPE compliance drops
    const recentAudits = this.db.prepare(`
      SELECT
        audit_date,
        CAST(compliant_employees AS FLOAT) / CAST(total_employees_observed AS FLOAT) * 100 as compliance
      FROM hse_ppe_audits
      WHERE audit_date >= date('now', '-30 days')
      ORDER BY audit_date DESC
    `).all() as any[];

    recentAudits.forEach(audit => {
      if (audit.compliance < 90) {
        anomalies.push({
          date: audit.audit_date,
          metric: 'PPE Compliance',
          actualValue: audit.compliance,
          expectedValue: 95,
          deviation: ((audit.compliance - 95) / 95) * 100,
          severity: audit.compliance < 85 ? 'critical' : 'high',
          description: `PPE compliance dropped to ${audit.compliance.toFixed(1)}% (target: 95%)`
        });
      }
    });

    return anomalies.slice(0, 3);
  }

  private detectNearMissAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Detect unusually low near miss reporting (potential underreporting)
    const recentNearMisses = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_near_misses
      WHERE report_date >= date('now', '-30 days')
    `).get() as any;

    const previousNearMisses = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_near_misses
      WHERE report_date >= date('now', '-60 days') AND report_date < date('now', '-30 days')
    `).get() as any;

    if (previousNearMisses.count > 0) {
      const dropPercent = ((previousNearMisses.count - recentNearMisses.count) / previousNearMisses.count) * 100;

      if (dropPercent > 50) {
        anomalies.push({
          date: format(subDays(new Date(), 15), 'yyyy-MM-dd'),
          metric: 'Near Miss Reporting',
          actualValue: recentNearMisses.count,
          expectedValue: previousNearMisses.count,
          deviation: -dropPercent,
          severity: 'medium',
          description: `Near miss reporting dropped ${dropPercent.toFixed(0)}% - possible underreporting`
        });
      }
    }

    return anomalies;
  }

  // 4. Generate Predictive Insights
  generateInsights(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Leading indicator analysis
    const leadingInsight = this.analyzeLeadingIndicators();
    if (leadingInsight) insights.push(leadingInsight);

    // Seasonal pattern analysis
    const seasonalInsight = this.analyzeSeasonalPatterns();
    if (seasonalInsight) insights.push(seasonalInsight);

    // Department risk insights
    const deptInsights = this.analyzeDepartmentRisks();
    insights.push(...deptInsights);

    // Training gap insights
    const trainingInsight = this.analyzeTrainingGaps();
    if (trainingInsight) insights.push(trainingInsight);

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  private analyzeLeadingIndicators(): PredictiveInsight | null {
    const nearMisses = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_near_misses
      WHERE report_date >= date('now', '-30 days')
    `).get() as any;

    const hazards = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_hazard_reports
      WHERE report_date >= date('now', '-30 days') AND (status = 'Open' OR status = 'In Progress')
    `).get() as any;

    const incidents = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE incident_date >= date('now', '-30 days')
    `).get() as any;

    // High leading indicators with low incidents = good safety culture
    // Low leading indicators with high incidents = reactive culture
    const leadingRatio = (nearMisses.count + hazards.count) / (incidents.count + 1);

    if (leadingRatio < 5) {
      return {
        type: 'warning',
        title: 'Low Proactive Safety Reporting Detected',
        description: `Near miss and hazard reporting is low relative to incidents (ratio: ${leadingRatio.toFixed(1)}:1). This suggests a reactive rather than proactive safety culture.`,
        confidence: 85,
        impact: 'high',
        recommendation: 'Increase safety observation programs, reward proactive reporting, and conduct safety culture assessment.',
        relatedMetrics: ['Near Miss Rate', 'Hazard Identification Rate', 'TRIR']
      };
    } else if (leadingRatio > 20) {
      return {
        type: 'opportunity',
        title: 'Strong Proactive Safety Culture',
        description: `Excellent leading indicator ratio (${leadingRatio.toFixed(1)}:1) shows strong proactive safety reporting and hazard identification.`,
        confidence: 90,
        impact: 'medium',
        recommendation: 'Continue current programs and share best practices across facilities. Consider benchmarking externally.',
        relatedMetrics: ['Near Miss Rate', 'Hazard Identification Rate']
      };
    }

    return null;
  }

  private analyzeSeasonalPatterns(): PredictiveInsight | null {
    // Check if we're approaching historically high-risk months
    const currentMonth = new Date().getMonth();

    // Manufacturing/Logistics typically see spikes in Q4 (holiday rush)
    if (currentMonth >= 9) { // Oct, Nov, Dec
      return {
        type: 'warning',
        title: 'Entering High-Risk Season',
        description: 'Q4 historically shows increased incident rates due to production pressures, seasonal workers, and reduced daylight hours.',
        confidence: 75,
        impact: 'high',
        recommendation: 'Increase safety observations, ensure seasonal worker training is complete, and review fatigue management policies.',
        relatedMetrics: ['TRIR', 'LTIFR', 'Safety Training Rate']
      };
    }

    return null;
  }

  private analyzeDepartmentRisks(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    const deptRisks = this.db.prepare(`
      SELECT
        department,
        COUNT(*) as incidents
      FROM safety_incidents
      WHERE incident_date >= date('now', '-90 days')
      GROUP BY department
      ORDER BY incidents DESC
      LIMIT 3
    `).all() as any[];

    deptRisks.forEach((dept, index) => {
      if (dept.incidents >= 5) {
        insights.push({
          type: index === 0 ? 'critical' : 'warning',
          title: `High Incident Rate in ${dept.department}`,
          description: `${dept.department} has recorded ${dept.incidents} incidents in the last 90 days, indicating elevated risk.`,
          confidence: 80,
          impact: 'high',
          recommendation: `Conduct focused safety stand-down in ${dept.department}, review job hazard analyses, and increase supervision.`,
          relatedMetrics: ['TRIR', 'LTIFR', 'Safety Audit Score']
        });
      }
    });

    return insights;
  }

  private analyzeTrainingGaps(): PredictiveInsight | null {
    const expiredCerts = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_safety_certifications
      WHERE status = 'Expired' OR (expiration_date <= date('now', '+30 days') AND status = 'Active')
    `).get() as any;

    if (expiredCerts.count > 10) {
      return {
        type: 'warning',
        title: 'Safety Certification Gaps Identified',
        description: `${expiredCerts.count} safety certifications are expired or expiring within 30 days, creating compliance and competency risks.`,
        confidence: 95,
        impact: 'medium',
        recommendation: 'Immediately schedule renewal training for expiring certifications and implement automated renewal reminders.',
        relatedMetrics: ['Safety Training Rate', 'Safety Audit Score']
      };
    }

    return null;
  }

  // Get all predictive analytics
  getAllPredictiveAnalytics() {
    return {
      riskScores: this.calculateRiskScores(),
      forecasts: this.forecastSafetyMetrics(),
      anomalies: this.detectAnomalies(),
      insights: this.generateInsights(),
      timestamp: new Date().toISOString()
    };
  }
}
