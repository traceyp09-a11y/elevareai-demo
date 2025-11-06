import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { KPICalculationService } from './services/kpiCalculations';
import { HSEKPICalculationService } from './services/kpiCalculationsHSE';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize KPI services
const dbPath = path.join(__dirname, '../database/elevareiq.db');
const kpiService = new KPICalculationService(dbPath);
const hseKpiService = new HSEKPICalculationService(dbPath);

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
  console.log(`\n💡 All calculations are transparent and auditable\n`);
});

export default app;
