import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { KPICalculationService } from './services/kpiCalculations';
import { HSEKPICalculationService } from './services/kpiCalculationsHSE';
import { OpsKPICalculationService } from './services/kpiCalculationsOps';
import { QCKPICalculationService } from './services/kpiCalculationsQC';
import { SupplyChainKPICalculationService } from './services/kpiCalculationsSupplyChain';
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
const scKpiService = new SupplyChainKPICalculationService(dbPath);
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
  const pain_points = [
    {
      id: 'qc-pp-001',
      title: 'High Defect Rates Impacting Customer Satisfaction',
      description: 'Defect rate at 31,440 PPM is 6x above industry benchmark of 5,000 PPM, leading to customer complaints, returns, and brand damage.',
      impact: 'Revenue loss from customer attrition, warranty costs, and potential regulatory penalties',
      severity: 'Critical',
      affected_metric: 'Defect Rate (PPM)',
      current_value: '31,440 PPM',
      target_value: '5,000 PPM',
      estimated_cost: '$450,000/year',
      recommended_actions: [
        'Implement Statistical Process Control (SPC) on critical processes',
        'Conduct root cause analysis on top 3 defect types',
        'Invest in automated inspection systems to catch defects earlier',
        'Train production staff on quality standards and defect prevention'
      ],
      responsible_department: 'Quality Control',
      timeline: '90 days'
    },
    {
      id: 'qc-pp-002',
      title: 'Customer Return Rate Exceeding Acceptable Limits',
      description: 'Customer return rate at 31.37% is 15x higher than the 2% benchmark, indicating serious quality escapes to the field.',
      impact: 'Direct financial loss, customer dissatisfaction, and competitive disadvantage',
      severity: 'Critical',
      affected_metric: 'Customer Return Rate',
      current_value: '31.37%',
      target_value: '2.0%',
      estimated_cost: '$380,000/year',
      recommended_actions: [
        'Strengthen final inspection protocols before shipment',
        'Implement customer complaint tracking and trend analysis',
        'Conduct field failure analysis on returned products',
        'Improve packaging and handling procedures to prevent damage'
      ],
      responsible_department: 'Quality Control & Customer Service',
      timeline: '60 days'
    },
    {
      id: 'qc-pp-003',
      title: 'Excessive Scrap Costs Reducing Profitability',
      description: 'Scrap rate at 15.90% is 5x above the 3% target, consuming $320K in materials and reducing profit margins.',
      impact: 'Material waste, increased production costs, and reduced competitiveness',
      severity: 'Critical',
      affected_metric: 'Scrap Rate',
      current_value: '15.90%',
      target_value: '3.0%',
      estimated_cost: '$320,873/year',
      recommended_actions: [
        'Analyze scrap by root cause (operator error, design, setup)',
        'Implement mistake-proofing (poka-yoke) on high-scrap processes',
        'Improve setup procedures and operator training',
        'Review design specifications for manufacturability'
      ],
      responsible_department: 'Manufacturing & Engineering',
      timeline: '90 days'
    },
    {
      id: 'qc-pp-004',
      title: 'High Non-Conformance Report (NCR) Rate',
      description: 'NCR rate at 20.42% indicates frequent quality issues requiring formal investigation and corrective action.',
      impact: 'Administrative burden, production delays, and systemic quality problems',
      severity: 'High',
      affected_metric: 'NCR Rate',
      current_value: '20.42%',
      target_value: '5.0%',
      estimated_cost: '$180,000/year',
      recommended_actions: [
        'Categorize NCRs by type (supplier, internal, customer) and address root causes',
        'Implement preventive controls to reduce recurrence',
        'Streamline NCR investigation and closure process',
        'Track CAPA effectiveness to ensure problems don\'t repeat'
      ],
      responsible_department: 'Quality Assurance',
      timeline: '120 days'
    },
    {
      id: 'qc-pp-005',
      title: 'Cost of Poor Quality (COPQ) Above Target',
      description: 'COPQ at 11.71% of sales is more than double the 5% target, representing significant financial waste.',
      impact: 'Direct hit to bottom line profitability and competitiveness',
      severity: 'High',
      affected_metric: 'Cost of Poor Quality',
      current_value: '11.71% of sales',
      target_value: '5.0% of sales',
      estimated_cost: '$443,640/year',
      recommended_actions: [
        'Break down COPQ into prevention, appraisal, internal, and external failure costs',
        'Shift spending from failure costs to prevention activities',
        'Benchmark COPQ against industry leaders',
        'Set quarterly COPQ reduction targets and track progress'
      ],
      responsible_department: 'Finance & Quality',
      timeline: '180 days'
    },
    {
      id: 'qc-pp-006',
      title: 'Inconsistent Supplier Quality Performance',
      description: 'Supplier Quality Index at 96.38% is below the 97% target, with 238 rejected parts out of 6,568 inspected.',
      impact: 'Production delays, increased incoming inspection costs, and quality escapes',
      severity: 'High',
      affected_metric: 'Supplier Quality Index',
      current_value: '96.38%',
      target_value: '97.0%',
      estimated_cost: '$125,000/year',
      recommended_actions: [
        'Conduct supplier quality audits for underperforming vendors',
        'Implement supplier scorecards with quality, delivery, and cost metrics',
        'Require supplier CAPAs for quality issues',
        'Consider supplier consolidation or replacement for chronic poor performers'
      ],
      responsible_department: 'Procurement & Quality',
      timeline: '90 days'
    },
    {
      id: 'qc-pp-007',
      title: 'Rework Consuming Production Capacity',
      description: 'Rework rate at 3.04% consumes 2,030 labor hours and $158K annually that could be used for value-added production.',
      impact: 'Reduced capacity, increased lead times, and higher labor costs',
      severity: 'Medium',
      affected_metric: 'Rework Rate',
      current_value: '3.04%',
      target_value: '1.0%',
      estimated_cost: '$158,113/year',
      recommended_actions: [
        'Analyze rework by process and identify top contributors',
        'Implement in-process inspection to catch defects earlier',
        'Improve work instructions and operator training',
        'Invest in process capability improvements (Cpk targets)'
      ],
      responsible_department: 'Manufacturing',
      timeline: '120 days'
    },
    {
      id: 'qc-pp-008',
      title: 'CAPA Closure Delays and Effectiveness Gaps',
      description: 'While CAPA effectiveness is 90%, 2 CAPAs are overdue, and average closure time of 24.9 days needs improvement.',
      impact: 'Recurring quality issues and delayed problem resolution',
      severity: 'Medium',
      affected_metric: 'CAPA Effectiveness',
      current_value: '90.0%',
      target_value: '95.0%',
      estimated_cost: '$75,000/year',
      recommended_actions: [
        'Assign CAPA owners with clear accountability and deadlines',
        'Implement CAPA tracking dashboard for management visibility',
        'Verify CAPA effectiveness through follow-up audits',
        'Train staff on effective root cause analysis techniques (5-Why, Fishbone)'
      ],
      responsible_department: 'Quality Assurance',
      timeline: '60 days'
    },
    {
      id: 'qc-pp-009',
      title: 'Quality Audit Findings Requiring Follow-Up',
      description: 'Audit score at 85.5 is acceptable, but 2 critical findings and 10 major findings need corrective action.',
      impact: 'Regulatory risk, certification issues, and potential customer audit failures',
      severity: 'Medium',
      affected_metric: 'Quality Audit Score',
      current_value: '85.5/100',
      target_value: '90.0/100',
      estimated_cost: '$50,000/year',
      recommended_actions: [
        'Address all critical and major audit findings within 30 days',
        'Conduct internal audits more frequently to catch issues early',
        'Provide auditor training on ISO 9001 and industry standards',
        'Implement audit finding tracking and verification system'
      ],
      responsible_department: 'Quality Management',
      timeline: '30 days (critical findings)'
    },
    {
      id: 'qc-pp-010',
      title: 'Lack of Real-Time Quality Data Visibility',
      description: 'Quality data is collected but not analyzed in real-time, missing opportunities for early intervention and prevention.',
      impact: 'Delayed problem detection, reactive firefighting, and missed improvement opportunities',
      severity: 'Medium',
      affected_metric: 'Multiple KPIs',
      current_value: 'Daily/Weekly reporting',
      target_value: 'Real-time dashboards',
      estimated_cost: '$100,000/year (opportunity cost)',
      recommended_actions: [
        'Implement real-time quality dashboards with alerts for out-of-control conditions',
        'Integrate inspection data with production systems for live tracking',
        'Train managers on data-driven decision making',
        'Deploy mobile quality apps for shop floor visibility'
      ],
      responsible_department: 'IT & Quality',
      timeline: '90 days'
    }
  ];

  res.json({
    success: true,
    period: {
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      label: 'Q4 2024'
    },
    pain_points
  });
});

// ========== Supply Chain Analytics API Endpoints ==========

// Get all Supply Chain KPIs for current quarter
app.get('/api/supplychain/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = scKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Supply Chain KPIs for custom period
app.get('/api/supplychain/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = scKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Supply Chain KPI endpoints

app.get('/api/supplychain/kpi/perfect-order-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculatePerfectOrderRate(startDate, endDate);
    res.json({ success: true, kpi: 'Perfect Order Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/otif', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateOTIF(startDate, endDate);
    res.json({ success: true, kpi: 'OTIF (On-Time In-Full)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/inventory-turnover', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateInventoryTurnover(startDate, endDate);
    res.json({ success: true, kpi: 'Inventory Turnover', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/dso', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateDSO(startDate, endDate);
    res.json({ success: true, kpi: 'Days Sales Outstanding (DSO)', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/cash-to-cash-cycle', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateCashToCashCycle(startDate, endDate);
    res.json({ success: true, kpi: 'Cash-to-Cash Cycle Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/supplier-lead-time', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateSupplierLeadTime(startDate, endDate);
    res.json({ success: true, kpi: 'Supplier Lead Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/freight-cost-pct', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateFreightCostPercentage(startDate, endDate);
    res.json({ success: true, kpi: 'Freight Cost % of Sales', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/warehouse-utilization', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateWarehouseUtilization(startDate, endDate);
    res.json({ success: true, kpi: 'Warehouse Capacity Utilization', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/order-accuracy', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateOrderAccuracy(startDate, endDate);
    res.json({ success: true, kpi: 'Order Accuracy Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/supplychain/kpi/sc-cost-pct', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = scKpiService.calculateSCCostPercentage(startDate, endDate);
    res.json({ success: true, kpi: 'Supply Chain Cost % of Revenue', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Supply Chain Pain Points endpoint
app.get('/api/supplychain/pain-points', (req: Request, res: Response) => {
  const pain_points = [
    {
      id: 'sc-pp-001',
      title: 'Low Perfect Order Rate Impacting Customer Satisfaction',
      description: 'Perfect Order Rate at 72.58% is significantly below the industry benchmark of 92.5%, indicating frequent issues with on-time, in-full, and accurate deliveries.',
      impact: 'Customer dissatisfaction, increased service costs, and potential loss of key accounts',
      severity: 'Critical',
      affected_metric: 'Perfect Order Rate',
      current_value: '72.58%',
      target_value: '92.5%',
      estimated_cost: '$580,000/year',
      recommended_actions: [
        'Implement real-time order tracking and exception management system',
        'Root cause analysis on delivery failures (late, incomplete, inaccurate)',
        'Improve coordination between warehousing, transportation, and customer service',
        'Establish order fulfillment process controls and performance dashboards'
      ],
      responsible_department: 'Supply Chain & Logistics',
      timeline: '120 days'
    },
    {
      id: 'sc-pp-002',
      title: 'OTIF Performance Below Target Affecting Reliability',
      description: 'On-Time In-Full delivery at 70.96% is well below the 87.5% benchmark, damaging customer trust and competitiveness.',
      impact: 'Penalties from retail customers, reduced order volumes, and competitive disadvantage',
      severity: 'Critical',
      affected_metric: 'OTIF Delivery Rate',
      current_value: '70.96%',
      target_value: '87.5%',
      estimated_cost: '$420,000/year',
      recommended_actions: [
        'Analyze delivery failures by root cause (inventory, transportation, forecasting)',
        'Improve demand forecasting accuracy to ensure product availability',
        'Optimize transportation routes and carrier performance',
        'Implement safety stock policies for critical SKUs'
      ],
      responsible_department: 'Logistics & Demand Planning',
      timeline: '90 days'
    },
    {
      id: 'sc-pp-003',
      title: 'Slow Inventory Turnover Tying Up Working Capital',
      description: 'Inventory turnover at 6.78x is below the 10x benchmark, indicating excess inventory and slow-moving stock.',
      impact: 'Cash tied up in inventory, increased carrying costs, and risk of obsolescence',
      severity: 'High',
      affected_metric: 'Inventory Turnover',
      current_value: '6.78x',
      target_value: '10x',
      estimated_cost: '$650,000/year (opportunity cost)',
      recommended_actions: [
        'Conduct ABC analysis to identify slow-moving and obsolete inventory',
        'Implement inventory optimization tools (EOQ, safety stock calculations)',
        'Improve demand forecasting to reduce overstocking',
        'Establish consignment or vendor-managed inventory (VMI) with key suppliers'
      ],
      responsible_department: 'Inventory Management & Planning',
      timeline: '180 days'
    },
    {
      id: 'sc-pp-004',
      title: 'Extended Days Sales Outstanding (DSO) Straining Cash Flow',
      description: 'DSO at 47.3 days exceeds the 38-day benchmark, delaying cash collection and impacting working capital.',
      impact: 'Cash flow constraints, increased need for credit facilities, and reduced financial flexibility',
      severity: 'High',
      affected_metric: 'Days Sales Outstanding',
      current_value: '47.3 days',
      target_value: '38 days',
      estimated_cost: '$290,000/year (financing costs)',
      recommended_actions: [
        'Implement automated invoicing and payment reminder systems',
        'Offer early payment discounts to incentivize faster payment',
        'Review customer credit terms and enforce payment policies',
        'Segment customers by payment behavior and manage proactively'
      ],
      responsible_department: 'Finance & Accounts Receivable',
      timeline: '60 days'
    },
    {
      id: 'sc-pp-005',
      title: 'Long Cash-to-Cash Cycle Time Reducing Liquidity',
      description: 'Cash-to-Cash cycle at 76.4 days is above the 45-day target, indicating cash is tied up too long in operations.',
      impact: 'Limited cash availability for growth initiatives and increased financing requirements',
      severity: 'High',
      affected_metric: 'Cash-to-Cash Cycle Time',
      current_value: '76.4 days',
      target_value: '45 days',
      estimated_cost: '$520,000/year (opportunity cost)',
      recommended_actions: [
        'Reduce DIO through better inventory management (see inventory turnover)',
        'Accelerate DSO through improved collections (see DSO)',
        'Negotiate extended payment terms with suppliers to increase DPO',
        'Implement supply chain finance solutions'
      ],
      responsible_department: 'CFO & Supply Chain Leadership',
      timeline: '180 days'
    },
    {
      id: 'sc-pp-006',
      title: 'Supplier Lead Times Too Long for Market Responsiveness',
      description: 'Average supplier lead time of 28.8 days exceeds the 21-day benchmark, reducing agility and increasing inventory needs.',
      impact: 'Slower response to market changes, higher safety stock requirements, and competitive disadvantage',
      severity: 'Medium',
      affected_metric: 'Supplier Lead Time',
      current_value: '28.8 days',
      target_value: '21 days',
      estimated_cost: '$180,000/year',
      recommended_actions: [
        'Conduct supplier segmentation and develop local/regional sourcing strategies',
        'Negotiate lead time reductions with key suppliers',
        'Implement vendor scorecards tracking lead time performance',
        'Consider dual sourcing for critical components to improve flexibility'
      ],
      responsible_department: 'Procurement & Supplier Management',
      timeline: '120 days'
    },
    {
      id: 'sc-pp-007',
      title: 'High Freight Costs Reducing Profit Margins',
      description: 'Freight costs at 5.87% of sales exceed the 4.5% benchmark, directly impacting bottom-line profitability.',
      impact: 'Reduced profit margins and price competitiveness',
      severity: 'Medium',
      affected_metric: 'Freight Cost % of Sales',
      current_value: '5.87%',
      target_value: '4.5%',
      estimated_cost: '$520,000/year',
      recommended_actions: [
        'Conduct freight spend analysis by lane, mode, and carrier',
        'Consolidate shipments and optimize truckload utilization',
        'Renegotiate carrier contracts and explore multi-modal transportation',
        'Implement transportation management system (TMS) for route optimization'
      ],
      responsible_department: 'Transportation & Logistics',
      timeline: '90 days'
    },
    {
      id: 'sc-pp-008',
      title: 'Warehouse Space Inefficiencies Driving Up Costs',
      description: 'Warehouse capacity utilization at 67.50% is below the optimal 80-85% range, indicating underutilized space or poor layout.',
      impact: 'Higher fixed costs per unit stored and potential need for additional warehouse space',
      severity: 'Medium',
      affected_metric: 'Warehouse Capacity Utilization',
      current_value: '67.50%',
      target_value: '82.5%',
      estimated_cost: '$220,000/year',
      recommended_actions: [
        'Conduct warehouse layout optimization and slotting analysis',
        'Implement vertical storage solutions (racking, mezzanines)',
        'Reduce slow-moving inventory to free up space',
        'Consider warehouse automation for better space utilization'
      ],
      responsible_department: 'Warehousing & Distribution',
      timeline: '120 days'
    },
    {
      id: 'sc-pp-009',
      title: 'Order Inaccuracy Creating Customer Service Issues',
      description: 'Order accuracy at 92.13% is below the 96.5% benchmark, leading to returns, complaints, and rework.',
      impact: 'Customer dissatisfaction, increased reverse logistics costs, and administrative burden',
      severity: 'Medium',
      affected_metric: 'Order Accuracy Rate',
      current_value: '92.13%',
      target_value: '96.5%',
      estimated_cost: '$170,000/year',
      recommended_actions: [
        'Implement barcode scanning and pick-to-light systems in warehouse',
        'Conduct error-proofing (poka-yoke) in picking and packing processes',
        'Train warehouse staff on quality and accuracy standards',
        'Track error types and implement targeted improvements'
      ],
      responsible_department: 'Warehouse Operations',
      timeline: '60 days'
    },
    {
      id: 'sc-pp-010',
      title: 'Elevated Supply Chain Costs Impacting Competitiveness',
      description: 'Supply Chain costs at 8.25% of revenue exceed the 6.5% benchmark, reducing overall company profitability.',
      impact: 'Lower profit margins, reduced pricing flexibility, and competitive disadvantage',
      severity: 'High',
      affected_metric: 'Supply Chain Cost % of Revenue',
      current_value: '8.25%',
      target_value: '6.5%',
      estimated_cost: '$665,000/year',
      recommended_actions: [
        'Conduct detailed cost breakdown by category (transport, warehouse, inventory carrying, procurement)',
        'Benchmark costs against industry leaders and identify improvement opportunities',
        'Implement lean supply chain initiatives to eliminate waste',
        'Invest in supply chain technology (WMS, TMS, advanced planning) for efficiency'
      ],
      responsible_department: 'Chief Supply Chain Officer',
      timeline: '180 days'
    }
  ];

  res.json({
    success: true,
    period: {
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      label: 'Q4 2024'
    },
    pain_points
  });
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
