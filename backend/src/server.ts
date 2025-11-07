import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { KPICalculationService } from './services/kpiCalculations';
import { HSEKPICalculationService } from './services/kpiCalculationsHSE';
import { OpsKPICalculationService } from './services/kpiCalculationsOps';
import { QCKPICalculationService } from './services/kpiCalculationsQC';
import { PredictiveAnalyticsService } from './services/predictiveAnalytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const dbPath = path.join(__dirname, '../database/elevareiq.db');
const kpiService = new KPICalculationService(dbPath);
const hseKpiService = new HSEKPICalculationService(dbPath);
const opsKpiService = new OpsKPICalculationService(dbPath);
const qcKpiService = new QCKPICalculationService(dbPath);
const predictiveService = new PredictiveAnalyticsService(dbPath);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'ElevareIQ-MVP API is running' });
});

// Get all KPIs for current quarter
app.get('/api/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = kpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all KPIs for custom period
app.get('/api/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = kpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual KPI endpoints with full calculation details

app.get('/api/kpis/turnover', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateTurnoverRate(startDate, endDate);
    res.json({ success: true, kpi: 'Employee Turnover Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/time-to-hire', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateTimeToHire(startDate, endDate);
    res.json({ success: true, kpi: 'Time to Hire', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/cost-per-hire', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateCostPerHire(startDate, endDate);
    res.json({ success: true, kpi: 'Cost per Hire', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/productivity', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateProductivity(startDate, endDate);
    res.json({ success: true, kpi: 'Employee Productivity', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/safety', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateTRIR(startDate, endDate);
    res.json({ success: true, kpi: 'Safety Incident Rate (TRIR)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/absenteeism', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateAbsenteeismRate(startDate, endDate);
    res.json({ success: true, kpi: 'Absenteeism Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/training-roi', (req: Request, res: Response) => {
  try {
    const fiscalYear = parseInt(req.query.fiscalYear as string) || 2024;

    const result = kpiService.calculateTrainingROI(fiscalYear);
    res.json({ success: true, kpi: 'Training ROI', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/engagement', (req: Request, res: Response) => {
  try {
    const surveyId = req.query.surveyId ? parseInt(req.query.surveyId as string) : undefined;

    const result = kpiService.calculateEngagementScore(surveyId);
    res.json({ success: true, kpi: 'Employee Engagement Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/offer-acceptance', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateOfferAcceptanceRate(startDate, endDate);
    res.json({ success: true, kpi: 'Offer Acceptance Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/kpis/revenue-per-employee', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = kpiService.calculateRevenuePerEmployee(startDate, endDate);
    res.json({ success: true, kpi: 'Revenue per Employee', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pain Points summary endpoint
app.get('/api/pain-points', (req: Request, res: Response) => {
  const painPoints = [
    {
      rank: 1,
      title: 'Skilled Labor Shortage & Talent Acquisition',
      description: '94% of construction firms struggle to fill craft positions. Average time to hire: 45 days.',
      relatedKPIs: ['Time to Hire', 'Cost per Hire', 'Offer Acceptance Rate'],
      severity: 'Critical'
    },
    {
      rank: 2,
      title: 'Employee Retention & High Turnover',
      description: 'Turnover costs 50-200% of annual salary per separation. Only 22% plan to stay long-term.',
      relatedKPIs: ['Turnover Rate', 'Training ROI', 'Engagement Score'],
      severity: 'Critical'
    },
    {
      rank: 3,
      title: 'Aging Workforce & Skills Gap',
      description: 'Construction workforce aged 25-54 declined 8%. Critical skills retiring faster than replacement.',
      relatedKPIs: ['Training ROI', 'Internal Promotion Rate', 'Succession Planning'],
      severity: 'High'
    },
    {
      rank: 4,
      title: 'Safety & Workers Compensation',
      description: 'Physical demands lead to higher injury rates. Indirect costs are 4-10× direct costs.',
      relatedKPIs: ['TRIR', 'Safety Costs', 'Lost Time Incidents'],
      severity: 'Critical'
    },
    {
      rank: 5,
      title: 'Employee Engagement & Burnout',
      description: '82% at risk of burnout. Only 26% feel engaged at work. 75% of managers overwhelmed.',
      relatedKPIs: ['Engagement Score', 'Absenteeism', 'Turnover Rate'],
      severity: 'High'
    },
    {
      rank: 6,
      title: 'Compensation & Benefits Competitiveness',
      description: 'Primary reason for declined offers and voluntary separations. Budget constraints ongoing.',
      relatedKPIs: ['Offer Acceptance Rate', 'Market Competitiveness', 'Total Rewards'],
      severity: 'High'
    },
    {
      rank: 7,
      title: 'Training & Development Needs',
      description: 'Continuous upskilling required. New technology requires new capabilities.',
      relatedKPIs: ['Training ROI', 'Skills Assessment', 'Certification Rate'],
      severity: 'Medium'
    },
    {
      rank: 8,
      title: 'Compliance & Labor Law Management',
      description: 'Complex multi-state regulations. Mobile workforce complicates compliance tracking.',
      relatedKPIs: ['Compliance Rate', 'Violations', 'Audit Findings'],
      severity: 'Medium'
    },
    {
      rank: 9,
      title: 'Budget Constraints & Cost Control',
      description: 'Economic uncertainty impacting hiring. Need to optimize HR spend and demonstrate ROI.',
      relatedKPIs: ['Cost per Hire', 'Labor Cost Ratio', 'Budget Variance'],
      severity: 'Medium'
    },
    {
      rank: 10,
      title: 'Recruiting Tech-Savvy Workers for Automation',
      description: 'Only 13% of workforce under 25. Need technical skills for robotics and automation.',
      relatedKPIs: ['Technical Hire Rate', 'Skills Gap Analysis', 'Training Completion'],
      severity: 'Medium'
    }
  ];

  res.json({ success: true, painPoints });
});

// Company info endpoint
app.get('/api/company', (req: Request, res: Response) => {
  res.json({
    success: true,
    company: {
      name: 'TitanBuild Manufacturing & Logistics',
      industry: 'Manufacturing, Construction & Logistics',
      founded: 1998,
      headquarters: 'Detroit, Michigan',
      facilities: 4,
      employees: 847,
      fiscalYear: 2024,
      locations: [
        { name: 'Detroit Manufacturing Plant', type: 'Manufacturing', employees: 385 },
        { name: 'Phoenix Distribution Center', type: 'Logistics', employees: 182 },
        { name: 'Atlanta Construction Division', type: 'Construction', employees: 218 },
        { name: 'Chicago Corporate Office', type: 'Office', employees: 62 }
      ]
    }
  });
});

// ========== HSE (Health, Safety & Environment) API Endpoints ==========

// Get all HSE KPIs for current quarter
app.get('/api/hse/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = hseKpiService.getAllHSEKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all HSE KPIs for custom period
app.get('/api/hse/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = hseKpiService.getAllHSEKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual HSE KPI endpoints

app.get('/api/hse/kpis/trir', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateTRIR(startDate, endDate);
    res.json({ success: true, kpi: 'TRIR (Total Recordable Incident Rate)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/ltifr', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateLTIFR(startDate, endDate);
    res.json({ success: true, kpi: 'LTIFR (Lost Time Injury Frequency Rate)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/near-miss-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateNearMissRate(startDate, endDate);
    res.json({ success: true, kpi: 'Near Miss Reporting Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/safety-training-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateSafetyTrainingRate(startDate, endDate);
    res.json({ success: true, kpi: 'Safety Training Completion Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/ppe-compliance', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculatePPEComplianceRate(startDate, endDate);
    res.json({ success: true, kpi: 'PPE Compliance Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/environmental-compliance', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateEnvironmentalCompliance(startDate, endDate);
    res.json({ success: true, kpi: 'Environmental Compliance Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/safety-audit-score', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateSafetyAuditScore(startDate, endDate);
    res.json({ success: true, kpi: 'Safety Audit Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/investigation-closure-time', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateInvestigationClosureTime(startDate, endDate);
    res.json({ success: true, kpi: 'Incident Investigation Closure Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/hazard-identification-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateHazardIdentificationRate(startDate, endDate);
    res.json({ success: true, kpi: 'Hazard Identification Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/hse/kpis/emergency-preparedness', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = hseKpiService.calculateEmergencyPreparednessScore(startDate, endDate);
    res.json({ success: true, kpi: 'Emergency Preparedness Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// HSE Pain Points endpoint
app.get('/api/hse/pain-points', (req: Request, res: Response) => {
  const painPoints = [
    {
      rank: 1,
      title: 'Workplace Injuries & Lost Time Incidents',
      description: 'High-risk environments lead to injuries that cost companies directly and indirectly through lost productivity, workers comp, and morale impacts.',
      relatedKPIs: ['TRIR', 'LTIFR', 'Investigation Closure Time'],
      severity: 'Critical'
    },
    {
      rank: 2,
      title: 'Safety Compliance & Regulatory Requirements',
      description: 'OSHA regulations, EPA requirements, and industry standards require constant vigilance. Non-compliance results in fines and shutdowns.',
      relatedKPIs: ['Safety Audit Score', 'Environmental Compliance', 'Safety Training Rate'],
      severity: 'Critical'
    },
    {
      rank: 3,
      title: 'PPE Compliance & Enforcement',
      description: 'Ensuring consistent use of personal protective equipment across all operations remains a daily challenge, especially in fast-paced environments.',
      relatedKPIs: ['PPE Compliance', 'Safety Observations', 'Incident Rate'],
      severity: 'High'
    },
    {
      rank: 4,
      title: 'Safety Culture & Behavior Change',
      description: 'Moving from compliance-based to proactive safety culture requires behavioral change, leadership commitment, and employee buy-in.',
      relatedKPIs: ['Near Miss Rate', 'Hazard Identification Rate', 'Emergency Preparedness'],
      severity: 'High'
    },
    {
      rank: 5,
      title: 'Incident Investigation & Root Cause Analysis',
      description: 'Thorough investigations are time-consuming but critical. Many incidents repeat because root causes aren\'t properly identified and addressed.',
      relatedKPIs: ['Investigation Closure Time', 'Repeat Incidents', 'Corrective Actions'],
      severity: 'High'
    },
    {
      rank: 6,
      title: 'Environmental Impact & Sustainability',
      description: 'Managing emissions, waste, water usage, and energy consumption while meeting production targets and staying within regulatory limits.',
      relatedKPIs: ['Environmental Compliance', 'Emissions', 'Waste Management'],
      severity: 'High'
    },
    {
      rank: 7,
      title: 'Safety Training & Certification Management',
      description: 'Ensuring all employees maintain required certifications, complete training on time, and demonstrate competency in safety procedures.',
      relatedKPIs: ['Safety Training Rate', 'Certification Status', 'Training Hours'],
      severity: 'Medium'
    },
    {
      rank: 8,
      title: 'Near Miss & Hazard Reporting',
      description: 'Encouraging proactive reporting of near misses and hazards without fear of punishment. Many incidents could be prevented with better reporting.',
      relatedKPIs: ['Near Miss Rate', 'Hazard Identification Rate', 'Reporting Engagement'],
      severity: 'Medium'
    },
    {
      rank: 9,
      title: 'Emergency Preparedness & Response',
      description: 'Maintaining readiness for fires, chemical spills, natural disasters, and medical emergencies through regular drills and equipment maintenance.',
      relatedKPIs: ['Emergency Preparedness', 'Drill Performance', 'Response Time'],
      severity: 'Medium'
    },
    {
      rank: 10,
      title: 'Chemical Management & SDS Tracking',
      description: 'Tracking hundreds of chemicals across multiple facilities, maintaining current Safety Data Sheets, and ensuring proper storage and handling.',
      relatedKPIs: ['Chemical Inventory', 'SDS Current', 'Hazmat Incidents'],
      severity: 'Medium'
    }
  ];

  res.json({ success: true, painPoints });
});

// ========== Operations KPI API Endpoints ==========

// Get all Operations KPIs for current quarter
app.get('/api/ops/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = opsKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Operations KPIs for custom period
app.get('/api/ops/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = opsKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Operations KPI endpoints

app.get('/api/ops/kpis/on-time-delivery', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateOnTimeDelivery(startDate, endDate);
    res.json({ success: true, kpi: 'On-Time Delivery (OTIF)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/schedule-adherence', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateScheduleAdherence(startDate, endDate);
    res.json({ success: true, kpi: 'Production Schedule Adherence', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/oee', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateOEE(startDate, endDate);
    res.json({ success: true, kpi: 'Overall Equipment Effectiveness (OEE)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/first-pass-yield', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateFirstPassYield(startDate, endDate);
    res.json({ success: true, kpi: 'First Pass Yield (FPY)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/inventory-turnover', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateInventoryTurnover(startDate, endDate);
    res.json({ success: true, kpi: 'Inventory Turnover Ratio', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/supplier-otd', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateSupplierOTD(startDate, endDate);
    res.json({ success: true, kpi: 'Supplier On-Time Delivery', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/cycle-time', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateCycleTime(startDate, endDate);
    res.json({ success: true, kpi: 'Manufacturing Cycle Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/capacity-utilization', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateCapacityUtilization(startDate, endDate);
    res.json({ success: true, kpi: 'Capacity Utilization', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/maintenance-compliance', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateMaintenanceCompliance(startDate, endDate);
    res.json({ success: true, kpi: 'Maintenance Compliance', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ops/kpis/cost-of-quality', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = opsKpiService.calculateCostOfQuality(startDate, endDate);
    res.json({ success: true, kpi: 'Cost of Quality (COQ)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Operations Pain Points endpoint
app.get('/api/ops/pain-points', (req: Request, res: Response) => {
  const painPoints = [
    {
      rank: 1,
      title: 'Production Delays & Missed Deadlines',
      description: 'Schedule slippage due to equipment issues, material shortages, and capacity constraints leads to late deliveries and customer dissatisfaction.',
      relatedKPIs: ['Schedule Adherence', 'On-Time Delivery', 'Cycle Time'],
      severity: 'Critical'
    },
    {
      rank: 2,
      title: 'Equipment Downtime & Maintenance Costs',
      description: 'Unplanned equipment failures result in production losses, emergency repairs, and increased maintenance spending that erodes profitability.',
      relatedKPIs: ['OEE', 'Maintenance Compliance', 'Downtime Hours'],
      severity: 'Critical'
    },
    {
      rank: 3,
      title: 'Quality Control & Defect Rates',
      description: 'First-pass yield issues create rework costs, scrap waste, and potential customer returns that damage reputation and margins.',
      relatedKPIs: ['First Pass Yield', 'Cost of Quality', 'Defect Rate'],
      severity: 'Critical'
    },
    {
      rank: 4,
      title: 'Inventory Management & Working Capital',
      description: 'Balancing inventory to avoid stockouts while minimizing carrying costs ties up working capital and impacts cash flow.',
      relatedKPIs: ['Inventory Turnover', 'Days Inventory Outstanding', 'Stockout Rate'],
      severity: 'High'
    },
    {
      rank: 5,
      title: 'Supply Chain Disruptions',
      description: 'Supplier delays, quality issues, and unreliable deliveries disrupt production schedules and force expedited shipping costs.',
      relatedKPIs: ['Supplier On-Time Delivery', 'Supplier Quality Rating', 'Lead Time Variance'],
      severity: 'High'
    },
    {
      rank: 6,
      title: 'Labor Capacity & Utilization',
      description: 'Mismatches between workforce capacity and demand create overtime costs or idle time, impacting productivity and costs.',
      relatedKPIs: ['Capacity Utilization', 'Labor Efficiency', 'Overtime Hours'],
      severity: 'High'
    },
    {
      rank: 7,
      title: 'Customer Delivery Performance',
      description: 'Late shipments, partial deliveries, and delivery errors damage customer relationships and create service recovery costs.',
      relatedKPIs: ['On-Time Delivery', 'Perfect Order Rate', 'Customer Complaints'],
      severity: 'High'
    },
    {
      rank: 8,
      title: 'Manufacturing Cycle Time Variability',
      description: 'Inconsistent production cycle times make scheduling difficult, increase WIP inventory, and reduce predictability.',
      relatedKPIs: ['Cycle Time', 'Cycle Time Variance', 'Schedule Stability'],
      severity: 'Medium'
    },
    {
      rank: 9,
      title: 'Preventive Maintenance Compliance',
      description: 'Deferred maintenance to meet production targets leads to breakdowns, safety risks, and higher long-term repair costs.',
      relatedKPIs: ['Maintenance Compliance', 'PM Completion Rate', 'Emergency Work Orders'],
      severity: 'Medium'
    },
    {
      rank: 10,
      title: 'Overall Equipment Effectiveness (OEE)',
      description: 'Low OEE from availability, performance, and quality losses indicates untapped production capacity and efficiency opportunities.',
      relatedKPIs: ['OEE', 'Availability', 'Performance Efficiency'],
      severity: 'Medium'
    }
  ];

  res.json({ success: true, painPoints });
});

// ========== Quality Control (QC) KPI API Endpoints ==========

// Get all QC KPIs for current quarter
app.get('/api/qc/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = qcKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all QC KPIs for custom period
app.get('/api/qc/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = qcKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual QC KPI endpoints

app.get('/api/qc/kpis/defect-rate-ppm', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateDefectRatePPM(startDate, endDate);
    res.json({ success: true, kpi: 'Defect Rate (PPM)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/first-pass-yield', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateFirstPassYield(startDate, endDate);
    res.json({ success: true, kpi: 'First Pass Yield', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/scrap-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateScrapRate(startDate, endDate);
    res.json({ success: true, kpi: 'Scrap Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/rework-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateReworkRate(startDate, endDate);
    res.json({ success: true, kpi: 'Rework Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/customer-return-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateCustomerReturnRate(startDate, endDate);
    res.json({ success: true, kpi: 'Customer Return Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/supplier-quality-index', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateSupplierQualityIndex(startDate, endDate);
    res.json({ success: true, kpi: 'Supplier Quality Index', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/ncr-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateNCRRate(startDate, endDate);
    res.json({ success: true, kpi: 'Non-Conformance Report Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/capa-effectiveness', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateCAPAEffectiveness(startDate, endDate);
    res.json({ success: true, kpi: 'CAPA Effectiveness', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/copq', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateCOPQ(startDate, endDate);
    res.json({ success: true, kpi: 'Cost of Poor Quality (COPQ)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/qc/kpis/quality-audit-score', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = qcKpiService.calculateQualityAuditScore(startDate, endDate);
    res.json({ success: true, kpi: 'Quality Audit Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// QC Pain Points endpoint
app.get('/api/qc/pain-points', (req: Request, res: Response) => {
  const painPoints = [
    {
      rank: 1,
      title: 'High Defect Rates Impacting Customer Satisfaction',
      description: 'Excessive defects lead to customer complaints, returns, warranty claims, and damage to brand reputation and market position.',
      relatedKPIs: ['Defect Rate (PPM)', 'First Pass Yield', 'Customer Return Rate'],
      severity: 'Critical'
    },
    {
      rank: 2,
      title: 'Inconsistent Quality Across Production Batches',
      description: 'Variation between batches creates unpredictable quality levels, making it difficult to maintain consistent product standards.',
      relatedKPIs: ['First Pass Yield', 'Defect Rate (PPM)', 'Quality Audit Score'],
      severity: 'Critical'
    },
    {
      rank: 3,
      title: 'Supplier Quality Issues & Incoming Defects',
      description: 'Poor supplier quality disrupts production, increases inspection costs, and leads to production delays and rework.',
      relatedKPIs: ['Supplier Quality Index', 'NCR Rate', 'Scrap Rate'],
      severity: 'Critical'
    },
    {
      rank: 4,
      title: 'Rework Costs Eroding Profit Margins',
      description: 'High rework rates consume labor hours, materials, and capacity that could be used for value-added production activities.',
      relatedKPIs: ['Rework Rate', 'Cost of Poor Quality', 'First Pass Yield'],
      severity: 'High'
    },
    {
      rank: 5,
      title: 'Customer Complaints & Warranty Claims',
      description: 'Field failures and customer dissatisfaction result in costly warranty work, product replacements, and potential liability exposure.',
      relatedKPIs: ['Customer Return Rate', 'Cost of Poor Quality', 'CAPA Effectiveness'],
      severity: 'High'
    },
    {
      rank: 6,
      title: 'Slow Root Cause Analysis & Corrective Actions',
      description: 'Delayed problem resolution allows quality issues to persist and repeat, increasing costs and customer impact.',
      relatedKPIs: ['CAPA Effectiveness', 'NCR Rate', 'Quality Audit Score'],
      severity: 'High'
    },
    {
      rank: 7,
      title: 'Lack of Real-Time Quality Visibility',
      description: 'Without real-time quality data, problems are discovered too late, missing opportunities for early intervention and prevention.',
      relatedKPIs: ['Defect Rate (PPM)', 'First Pass Yield', 'NCR Rate'],
      severity: 'High'
    },
    {
      rank: 8,
      title: 'Inspector Training & Competency Gaps',
      description: 'Inadequate inspector training leads to inconsistent inspection results, missed defects, and false rejections.',
      relatedKPIs: ['Quality Audit Score', 'First Pass Yield', 'NCR Rate'],
      severity: 'Medium'
    },
    {
      rank: 9,
      title: 'Documentation & Traceability Challenges',
      description: 'Poor documentation makes it difficult to trace defects to root causes, conduct recalls, and demonstrate regulatory compliance.',
      relatedKPIs: ['Quality Audit Score', 'CAPA Effectiveness', 'NCR Rate'],
      severity: 'Medium'
    },
    {
      rank: 10,
      title: 'Measurement System Accuracy & Calibration',
      description: 'Inaccurate or uncalibrated measurement equipment produces unreliable data, leading to wrong decisions and quality escapes.',
      relatedKPIs: ['Quality Audit Score', 'Defect Rate (PPM)', 'Supplier Quality Index'],
      severity: 'Medium'
    }
  ];

  res.json({ success: true, painPoints });
});

// ========== Mobile Safety Reporting API Endpoints ==========

// Submit incident report
app.post('/api/mobile/report/incident', (req: Request, res: Response) => {
  try {
    const { facilityId, department, employeeId, description, incidentType, severity, location, latitude, longitude, photoUrls } = req.body;

    const db = new (require('better-sqlite3'))(require('path').join(__dirname, '../database/elevareiq.db'));

    const incidentId = `INC-MOB-${Date.now()}`;
    const incidentDate = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT INTO safety_incidents (
        incident_id, incident_date, facility_id, department, employee_id,
        incident_type, severity, description, recordable, lost_work_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
    `);

    const result = insert.run(incidentId, incidentDate, facilityId, department, employeeId, incidentType, severity, description);

    db.close();

    res.json({
      success: true,
      message: 'Incident report submitted successfully',
      incidentId,
      reportId: result.lastInsertRowid
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit near miss report
app.post('/api/mobile/report/near-miss', (req: Request, res: Response) => {
  try {
    const { facilityId, department, employeeId, description, potentialSeverity, hazardType, location, latitude, longitude } = req.body;

    const db = new (require('better-sqlite3'))(require('path').join(__dirname, '../database/elevareiq.db'));

    const nearMissId = `NM-MOB-${Date.now()}`;
    const reportDate = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT INTO hse_near_misses (
        near_miss_id, report_date, facility_id, department, reported_by_employee_id,
        description, potential_severity, hazard_type, corrective_action, action_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Under review', 0)
    `);

    const result = insert.run(nearMissId, reportDate, facilityId, department, employeeId, description, potentialSeverity, hazardType);

    db.close();

    res.json({
      success: true,
      message: 'Near miss report submitted successfully',
      nearMissId,
      reportId: result.lastInsertRowid
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit hazard report
app.post('/api/mobile/report/hazard', (req: Request, res: Response) => {
  try {
    const { facilityId, department, employeeId, hazardType, hazardCategory, locationDescription, severityLevel, probability, description, latitude, longitude } = req.body;

    const db = new (require('better-sqlite3'))(require('path').join(__dirname, '../database/elevareiq.db'));

    const hazardId = `HAZ-MOB-${Date.now()}`;
    const reportDate = new Date().toISOString().split('T')[0];

    const severityMap: { [key: string]: number } = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
    const probabilityMap: { [key: string]: number } = { 'Rare': 1, 'Unlikely': 2, 'Possible': 3, 'Likely': 4, 'Almost Certain': 5 };
    const riskRating = (severityMap[severityLevel] || 2) * (probabilityMap[probability] || 3);

    const insert = db.prepare(`
      INSERT INTO hse_hazard_reports (
        hazard_id, report_date, facility_id, department, reported_by_employee_id,
        hazard_type, hazard_category, location_description, severity_level, probability,
        risk_rating, description, photos_attached, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Open')
    `);

    const result = insert.run(hazardId, reportDate, facilityId, department, employeeId, hazardType, hazardCategory, locationDescription, severityLevel, probability, riskRating, description);

    db.close();

    res.json({
      success: true,
      message: 'Hazard report submitted successfully',
      hazardId,
      reportId: result.lastInsertRowid,
      riskRating
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get mobile user's submitted reports
app.get('/api/mobile/reports/:employeeId', (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const db = new (require('better-sqlite3'))(require('path').join(__dirname, '../database/elevareiq.db'));

    const incidents = db.prepare(`
      SELECT incident_id as id, incident_date as date, incident_type as type, severity, description, 'incident' as reportType
      FROM safety_incidents
      WHERE employee_id = ?
      ORDER BY incident_date DESC
      LIMIT 20
    `).all(employeeId);

    const nearMisses = db.prepare(`
      SELECT near_miss_id as id, report_date as date, hazard_type as type, potential_severity as severity, description, 'near-miss' as reportType
      FROM hse_near_misses
      WHERE reported_by_employee_id = ?
      ORDER BY report_date DESC
      LIMIT 20
    `).all(employeeId);

    const hazards = db.prepare(`
      SELECT hazard_id as id, report_date as date, hazard_category as type, severity_level as severity, description, status, 'hazard' as reportType
      FROM hse_hazard_reports
      WHERE reported_by_employee_id = ?
      ORDER BY report_date DESC
      LIMIT 20
    `).all(employeeId);

    db.close();

    const allReports = [...incidents, ...nearMisses, ...hazards].sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      success: true,
      reports: allReports,
      totals: {
        incidents: incidents.length,
        nearMisses: nearMisses.length,
        hazards: hazards.length
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get facilities list for mobile
app.get('/api/mobile/facilities', (req: Request, res: Response) => {
  try {
    const db = new (require('better-sqlite3'))(require('path').join(__dirname, '../database/elevareiq.db'));
    const facilities = db.prepare('SELECT id, name, type, city, state FROM facilities').all();
    db.close();

    res.json({ success: true, facilities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling

// Get all predictive analytics
app.get('/api/predictive/all', (req: Request, res: Response) => {
  try {
    const analytics = predictiveService.getAllPredictiveAnalytics();
    res.json({ success: true, ...analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get risk scores
app.get('/api/predictive/risk-scores', (req: Request, res: Response) => {
  try {
    const riskScores = predictiveService.calculateRiskScores();
    res.json({ success: true, riskScores });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get forecasts
app.get('/api/predictive/forecasts', (req: Request, res: Response) => {
  try {
    const forecasts = predictiveService.forecastSafetyMetrics();
    res.json({ success: true, forecasts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get anomalies
app.get('/api/predictive/anomalies', (req: Request, res: Response) => {
  try {
    const anomalies = predictiveService.detectAnomalies();
    res.json({ success: true, anomalies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get insights
app.get('/api/predictive/insights', (req: Request, res: Response) => {
  try {
    const insights = predictiveService.generateInsights();
    res.json({ success: true, insights });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ElevareIQ-MVP API Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000`);
  console.log(`\n🔗 HR Analytics API Endpoints:`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/company`);
  console.log(`   GET /api/pain-points`);
  console.log(`   GET /api/kpis/current`);
  console.log(`   GET /api/kpis/period?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`);
  console.log(`   GET /api/kpis/[metric-name]`);
  console.log(`\n🦺 HSE Analytics API Endpoints:`);
  console.log(`   GET /api/hse/pain-points`);
  console.log(`   GET /api/hse/kpis/current`);
  console.log(`   GET /api/hse/kpis/period?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`);
  console.log(`   GET /api/hse/kpis/trir`);
  console.log(`   GET /api/hse/kpis/ltifr`);
  console.log(`   GET /api/hse/kpis/near-miss-rate`);
  console.log(`   GET /api/hse/kpis/safety-training-rate`);
  console.log(`   GET /api/hse/kpis/ppe-compliance`);
  console.log(`   GET /api/hse/kpis/environmental-compliance`);
  console.log(`   GET /api/hse/kpis/safety-audit-score`);
  console.log(`   GET /api/hse/kpis/investigation-closure-time`);
  console.log(`   GET /api/hse/kpis/hazard-identification-rate`);
  console.log(`   GET /api/hse/kpis/emergency-preparedness`);
  console.log(`\n🔮 Predictive Analytics API Endpoints:`);
  console.log(`   GET /api/predictive/all`);
  console.log(`   GET /api/predictive/risk-scores`);
  console.log(`   GET /api/predictive/forecasts`);
  console.log(`   GET /api/predictive/anomalies`);
  console.log(`   GET /api/predictive/insights`);
  console.log(`\n📱 Mobile Safety Reporting API Endpoints:`);
  console.log(`   POST /api/mobile/report/incident`);
  console.log(`   POST /api/mobile/report/near-miss`);
  console.log(`   POST /api/mobile/report/hazard`);
  console.log(`   GET /api/mobile/reports/:employeeId`);
  console.log(`   GET /api/mobile/facilities`);
  console.log(`\n💡 All calculations are transparent and auditable\n`);
});

export default app;
