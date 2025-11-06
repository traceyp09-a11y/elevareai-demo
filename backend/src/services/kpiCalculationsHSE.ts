import Database from 'better-sqlite3';
import { subMonths, format } from 'date-fns';

export interface KPIResult {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
}

export class HSEKPICalculationService {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
  }

  // 1. TRIR (Total Recordable Incident Rate)
  // Formula: (Number of OSHA recordable incidents × 200,000) / Total hours worked
  calculateTRIR(startDate: string, endDate: string): KPIResult {
    const incidents = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE incident_date BETWEEN ? AND ?
      AND recordable = 1
    `).get(startDate, endDate) as any;

    const laborHours = this.db.prepare(`
      SELECT SUM(total_hours) as total FROM labor_hours
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const totalHours = laborHours.total || 0;
    const trir = totalHours > 0 ? (incidents.count * 200000) / totalHours : 0;

    return {
      value: trir,
      displayValue: trir.toFixed(2),
      calculation: {
        formula: 'TRIR = (Number of OSHA Recordable Incidents × 200,000) / Total Hours Worked',
        components: {
          recordableIncidents: incidents.count,
          totalHoursWorked: totalHours,
          period: `${startDate} to ${endDate}`,
          standardFactor: 200000
        },
        steps: [
          `Step 1: Count OSHA recordable incidents = ${incidents.count}`,
          `Step 2: Calculate total hours worked = ${totalHours.toLocaleString()} hours`,
          `Step 3: Apply OSHA formula = (${incidents.count} × 200,000) / ${totalHours.toLocaleString()}`,
          `Step 4: TRIR = ${trir.toFixed(2)}`
        ]
      },
      benchmark: {
        value: 3.0,
        status: trir < 3.0 ? 'below' : trir > 3.0 ? 'above' : 'at'
      }
    };
  }

  // 2. LTIFR (Lost Time Injury Frequency Rate)
  // Formula: (Number of lost time injuries × 1,000,000) / Total hours worked
  calculateLTIFR(startDate: string, endDate: string): KPIResult {
    const lostTimeIncidents = this.db.prepare(`
      SELECT COUNT(*) as count FROM safety_incidents
      WHERE incident_date BETWEEN ? AND ?
      AND lost_work_days > 0
    `).get(startDate, endDate) as any;

    const laborHours = this.db.prepare(`
      SELECT SUM(total_hours) as total FROM labor_hours
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const totalHours = laborHours.total || 0;
    const ltifr = totalHours > 0 ? (lostTimeIncidents.count * 1000000) / totalHours : 0;

    const totalLostDays = this.db.prepare(`
      SELECT SUM(lost_work_days) as total FROM safety_incidents
      WHERE incident_date BETWEEN ? AND ?
      AND lost_work_days > 0
    `).get(startDate, endDate) as any;

    return {
      value: ltifr,
      displayValue: ltifr.toFixed(2),
      calculation: {
        formula: 'LTIFR = (Number of Lost Time Injuries × 1,000,000) / Total Hours Worked',
        components: {
          lostTimeInjuries: lostTimeIncidents.count,
          totalHoursWorked: totalHours,
          totalLostWorkDays: totalLostDays.total || 0,
          period: `${startDate} to ${endDate}`,
          standardFactor: 1000000
        },
        steps: [
          `Step 1: Count lost time injuries = ${lostTimeIncidents.count}`,
          `Step 2: Calculate total hours worked = ${totalHours.toLocaleString()} hours`,
          `Step 3: Apply formula = (${lostTimeIncidents.count} × 1,000,000) / ${totalHours.toLocaleString()}`,
          `Step 4: LTIFR = ${ltifr.toFixed(2)}`,
          `Step 5: Total lost work days = ${totalLostDays.total || 0} days`
        ]
      },
      benchmark: {
        value: 1.0,
        status: ltifr < 1.0 ? 'below' : ltifr > 1.0 ? 'above' : 'at'
      }
    };
  }

  // 3. Near Miss Reporting Rate
  // Formula: (Number of near miss reports / Total employees) × 100
  calculateNearMissRate(startDate: string, endDate: string): KPIResult {
    const nearMisses = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_near_misses
      WHERE report_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const activeEmployees = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees
      WHERE status = 'Active'
    `).get() as any;

    const rate = activeEmployees.count > 0 ? (nearMisses.count / activeEmployees.count) * 100 : 0;

    const actionCompleted = this.db.prepare(`
      SELECT COUNT(*) as count FROM hse_near_misses
      WHERE report_date BETWEEN ? AND ?
      AND action_completed = 1
    `).get(startDate, endDate) as any;

    const completionRate = nearMisses.count > 0 ? (actionCompleted.count / nearMisses.count) * 100 : 0;

    return {
      value: rate,
      displayValue: `${rate.toFixed(2)}%`,
      calculation: {
        formula: 'Near Miss Rate = (Number of Near Miss Reports / Total Employees) × 100',
        components: {
          nearMissReports: nearMisses.count,
          activeEmployees: activeEmployees.count,
          actionsCompleted: actionCompleted.count,
          completionRate: completionRate.toFixed(2),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count near miss reports = ${nearMisses.count}`,
          `Step 2: Count active employees = ${activeEmployees.count}`,
          `Step 3: Calculate rate = (${nearMisses.count} / ${activeEmployees.count}) × 100`,
          `Step 4: Near miss reporting rate = ${rate.toFixed(2)}%`,
          `Step 5: Corrective action completion rate = ${completionRate.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 10.0,
        status: rate > 10.0 ? 'above' : rate < 10.0 ? 'below' : 'at'
      }
    };
  }

  // 4. Safety Training Completion Rate
  // Formula: (Safety training completed / Total safety training required) × 100
  calculateSafetyTrainingRate(startDate: string, endDate: string): KPIResult {
    const safetyTraining = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
      FROM training_enrollments te
      JOIN training_programs tp ON te.program_id = tp.id
      WHERE tp.category = 'Safety'
      AND te.enrollment_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const completionRate = safetyTraining.total > 0
      ? (safetyTraining.completed / safetyTraining.total) * 100
      : 0;

    const certifications = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Expired' THEN 1 ELSE 0 END) as expired
      FROM hse_safety_certifications
    `).get() as any;

    return {
      value: completionRate,
      displayValue: `${completionRate.toFixed(2)}%`,
      calculation: {
        formula: 'Training Completion Rate = (Safety Training Completed / Total Safety Training) × 100',
        components: {
          totalTraining: safetyTraining.total,
          completedTraining: safetyTraining.completed,
          activeCertifications: certifications.active,
          expiredCertifications: certifications.expired,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Count total safety training enrollments = ${safetyTraining.total}`,
          `Step 2: Count completed training = ${safetyTraining.completed}`,
          `Step 3: Calculate completion rate = (${safetyTraining.completed} / ${safetyTraining.total}) × 100`,
          `Step 4: Safety training completion rate = ${completionRate.toFixed(2)}%`,
          `Step 5: Active certifications = ${certifications.active}, Expired = ${certifications.expired}`
        ]
      },
      benchmark: {
        value: 95.0,
        status: completionRate > 95.0 ? 'above' : completionRate < 95.0 ? 'below' : 'at'
      }
    };
  }

  // 5. PPE Compliance Rate
  // Formula: (Compliant observations / Total observations) × 100
  calculatePPEComplianceRate(startDate: string, endDate: string): KPIResult {
    const ppeData = this.db.prepare(`
      SELECT
        SUM(total_employees_observed) as total_observed,
        SUM(compliant_employees) as total_compliant,
        SUM(non_compliant_employees) as total_non_compliant,
        COUNT(*) as total_audits
      FROM hse_ppe_audits
      WHERE audit_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const complianceRate = ppeData.total_observed > 0
      ? (ppeData.total_compliant / ppeData.total_observed) * 100
      : 0;

    const byType = this.db.prepare(`
      SELECT
        ppe_type,
        SUM(total_employees_observed) as observed,
        SUM(compliant_employees) as compliant
      FROM hse_ppe_audits
      WHERE audit_date BETWEEN ? AND ?
      GROUP BY ppe_type
      ORDER BY observed DESC
      LIMIT 5
    `).all(startDate, endDate) as any[];

    return {
      value: complianceRate,
      displayValue: `${complianceRate.toFixed(2)}%`,
      calculation: {
        formula: 'PPE Compliance Rate = (Compliant Observations / Total Observations) × 100',
        components: {
          totalObservations: ppeData.total_observed,
          compliantObservations: ppeData.total_compliant,
          nonCompliantObservations: ppeData.total_non_compliant,
          totalAudits: ppeData.total_audits,
          byType: byType,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total employees observed = ${ppeData.total_observed}`,
          `Step 2: Compliant employees = ${ppeData.total_compliant}`,
          `Step 3: Non-compliant employees = ${ppeData.total_non_compliant}`,
          `Step 4: Calculate compliance rate = (${ppeData.total_compliant} / ${ppeData.total_observed}) × 100`,
          `Step 5: PPE compliance rate = ${complianceRate.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 95.0,
        status: complianceRate > 95.0 ? 'above' : complianceRate < 95.0 ? 'below' : 'at'
      }
    };
  }

  // 6. Environmental Compliance Score
  // Formula: (Compliant metrics / Total metrics) × 100
  calculateEnvironmentalCompliance(startDate: string, endDate: string): KPIResult {
    const envData = this.db.prepare(`
      SELECT
        COUNT(*) as total_metrics,
        SUM(CASE WHEN compliant = 1 THEN 1 ELSE 0 END) as compliant_metrics,
        SUM(CASE WHEN compliant = 0 THEN 1 ELSE 0 END) as non_compliant_metrics
      FROM hse_environmental_metrics
      WHERE record_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const complianceScore = envData.total_metrics > 0
      ? (envData.compliant_metrics / envData.total_metrics) * 100
      : 0;

    const violations = this.db.prepare(`
      SELECT
        metric_type,
        COUNT(*) as violation_count
      FROM hse_environmental_metrics
      WHERE record_date BETWEEN ? AND ?
      AND compliant = 0
      GROUP BY metric_type
      ORDER BY violation_count DESC
    `).all(startDate, endDate) as any[];

    return {
      value: complianceScore,
      displayValue: `${complianceScore.toFixed(2)}%`,
      calculation: {
        formula: 'Environmental Compliance = (Compliant Metrics / Total Metrics) × 100',
        components: {
          totalMetrics: envData.total_metrics,
          compliantMetrics: envData.compliant_metrics,
          nonCompliantMetrics: envData.non_compliant_metrics,
          violations: violations,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total environmental metrics tracked = ${envData.total_metrics}`,
          `Step 2: Compliant metrics = ${envData.compliant_metrics}`,
          `Step 3: Non-compliant metrics = ${envData.non_compliant_metrics}`,
          `Step 4: Calculate compliance score = (${envData.compliant_metrics} / ${envData.total_metrics}) × 100`,
          `Step 5: Environmental compliance score = ${complianceScore.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 98.0,
        status: complianceScore > 98.0 ? 'above' : complianceScore < 98.0 ? 'below' : 'at'
      }
    };
  }

  // 7. Safety Audit Score
  // Formula: Average overall score from safety audits
  calculateSafetyAuditScore(startDate: string, endDate: string): KPIResult {
    const auditData = this.db.prepare(`
      SELECT
        COUNT(*) as total_audits,
        AVG(overall_score) as avg_score,
        SUM(total_items_checked) as total_items,
        SUM(items_passed) as items_passed,
        SUM(items_failed) as items_failed,
        SUM(critical_findings) as critical_findings
      FROM hse_safety_audits
      WHERE audit_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const avgScore = auditData.avg_score || 0;

    const byType = this.db.prepare(`
      SELECT
        audit_type,
        COUNT(*) as count,
        AVG(overall_score) as avg_score
      FROM hse_safety_audits
      WHERE audit_date BETWEEN ? AND ?
      GROUP BY audit_type
    `).all(startDate, endDate) as any[];

    return {
      value: avgScore,
      displayValue: `${avgScore.toFixed(2)}%`,
      calculation: {
        formula: 'Safety Audit Score = Average of (Items Passed / Total Items) × 100',
        components: {
          totalAudits: auditData.total_audits,
          averageScore: avgScore,
          totalItemsChecked: auditData.total_items,
          itemsPassed: auditData.items_passed,
          itemsFailed: auditData.items_failed,
          criticalFindings: auditData.critical_findings,
          byType: byType,
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total safety audits conducted = ${auditData.total_audits}`,
          `Step 2: Total items checked = ${auditData.total_items}`,
          `Step 3: Items passed = ${auditData.items_passed}, Items failed = ${auditData.items_failed}`,
          `Step 4: Critical findings = ${auditData.critical_findings}`,
          `Step 5: Average audit score = ${avgScore.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 90.0,
        status: avgScore > 90.0 ? 'above' : avgScore < 90.0 ? 'below' : 'at'
      }
    };
  }

  // 8. Incident Investigation Closure Time
  // Formula: Average days to close incident investigations
  calculateInvestigationClosureTime(startDate: string, endDate: string): KPIResult {
    const investigations = this.db.prepare(`
      SELECT
        investigation_opened_date,
        investigation_closed_date,
        investigation_status
      FROM hse_incident_investigations
      WHERE investigation_opened_date BETWEEN ? AND ?
    `).all(startDate, endDate) as any[];

    const closedInvestigations = investigations.filter(inv => inv.investigation_closed_date);

    let totalDays = 0;
    closedInvestigations.forEach(inv => {
      const openDate = new Date(inv.investigation_opened_date);
      const closeDate = new Date(inv.investigation_closed_date);
      const days = Math.floor((closeDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
    });

    const avgDays = closedInvestigations.length > 0 ? totalDays / closedInvestigations.length : 0;
    const closureRate = investigations.length > 0
      ? (closedInvestigations.length / investigations.length) * 100
      : 0;

    return {
      value: avgDays,
      displayValue: `${avgDays.toFixed(1)} days`,
      calculation: {
        formula: 'Average Closure Time = Total Days to Close All Investigations / Number of Closed Investigations',
        components: {
          totalInvestigations: investigations.length,
          closedInvestigations: closedInvestigations.length,
          openInvestigations: investigations.length - closedInvestigations.length,
          totalDays: totalDays,
          closureRate: closureRate.toFixed(2),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total investigations opened = ${investigations.length}`,
          `Step 2: Closed investigations = ${closedInvestigations.length}`,
          `Step 3: Open investigations = ${investigations.length - closedInvestigations.length}`,
          `Step 4: Total days to close all = ${totalDays} days`,
          `Step 5: Average closure time = ${avgDays.toFixed(1)} days`,
          `Step 6: Closure rate = ${closureRate.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 30.0,
        status: avgDays < 30.0 ? 'below' : avgDays > 30.0 ? 'above' : 'at'
      }
    };
  }

  // 9. Hazard Identification Rate
  // Formula: (Number of hazards reported / Total employees) × 100
  calculateHazardIdentificationRate(startDate: string, endDate: string): KPIResult {
    const hazards = this.db.prepare(`
      SELECT
        COUNT(*) as total_hazards,
        SUM(CASE WHEN status = 'Resolved' OR status = 'Closed' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN severity_level = 'Critical' OR severity_level = 'High' THEN 1 ELSE 0 END) as high_severity
      FROM hse_hazard_reports
      WHERE report_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const activeEmployees = this.db.prepare(`
      SELECT COUNT(*) as count FROM employees
      WHERE status = 'Active'
    `).get() as any;

    const rate = activeEmployees.count > 0 ? (hazards.total_hazards / activeEmployees.count) * 100 : 0;
    const resolutionRate = hazards.total_hazards > 0
      ? (hazards.resolved / hazards.total_hazards) * 100
      : 0;

    return {
      value: rate,
      displayValue: `${rate.toFixed(2)}%`,
      calculation: {
        formula: 'Hazard Identification Rate = (Number of Hazards Reported / Total Employees) × 100',
        components: {
          totalHazards: hazards.total_hazards,
          activeEmployees: activeEmployees.count,
          resolvedHazards: hazards.resolved,
          highSeverityHazards: hazards.high_severity,
          resolutionRate: resolutionRate.toFixed(2),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total hazards reported = ${hazards.total_hazards}`,
          `Step 2: Active employees = ${activeEmployees.count}`,
          `Step 3: Calculate identification rate = (${hazards.total_hazards} / ${activeEmployees.count}) × 100`,
          `Step 4: Hazard identification rate = ${rate.toFixed(2)}%`,
          `Step 5: Resolved hazards = ${hazards.resolved} (${resolutionRate.toFixed(2)}%)`,
          `Step 6: High/Critical severity hazards = ${hazards.high_severity}`
        ]
      },
      benchmark: {
        value: 15.0,
        status: rate > 15.0 ? 'above' : rate < 15.0 ? 'below' : 'at'
      }
    };
  }

  // 10. Emergency Preparedness Score
  // Formula: Weighted score based on drill performance, participation, and timing
  calculateEmergencyPreparednessScore(startDate: string, endDate: string): KPIResult {
    const drills = this.db.prepare(`
      SELECT
        COUNT(*) as total_drills,
        AVG(CAST(participants_actual AS FLOAT) / CAST(participants_expected AS FLOAT) * 100) as avg_participation,
        SUM(CASE WHEN evacuation_time_minutes <= target_evacuation_time THEN 1 ELSE 0 END) as drills_met_target,
        SUM(CASE WHEN performance_rating = 'Excellent' THEN 4
                 WHEN performance_rating = 'Good' THEN 3
                 WHEN performance_rating = 'Satisfactory' THEN 2
                 ELSE 1 END) as rating_points
      FROM hse_emergency_drills
      WHERE drill_date BETWEEN ? AND ?
    `).get(startDate, endDate) as any;

    const participationScore = drills.avg_participation || 0;
    const timePerformanceRate = drills.total_drills > 0
      ? (drills.drills_met_target / drills.total_drills) * 100
      : 0;
    const avgRating = drills.total_drills > 0
      ? (drills.rating_points / drills.total_drills) / 4 * 100
      : 0;

    // Weighted average: 40% participation, 30% time performance, 30% rating
    const overallScore = (participationScore * 0.4) + (timePerformanceRate * 0.3) + (avgRating * 0.3);

    return {
      value: overallScore,
      displayValue: `${overallScore.toFixed(2)}%`,
      calculation: {
        formula: 'Preparedness Score = (Participation × 0.4) + (Time Performance × 0.3) + (Rating × 0.3)',
        components: {
          totalDrills: drills.total_drills,
          participationScore: participationScore.toFixed(2),
          timePerformanceRate: timePerformanceRate.toFixed(2),
          drillsMeetingTarget: drills.drills_met_target,
          avgRating: avgRating.toFixed(2),
          period: `${startDate} to ${endDate}`
        },
        steps: [
          `Step 1: Total emergency drills conducted = ${drills.total_drills}`,
          `Step 2: Average participation rate = ${participationScore.toFixed(2)}%`,
          `Step 3: Drills meeting time target = ${drills.drills_met_target} (${timePerformanceRate.toFixed(2)}%)`,
          `Step 4: Average performance rating = ${avgRating.toFixed(2)}%`,
          `Step 5: Calculate weighted score = (${participationScore.toFixed(2)} × 0.4) + (${timePerformanceRate.toFixed(2)} × 0.3) + (${avgRating.toFixed(2)} × 0.3)`,
          `Step 6: Emergency preparedness score = ${overallScore.toFixed(2)}%`
        ]
      },
      benchmark: {
        value: 90.0,
        status: overallScore > 90.0 ? 'above' : overallScore < 90.0 ? 'below' : 'at'
      }
    };
  }

  // Get all HSE KPIs
  getAllHSEKPIs(startDate: string, endDate: string): { [key: string]: KPIResult } {
    return {
      'TRIR': this.calculateTRIR(startDate, endDate),
      'LTIFR': this.calculateLTIFR(startDate, endDate),
      'Near Miss Rate': this.calculateNearMissRate(startDate, endDate),
      'Safety Training Rate': this.calculateSafetyTrainingRate(startDate, endDate),
      'PPE Compliance': this.calculatePPEComplianceRate(startDate, endDate),
      'Environmental Compliance': this.calculateEnvironmentalCompliance(startDate, endDate),
      'Safety Audit Score': this.calculateSafetyAuditScore(startDate, endDate),
      'Investigation Closure Time': this.calculateInvestigationClosureTime(startDate, endDate),
      'Hazard Identification Rate': this.calculateHazardIdentificationRate(startDate, endDate),
      'Emergency Preparedness': this.calculateEmergencyPreparednessScore(startDate, endDate)
    };
  }
}
