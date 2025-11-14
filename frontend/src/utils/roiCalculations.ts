/**
 * ROI Calculations and Financial Impact Analysis
 * Translates operational metrics into dollar impact for business case justification
 */

export interface ROIMetric {
  metricName: string;
  currentValue: number | string;
  targetValue: number | string;
  unit: string;
  annualCostImpact: number; // in dollars
  improvementPotential: number; // percentage or absolute value
  timeToValue: number; // in months
  confidenceLevel: 'high' | 'medium' | 'low';
  calculationMethod: string;
}

export interface TimeSavings {
  activity: string;
  currentTimeHours: number;
  elevareIQTimeHours: number;
  savingsHours: number;
  savingsPercentage: number;
  annualSavingsDollars: number;
  burdedLaborRate: number; // $/hour
}

export interface DepartmentROI {
  department: string;
  totalAnnualCost: number;
  potentialSavings: number;
  roiPercentage: number;
  paybackMonths: number;
  metrics: ROIMetric[];
  timeSavings: TimeSavings[];
}

// Average burdened labor rates by role (salary + benefits + overhead)
const LABOR_RATES = {
  executive: 175, // $175/hour
  director: 125,
  manager: 95,
  analyst: 65,
  specialist: 55,
  operator: 45,
};

// Platform costs for ROI calculation
const PLATFORM_COSTS = {
  annualLicensing: 150000, // $150K/year for enterprise
  implementation: 50000, // One-time
  training: 25000, // One-time
  annualSupport: 30000,
};

/**
 * Calculate time savings from automated reporting
 */
export function calculateReportingTimeSavings(
  department: string,
  numberOfReports: number = 30,
  userCount: number = 50
): TimeSavings[] {
  const timeSavings: TimeSavings[] = [
    {
      activity: 'Monthly Report Generation',
      currentTimeHours: 40, // Manual Excel/PowerPoint creation
      elevareIQTimeHours: 0.5, // One-click export
      savingsHours: 39.5,
      savingsPercentage: 98.75,
      annualSavingsDollars: 39.5 * 12 * LABOR_RATES.analyst,
      burdedLaborRate: LABOR_RATES.analyst,
    },
    {
      activity: 'Data Collection & Validation',
      currentTimeHours: 60, // Manual data gathering from multiple systems
      elevareIQTimeHours: 2, // Automated integration
      savingsHours: 58,
      savingsPercentage: 96.67,
      annualSavingsDollars: 58 * 12 * LABOR_RATES.specialist,
      burdedLaborRate: LABOR_RATES.specialist,
    },
    {
      activity: 'Executive Dashboard Preparation',
      currentTimeHours: 20, // Manual chart creation
      elevareIQTimeHours: 0.25, // Real-time dashboard
      savingsHours: 19.75,
      savingsPercentage: 98.75,
      annualSavingsDollars: 19.75 * 12 * LABOR_RATES.manager,
      burdedLaborRate: LABOR_RATES.manager,
    },
    {
      activity: 'Board Presentation Creation',
      currentTimeHours: 16, // Quarterly board decks
      elevareIQTimeHours: 1, // Export templates
      savingsHours: 15,
      savingsPercentage: 93.75,
      annualSavingsDollars: 15 * 4 * LABOR_RATES.director, // Quarterly
      burdedLaborRate: LABOR_RATES.director,
    },
    {
      activity: 'Cross-Department Data Reconciliation',
      currentTimeHours: 24, // Monthly reconciliation meetings
      elevareIQTimeHours: 2, // Single source of truth
      savingsHours: 22,
      savingsPercentage: 91.67,
      annualSavingsDollars: 22 * 12 * LABOR_RATES.manager,
      burdedLaborRate: LABOR_RATES.manager,
    },
    {
      activity: 'Ad-Hoc Analysis Requests',
      currentTimeHours: 8, // Per request, ~10 requests/month
      elevareIQTimeHours: 0.5,
      savingsHours: 7.5,
      savingsPercentage: 93.75,
      annualSavingsDollars: 7.5 * 10 * 12 * LABOR_RATES.analyst,
      burdedLaborRate: LABOR_RATES.analyst,
    },
  ];

  return timeSavings;
}

/**
 * Calculate financial impact of operational metrics
 */
export function calculateHRROI(): DepartmentROI {
  const metrics: ROIMetric[] = [
    {
      metricName: 'Employee Turnover Reduction',
      currentValue: 13.5,
      targetValue: 12,
      unit: '%',
      annualCostImpact: 450000, // $450K saved by reducing turnover by 1.5%
      improvementPotential: 1.5,
      timeToValue: 6,
      confidenceLevel: 'high',
      calculationMethod: 'Avg replacement cost ($60K) × workforce (2000) × turnover reduction (1.5%)',
    },
    {
      metricName: 'Time to Hire Reduction',
      currentValue: 42,
      targetValue: 30,
      unit: 'days',
      annualCostImpact: 180000, // $180K saved from faster hiring
      improvementPotential: 12,
      timeToValue: 3,
      confidenceLevel: 'high',
      calculationMethod: '12 days × 125 hires/year × $120/day productivity loss',
    },
    {
      metricName: 'Recruitment Cost Optimization',
      currentValue: 4200,
      targetValue: 3500,
      unit: '$',
      annualCostImpact: 87500, // $87.5K saved
      improvementPotential: 700,
      timeToValue: 4,
      confidenceLevel: 'medium',
      calculationMethod: '$700 savings × 125 hires/year',
    },
    {
      metricName: 'Absenteeism Reduction',
      currentValue: 3.8,
      targetValue: 3.0,
      unit: '%',
      annualCostImpact: 320000, // $320K saved from reduced absenteeism
      improvementPotential: 0.8,
      timeToValue: 6,
      confidenceLevel: 'medium',
      calculationMethod: '0.8% × 2000 employees × 250 workdays × $100/day avg productivity',
    },
  ];

  const timeSavings = calculateReportingTimeSavings('HR');
  const totalTimeSavings = timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0);
  const totalMetricSavings = metrics.reduce((sum, m) => sum + m.annualCostImpact, 0);
  const totalSavings = totalTimeSavings + totalMetricSavings;
  const totalCost = PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport;

  return {
    department: 'HR',
    totalAnnualCost: totalCost,
    potentialSavings: totalSavings,
    roiPercentage: ((totalSavings - totalCost) / totalCost) * 100,
    paybackMonths: (totalCost / totalSavings) * 12,
    metrics,
    timeSavings,
  };
}

export function calculateHSEROI(): DepartmentROI {
  const metrics: ROIMetric[] = [
    {
      metricName: 'TRIR Reduction',
      currentValue: 4.2,
      targetValue: 3.0,
      unit: 'incidents/200K hours',
      annualCostImpact: 1200000, // $1.2M saved from fewer incidents
      improvementPotential: 1.2,
      timeToValue: 9,
      confidenceLevel: 'high',
      calculationMethod: '1.2 reduction × avg incident cost ($1M including lost time, OSHA, legal)',
    },
    {
      metricName: 'Lost Time Reduction',
      currentValue: 1440,
      targetValue: 500,
      unit: 'hours/year',
      annualCostImpact: 94000, // $94K saved
      improvementPotential: 940,
      timeToValue: 6,
      confidenceLevel: 'high',
      calculationMethod: '940 hours × $100/hour burdened rate',
    },
    {
      metricName: 'OSHA Violation Avoidance',
      currentValue: 5,
      targetValue: 0,
      unit: 'violations/year',
      annualCostImpact: 250000, // $250K saved from fines + remediation
      improvementPotential: 5,
      timeToValue: 12,
      confidenceLevel: 'medium',
      calculationMethod: '5 violations × avg $50K (fine + corrective action costs)',
    },
    {
      metricName: 'Safety Training Efficiency',
      currentValue: 78,
      targetValue: 95,
      unit: '% completion',
      annualCostImpact: 85000, // $85K saved from reduced incidents
      improvementPotential: 17,
      timeToValue: 3,
      confidenceLevel: 'high',
      calculationMethod: '17% improvement × avg incident reduction value ($5K per %)',
    },
  ];

  const timeSavings = calculateReportingTimeSavings('HSE');
  const totalTimeSavings = timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0);
  const totalMetricSavings = metrics.reduce((sum, m) => sum + m.annualCostImpact, 0);
  const totalSavings = totalTimeSavings + totalMetricSavings;
  const totalCost = PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport;

  return {
    department: 'HSE',
    totalAnnualCost: totalCost,
    potentialSavings: totalSavings,
    roiPercentage: ((totalSavings - totalCost) / totalCost) * 100,
    paybackMonths: (totalCost / totalSavings) * 12,
    metrics,
    timeSavings,
  };
}

export function calculateOperationsROI(): DepartmentROI {
  const metrics: ROIMetric[] = [
    {
      metricName: 'Downtime Reduction',
      currentValue: 12.3,
      targetValue: 5.0,
      unit: '% downtime',
      annualCostImpact: 2400000, // $2.4M saved
      improvementPotential: 7.3,
      timeToValue: 6,
      confidenceLevel: 'high',
      calculationMethod: '7.3% × $450/min production value × 525,600 min/year',
    },
    {
      metricName: 'OEE Improvement',
      currentValue: 72,
      targetValue: 85,
      unit: '% efficiency',
      annualCostImpact: 3900000, // $3.9M in additional production
      improvementPotential: 13,
      timeToValue: 9,
      confidenceLevel: 'high',
      calculationMethod: '13% improvement × $30M annual production capacity',
    },
    {
      metricName: 'Capacity Utilization Increase',
      currentValue: 78,
      targetValue: 90,
      unit: '% utilization',
      annualCostImpact: 1800000, // $1.8M from better asset utilization
      improvementPotential: 12,
      timeToValue: 8,
      confidenceLevel: 'medium',
      calculationMethod: '12% × $150M in fixed asset base × 10% ROI',
    },
    {
      metricName: 'Production Volume Increase',
      currentValue: 44200,
      targetValue: 50000,
      unit: 'units/month',
      annualCostImpact: 1392000, // $1.39M additional revenue
      improvementPotential: 5800,
      timeToValue: 12,
      confidenceLevel: 'medium',
      calculationMethod: '5,800 units/month × 12 months × $20 margin/unit',
    },
  ];

  const timeSavings = calculateReportingTimeSavings('Operations');
  const totalTimeSavings = timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0);
  const totalMetricSavings = metrics.reduce((sum, m) => sum + m.annualCostImpact, 0);
  const totalSavings = totalTimeSavings + totalMetricSavings;
  const totalCost = PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport;

  return {
    department: 'Operations',
    totalAnnualCost: totalCost,
    potentialSavings: totalSavings,
    roiPercentage: ((totalSavings - totalCost) / totalCost) * 100,
    paybackMonths: (totalCost / totalSavings) * 12,
    metrics,
    timeSavings,
  };
}

export function calculateQualityControlROI(): DepartmentROI {
  const metrics: ROIMetric[] = [
    {
      metricName: 'Defect Rate Reduction',
      currentValue: 3450,
      targetValue: 2000,
      unit: 'PPM',
      annualCostImpact: 870000, // $870K saved
      improvementPotential: 1450,
      timeToValue: 8,
      confidenceLevel: 'high',
      calculationMethod: '1,450 PPM × 400,000 units/year × $1.50 avg cost per defect',
    },
    {
      metricName: 'Scrap Rate Reduction',
      currentValue: 2.8,
      targetValue: 2.0,
      unit: '% scrap',
      annualCostImpact: 480000, // $480K saved in materials
      improvementPotential: 0.8,
      timeToValue: 6,
      confidenceLevel: 'high',
      calculationMethod: '0.8% × $60M annual materials cost',
    },
    {
      metricName: 'Rework Cost Reduction',
      currentValue: 4.2,
      targetValue: 3.0,
      unit: '% rework',
      annualCostImpact: 360000, // $360K saved
      improvementPotential: 1.2,
      timeToValue: 7,
      confidenceLevel: 'medium',
      calculationMethod: '1.2% × $30M labor cost (assumes rework is labor-intensive)',
    },
    {
      metricName: 'Warranty Claims Reduction',
      currentValue: 32,
      targetValue: 20,
      unit: 'claims/month',
      annualCostImpact: 216000, // $216K saved
      improvementPotential: 12,
      timeToValue: 9,
      confidenceLevel: 'medium',
      calculationMethod: '12 claims/month × 12 months × $1,500 avg claim cost',
    },
  ];

  const timeSavings = calculateReportingTimeSavings('Quality Control');
  const totalTimeSavings = timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0);
  const totalMetricSavings = metrics.reduce((sum, m) => sum + m.annualCostImpact, 0);
  const totalSavings = totalTimeSavings + totalMetricSavings;
  const totalCost = PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport;

  return {
    department: 'Quality Control',
    totalAnnualCost: totalCost,
    potentialSavings: totalSavings,
    roiPercentage: ((totalSavings - totalCost) / totalCost) * 100,
    paybackMonths: (totalCost / totalSavings) * 12,
    metrics,
    timeSavings,
  };
}

/**
 * Calculate enterprise-wide ROI
 */
export function calculateEnterpriseROI(): {
  departments: DepartmentROI[];
  totalInvestment: number;
  totalAnnualSavings: number;
  totalROI: number;
  paybackMonths: number;
  threeYearNPV: number;
} {
  const departments = [
    calculateHRROI(),
    calculateHSEROI(),
    calculateOperationsROI(),
    calculateQualityControlROI(),
  ];

  const totalInvestment =
    PLATFORM_COSTS.annualLicensing +
    PLATFORM_COSTS.annualSupport +
    PLATFORM_COSTS.implementation +
    PLATFORM_COSTS.training;

  const totalAnnualSavings = departments.reduce((sum, dept) => sum + dept.potentialSavings, 0);

  const totalROI = ((totalAnnualSavings - (PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport)) /
                    (PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport)) * 100;

  const paybackMonths = (totalInvestment / totalAnnualSavings) * 12;

  // Calculate 3-year NPV (assuming 8% discount rate)
  const discountRate = 0.08;
  const year1Savings = totalAnnualSavings - (PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport);
  const year2Savings = totalAnnualSavings * 1.1 - (PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport); // 10% improvement
  const year3Savings = totalAnnualSavings * 1.15 - (PLATFORM_COSTS.annualLicensing + PLATFORM_COSTS.annualSupport); // 15% improvement

  const threeYearNPV =
    -totalInvestment +
    year1Savings / Math.pow(1 + discountRate, 1) +
    year2Savings / Math.pow(1 + discountRate, 2) +
    year3Savings / Math.pow(1 + discountRate, 3);

  return {
    departments,
    totalInvestment,
    totalAnnualSavings,
    totalROI,
    paybackMonths,
    threeYearNPV,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get confidence level color
 */
export function getConfidenceColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'text-green-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-red-400';
  }
}
