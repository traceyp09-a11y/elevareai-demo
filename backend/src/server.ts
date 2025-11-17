import express, { Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import path from 'path';
import { createAuthRoutes } from './routes/auth';
import { KPICalculationService } from './services/kpiCalculations';
import { HSEKPICalculationService } from './services/kpiCalculationsHSE';
import { OpsKPICalculationService } from './services/kpiCalculationsOps';
import { QCKPICalculationService } from './services/kpiCalculationsQC';
import { SupplyChainKPICalculationService } from './services/kpiCalculationsSupplyChain';
import { FinanceKPICalculationService } from './services/kpiCalculationsFinance';
import { AdminKPICalculationService } from './services/kpiCalculationsAdministration';
import { SalesKPICalculationService } from './services/kpiCalculationsSales';
import { CustomerSuccessKPICalculationService } from './services/kpiCalculationsCustomerSuccess';
import { MarketingKPICalculationService } from './services/kpiCalculationsMarketing';
import { PredictiveAnalyticsService } from './services/predictiveAnalytics';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Compression middleware - reduces response size by 40-60%
app.use(compression());

// Request logging
app.use(morgan('combined'));

// Response time tracking
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});

// Initialize services
const dbPath = path.join(__dirname, '../database/elevareiq.db');
const kpiService = new KPICalculationService(dbPath);
const hseKpiService = new HSEKPICalculationService(dbPath);
const opsKpiService = new OpsKPICalculationService(dbPath);
const qcKpiService = new QCKPICalculationService(dbPath);
const scKpiService = new SupplyChainKPICalculationService(dbPath);
const financeKpiService = new FinanceKPICalculationService(dbPath);
const adminKpiService = new AdminKPICalculationService(dbPath);
const salesKpiService = new SalesKPICalculationService(dbPath);
const csKpiService = new CustomerSuccessKPICalculationService(dbPath);
const marketingKpiService = new MarketingKPICalculationService(dbPath);
const predictiveService = new PredictiveAnalyticsService(dbPath);

// Initialize database for authentication
const db = new Database(dbPath);

// Authentication routes
app.use('/api/auth', createAuthRoutes(db));

// Health check with detailed metrics
app.get('/api/health', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    message: 'ElevareAI Platform API is running',
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
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

// ========== Finance Module API Endpoints ==========

// Get all Finance KPIs for Q4 2024
app.get('/api/finance/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = financeKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Finance KPIs for custom period
app.get('/api/finance/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = financeKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Finance KPI endpoints

app.get('/api/finance/kpi/gross-profit-margin', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = financeKpiService.calculateGrossProfitMargin(startDate, endDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/net-profit-margin', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = financeKpiService.calculateNetProfitMargin(startDate, endDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/operating-cash-flow-ratio', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = financeKpiService.calculateOperatingCashFlowRatio(startDate, endDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/current-ratio', (req: Request, res: Response) => {
  try {
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateCurrentRatio(snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/quick-ratio', (req: Request, res: Response) => {
  try {
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateQuickRatio(snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/return-on-assets', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateReturnOnAssets(startDate, endDate, snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/return-on-equity', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateReturnOnEquity(startDate, endDate, snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/debt-to-equity-ratio', (req: Request, res: Response) => {
  try {
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateDebtToEquityRatio(snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/working-capital-ratio', (req: Request, res: Response) => {
  try {
    const snapshotDate = req.query.snapshotDate as string || '2024-12-31';

    const result = financeKpiService.calculateWorkingCapitalRatio(snapshotDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/finance/kpi/ebitda-margin', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = financeKpiService.calculateEBITDAMargin(startDate, endDate);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Finance Pain Points Endpoint
app.get('/api/finance/pain-points', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';

  const kpis = financeKpiService.getAllKPIs(startDate, endDate);

  const pain_points = [
    {
      id: 1,
      title: 'Gross Profit Margin Below Target',
      description: 'Gross profit margin is tracking below the industry benchmark, indicating higher cost of goods sold relative to revenue.',
      severity: 'High',
      affected_metric: 'Gross Profit Margin',
      current_value: kpis.grossProfitMargin.value + '%',
      target_value: kpis.grossProfitMargin.benchmark + '%',
      estimated_cost: '$1.2M/year in lost margin',
      recommended_actions: [
        'Analyze product mix and prioritize higher-margin offerings',
        'Negotiate better pricing with suppliers to reduce COGS',
        'Review manufacturing efficiency and reduce production waste',
        'Consider price increases for products with inelastic demand'
      ],
      responsible_department: 'CFO / Operations',
      timeline: '90 days'
    },
    {
      id: 2,
      title: 'Net Profit Margin Compression',
      description: 'Net profit margin is below target, suggesting operating expenses and/or taxes are consuming too much of gross profit.',
      severity: 'Critical',
      affected_metric: 'Net Profit Margin',
      current_value: kpis.netProfitMargin.value + '%',
      target_value: kpis.netProfitMargin.benchmark + '%',
      estimated_cost: '$850K/year in reduced profitability',
      recommended_actions: [
        'Conduct zero-based budgeting review of all operating expenses',
        'Identify and eliminate non-value-added activities and costs',
        'Implement cost controls and approval workflows for discretionary spending',
        'Evaluate tax optimization strategies with tax advisors'
      ],
      responsible_department: 'CFO / Finance',
      timeline: '120 days'
    },
    {
      id: 3,
      title: 'Operating Cash Flow Coverage Concerns',
      description: 'Operating cash flow ratio indicates potential difficulty covering current liabilities with cash generated from operations.',
      severity: kpis.operatingCashFlowRatio.value < 1.0 ? 'Critical' : 'High',
      affected_metric: 'Operating Cash Flow Ratio',
      current_value: kpis.operatingCashFlowRatio.value.toString(),
      target_value: kpis.operatingCashFlowRatio.benchmark.toString(),
      estimated_cost: '$500K in potential credit facility fees',
      recommended_actions: [
        'Accelerate accounts receivable collections through early payment discounts',
        'Optimize inventory levels to free up working capital',
        'Review and extend accounts payable terms where possible',
        'Consider factoring or AR financing to improve short-term liquidity'
      ],
      responsible_department: 'CFO / Treasury',
      timeline: '60 days'
    },
    {
      id: 4,
      title: 'Liquidity Ratio Below Benchmark',
      description: 'Current ratio indicates insufficient current assets to comfortably cover current liabilities.',
      severity: kpis.currentRatio.value < 1.5 ? 'Critical' : 'High',
      affected_metric: 'Current Ratio',
      current_value: kpis.currentRatio.value.toString(),
      target_value: kpis.currentRatio.benchmark.toString(),
      estimated_cost: '$300K in higher borrowing costs',
      recommended_actions: [
        'Build cash reserves through improved working capital management',
        'Reduce short-term debt obligations through refinancing',
        'Convert excess inventory to cash through sales promotions',
        'Secure a revolving credit facility for liquidity cushion'
      ],
      responsible_department: 'CFO / Treasury',
      timeline: '90 days'
    },
    {
      id: 5,
      title: 'Quick Ratio Indicates Cash Dependency on Inventory',
      description: 'Quick ratio shows the company may struggle to meet short-term obligations without liquidating inventory.',
      severity: kpis.quickRatio.value < 1.0 ? 'Critical' : 'Medium',
      affected_metric: 'Quick Ratio',
      current_value: kpis.quickRatio.value.toString(),
      target_value: kpis.quickRatio.benchmark.toString(),
      estimated_cost: '$200K in potential fire-sale losses',
      recommended_actions: [
        'Increase focus on cash and near-cash equivalents',
        'Implement just-in-time inventory to reduce inventory levels',
        'Accelerate AR collections to build liquid assets',
        'Establish standby credit facilities for emergency liquidity'
      ],
      responsible_department: 'CFO / Operations',
      timeline: '120 days'
    },
    {
      id: 6,
      title: 'Return on Assets Below Industry Average',
      description: 'ROA indicates assets are not being utilized efficiently to generate profits.',
      severity: 'Medium',
      affected_metric: 'Return on Assets (ROA)',
      current_value: kpis.returnOnAssets.value + '%',
      target_value: kpis.returnOnAssets.benchmark + '%',
      estimated_cost: '$600K in unrealized profit potential',
      recommended_actions: [
        'Divest non-productive or underutilized assets',
        'Improve asset utilization rates through better planning',
        'Invest in higher-returning projects and discontinue low-ROI initiatives',
        'Consider sale-leaseback arrangements for fixed assets'
      ],
      responsible_department: 'CFO / Strategy',
      timeline: '180 days'
    },
    {
      id: 7,
      title: 'Return on Equity Below Shareholder Expectations',
      description: 'ROE is below target, indicating insufficient returns being generated for shareholders.',
      severity: kpis.returnOnEquity.value < 10 ? 'Critical' : 'High',
      affected_metric: 'Return on Equity (ROE)',
      current_value: kpis.returnOnEquity.value + '%',
      target_value: kpis.returnOnEquity.benchmark + '%',
      estimated_cost: 'Impact on valuation and investor confidence',
      recommended_actions: [
        'Improve profitability through revenue growth and cost optimization',
        'Optimize capital structure to reduce cost of capital',
        'Focus on high-ROE business segments and product lines',
        'Implement share buyback program if appropriate'
      ],
      responsible_department: 'CEO / CFO',
      timeline: '180 days'
    },
    {
      id: 8,
      title: 'Leverage Ratio Indicates High Financial Risk',
      description: 'Debt-to-equity ratio suggests the company is highly leveraged, increasing financial risk.',
      severity: kpis.debtToEquityRatio.value > 2.0 ? 'Critical' : kpis.debtToEquityRatio.value > 1.5 ? 'High' : 'Medium',
      affected_metric: 'Debt-to-Equity Ratio',
      current_value: kpis.debtToEquityRatio.value.toString(),
      target_value: kpis.debtToEquityRatio.benchmark.toString(),
      estimated_cost: '$400K in excess interest expense',
      recommended_actions: [
        'Develop debt reduction plan through cash flow allocation',
        'Consider equity raise to improve capital structure',
        'Refinance high-interest debt at lower rates',
        'Improve profitability to organically build equity base'
      ],
      responsible_department: 'CFO / Treasury',
      timeline: '240 days'
    },
    {
      id: 9,
      title: 'Working Capital Ratio Below Optimal Level',
      description: 'Working capital as a percentage of total assets is below target, limiting operational flexibility.',
      severity: 'Medium',
      affected_metric: 'Working Capital Ratio',
      current_value: kpis.workingCapitalRatio.value + '%',
      target_value: kpis.workingCapitalRatio.benchmark + '%',
      estimated_cost: '$350K in lost business opportunities',
      recommended_actions: [
        'Improve cash conversion cycle (DSO, DIO, DPO)',
        'Implement working capital optimization program',
        'Negotiate better payment terms with customers and suppliers',
        'Monitor and manage working capital KPIs weekly'
      ],
      responsible_department: 'CFO / Operations',
      timeline: '120 days'
    },
    {
      id: 10,
      title: 'EBITDA Margin Below Industry Benchmark',
      description: 'EBITDA margin indicates operating profitability before non-cash items is below best-in-class performance.',
      severity: 'High',
      affected_metric: 'EBITDA Margin',
      current_value: kpis.ebitdaMargin.value + '%',
      target_value: kpis.ebitdaMargin.benchmark + '%',
      estimated_cost: '$950K/year in operational inefficiency',
      recommended_actions: [
        'Benchmark operating costs against industry leaders',
        'Implement lean management and continuous improvement programs',
        'Automate manual processes to reduce labor costs',
        'Focus on revenue growth in higher-margin segments'
      ],
      responsible_department: 'CFO / Operations',
      timeline: '150 days'
    }
  ];

  res.json({
    success: true,
    period: {
      startDate,
      endDate,
      label: 'Q4 2024'
    },
    pain_points
  });
});

// ========== ADMINISTRATION / IT MODULE API ENDPOINTS ==========

// Get all Administration KPIs for current period
app.get('/api/administration/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = adminKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Administration KPIs for custom period
app.get('/api/administration/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = adminKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Administration KPI endpoints

app.get('/api/administration/kpi/system-uptime', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateSystemUptime(startDate, endDate);
    res.json({ success: true, kpi: 'IT System Uptime', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/helpdesk-response-time', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateHelpdeskResponseTime(startDate, endDate);
    res.json({ success: true, kpi: 'Help Desk Response Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/it-cost-per-employee', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateITCostPerEmployee(startDate, endDate);
    res.json({ success: true, kpi: 'IT Cost per Employee', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/security-incident-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateSecurityIncidentRate(startDate, endDate);
    res.json({ success: true, kpi: 'Security Incident Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/license-utilization', (req: Request, res: Response) => {
  try {
    const result = adminKpiService.calculateLicenseUtilization();
    res.json({ success: true, kpi: 'Software License Utilization', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/backup-success-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateBackupSuccessRate(startDate, endDate);
    res.json({ success: true, kpi: 'Backup Success Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/project-on-time-delivery', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateProjectOnTimeDelivery(startDate, endDate);
    res.json({ success: true, kpi: 'IT Project On-Time Delivery', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/employee-satisfaction', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateEmployeeSatisfaction(startDate, endDate);
    res.json({ success: true, kpi: 'Employee IT Satisfaction', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/ticket-resolution-time', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateTicketResolutionTime(startDate, endDate);
    res.json({ success: true, kpi: 'Ticket Resolution Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/administration/kpi/infrastructure-utilization', (req: Request, res: Response) => {
  try {
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = adminKpiService.calculateInfrastructureUtilization(endDate);
    res.json({ success: true, kpi: 'Infrastructure Capacity Utilization', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Administration Pain Points Endpoint
app.get('/api/administration/pain-points', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';

  const kpis = adminKpiService.getAllKPIs(startDate, endDate);

  const pain_points = [
    {
      id: 1,
      title: 'Critical System Downtime Exceeding Tolerance',
      description: 'IT system uptime is below the 99.5% SLA target, resulting in productivity losses and user frustration.',
      severity: kpis.systemUptime.value < 99.0 ? 'Critical' : 'High',
      affected_metric: 'IT System Uptime',
      current_value: kpis.systemUptime.value.toFixed(2) + '%',
      target_value: kpis.systemUptime.benchmark.toFixed(2) + '%',
      estimated_cost: '$180K/year in lost productivity',
      recommended_actions: [
        'Implement redundant systems and failover mechanisms for critical infrastructure',
        'Establish 24/7 monitoring with automated alerting for system health',
        'Conduct root cause analysis on all downtime incidents and address systemic issues',
        'Invest in infrastructure upgrades to improve reliability and performance'
      ],
      responsible_department: 'CIO / Infrastructure',
      timeline: '90 days'
    },
    {
      id: 2,
      title: 'Help Desk Response Time Below Service Standards',
      description: 'Average help desk first response time exceeds target, leading to employee dissatisfaction and reduced productivity.',
      severity: kpis.helpdeskResponseTime.value > 30 ? 'Critical' : 'High',
      affected_metric: 'Help Desk Response Time',
      current_value: kpis.helpdeskResponseTime.value.toFixed(1) + ' minutes',
      target_value: kpis.helpdeskResponseTime.benchmark.toFixed(1) + ' minutes',
      estimated_cost: '$120K/year in delayed issue resolution',
      recommended_actions: [
        'Increase help desk staffing during peak hours based on ticket volume analysis',
        'Implement AI-powered chatbot for common issues and tier-0 support',
        'Deploy self-service knowledge base to deflect routine tickets',
        'Establish clear SLA tiers and prioritization rules for ticket routing'
      ],
      responsible_department: 'CIO / IT Support',
      timeline: '60 days'
    },
    {
      id: 3,
      title: 'IT Cost per Employee Above Industry Benchmark',
      description: 'IT spending per employee is significantly higher than industry average, indicating potential inefficiencies.',
      severity: kpis.itCostPerEmployee.value > 8000 ? 'High' : 'Medium',
      affected_metric: 'IT Cost per Employee',
      current_value: '$' + kpis.itCostPerEmployee.value.toLocaleString(),
      target_value: '$' + kpis.itCostPerEmployee.benchmark.toLocaleString(),
      estimated_cost: '$450K/year in excess IT spending',
      recommended_actions: [
        'Conduct IT spend analysis to identify cost optimization opportunities',
        'Renegotiate vendor contracts and consolidate software licenses',
        'Migrate on-premise infrastructure to cloud for better cost efficiency',
        'Implement IT financial management (ITFM) tools for better visibility'
      ],
      responsible_department: 'CIO / CFO',
      timeline: '120 days'
    },
    {
      id: 4,
      title: 'Rising Cybersecurity Incident Rate',
      description: 'Security incidents are increasing, exposing the organization to data breach risks and compliance violations.',
      severity: kpis.securityIncidentRate.value > 15 ? 'Critical' : 'High',
      affected_metric: 'Cybersecurity Incident Rate',
      current_value: kpis.securityIncidentRate.value.toFixed(1) + ' incidents/month',
      target_value: kpis.securityIncidentRate.benchmark.toFixed(1) + ' incidents/month',
      estimated_cost: '$500K potential breach cost + reputation damage',
      recommended_actions: [
        'Deploy advanced threat detection and prevention systems (EDR, SIEM)',
        'Conduct mandatory cybersecurity awareness training for all employees',
        'Implement multi-factor authentication (MFA) across all systems',
        'Perform regular vulnerability assessments and penetration testing'
      ],
      responsible_department: 'CIO / CISO',
      timeline: '90 days'
    },
    {
      id: 5,
      title: 'Poor Software License Utilization',
      description: 'Many software licenses are underutilized or unused, representing wasted IT budget.',
      severity: kpis.licenseUtilization.value < 70 ? 'High' : 'Medium',
      affected_metric: 'Software License Utilization',
      current_value: kpis.licenseUtilization.value.toFixed(1) + '%',
      target_value: kpis.licenseUtilization.benchmark.toFixed(1) + '%',
      estimated_cost: '$85K/year in unused license costs',
      recommended_actions: [
        'Implement software asset management (SAM) tool to track usage',
        'Reclaim and reallocate unused licenses or negotiate subscription reductions',
        'Establish license request approval workflow to prevent over-purchasing',
        'Conduct quarterly license utilization reviews with department heads'
      ],
      responsible_department: 'CIO / Procurement',
      timeline: '60 days'
    },
    {
      id: 6,
      title: 'Data Backup Failures Increasing Risk',
      description: 'Backup success rate is below target, putting critical business data at risk of loss.',
      severity: kpis.backupSuccessRate.value < 95 ? 'Critical' : 'High',
      affected_metric: 'Data Backup Success Rate',
      current_value: kpis.backupSuccessRate.value.toFixed(1) + '%',
      target_value: kpis.backupSuccessRate.benchmark.toFixed(1) + '%',
      estimated_cost: 'Catastrophic data loss potential',
      recommended_actions: [
        'Upgrade backup infrastructure and software to current versions',
        'Implement automated backup monitoring with alerts for failed backups',
        'Conduct regular backup restoration tests to verify recoverability',
        'Establish 3-2-1 backup strategy (3 copies, 2 media types, 1 offsite)'
      ],
      responsible_department: 'CIO / Infrastructure',
      timeline: '30 days'
    },
    {
      id: 7,
      title: 'IT Projects Consistently Delivered Late',
      description: 'IT project on-time delivery rate is well below target, causing business disruption and cost overruns.',
      severity: kpis.projectOnTimeDelivery.value < 50 ? 'Critical' : 'High',
      affected_metric: 'IT Project On-Time Delivery',
      current_value: kpis.projectOnTimeDelivery.value.toFixed(1) + '%',
      target_value: kpis.projectOnTimeDelivery.benchmark.toFixed(1) + '%',
      estimated_cost: '$200K/year in project delays and overruns',
      recommended_actions: [
        'Implement Agile/Scrum methodology for better project management',
        'Establish project governance office (PMO) with standardized processes',
        'Improve project scoping and resource allocation accuracy',
        'Conduct post-mortem reviews on delayed projects to identify root causes'
      ],
      responsible_department: 'CIO / PMO',
      timeline: '120 days'
    },
    {
      id: 8,
      title: 'Low Employee IT Satisfaction Scores',
      description: 'Employee satisfaction with IT services is below expectations, affecting morale and productivity.',
      severity: kpis.employeeSatisfaction.value < 3.5 ? 'High' : 'Medium',
      affected_metric: 'Employee IT Satisfaction',
      current_value: kpis.employeeSatisfaction.value.toFixed(1) + '/5.0',
      target_value: kpis.employeeSatisfaction.benchmark.toFixed(1) + '/5.0',
      estimated_cost: '$150K/year in reduced productivity',
      recommended_actions: [
        'Conduct employee focus groups to identify specific IT pain points',
        'Improve IT communication and transparency around outages and changes',
        'Upgrade end-user devices and applications to modern standards',
        'Implement regular IT satisfaction surveys with action plans'
      ],
      responsible_department: 'CIO / IT Support',
      timeline: '90 days'
    },
    {
      id: 9,
      title: 'Excessive Help Desk Ticket Resolution Time',
      description: 'Average ticket resolution time is too high, causing frustration and extended downtime for users.',
      severity: kpis.ticketResolutionTime.value > 24 ? 'High' : 'Medium',
      affected_metric: 'Average Ticket Resolution Time',
      current_value: kpis.ticketResolutionTime.value.toFixed(1) + ' hours',
      target_value: kpis.ticketResolutionTime.benchmark.toFixed(1) + ' hours',
      estimated_cost: '$95K/year in extended downtime',
      recommended_actions: [
        'Analyze ticket patterns to identify recurring issues and fix root causes',
        'Provide advanced training to help desk staff on complex issues',
        'Implement escalation procedures to route difficult tickets faster',
        'Deploy remote support tools to speed up troubleshooting'
      ],
      responsible_department: 'CIO / IT Support',
      timeline: '90 days'
    },
    {
      id: 10,
      title: 'Infrastructure Capacity Approaching Limits',
      description: 'Infrastructure utilization is high and approaching capacity limits, risking performance degradation.',
      severity: kpis.infrastructureUtilization.value > 85 ? 'Critical' : kpis.infrastructureUtilization.value > 75 ? 'High' : 'Medium',
      affected_metric: 'Infrastructure Capacity Utilization',
      current_value: kpis.infrastructureUtilization.value.toFixed(1) + '%',
      target_value: kpis.infrastructureUtilization.benchmark.toFixed(1) + '%',
      estimated_cost: '$250K for emergency capacity expansion',
      recommended_actions: [
        'Conduct infrastructure capacity planning for next 12-24 months',
        'Implement auto-scaling for cloud resources to handle peak loads',
        'Optimize resource usage through virtualization and consolidation',
        'Budget for infrastructure expansion before hitting critical thresholds'
      ],
      responsible_department: 'CIO / Infrastructure',
      timeline: '60 days'
    }
  ];

  res.json({
    success: true,
    period: {
      startDate,
      endDate,
      label: 'Q4 2024'
    },
    pain_points
  });
});

// ========== SALES & REVENUE MODULE API ENDPOINTS ==========

// Get all Sales KPIs for current period
app.get('/api/sales/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    const kpis = salesKpiService.getAllKPIs(startDate, endDate);

    res.json({
      success: true,
      period: { startDate, endDate, label: 'Q4 2024' },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Sales KPIs for custom period
app.get('/api/sales/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate and endDate query parameters are required'
      });
    }

    const kpis = salesKpiService.getAllKPIs(startDate as string, endDate as string);

    res.json({
      success: true,
      period: { startDate, endDate },
      kpis: kpis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Sales KPI endpoints

app.get('/api/sales/kpi/win-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateWinRate(startDate, endDate);
    res.json({ success: true, kpi: 'Win Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/sales-cycle-length', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateAvgSalesCycleLength(startDate, endDate);
    res.json({ success: true, kpi: 'Average Sales Cycle Length', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/pipeline-velocity', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculatePipelineVelocity(startDate, endDate);
    res.json({ success: true, kpi: 'Pipeline Velocity', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/quota-attainment', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateQuotaAttainment(startDate, endDate);
    res.json({ success: true, kpi: 'Quota Attainment', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/avg-deal-size', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateAvgDealSize(startDate, endDate);
    res.json({ success: true, kpi: 'Average Deal Size', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/cac', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateCAC(startDate, endDate);
    res.json({ success: true, kpi: 'Customer Acquisition Cost', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/revenue-per-rep', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateRevenuePerRep(startDate, endDate);
    res.json({ success: true, kpi: 'Revenue per Sales Rep', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/forecast-accuracy', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateForecastAccuracy(startDate, endDate);
    res.json({ success: true, kpi: 'Forecast Accuracy', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/lead-conversion-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateLeadConversionRate(startDate, endDate);
    res.json({ success: true, kpi: 'Lead Conversion Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sales/kpi/mrr-growth', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = salesKpiService.calculateMRRGrowthRate(startDate, endDate);
    res.json({ success: true, kpi: 'MRR Growth Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sales Pain Points Endpoint
app.get('/api/sales/pain-points', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';

  const kpis = salesKpiService.getAllKPIs(startDate, endDate);

  const pain_points = [
    {
      id: 1,
      title: 'Win Rate Below Industry Benchmark',
      description: 'Sales win rate is tracking significantly below the 25% industry benchmark, indicating issues with lead quality, sales process, or competitive positioning.',
      severity: kpis.winRate.value < 20 ? 'Critical' : 'High',
      affected_metric: 'Win Rate',
      current_value: kpis.winRate.value + '%',
      target_value: kpis.winRate.benchmark + '%',
      estimated_cost: '$2.5M/year in lost revenue opportunities',
      recommended_actions: [
        'Implement lead qualification framework (BANT/MEDDIC) to improve pipeline quality',
        'Conduct win/loss analysis to identify competitive gaps and positioning weaknesses',
        'Provide advanced sales training on objection handling and value selling',
        'Review and optimize pricing strategy to improve competitive positioning'
      ],
      responsible_department: 'VP Sales / Sales Enablement',
      timeline: '90 days'
    },
    {
      id: 2,
      title: 'Extended Sales Cycle Slowing Revenue Growth',
      description: 'Average sales cycle length exceeds target, delaying revenue recognition and reducing sales team productivity.',
      severity: kpis.avgSalesCycleLength.value > 60 ? 'Critical' : kpis.avgSalesCycleLength.value > 45 ? 'High' : 'Medium',
      affected_metric: 'Average Sales Cycle Length',
      current_value: kpis.avgSalesCycleLength.value + ' days',
      target_value: kpis.avgSalesCycleLength.benchmark + ' days',
      estimated_cost: '$1.8M/year in delayed revenue and reduced capacity',
      recommended_actions: [
        'Implement sales process automation to eliminate manual bottlenecks',
        'Create standardized proposal templates and ROI calculators for faster deal closure',
        'Establish executive sponsorship program to accelerate enterprise deal approvals',
        'Analyze deal stages to identify and remove unnecessary friction points'
      ],
      responsible_department: 'VP Sales / Sales Operations',
      timeline: '120 days'
    },
    {
      id: 3,
      title: 'Low Pipeline Velocity Constraining Growth',
      description: 'Pipeline velocity ($/day) is below target, indicating insufficient pipeline generation and/or slow deal progression.',
      severity: kpis.pipelineVelocity.value < 30000 ? 'Critical' : 'High',
      affected_metric: 'Pipeline Velocity',
      current_value: '$' + kpis.pipelineVelocity.value.toLocaleString() + '/day',
      target_value: '$' + kpis.pipelineVelocity.benchmark.toLocaleString() + '/day',
      estimated_cost: '$3.2M/year in unrealized revenue potential',
      recommended_actions: [
        'Increase top-of-funnel activity through enhanced marketing and SDR collaboration',
        'Implement pipeline acceleration plays for stalled opportunities',
        'Focus on higher-value deal segments to improve average deal size',
        'Create fast-track sales process for qualified, high-intent prospects'
      ],
      responsible_department: 'CRO / VP Sales / VP Marketing',
      timeline: '90 days'
    },
    {
      id: 4,
      title: 'Team Missing Quota Targets Consistently',
      description: 'Average quota attainment is below 100%, indicating misalignment between targets and market reality or underperformance.',
      severity: kpis.quotaAttainment.value < 80 ? 'Critical' : kpis.quotaAttainment.value < 100 ? 'High' : 'Medium',
      affected_metric: 'Quota Attainment',
      current_value: kpis.quotaAttainment.value + '%',
      target_value: kpis.quotaAttainment.benchmark + '%',
      estimated_cost: '$2.1M/year in missed revenue targets',
      recommended_actions: [
        'Review quota setting methodology to ensure targets are realistic and achievable',
        'Provide targeted coaching and performance improvement plans for underperforming reps',
        'Analyze top performers to identify and replicate best practices across the team',
        'Implement sales contests and incentives to drive Q4 performance surge'
      ],
      responsible_department: 'VP Sales / Sales Management',
      timeline: '60 days'
    },
    {
      id: 5,
      title: 'Average Deal Size Below Target Market Potential',
      description: 'Average deal size is lower than expected, suggesting focus on wrong market segments or insufficient upselling.',
      severity: kpis.avgDealSize.value < 30000 ? 'Critical' : 'High',
      affected_metric: 'Average Deal Size',
      current_value: '$' + kpis.avgDealSize.value.toLocaleString(),
      target_value: '$' + kpis.avgDealSize.benchmark.toLocaleString(),
      estimated_cost: '$1.5M/year in unrealized deal potential',
      recommended_actions: [
        'Shift focus to mid-market and enterprise segments with higher deal values',
        'Create multi-product bundles and solutions packages to increase deal size',
        'Train sales team on value-based selling and business case development',
        'Implement land-and-expand strategy with clear expansion playbooks'
      ],
      responsible_department: 'VP Sales / Product Marketing',
      timeline: '120 days'
    },
    {
      id: 6,
      title: 'Customer Acquisition Cost Exceeding Healthy Ratios',
      description: 'CAC is significantly above target, indicating inefficient go-to-market spend or low conversion rates.',
      severity: kpis.customerAcquisitionCost.value > 20000 ? 'Critical' : 'High',
      affected_metric: 'Customer Acquisition Cost (CAC)',
      current_value: '$' + kpis.customerAcquisitionCost.value.toLocaleString(),
      target_value: '$' + kpis.customerAcquisitionCost.benchmark.toLocaleString(),
      estimated_cost: '$900K/year in excess acquisition costs',
      recommended_actions: [
        'Optimize marketing spend allocation toward highest-converting channels',
        'Improve lead quality through better targeting and qualification criteria',
        'Implement product-led growth motions to reduce sales-assisted acquisition costs',
        'Increase reliance on referrals and partner channels with lower CAC'
      ],
      responsible_department: 'CRO / VP Sales / VP Marketing',
      timeline: '90 days'
    },
    {
      id: 7,
      title: 'Revenue per Rep Below Productivity Targets',
      description: 'Revenue per sales rep is below benchmark, indicating underperformance or inadequate support/enablement.',
      severity: kpis.revenuePerRep.value < 350000 ? 'Critical' : 'High',
      affected_metric: 'Revenue per Sales Rep',
      current_value: '$' + kpis.revenuePerRep.value.toLocaleString(),
      target_value: '$' + kpis.revenuePerRep.benchmark.toLocaleString(),
      estimated_cost: '$1.2M/year in lost productivity',
      recommended_actions: [
        'Implement sales enablement platform with playbooks, content, and training resources',
        'Hire SDR team to handle prospecting and qualification, freeing AEs for closing',
        'Provide better sales tools (CRM, sales intelligence, proposal automation)',
        'Conduct quarterly business reviews with each rep to remove blockers and optimize territory'
      ],
      responsible_department: 'VP Sales / Sales Enablement',
      timeline: '120 days'
    },
    {
      id: 8,
      title: 'Poor Forecast Accuracy Creating Planning Challenges',
      description: 'Forecast accuracy variance is too high, making it difficult to plan resources and set realistic expectations.',
      severity: kpis.forecastAccuracy.value < 80 || kpis.forecastAccuracy.value > 120 ? 'Critical' : 'High',
      affected_metric: 'Forecast Accuracy',
      current_value: kpis.forecastAccuracy.value + '%',
      target_value: kpis.forecastAccuracy.benchmark + '%',
      estimated_cost: 'Resource planning challenges and credibility loss',
      recommended_actions: [
        'Implement structured forecast methodology with clear stage definitions and exit criteria',
        'Require forecast commits to be based on multi-threaded customer validation',
        'Conduct weekly forecast reviews with deal inspection and accountability',
        'Use CRM data quality rules to ensure forecast submissions are based on complete information'
      ],
      responsible_department: 'VP Sales / Sales Operations',
      timeline: '60 days'
    },
    {
      id: 9,
      title: 'Lead Conversion Rate Indicates Qualification Problems',
      description: 'Lead-to-opportunity conversion rate is below target, suggesting poor lead quality or inadequate follow-up.',
      severity: kpis.leadConversionRate.value < 10 ? 'Critical' : 'High',
      affected_metric: 'Lead Conversion Rate',
      current_value: kpis.leadConversionRate.value + '%',
      target_value: kpis.leadConversionRate.benchmark + '%',
      estimated_cost: '$750K/year in wasted lead acquisition spend',
      recommended_actions: [
        'Implement lead scoring model to prioritize highest-quality leads',
        'Establish SLA between marketing and sales for lead follow-up speed',
        'Provide SDR team with better qualification scripts and discovery questions',
        'Create feedback loop from sales to marketing on lead quality by source/campaign'
      ],
      responsible_department: 'VP Sales / VP Marketing',
      timeline: '90 days'
    },
    {
      id: 10,
      title: 'MRR Growth Rate Below SaaS Benchmarks',
      description: 'Monthly Recurring Revenue growth is below target for a high-growth SaaS business, risking investor confidence.',
      severity: kpis.mrrGrowthRate.value < 5 ? 'Critical' : 'High',
      affected_metric: 'MRR Growth Rate',
      current_value: kpis.mrrGrowthRate.value + '%',
      target_value: kpis.mrrGrowthRate.benchmark + '%',
      estimated_cost: 'Valuation impact and missed growth targets',
      recommended_actions: [
        'Focus on expansion revenue from existing customers (upsell/cross-sell)',
        'Launch product-led growth initiatives to accelerate new customer acquisition',
        'Implement customer success programs to reduce churn and increase net retention',
        'Develop strategic partnerships to access new customer segments and geographies'
      ],
      responsible_department: 'CRO / VP Sales / VP Customer Success',
      timeline: '180 days'
    }
  ];

  res.json({
    success: true,
    period: {
      startDate,
      endDate,
      label: 'Q4 2024'
    },
    pain_points
  });
});

// ========== CUSTOMER SUCCESS & EXPERIENCE MODULE API ENDPOINTS ==========

// Get all Customer Success KPIs for current period
app.get('/api/customer-success/kpis/current', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';
    const kpis = csKpiService.getAllKPIs(startDate, endDate);
    res.json({ success: true, period: { startDate, endDate, label: 'Q4 2024' }, kpis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all Customer Success KPIs for custom period
app.get('/api/customer-success/kpis/period', (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'startDate and endDate required' });
    }
    const kpis = csKpiService.getAllKPIs(startDate as string, endDate as string);
    res.json({ success: true, period: { startDate, endDate }, kpis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual Customer Success KPI endpoints
app.get('/api/customer-success/kpi/nps', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateNPS(startDate, endDate);
    res.json({ success: true, kpi: 'Net Promoter Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/csat', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateCSAT(startDate, endDate);
    res.json({ success: true, kpi: 'CSAT', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/ces', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateCES(startDate, endDate);
    res.json({ success: true, kpi: 'CES', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/churn-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateChurnRate(startDate, endDate);
    res.json({ success: true, kpi: 'Churn Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/ltv', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateCustomerLTV(startDate, endDate);
    res.json({ success: true, kpi: 'Customer LTV', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/nrr', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateNetRevenueRetention(startDate, endDate);
    res.json({ success: true, kpi: 'Net Revenue Retention', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/health-score', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateAvgHealthScore(startDate, endDate);
    res.json({ success: true, kpi: 'Health Score', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/time-to-value', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateTimeToFirstValue(startDate, endDate);
    res.json({ success: true, kpi: 'Time to First Value', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/adoption-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateProductAdoptionRate(startDate, endDate);
    res.json({ success: true, kpi: 'Product Adoption Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/customer-success/kpi/ticket-resolution', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';
    const result = csKpiService.calculateAvgTicketResolution(startDate, endDate);
    res.json({ success: true, kpi: 'Ticket Resolution Time', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Customer Success Pain Points Endpoint
app.get('/api/customer-success/pain-points', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';
  const kpis = csKpiService.getAllKPIs(startDate, endDate);

  const pain_points = [
    {
      id: 1,
      title: 'NPS Score Below Industry Benchmark',
      description: 'Net Promoter Score indicates customer loyalty and advocacy are below target, risking organic growth through referrals.',
      severity: kpis.nps.value < 30 ? 'Critical' : 'High',
      affected_metric: 'Net Promoter Score (NPS)',
      current_value: kpis.nps.value.toString(),
      target_value: kpis.nps.benchmark.toString(),
      estimated_cost: '$1.5M/year in lost referral revenue',
      recommended_actions: [
        'Conduct detractor outreach program to understand and address pain points',
        'Implement closed-loop feedback system to act on survey results',
        'Create promoter advocacy program (case studies, referrals, reviews)',
        'Address top 3 themes from NPS feedback with product/service improvements'
      ],
      responsible_department: 'VP Customer Success / Product',
      timeline: '90 days'
    },
    {
      id: 2,
      title: 'Customer Satisfaction Below Expectations',
      description: 'CSAT scores indicate customers are not fully satisfied with product experience or support quality.',
      severity: kpis.csat.value < 3.5 ? 'Critical' : 'High',
      affected_metric: 'Customer Satisfaction (CSAT)',
      current_value: kpis.csat.value.toFixed(1) + '/5.0',
      target_value: kpis.csat.benchmark.toFixed(1) + '/5.0',
      estimated_cost: '$800K/year in at-risk renewals',
      recommended_actions: [
        'Analyze low-CSAT interactions to identify service gaps',
        'Improve support team training on product knowledge and soft skills',
        'Implement proactive customer check-ins before renewal periods',
        'Create customer education program (webinars, documentation, certification)'
      ],
      responsible_department: 'VP Customer Success / Support',
      timeline: '60 days'
    },
    {
      id: 3,
      title: 'High Customer Effort Scores Indicating Friction',
      description: 'CES data shows customers find it difficult to get value from product, leading to poor adoption and churn risk.',
      severity: kpis.ces.value < 5.0 ? 'Critical' : 'High',
      affected_metric: 'Customer Effort Score (CES)',
      current_value: kpis.ces.value.toFixed(1) + '/7.0',
      target_value: kpis.ces.benchmark.toFixed(1) + '/7.0',
      estimated_cost: '$650K/year in churn from poor UX',
      recommended_actions: [
        'Conduct UX research to identify friction points in customer journey',
        'Simplify onboarding and product setup processes',
        'Improve in-app guidance and contextual help',
        'Create self-service knowledge base and video tutorials'
      ],
      responsible_department: 'Product / Customer Success',
      timeline: '120 days'
    },
    {
      id: 4,
      title: 'Churn Rate Exceeding Healthy SaaS Benchmarks',
      description: 'Customer churn rate is above acceptable levels, directly impacting revenue growth and company valuation.',
      severity: kpis.churnRate.value > 8 ? 'Critical' : 'High',
      affected_metric: 'Churn Rate',
      current_value: kpis.churnRate.value.toFixed(1) + '%',
      target_value: kpis.churnRate.benchmark.toFixed(1) + '%',
      estimated_cost: '$2.3M/year in lost ARR',
      recommended_actions: [
        'Implement early warning system for at-risk customers (health score monitoring)',
        'Create win-back program for churned customers with exit interview insights',
        'Establish executive business reviews (EBRs) for strategic accounts',
        'Develop customer success playbooks for common churn scenarios'
      ],
      responsible_department: 'VP Customer Success / CRO',
      timeline: '90 days'
    },
    {
      id: 5,
      title: 'Customer Lifetime Value Below Target',
      description: 'LTV is lower than expected due to high churn and/or insufficient expansion revenue, limiting growth efficiency.',
      severity: kpis.customerLTV.value < 70000 ? 'Critical' : 'High',
      affected_metric: 'Customer Lifetime Value (LTV)',
      current_value: '$' + kpis.customerLTV.value.toLocaleString(),
      target_value: '$' + kpis.customerLTV.benchmark.toLocaleString(),
      estimated_cost: 'CAC payback period too long, unprofitable unit economics',
      recommended_actions: [
        'Reduce churn through improved customer success engagement',
        'Increase expansion revenue through upsell/cross-sell programs',
        'Improve product stickiness with advanced features and integrations',
        'Optimize pricing to capture more value from high-usage customers'
      ],
      responsible_department: 'CRO / VP Customer Success',
      timeline: '180 days'
    },
    {
      id: 6,
      title: 'Net Revenue Retention Below Growth Standards',
      description: 'NRR below 110% indicates expansion revenue is not offsetting churn, limiting growth potential.',
      severity: kpis.netRevenueRetention.value < 100 ? 'Critical' : 'High',
      affected_metric: 'Net Revenue Retention (NRR)',
      current_value: kpis.netRevenueRetention.value.toFixed(1) + '%',
      target_value: kpis.netRevenueRetention.benchmark.toFixed(1) + '%',
      estimated_cost: '$1.8M/year in unrealized expansion revenue',
      recommended_actions: [
        'Launch systematic expansion motion (identify, qualify, close upsells)',
        'Create usage-based pricing tiers to capture growth organically',
        'Develop customer success-to-sales handoff process for expansion deals',
        'Build customer segmentation model to prioritize expansion opportunities'
      ],
      responsible_department: 'CRO / VP Customer Success / VP Sales',
      timeline: '120 days'
    },
    {
      id: 7,
      title: 'Low Customer Health Scores Indicating Risk',
      description: 'Average health score suggests many customers are at risk of churn or not achieving desired outcomes.',
      severity: kpis.avgHealthScore.value < 60 ? 'Critical' : 'High',
      affected_metric: 'Average Customer Health Score',
      current_value: kpis.avgHealthScore.value.toFixed(1) + '/100',
      target_value: kpis.avgHealthScore.benchmark.toFixed(1) + '/100',
      estimated_cost: '$1.2M/year in preventable churn',
      recommended_actions: [
        'Refine health scoring model to include usage, engagement, support, and sentiment',
        'Implement automated playbooks triggered by health score changes',
        'Assign dedicated CSMs to red/yellow health score accounts',
        'Create quarterly business review (QBR) cadence for all customers'
      ],
      responsible_department: 'VP Customer Success',
      timeline: '60 days'
    },
    {
      id: 8,
      title: 'Extended Time to First Value Delaying Adoption',
      description: 'New customers are taking too long to achieve first value, increasing early-stage churn risk.',
      severity: kpis.timeToFirstValue.value > 21 ? 'Critical' : 'High',
      affected_metric: 'Time to First Value',
      current_value: kpis.timeToFirstValue.value.toFixed(1) + ' days',
      target_value: kpis.timeToFirstValue.benchmark.toFixed(1) + ' days',
      estimated_cost: '$450K/year in early churn',
      recommended_actions: [
        'Redesign onboarding program with clear milestones and success criteria',
        'Create fast-start templates and pre-built configurations',
        'Implement white-glove onboarding for high-value customers',
        'Measure and optimize each onboarding stage for bottlenecks'
      ],
      responsible_department: 'VP Customer Success / Product',
      timeline: '90 days'
    },
    {
      id: 9,
      title: 'Poor Product Adoption Limiting Value Realization',
      description: 'Customers are not adopting key features, reducing perceived value and increasing churn risk.',
      severity: kpis.productAdoptionRate.value < 50 ? 'Critical' : 'High',
      affected_metric: 'Product Adoption Rate',
      current_value: kpis.productAdoptionRate.value.toFixed(1) + '%',
      target_value: kpis.productAdoptionRate.benchmark.toFixed(1) + '%',
      estimated_cost: '$950K/year in churn from low value perception',
      recommended_actions: [
        'Create feature adoption campaigns with use case demonstrations',
        'Implement in-app messaging to promote underutilized features',
        'Develop role-based onboarding journeys highlighting relevant features',
        'Track feature adoption by customer segment and create targeted enablement'
      ],
      responsible_department: 'Product / Customer Success',
      timeline: '120 days'
    },
    {
      id: 10,
      title: 'Slow Support Ticket Resolution Damaging Experience',
      description: 'Support resolution times exceed customer expectations, leading to dissatisfaction and churn risk.',
      severity: kpis.avgTicketResolution.value > 48 ? 'Critical' : 'High',
      affected_metric: 'Avg Support Ticket Resolution Time',
      current_value: kpis.avgTicketResolution.value.toFixed(1) + ' hours',
      target_value: kpis.avgTicketResolution.benchmark.toFixed(1) + ' hours',
      estimated_cost: '$550K/year in support-driven churn',
      recommended_actions: [
        'Analyze ticket patterns to identify and fix root cause issues in product',
        'Implement tiered support SLAs based on customer segment and severity',
        'Expand self-service options (knowledge base, community, AI chatbot)',
        'Provide advanced technical training to support team'
      ],
      responsible_department: 'VP Customer Support / Product',
      timeline: '60 days'
    }
  ];

  // Transform to frontend format
  const painPoints = pain_points.map(pp => ({
    id: pp.id.toString(),
    title: pp.title,
    severity: pp.severity.toLowerCase() as 'high' | 'medium' | 'low',
    category: pp.affected_metric,
    description: pp.description,
    impact: `Current: ${pp.current_value} | Target: ${pp.target_value}. ${pp.description}`,
    recommendation: pp.recommended_actions.join('. ') + '.',
    estimatedCost: pp.estimated_cost
  }));

  res.json({
    success: true,
    count: painPoints.length,
    painPoints
  });
});

// ========== Marketing Analytics API Endpoints ==========

// Get current Marketing KPIs (Q4 2024)
app.get('/api/marketing/kpis/current', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';

  const kpis = marketingKpiService.getAllKPIs(startDate, endDate);

  res.json({
    success: true,
    period: { startDate, endDate, label: 'Q4 2024' },
    kpis
  });
});

// Get Marketing KPIs for custom period
app.get('/api/marketing/kpis', (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: 'startDate and endDate query parameters are required'
    });
  }

  const kpis = marketingKpiService.getAllKPIs(startDate as string, endDate as string);

  res.json({
    success: true,
    period: { startDate, endDate },
    kpis
  });
});

// Individual Marketing KPI endpoints
app.get('/api/marketing/kpi/marketing-roi', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateMarketingROI(startDate, endDate);
    res.json({ success: true, kpi: 'Marketing ROI', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/cost-per-lead', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateCostPerLead(startDate, endDate);
    res.json({ success: true, kpi: 'Cost Per Lead', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/mql-to-sql-conversion', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateMQLToSQLConversion(startDate, endDate);
    res.json({ success: true, kpi: 'MQL to SQL Conversion', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/cac', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateCAC(startDate, endDate);
    res.json({ success: true, kpi: 'Customer Acquisition Cost', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/mqls-generated', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateMQLsGenerated(startDate, endDate);
    res.json({ success: true, kpi: 'MQLs Generated', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/campaign-effectiveness', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateCampaignEffectiveness(startDate, endDate);
    res.json({ success: true, kpi: 'Campaign Effectiveness', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/lead-to-customer-rate', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateLeadToCustomerRate(startDate, endDate);
    res.json({ success: true, kpi: 'Lead to Customer Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/avg-deal-size', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateAvgDealSize(startDate, endDate);
    res.json({ success: true, kpi: 'Average Deal Size', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/channel-roi', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateChannelROI(startDate, endDate);
    res.json({ success: true, kpi: 'Best Channel ROI', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/marketing/kpi/content-engagement', (req: Request, res: Response) => {
  try {
    const startDate = req.query.startDate as string || '2024-10-01';
    const endDate = req.query.endDate as string || '2024-12-31';

    const result = marketingKpiService.calculateContentEngagement(startDate, endDate);
    res.json({ success: true, kpi: 'Content Engagement Rate', ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marketing Pain Points Endpoint
app.get('/api/marketing/pain-points', (req: Request, res: Response) => {
  const startDate = '2024-10-01';
  const endDate = '2024-12-31';
  const kpis = marketingKpiService.getAllKPIs(startDate, endDate);

  const pain_points = [
    {
      id: 1,
      title: 'Marketing ROI Below Target',
      description: 'Marketing return on investment is lower than industry benchmarks, indicating inefficient marketing spend or attribution gaps.',
      severity: kpis.marketingROI.value < 300 ? 'high' : kpis.marketingROI.value < 500 ? 'medium' : 'low',
      category: 'Marketing ROI (ROMI)',
      impact: `Current ROI is ${kpis.marketingROI.value.toFixed(1)}% vs target of ${kpis.marketingROI.benchmark}%. This suggests either overspending on marketing activities or underattribution of revenue to marketing efforts.`,
      recommendation: 'Implement multi-touch attribution modeling to better track revenue impact. Analyze underperforming campaigns and reallocate budget to high-ROI channels. Review marketing-to-sales handoff process.',
      estimatedCost: '$500K/year in inefficient marketing spend'
    },
    {
      id: 2,
      title: 'Cost Per Lead Exceeds Budget',
      description: 'The cost to generate each marketing lead is higher than planned, reducing marketing efficiency and profitability.',
      severity: kpis.costPerLead.value > 300 ? 'high' : kpis.costPerLead.value > 200 ? 'medium' : 'low',
      category: 'Cost Per Lead (CPL)',
      impact: `Current CPL is $${kpis.costPerLead.value.toFixed(2)} vs target of $${kpis.costPerLead.benchmark}. High CPL erodes profit margins and limits scalability.`,
      recommendation: 'Optimize ad targeting and messaging. Focus on organic channels (SEO, content). Implement lead quality scoring to reduce low-value leads. Test new channels with lower CPL.',
      estimatedCost: '$300K/year in excess acquisition costs'
    },
    {
      id: 3,
      title: 'Low MQL to SQL Conversion Rate',
      description: 'Too few Marketing Qualified Leads are converting to Sales Qualified Leads, indicating misalignment between marketing and sales criteria.',
      severity: kpis.mqlToSqlConversion.value < 25 ? 'high' : kpis.mqlToSqlConversion.value < 40 ? 'medium' : 'low',
      category: 'MQL to SQL Conversion Rate',
      impact: `Only ${kpis.mqlToSqlConversion.value.toFixed(1)}% of MQLs become SQLs (target: ${kpis.mqlToSqlConversion.benchmark}%). This wastes sales time and marketing budget on unqualified leads.`,
      recommendation: 'Align marketing and sales on lead qualification criteria. Implement lead scoring refinements. Enhance lead nurture programs before hand-off to sales. Provide sales with better lead intelligence.',
      estimatedCost: '$400K/year in wasted sales time on poor-fit leads'
    },
    {
      id: 4,
      title: 'High Customer Acquisition Cost (CAC)',
      description: 'Combined marketing and sales costs to acquire new customers exceed target, threatening unit economics.',
      severity: kpis.customerAcquisitionCost.value > 20000 ? 'high' : kpis.customerAcquisitionCost.value > 15000 ? 'medium' : 'low',
      category: 'Customer Acquisition Cost (CAC)',
      impact: `CAC is $${kpis.customerAcquisitionCost.value.toLocaleString()} vs target of $${kpis.customerAcquisitionCost.benchmark.toLocaleString()}. High CAC reduces profitability and limits growth potential.`,
      recommendation: 'Reduce marketing spend waste through better targeting. Shorten sales cycles with better-qualified leads. Improve conversion rates at each funnel stage. Leverage lower-cost channels.',
      estimatedCost: '$600K/year in excess acquisition costs'
    },
    {
      id: 5,
      title: 'Insufficient MQL Generation',
      description: 'Marketing is not generating enough qualified leads to meet pipeline and revenue targets.',
      severity: kpis.mqlsGenerated.value < 50 ? 'high' : kpis.mqlsGenerated.value < 100 ? 'medium' : 'low',
      category: 'Marketing Qualified Leads (MQLs)',
      impact: `Generated only ${kpis.mqlsGenerated.value} MQLs vs target of ${kpis.mqlsGenerated.benchmark}. Insufficient lead volume threatens revenue goals.`,
      recommendation: 'Increase marketing budget allocation to proven lead-gen channels. Launch new demand generation campaigns. Improve website conversion rates. Expand content marketing efforts.',
      estimatedCost: '$800K/year in missed revenue opportunity'
    },
    {
      id: 6,
      title: 'Poor Campaign Performance',
      description: 'Too many marketing campaigns are failing to meet their goals, indicating poor planning or execution.',
      severity: kpis.campaignEffectiveness.value < 50 ? 'high' : kpis.campaignEffectiveness.value < 70 ? 'medium' : 'low',
      category: 'Campaign Effectiveness Rate',
      impact: `Only ${kpis.campaignEffectiveness.value.toFixed(1)}% of campaigns meet goals (target: ${kpis.campaignEffectiveness.benchmark}%). This wastes budget and team resources.`,
      recommendation: 'Improve campaign planning with better audience research. Test messaging before full launch. Kill underperforming campaigns quickly. Replicate successful campaign elements.',
      estimatedCost: '$350K/year in failed campaign spend'
    },
    {
      id: 7,
      title: 'Low Lead-to-Customer Conversion',
      description: 'The percentage of leads that ultimately become customers is below target, indicating funnel leakage.',
      severity: kpis.leadToCustomerRate.value < 5 ? 'high' : kpis.leadToCustomerRate.value < 10 ? 'medium' : 'low',
      category: 'Lead-to-Customer Conversion Rate',
      impact: `Only ${kpis.leadToCustomerRate.value.toFixed(1)}% of leads convert to customers (target: ${kpis.leadToCustomerRate.benchmark}%). Significant value loss in funnel.`,
      recommendation: 'Map customer journey to identify drop-off points. Improve lead nurturing with targeted content. Enhance sales enablement. Better qualify leads before SDR handoff.',
      estimatedCost: '$700K/year in lost revenue from funnel leakage'
    },
    {
      id: 8,
      title: 'Small Average Deal Size',
      description: 'Marketing-sourced deals are smaller than target, reducing revenue efficiency and LTV:CAC ratio.',
      severity: kpis.avgDealSize.value < 30000 ? 'high' : kpis.avgDealSize.value < 50000 ? 'medium' : 'low',
      category: 'Avg Deal Size (Marketing-Sourced)',
      impact: `Average deal size is $${kpis.avgDealSize.value.toLocaleString()} vs target of $${kpis.avgDealSize.benchmark.toLocaleString()}. Lower deal sizes reduce revenue per customer.`,
      recommendation: 'Target larger enterprise accounts with ABM strategies. Promote higher-tier products/packages. Improve sales training on value selling. Create enterprise-focused content.',
      estimatedCost: '$450K/year in unrealized revenue potential'
    },
    {
      id: 9,
      title: 'Underperforming Marketing Channels',
      description: 'The best marketing channel ROI is below expectations, suggesting optimization opportunities across all channels.',
      severity: kpis.channelROI.value < 200 ? 'high' : kpis.channelROI.value < 400 ? 'medium' : 'low',
      category: 'Best Channel ROI',
      impact: `Best channel ROI is ${kpis.channelROI.value.toFixed(1)}% (target: ${kpis.channelROI.benchmark}%). Even top channels need optimization.`,
      recommendation: 'Conduct channel performance audit. Shift budget from low-ROI to high-ROI channels. Test new channels with growth potential. Optimize landing pages and conversion funnels.',
      estimatedCost: '$550K/year in suboptimal channel performance'
    },
    {
      id: 10,
      title: 'Low Content Engagement',
      description: 'Content marketing efforts are not generating sufficient engagement, limiting lead generation and brand building.',
      severity: kpis.contentEngagement.value < 10 ? 'high' : kpis.contentEngagement.value < 15 ? 'medium' : 'low',
      category: 'Content Engagement Rate',
      impact: `Content engagement is only ${kpis.contentEngagement.value.toFixed(1)}% (target: ${kpis.contentEngagement.benchmark}%). Low engagement reduces content marketing ROI.`,
      recommendation: 'Improve content quality and relevance through audience research. Optimize headlines and formats. Promote content more effectively. Create more interactive content (videos, tools).',
      estimatedCost: '$250K/year in underperforming content investment'
    }
  ];

  const painPoints = pain_points.map(pp => ({
    id: pp.id.toString(),
    title: pp.title,
    severity: pp.severity as 'high' | 'medium' | 'low',
    category: pp.category,
    description: pp.description,
    impact: pp.impact,
    recommendation: pp.recommendation,
    estimatedCost: pp.estimatedCost
  }));

  res.json({
    success: true,
    count: painPoints.length,
    painPoints
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

// ========== EXECUTIVE DASHBOARD API ENDPOINT ==========

// Get Executive Dashboard - Aggregates key metrics from all departments
app.get('/api/executive/dashboard', (req: Request, res: Response) => {
  try {
    const startDate = '2024-10-01';
    const endDate = '2024-12-31';

    // Get KPIs from all modules
    const hrKpis = kpiService.getAllKPIs(startDate, endDate);
    const hseKpis = hseKpiService.getAllHSEKPIs(startDate, endDate);
    const opsKpis = opsKpiService.getAllKPIs(startDate, endDate);
    const qcKpis = qcKpiService.getAllKPIs(startDate, endDate);
    const scKpis = scKpiService.getAllKPIs(startDate, endDate);
    const financeKpis = financeKpiService.getAllKPIs(startDate, endDate);
    const adminKpis = adminKpiService.getAllKPIs(startDate, endDate);
    const salesKpis = salesKpiService.getAllKPIs(startDate, endDate);
    const csKpis = csKpiService.getAllKPIs(startDate, endDate);
    const marketingKpis = marketingKpiService.getAllKPIs(startDate, endDate);

    // Calculate department health scores
    const getHealthScore = (kpis: any): number => {
      const kpiArray = Object.values(kpis) as any[];
      const scores = kpiArray.map((kpi: any) => {
        if (kpi.status === 'Excellent') return 100;
        if (kpi.status === 'Good') return 75;
        if (kpi.status === 'Warning') return 50;
        if (kpi.status === 'Critical') return 25;
        return 50;
      });
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    };

    // Department summaries with key metrics
    const departments = [
      {
        id: 'hr',
        name: 'HR Analytics',
        icon: '👥',
        theme: 'cyan',
        healthScore: getHealthScore(hrKpis),
        keyMetrics: [
          { name: 'Turnover Rate', value: hrKpis.turnoverRate.value + '%', status: hrKpis.turnoverRate.status },
          { name: 'Engagement Score', value: hrKpis.engagement.value + '/100', status: hrKpis.engagement.status },
          { name: 'Time to Hire', value: hrKpis.timeToHire.value + ' days', status: hrKpis.timeToHire.status }
        ],
        url: '/'
      },
      {
        id: 'hse',
        name: 'HSE Analytics',
        icon: '🦺',
        theme: 'orange',
        healthScore: getHealthScore(hseKpis),
        keyMetrics: [
          { name: 'TRIR', value: hseKpis['TRIR'].value.toFixed(2), status: hseKpis['TRIR'].status },
          { name: 'Training Rate', value: hseKpis['Safety Training Rate'].value + '%', status: hseKpis['Safety Training Rate'].status },
          { name: 'PPE Compliance', value: hseKpis['PPE Compliance'].value + '%', status: hseKpis['PPE Compliance'].status }
        ],
        url: '/hse'
      },
      {
        id: 'operations',
        name: 'Operations',
        icon: '⚙️',
        theme: 'blue',
        healthScore: getHealthScore(opsKpis),
        keyMetrics: [
          { name: 'OEE', value: opsKpis.oee.value + '%', status: opsKpis.oee.status },
          { name: 'Schedule Adherence', value: opsKpis.scheduleAdherence.value + '%', status: opsKpis.scheduleAdherence.status },
          { name: 'Capacity Utilization', value: opsKpis.capacityUtilization.value + '%', status: opsKpis.capacityUtilization.status }
        ],
        url: '/ops'
      },
      {
        id: 'quality',
        name: 'Quality Control',
        icon: '✅',
        theme: 'purple',
        healthScore: getHealthScore(qcKpis),
        keyMetrics: [
          { name: 'Defect Rate (PPM)', value: qcKpis.defectRatePPM.value.toString(), status: qcKpis.defectRatePPM.status },
          { name: 'First Pass Yield', value: qcKpis.firstPassYield.value + '%', status: qcKpis.firstPassYield.status },
          { name: 'Customer Returns', value: qcKpis.customerReturnRate.value + '%', status: qcKpis.customerReturnRate.status }
        ],
        url: '/qc'
      },
      {
        id: 'supplychain',
        name: 'Supply Chain',
        icon: '🚚',
        theme: 'teal',
        healthScore: getHealthScore(scKpis),
        keyMetrics: [
          { name: 'OTIF', value: scKpis.otif.value + '%', status: scKpis.otif.status },
          { name: 'Inventory Turnover', value: scKpis.inventoryTurnover.value.toFixed(1) + 'x', status: scKpis.inventoryTurnover.status },
          { name: 'Order Accuracy', value: scKpis.orderAccuracy.value + '%', status: scKpis.orderAccuracy.status }
        ],
        url: '/supplychain'
      },
      {
        id: 'finance',
        name: 'Finance',
        icon: '💰',
        theme: 'green',
        healthScore: getHealthScore(financeKpis),
        keyMetrics: [
          { name: 'Gross Profit Margin', value: financeKpis.grossProfitMargin.value + '%', status: financeKpis.grossProfitMargin.status },
          { name: 'EBITDA Margin', value: financeKpis.ebitdaMargin.value + '%', status: financeKpis.ebitdaMargin.status },
          { name: 'Operating Cash Flow Ratio', value: financeKpis.operatingCashFlowRatio.value.toFixed(2), status: financeKpis.operatingCashFlowRatio.status }
        ],
        url: '/finance'
      },
      {
        id: 'it',
        name: 'IT & Admin',
        icon: '💻',
        theme: 'blue',
        healthScore: getHealthScore(adminKpis),
        keyMetrics: [
          { name: 'System Uptime', value: adminKpis.systemUptime.value + '%', status: adminKpis.systemUptime.status },
          { name: 'Ticket Resolution Time', value: adminKpis.ticketResolutionTime.value.toFixed(1) + 'hrs', status: adminKpis.ticketResolutionTime.status },
          { name: 'Security Incident Rate', value: adminKpis.securityIncidentRate.value.toFixed(2) + '%', status: adminKpis.securityIncidentRate.status }
        ],
        url: '/administration'
      },
      {
        id: 'sales',
        name: 'Sales & Revenue',
        icon: '💼',
        theme: 'amber',
        healthScore: getHealthScore(salesKpis),
        keyMetrics: [
          { name: 'MRR Growth Rate', value: salesKpis.mrrGrowthRate.value + '%', status: salesKpis.mrrGrowthRate.status },
          { name: 'Win Rate', value: salesKpis.winRate.value + '%', status: salesKpis.winRate.status },
          { name: 'Revenue Per Rep', value: '$' + (salesKpis.revenuePerRep.value / 1000).toFixed(0) + 'K', status: salesKpis.revenuePerRep.status }
        ],
        url: '/sales'
      },
      {
        id: 'customersuccess',
        name: 'Customer Success',
        icon: '❤️',
        theme: 'teal',
        healthScore: getHealthScore(csKpis),
        keyMetrics: [
          { name: 'NPS', value: csKpis.nps.value.toFixed(1), status: csKpis.nps.status },
          { name: 'Churn Rate', value: csKpis.churnRate.value + '%', status: csKpis.churnRate.status },
          { name: 'NRR', value: csKpis.netRevenueRetention.value.toFixed(1) + '%', status: csKpis.netRevenueRetention.status }
        ],
        url: '/customer-success'
      },
      {
        id: 'marketing',
        name: 'Marketing',
        icon: '📢',
        theme: 'orange',
        healthScore: getHealthScore(marketingKpis),
        keyMetrics: [
          { name: 'Marketing ROI', value: marketingKpis.marketingROI.value.toFixed(0) + '%', status: marketingKpis.marketingROI.status },
          { name: 'Cost Per Lead', value: '$' + marketingKpis.costPerLead.value.toFixed(0), status: marketingKpis.costPerLead.status },
          { name: 'MQL→SQL', value: marketingKpis.mqlToSqlConversion.value.toFixed(1) + '%', status: marketingKpis.mqlToSqlConversion.status }
        ],
        url: '/marketing'
      }
    ];

    // Calculate overall company health
    const overallHealth = Math.round(
      departments.reduce((sum, dept) => sum + dept.healthScore, 0) / departments.length
    );

    // Count critical metrics across all departments
    const criticalCount = departments.reduce((count, dept) => {
      return count + dept.keyMetrics.filter(m => m.status === 'Critical').length;
    }, 0);

    const warningCount = departments.reduce((count, dept) => {
      return count + dept.keyMetrics.filter(m => m.status === 'Warning').length;
    }, 0);

    // Executive summary metrics
    const executiveSummary = {
      overallHealth,
      overallHealthStatus: overallHealth >= 80 ? 'Excellent' : overallHealth >= 65 ? 'Good' : overallHealth >= 50 ? 'Warning' : 'Critical',
      departmentsMonitored: 10,
      totalKPIs: 100,
      criticalAlerts: criticalCount,
      warningAlerts: warningCount,
      period: {
        label: 'Q4 2024',
        startDate,
        endDate
      }
    };

    // Top executive KPIs
    const topExecutiveKPIs = [
      {
        category: 'Financial Performance',
        kpis: [
          { name: 'Gross Profit Margin', value: financeKpis.grossProfitMargin.value + '%', status: financeKpis.grossProfitMargin.status, change: '+2.5%' },
          { name: 'EBITDA Margin', value: financeKpis.ebitdaMargin.value + '%', status: financeKpis.ebitdaMargin.status, change: '+2.3%' },
          { name: 'Net Profit Margin', value: financeKpis.netProfitMargin.value + '%', status: financeKpis.netProfitMargin.status, change: '+1.8%' }
        ]
      },
      {
        category: 'Customer & Market',
        kpis: [
          { name: 'Net Promoter Score', value: csKpis.nps.value.toFixed(1), status: csKpis.nps.status, change: '-5.2' },
          { name: 'Customer Churn', value: csKpis.churnRate.value + '%', status: csKpis.churnRate.status, change: '+3.1%' },
          { name: 'Marketing ROI', value: marketingKpis.marketingROI.value.toFixed(0) + '%', status: marketingKpis.marketingROI.status, change: '+15%' }
        ]
      },
      {
        category: 'Operations & Quality',
        kpis: [
          { name: 'Overall Equipment Effectiveness', value: opsKpis.oee.value + '%', status: opsKpis.oee.status, change: '+1.8%' },
          { name: 'Product Defect Rate (PPM)', value: qcKpis.defectRatePPM.value.toString(), status: qcKpis.defectRatePPM.status, change: '-50 PPM' },
          { name: 'On-Time In-Full (OTIF)', value: scKpis.otif.value + '%', status: scKpis.otif.status, change: '-2.5%' }
        ]
      },
      {
        category: 'People & Safety',
        kpis: [
          { name: 'Employee Engagement', value: hrKpis.engagement.value + '/100', status: hrKpis.engagement.status, change: '+3.5' },
          { name: 'Safety Incident Rate (TRIR)', value: hseKpis['TRIR'].value.toFixed(2), status: hseKpis['TRIR'].status, change: '-0.15' },
          { name: 'System Uptime', value: adminKpis.systemUptime.value + '%', status: adminKpis.systemUptime.status, change: '+0.2%' }
        ]
      }
    ];

    res.json({
      success: true,
      executiveSummary,
      departments,
      topExecutiveKPIs,
      generatedAt: new Date().toISOString()
    });

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
