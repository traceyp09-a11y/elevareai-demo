/**
 * Administration KPI Calculation Service
 *
 * Calculates 10 critical IT/Admin KPIs with full transparency:
 * 1. IT System Uptime %
 * 2. Help Desk Response Time
 * 3. IT Cost per Employee
 * 4. Cybersecurity Incident Rate
 * 5. Software License Utilization
 * 6. Data Backup Success Rate
 * 7. IT Project On-Time Delivery
 * 8. Employee IT Satisfaction Score
 * 9. Average Ticket Resolution Time
 * 10. Infrastructure Capacity Utilization
 */

import Database from 'better-sqlite3';
import path from 'path';

export interface KPIResult {
  kpiName: string;
  value: number;
  unit: string;
  formula: string;
  components: Record<string, number>;
  calculationSteps: string[];
  benchmark: number;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  industryContext: string;
}

export class AdminKPICalculationService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(__dirname, '../../database/elevareiq.db');
    this.db = new Database(finalPath);
  }

  /**
   * Get all Administration KPIs for a specific period
   */
  getAllKPIs(startDate: string, endDate: string): Record<string, KPIResult> {
    return {
      systemUptime: this.calculateSystemUptime(startDate, endDate),
      helpdeskResponseTime: this.calculateHelpdeskResponseTime(startDate, endDate),
      itCostPerEmployee: this.calculateITCostPerEmployee(startDate, endDate),
      securityIncidentRate: this.calculateSecurityIncidentRate(startDate, endDate),
      licenseUtilization: this.calculateLicenseUtilization(),
      backupSuccessRate: this.calculateBackupSuccessRate(startDate, endDate),
      projectOnTimeDelivery: this.calculateProjectOnTimeDelivery(startDate, endDate),
      employeeSatisfaction: this.calculateEmployeeSatisfaction(startDate, endDate),
      ticketResolutionTime: this.calculateTicketResolutionTime(startDate, endDate),
      infrastructureUtilization: this.calculateInfrastructureUtilization(endDate),
    };
  }

  /**
   * KPI 1: IT System Uptime %
   * Formula: (Total Minutes - Downtime Minutes) / Total Minutes × 100
   * Benchmark: 99.9% (industry standard for critical systems)
   */
  calculateSystemUptime(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        SUM(total_minutes) as total_minutes,
        SUM(downtime_minutes) as downtime_minutes,
        COUNT(DISTINCT system_name) as system_count
      FROM admin_system_uptime
      WHERE date >= ? AND date <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const totalMinutes = result.total_minutes || 0;
    const downtimeMinutes = result.downtime_minutes || 0;
    const systemCount = result.system_count || 0;

    const uptimePercentage = totalMinutes > 0 ? ((totalMinutes - downtimeMinutes) / totalMinutes) * 100 : 0;
    const benchmark = 99.9;

    return {
      kpiName: 'IT System Uptime',
      value: parseFloat(uptimePercentage.toFixed(2)),
      unit: '%',
      formula: '(Total Minutes - Downtime Minutes) / Total Minutes × 100',
      components: {
        totalMinutes,
        downtimeMinutes,
        uptimeMinutes: totalMinutes - downtimeMinutes,
        systemCount,
      },
      calculationSteps: [
        `1. Total System Minutes: ${totalMinutes.toLocaleString()}`,
        `2. Downtime Minutes: ${downtimeMinutes.toLocaleString()}`,
        `3. Uptime Minutes: ${(totalMinutes - downtimeMinutes).toLocaleString()}`,
        `4. Uptime Percentage: ${uptimePercentage.toFixed(2)}%`,
      ],
      benchmark,
      status: this.getUptimeStatus(uptimePercentage, benchmark),
      industryContext: '99.9% = Standard, 99.95% = High Availability, 99.99% = Mission Critical',
    };
  }

  /**
   * KPI 2: Help Desk Response Time
   * Formula: Average First Response Time in Minutes
   * Benchmark: 30 minutes (industry best practice)
   */
  calculateHelpdeskResponseTime(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        AVG(first_response_time_minutes) as avg_response_time,
        COUNT(*) as total_tickets,
        SUM(CASE WHEN first_response_time_minutes <= 30 THEN 1 ELSE 0 END) as within_sla
      FROM admin_helpdesk_tickets
      WHERE created_date >= ? AND created_date <= ?
        AND first_response_time_minutes IS NOT NULL
    `);

    const result = stmt.get(startDate, endDate) as any;
    const avgResponseTime = result.avg_response_time || 0;
    const totalTickets = result.total_tickets || 0;
    const withinSLA = result.within_sla || 0;

    const slaCompliance = totalTickets > 0 ? (withinSLA / totalTickets) * 100 : 0;
    const benchmark = 30;

    return {
      kpiName: 'Help Desk Response Time',
      value: parseFloat(avgResponseTime.toFixed(1)),
      unit: 'min',
      formula: 'Average First Response Time',
      components: {
        avgResponseTime,
        totalTickets,
        withinSLA,
        slaCompliancePercent: parseFloat(slaCompliance.toFixed(1)),
      },
      calculationSteps: [
        `1. Total Tickets: ${totalTickets.toLocaleString()}`,
        `2. Average Response Time: ${avgResponseTime.toFixed(1)} minutes`,
        `3. Tickets Within SLA (30min): ${withinSLA}`,
        `4. SLA Compliance: ${slaCompliance.toFixed(1)}%`,
      ],
      benchmark,
      status: this.getResponseTimeStatus(avgResponseTime, benchmark),
      industryContext: '<15min = Excellent, 15-30min = Good, 30-60min = Fair, >60min = Poor',
    };
  }

  /**
   * KPI 3: IT Cost per Employee
   * Formula: Total IT Costs / Total Employees
   * Benchmark: $5,000 per employee annually
   */
  calculateITCostPerEmployee(startDate: string, endDate: string): KPIResult {
    const costStmt = this.db.prepare(`
      SELECT SUM(amount) as total_cost
      FROM admin_it_costs
      WHERE period >= ? AND period <= ?
    `);

    const empStmt = this.db.prepare(`
      SELECT AVG(total_employees) as avg_employees
      FROM admin_employee_count
      WHERE period >= ? AND period <= ?
    `);

    const costResult = costStmt.get(startDate, endDate) as any;
    const empResult = empStmt.get(startDate, endDate) as any;

    const totalCost = costResult?.total_cost || 0;
    const avgEmployees = empResult?.avg_employees || 1;

    const costPerEmployee = totalCost / avgEmployees;
    const benchmark = 5000;

    return {
      kpiName: 'IT Cost per Employee',
      value: parseFloat(costPerEmployee.toFixed(0)),
      unit: '$',
      formula: 'Total IT Costs / Total Employees',
      components: {
        totalCost,
        avgEmployees,
        costPerEmployee,
      },
      calculationSteps: [
        `1. Total IT Costs: $${totalCost.toLocaleString()}`,
        `2. Average Employees: ${avgEmployees.toLocaleString()}`,
        `3. Cost per Employee: $${costPerEmployee.toFixed(0)}`,
      ],
      benchmark,
      status: this.getCostStatus(costPerEmployee, benchmark),
      industryContext: 'SMB: $3-6K, Enterprise: $5-10K, Tech: $10-15K per employee annually',
    };
  }

  /**
   * KPI 4: Cybersecurity Incident Rate
   * Formula: Total Security Incidents per Month
   * Benchmark: <2 incidents per month
   */
  calculateSecurityIncidentRate(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_incidents,
        SUM(CASE WHEN severity = 'Critical' THEN 1 ELSE 0 END) as critical_incidents,
        SUM(CASE WHEN severity = 'High' THEN 1 ELSE 0 END) as high_incidents
      FROM admin_security_incidents
      WHERE incident_date >= ? AND incident_date <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const totalIncidents = result.total_incidents || 0;
    const criticalIncidents = result.critical_incidents || 0;
    const highIncidents = result.high_incidents || 0;

    // Calculate incidents per month
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const incidentsPerMonth = totalIncidents / months;

    const benchmark = 2;

    return {
      kpiName: 'Security Incident Rate',
      value: parseFloat(incidentsPerMonth.toFixed(1)),
      unit: '/month',
      formula: 'Total Security Incidents / Number of Months',
      components: {
        totalIncidents,
        criticalIncidents,
        highIncidents,
        months: parseFloat(months.toFixed(1)),
        incidentsPerMonth,
      },
      calculationSteps: [
        `1. Total Incidents: ${totalIncidents}`,
        `2. Critical Incidents: ${criticalIncidents}`,
        `3. High Incidents: ${highIncidents}`,
        `4. Period: ${months.toFixed(1)} months`,
        `5. Incidents per Month: ${incidentsPerMonth.toFixed(1)}`,
      ],
      benchmark,
      status: this.getIncidentStatus(incidentsPerMonth, benchmark),
      industryContext: '<1 = Excellent, 1-2 = Good, 2-5 = Fair, >5 = High Risk',
    };
  }

  /**
   * KPI 5: Software License Utilization
   * Formula: (Licenses In Use / Total Licenses) × 100
   * Benchmark: 85% (optimal utilization)
   */
  calculateLicenseUtilization(): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        SUM(total_licenses) as total_licenses,
        SUM(licenses_in_use) as licenses_in_use,
        COUNT(*) as software_count
      FROM admin_software_licenses
    `);

    const result = stmt.get() as any;
    const totalLicenses = result.total_licenses || 0;
    const licensesInUse = result.licenses_in_use || 0;
    const softwareCount = result.software_count || 0;

    const utilization = totalLicenses > 0 ? (licensesInUse / totalLicenses) * 100 : 0;
    const benchmark = 85;

    return {
      kpiName: 'Software License Utilization',
      value: parseFloat(utilization.toFixed(1)),
      unit: '%',
      formula: '(Licenses In Use / Total Licenses) × 100',
      components: {
        totalLicenses,
        licensesInUse,
        unusedLicenses: totalLicenses - licensesInUse,
        softwareCount,
      },
      calculationSteps: [
        `1. Total Licenses: ${totalLicenses.toLocaleString()}`,
        `2. Licenses In Use: ${licensesInUse.toLocaleString()}`,
        `3. Unused Licenses: ${(totalLicenses - licensesInUse).toLocaleString()}`,
        `4. Utilization: ${utilization.toFixed(1)}%`,
      ],
      benchmark,
      status: this.getUtilizationStatus(utilization, benchmark),
      industryContext: '>90% = Over-allocated, 80-90% = Optimal, 70-80% = Good, <70% = Waste',
    };
  }

  /**
   * KPI 6: Data Backup Success Rate
   * Formula: (Successful Backups / Total Backups) × 100
   * Benchmark: 99% (critical for data protection)
   */
  calculateBackupSuccessRate(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_backups,
        SUM(CASE WHEN status = 'Success' THEN 1 ELSE 0 END) as successful_backups,
        SUM(CASE WHEN status = 'Failed' THEN 1 ELSE 0 END) as failed_backups
      FROM admin_data_backups
      WHERE backup_date >= ? AND backup_date <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const totalBackups = result.total_backups || 0;
    const successfulBackups = result.successful_backups || 0;
    const failedBackups = result.failed_backups || 0;

    const successRate = totalBackups > 0 ? (successfulBackups / totalBackups) * 100 : 0;
    const benchmark = 99;

    return {
      kpiName: 'Data Backup Success Rate',
      value: parseFloat(successRate.toFixed(1)),
      unit: '%',
      formula: '(Successful Backups / Total Backups) × 100',
      components: {
        totalBackups,
        successfulBackups,
        failedBackups,
      },
      calculationSteps: [
        `1. Total Backups: ${totalBackups}`,
        `2. Successful Backups: ${successfulBackups}`,
        `3. Failed Backups: ${failedBackups}`,
        `4. Success Rate: ${successRate.toFixed(1)}%`,
      ],
      benchmark,
      status: this.getBackupStatus(successRate, benchmark),
      industryContext: '>99% = Excellent, 95-99% = Good, 90-95% = Fair, <90% = Critical',
    };
  }

  /**
   * KPI 7: IT Project On-Time Delivery
   * Formula: (Projects Delivered On-Time / Total Completed Projects) × 100
   * Benchmark: 80%
   */
  calculateProjectOnTimeDelivery(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as completed_projects,
        SUM(CASE WHEN actual_end_date <= planned_end_date THEN 1 ELSE 0 END) as on_time_projects,
        SUM(CASE WHEN actual_end_date > planned_end_date THEN 1 ELSE 0 END) as delayed_projects
      FROM admin_it_projects
      WHERE status = 'Completed'
        AND actual_end_date >= ? AND actual_end_date <= ?
    `);

    const result = stmt.get(startDate, endDate) as any;
    const completedProjects = result.completed_projects || 0;
    const onTimeProjects = result.on_time_projects || 0;
    const delayedProjects = result.delayed_projects || 0;

    const onTimeRate = completedProjects > 0 ? (onTimeProjects / completedProjects) * 100 : 0;
    const benchmark = 80;

    return {
      kpiName: 'IT Project On-Time Delivery',
      value: parseFloat(onTimeRate.toFixed(1)),
      unit: '%',
      formula: '(On-Time Projects / Total Completed) × 100',
      components: {
        completedProjects,
        onTimeProjects,
        delayedProjects,
      },
      calculationSteps: [
        `1. Completed Projects: ${completedProjects}`,
        `2. On-Time Projects: ${onTimeProjects}`,
        `3. Delayed Projects: ${delayedProjects}`,
        `4. On-Time Rate: ${onTimeRate.toFixed(1)}%`,
      ],
      benchmark,
      status: this.getProjectStatus(onTimeRate, benchmark),
      industryContext: '>85% = Excellent, 70-85% = Good, 60-70% = Fair, <60% = Poor',
    };
  }

  /**
   * KPI 8: Employee IT Satisfaction Score
   * Formula: Average Overall Satisfaction Rating
   * Benchmark: 4.0 out of 5.0
   */
  calculateEmployeeSatisfaction(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        AVG(overall_satisfaction) as avg_satisfaction,
        AVG(system_performance_rating) as avg_performance,
        AVG(support_quality_rating) as avg_support,
        COUNT(*) as response_count
      FROM admin_employee_satisfaction
      WHERE survey_date >= ? AND survey_date <= ?
        AND overall_satisfaction IS NOT NULL
    `);

    const result = stmt.get(startDate, endDate) as any;
    const avgSatisfaction = result.avg_satisfaction || 0;
    const avgPerformance = result.avg_performance || 0;
    const avgSupport = result.avg_support || 0;
    const responseCount = result.response_count || 0;

    const benchmark = 4.0;

    return {
      kpiName: 'Employee IT Satisfaction',
      value: parseFloat(avgSatisfaction.toFixed(2)),
      unit: '/5.0',
      formula: 'Average Overall Satisfaction Rating',
      components: {
        avgSatisfaction,
        avgPerformance,
        avgSupport,
        responseCount,
      },
      calculationSteps: [
        `1. Survey Responses: ${responseCount}`,
        `2. Average Satisfaction: ${avgSatisfaction.toFixed(2)}/5.0`,
        `3. Performance Rating: ${avgPerformance.toFixed(2)}/5.0`,
        `4. Support Quality: ${avgSupport.toFixed(2)}/5.0`,
      ],
      benchmark,
      status: this.getSatisfactionStatus(avgSatisfaction, benchmark),
      industryContext: '>4.5 = Excellent, 4.0-4.5 = Good, 3.5-4.0 = Fair, <3.5 = Poor',
    };
  }

  /**
   * KPI 9: Average Ticket Resolution Time
   * Formula: Average Resolution Time in Hours
   * Benchmark: 4 hours
   */
  calculateTicketResolutionTime(startDate: string, endDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        AVG(resolution_time_minutes) as avg_resolution_minutes,
        COUNT(*) as resolved_tickets,
        SUM(CASE WHEN resolution_time_minutes <= 240 THEN 1 ELSE 0 END) as within_sla
      FROM admin_helpdesk_tickets
      WHERE resolved_date >= ? AND resolved_date <= ?
        AND status IN ('Resolved', 'Closed')
        AND resolution_time_minutes IS NOT NULL
    `);

    const result = stmt.get(startDate, endDate) as any;
    const avgResolutionMinutes = result.avg_resolution_minutes || 0;
    const resolvedTickets = result.resolved_tickets || 0;
    const withinSLA = result.within_sla || 0;

    const avgResolutionHours = avgResolutionMinutes / 60;
    const slaCompliance = resolvedTickets > 0 ? (withinSLA / resolvedTickets) * 100 : 0;
    const benchmark = 4;

    return {
      kpiName: 'Avg Ticket Resolution Time',
      value: parseFloat(avgResolutionHours.toFixed(1)),
      unit: 'hrs',
      formula: 'Average Resolution Time',
      components: {
        avgResolutionHours,
        resolvedTickets,
        withinSLA,
        slaCompliancePercent: parseFloat(slaCompliance.toFixed(1)),
      },
      calculationSteps: [
        `1. Resolved Tickets: ${resolvedTickets}`,
        `2. Avg Resolution Time: ${avgResolutionHours.toFixed(1)} hours`,
        `3. Tickets Within SLA (4hrs): ${withinSLA}`,
        `4. SLA Compliance: ${slaCompliance.toFixed(1)}%`,
      ],
      benchmark,
      status: this.getResolutionStatus(avgResolutionHours, benchmark),
      industryContext: '<2hrs = Excellent, 2-4hrs = Good, 4-8hrs = Fair, >8hrs = Poor',
    };
  }

  /**
   * KPI 10: Infrastructure Capacity Utilization
   * Formula: Average Utilization Percentage Across All Resources
   * Benchmark: 75% (optimal range: 70-80%)
   */
  calculateInfrastructureUtilization(snapshotDate: string): KPIResult {
    const stmt = this.db.prepare(`
      SELECT
        AVG(utilization_percentage) as avg_utilization,
        COUNT(*) as resource_count,
        SUM(CASE WHEN utilization_percentage > 90 THEN 1 ELSE 0 END) as over_utilized,
        SUM(CASE WHEN utilization_percentage < 50 THEN 1 ELSE 0 END) as under_utilized
      FROM admin_infrastructure_capacity
      WHERE measurement_date = ?
    `);

    const result = stmt.get(snapshotDate) as any;
    const avgUtilization = result.avg_utilization || 0;
    const resourceCount = result.resource_count || 0;
    const overUtilized = result.over_utilized || 0;
    const underUtilized = result.under_utilized || 0;

    const benchmark = 75;

    return {
      kpiName: 'Infrastructure Utilization',
      value: parseFloat(avgUtilization.toFixed(1)),
      unit: '%',
      formula: 'Average Utilization Across All Resources',
      components: {
        avgUtilization,
        resourceCount,
        overUtilized,
        underUtilized,
      },
      calculationSteps: [
        `1. Total Resources: ${resourceCount}`,
        `2. Average Utilization: ${avgUtilization.toFixed(1)}%`,
        `3. Over-Utilized (>90%): ${overUtilized}`,
        `4. Under-Utilized (<50%): ${underUtilized}`,
      ],
      benchmark,
      status: this.getCapacityStatus(avgUtilization, benchmark),
      industryContext: '70-80% = Optimal, 60-70% = Good, 50-60% = Fair, <50% or >90% = Action Needed',
    };
  }

  // Helper methods for status determination
  private getUptimeStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark) return 'Excellent';
    if (value >= benchmark - 0.5) return 'Good';
    if (value >= benchmark - 1.0) return 'Warning';
    return 'Critical';
  }

  private getResponseTimeStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value <= benchmark * 0.5) return 'Excellent';
    if (value <= benchmark) return 'Good';
    if (value <= benchmark * 1.5) return 'Warning';
    return 'Critical';
  }

  private getCostStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value <= benchmark * 0.9) return 'Excellent';
    if (value <= benchmark) return 'Good';
    if (value <= benchmark * 1.2) return 'Warning';
    return 'Critical';
  }

  private getIncidentStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value < benchmark * 0.5) return 'Excellent';
    if (value <= benchmark) return 'Good';
    if (value <= benchmark * 2) return 'Warning';
    return 'Critical';
  }

  private getUtilizationStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark - 5 && value <= benchmark + 5) return 'Excellent';
    if (value >= benchmark - 10) return 'Good';
    if (value >= benchmark - 20) return 'Warning';
    return 'Critical';
  }

  private getBackupStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark) return 'Excellent';
    if (value >= 95) return 'Good';
    if (value >= 90) return 'Warning';
    return 'Critical';
  }

  private getProjectStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark + 5) return 'Excellent';
    if (value >= benchmark) return 'Good';
    if (value >= benchmark - 10) return 'Warning';
    return 'Critical';
  }

  private getSatisfactionStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= benchmark + 0.5) return 'Excellent';
    if (value >= benchmark) return 'Good';
    if (value >= benchmark - 0.5) return 'Warning';
    return 'Critical';
  }

  private getResolutionStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value <= benchmark * 0.5) return 'Excellent';
    if (value <= benchmark) return 'Good';
    if (value <= benchmark * 2) return 'Warning';
    return 'Critical';
  }

  private getCapacityStatus(value: number, benchmark: number): 'Excellent' | 'Good' | 'Warning' | 'Critical' {
    if (value >= 70 && value <= 80) return 'Excellent';
    if (value >= 60 && value <= 85) return 'Good';
    if (value >= 50 && value <= 90) return 'Warning';
    return 'Critical';
  }

  close(): void {
    this.db.close();
  }
}
