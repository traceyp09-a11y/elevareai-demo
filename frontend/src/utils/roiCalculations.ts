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
 * Calculate time savings from automated reporting - customized per department
 */
export function calculateReportingTimeSavings(department: string): TimeSavings[] {
  const departmentActivities: { [key: string]: TimeSavings[] } = {
    HR: [
      {
        activity: 'New Hire Onboarding Paperwork',
        currentTimeHours: 8,
        elevareIQTimeHours: 0.5,
        savingsHours: 7.5,
        savingsPercentage: 93.75,
        annualSavingsDollars: 7.5 * 125 * LABOR_RATES.specialist, // 125 hires/year
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Benefits Enrollment Processing',
        currentTimeHours: 12,
        elevareIQTimeHours: 1,
        savingsHours: 11,
        savingsPercentage: 91.67,
        annualSavingsDollars: 11 * 12 * LABOR_RATES.specialist, // Monthly
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Performance Review Compilation',
        currentTimeHours: 40,
        elevareIQTimeHours: 2,
        savingsHours: 38,
        savingsPercentage: 95.0,
        annualSavingsDollars: 38 * 2 * LABOR_RATES.manager, // Bi-annual
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Turnover & Retention Analysis',
        currentTimeHours: 16,
        elevareIQTimeHours: 0.25,
        savingsHours: 15.75,
        savingsPercentage: 98.44,
        annualSavingsDollars: 15.75 * 12 * LABOR_RATES.analyst, // Monthly
        burdedLaborRate: LABOR_RATES.analyst,
      },
      {
        activity: 'Compliance Reporting (EEO, OSHA, etc.)',
        currentTimeHours: 24,
        elevareIQTimeHours: 1,
        savingsHours: 23,
        savingsPercentage: 95.83,
        annualSavingsDollars: 23 * 4 * LABOR_RATES.manager, // Quarterly
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Headcount Planning & Budget Reports',
        currentTimeHours: 20,
        elevareIQTimeHours: 0.5,
        savingsHours: 19.5,
        savingsPercentage: 97.5,
        annualSavingsDollars: 19.5 * 12 * LABOR_RATES.manager, // Monthly
        burdedLaborRate: LABOR_RATES.manager,
      },
    ],

    HSE: [
      {
        activity: 'Incident Investigation Reports',
        currentTimeHours: 12,
        elevareIQTimeHours: 1,
        savingsHours: 11,
        savingsPercentage: 91.67,
        annualSavingsDollars: 11 * 24 * LABOR_RATES.specialist, // ~24 incidents/year
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Safety Audit Documentation',
        currentTimeHours: 32,
        elevareIQTimeHours: 2,
        savingsHours: 30,
        savingsPercentage: 93.75,
        annualSavingsDollars: 30 * 4 * LABOR_RATES.manager, // Quarterly audits
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'PPE Inventory & Compliance Tracking',
        currentTimeHours: 8,
        elevareIQTimeHours: 0.25,
        savingsHours: 7.75,
        savingsPercentage: 96.88,
        annualSavingsDollars: 7.75 * 12 * LABOR_RATES.specialist, // Monthly
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Hazard Assessment Forms',
        currentTimeHours: 6,
        elevareIQTimeHours: 0.5,
        savingsHours: 5.5,
        savingsPercentage: 91.67,
        annualSavingsDollars: 5.5 * 52 * LABOR_RATES.specialist, // Weekly
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'OSHA/Regulatory Reporting',
        currentTimeHours: 40,
        elevareIQTimeHours: 2,
        savingsHours: 38,
        savingsPercentage: 95.0,
        annualSavingsDollars: 38 * 4 * LABOR_RATES.manager, // Quarterly
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Safety Training Records & Certification Tracking',
        currentTimeHours: 16,
        elevareIQTimeHours: 0.5,
        savingsHours: 15.5,
        savingsPercentage: 96.88,
        annualSavingsDollars: 15.5 * 12 * LABOR_RATES.specialist, // Monthly
        burdedLaborRate: LABOR_RATES.specialist,
      },
    ],

    Operations: [
      {
        activity: 'Daily Production Scheduling',
        currentTimeHours: 4,
        elevareIQTimeHours: 0.25,
        savingsHours: 3.75,
        savingsPercentage: 93.75,
        annualSavingsDollars: 3.75 * 250 * LABOR_RATES.manager, // 250 workdays
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Equipment Maintenance Logs',
        currentTimeHours: 6,
        elevareIQTimeHours: 0.5,
        savingsHours: 5.5,
        savingsPercentage: 91.67,
        annualSavingsDollars: 5.5 * 52 * LABOR_RATES.specialist, // Weekly
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Inventory Reconciliation',
        currentTimeHours: 24,
        elevareIQTimeHours: 1,
        savingsHours: 23,
        savingsPercentage: 95.83,
        annualSavingsDollars: 23 * 12 * LABOR_RATES.analyst, // Monthly
        burdedLaborRate: LABOR_RATES.analyst,
      },
      {
        activity: 'Shift Handover Reports',
        currentTimeHours: 2,
        elevareIQTimeHours: 0.1,
        savingsHours: 1.9,
        savingsPercentage: 95.0,
        annualSavingsDollars: 1.9 * 250 * 3 * LABOR_RATES.operator, // 3 shifts/day, 250 days
        burdedLaborRate: LABOR_RATES.operator,
      },
      {
        activity: 'OEE & Downtime Analysis',
        currentTimeHours: 16,
        elevareIQTimeHours: 0.25,
        savingsHours: 15.75,
        savingsPercentage: 98.44,
        annualSavingsDollars: 15.75 * 12 * LABOR_RATES.manager, // Monthly
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Root Cause Analysis Documentation',
        currentTimeHours: 20,
        elevareIQTimeHours: 2,
        savingsHours: 18,
        savingsPercentage: 90.0,
        annualSavingsDollars: 18 * 12 * LABOR_RATES.manager, // Monthly
        burdedLaborRate: LABOR_RATES.manager,
      },
    ],

    'Quality Control': [
      {
        activity: 'Daily Inspection Reports',
        currentTimeHours: 3,
        elevareIQTimeHours: 0.25,
        savingsHours: 2.75,
        savingsPercentage: 91.67,
        annualSavingsDollars: 2.75 * 250 * LABOR_RATES.specialist, // 250 workdays
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Non-Conformance Tracking & Reporting',
        currentTimeHours: 8,
        elevareIQTimeHours: 0.5,
        savingsHours: 7.5,
        savingsPercentage: 93.75,
        annualSavingsDollars: 7.5 * 52 * LABOR_RATES.specialist, // Weekly
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Corrective Action (CAPA) Documentation',
        currentTimeHours: 12,
        elevareIQTimeHours: 1,
        savingsHours: 11,
        savingsPercentage: 91.67,
        annualSavingsDollars: 11 * 24 * LABOR_RATES.analyst, // ~24 CAPAs/year
        burdedLaborRate: LABOR_RATES.analyst,
      },
      {
        activity: 'Supplier Quality Audit Reports',
        currentTimeHours: 24,
        elevareIQTimeHours: 2,
        savingsHours: 22,
        savingsPercentage: 91.67,
        annualSavingsDollars: 22 * 4 * LABOR_RATES.manager, // Quarterly
        burdedLaborRate: LABOR_RATES.manager,
      },
      {
        activity: 'Certificate of Analysis (COA) Generation',
        currentTimeHours: 4,
        elevareIQTimeHours: 0.1,
        savingsHours: 3.9,
        savingsPercentage: 97.5,
        annualSavingsDollars: 3.9 * 200 * LABOR_RATES.specialist, // 200 batches/year
        burdedLaborRate: LABOR_RATES.specialist,
      },
      {
        activity: 'Customer Complaint Investigation',
        currentTimeHours: 16,
        elevareIQTimeHours: 1.5,
        savingsHours: 14.5,
        savingsPercentage: 90.63,
        annualSavingsDollars: 14.5 * 12 * LABOR_RATES.manager, // Monthly
        burdedLaborRate: LABOR_RATES.manager,
      },
    ],
  };

  return departmentActivities[department] || [];
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
