import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

type ReportType = 'executive' | 'operational' | 'compliance' | 'custom';
type TimeRange = '1m' | '3m' | '6m' | '1y' | '2y';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ReportType;
  metrics: string[];
}

// Department-specific report templates
const DEPARTMENT_REPORT_TEMPLATES: { [department: string]: ReportTemplate[] } = {
  hr: [
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'High-level overview of all key HR metrics for C-suite presentations',
      icon: '📊',
      type: 'executive',
      metrics: ['turnover', 'engagement', 'productivity', 'revenue-per-employee']
    },
    {
      id: 'workforce-analytics',
      name: 'Workforce Analytics',
      description: 'Detailed workforce composition, turnover, and productivity analysis',
      icon: '👥',
      type: 'operational',
      metrics: ['headcount', 'turnover', 'absenteeism', 'demographics']
    },
    {
      id: 'recruitment-performance',
      name: 'Recruitment Performance',
      description: 'Hiring efficiency, time-to-hire, and candidate quality metrics',
      icon: '🎯',
      type: 'operational',
      metrics: ['time-to-hire', 'cost-per-hire', 'offer-acceptance', 'quality-of-hire']
    },
    {
      id: 'compensation-benefits',
      name: 'Compensation & Benefits',
      description: 'Pay equity, benefits utilization, and total rewards analysis',
      icon: '💰',
      type: 'operational',
      metrics: ['compensation-ratio', 'benefits-cost', 'pay-equity', 'retention']
    },
    {
      id: 'learning-development',
      name: 'Learning & Development',
      description: 'Training ROI, skill development, and career progression metrics',
      icon: '🎓',
      type: 'operational',
      metrics: ['training-roi', 'completion-rate', 'skill-gap', 'career-progression']
    }
  ],
  hse: [
    {
      id: 'safety-overview',
      name: 'Safety Executive Summary',
      description: 'High-level overview of safety performance and compliance metrics',
      icon: '🛡️',
      type: 'executive',
      metrics: ['trir', 'ltifr', 'compliance-score', 'training-completion']
    },
    {
      id: 'incident-analysis',
      name: 'Incident Analysis',
      description: 'Detailed breakdown of safety incidents, root causes, and trends',
      icon: '⚠️',
      type: 'operational',
      metrics: ['incident-rate', 'severity-index', 'root-causes', 'corrective-actions']
    },
    {
      id: 'environmental-compliance',
      name: 'Environmental Compliance',
      description: 'Environmental metrics, emissions tracking, and regulatory compliance',
      icon: '🌍',
      type: 'compliance',
      metrics: ['emissions', 'waste-reduction', 'water-usage', 'compliance-score']
    },
    {
      id: 'safety-training',
      name: 'Safety Training Report',
      description: 'Training completion rates, effectiveness, and certification tracking',
      icon: '🎓',
      type: 'operational',
      metrics: ['completion-rate', 'certification-status', 'training-effectiveness']
    }
  ],
  ops: [
    {
      id: 'operations-summary',
      name: 'Operations Executive Summary',
      description: 'High-level overview of operational efficiency and performance',
      icon: '⚙️',
      type: 'executive',
      metrics: ['oee', 'on-time-delivery', 'capacity-utilization', 'cost-efficiency']
    },
    {
      id: 'production-analysis',
      name: 'Production Analysis',
      description: 'Detailed production metrics, yields, and efficiency analysis',
      icon: '🏭',
      type: 'operational',
      metrics: ['first-pass-yield', 'cycle-time', 'throughput', 'downtime']
    },
    {
      id: 'equipment-performance',
      name: 'Equipment Performance',
      description: 'OEE breakdown, maintenance compliance, and reliability metrics',
      icon: '🔧',
      type: 'operational',
      metrics: ['oee', 'mtbf', 'mttr', 'maintenance-compliance']
    },
    {
      id: 'quality-metrics',
      name: 'Quality Performance',
      description: 'Quality yields, defect rates, and cost of quality analysis',
      icon: '✅',
      type: 'operational',
      metrics: ['first-pass-yield', 'defect-rate', 'rework-rate', 'cost-of-quality']
    }
  ],
  finance: [
    {
      id: 'financial-summary',
      name: 'Financial Executive Summary',
      description: 'High-level overview of financial performance and profitability',
      icon: '💰',
      type: 'executive',
      metrics: ['gross-margin', 'net-margin', 'roa', 'roe']
    },
    {
      id: 'profitability-analysis',
      name: 'Profitability Analysis',
      description: 'Detailed margin analysis by product, region, and customer',
      icon: '📈',
      type: 'operational',
      metrics: ['gross-margin', 'operating-margin', 'ebitda', 'net-income']
    },
    {
      id: 'cash-flow-analysis',
      name: 'Cash Flow Analysis',
      description: 'Operating, investing, and financing cash flow analysis',
      icon: '💵',
      type: 'operational',
      metrics: ['operating-cash-flow', 'free-cash-flow', 'working-capital', 'dso']
    },
    {
      id: 'budget-variance',
      name: 'Budget Variance Report',
      description: 'Actual vs budget performance with variance analysis',
      icon: '📊',
      type: 'operational',
      metrics: ['revenue-variance', 'cost-variance', 'forecast-accuracy']
    }
  ],
  sales: [
    {
      id: 'sales-summary',
      name: 'Sales Executive Summary',
      description: 'High-level overview of sales performance and pipeline health',
      icon: '🏆',
      type: 'executive',
      metrics: ['revenue', 'win-rate', 'pipeline-velocity', 'quota-attainment']
    },
    {
      id: 'pipeline-analysis',
      name: 'Pipeline Analysis',
      description: 'Detailed pipeline stages, conversion rates, and forecasting',
      icon: '🚀',
      type: 'operational',
      metrics: ['pipeline-value', 'stage-conversion', 'deal-velocity', 'forecast']
    },
    {
      id: 'rep-performance',
      name: 'Rep Performance Report',
      description: 'Individual and team sales performance metrics',
      icon: '👤',
      type: 'operational',
      metrics: ['quota-attainment', 'revenue-per-rep', 'activities', 'conversion']
    },
    {
      id: 'customer-acquisition',
      name: 'Customer Acquisition Report',
      description: 'CAC, LTV, and customer acquisition efficiency metrics',
      icon: '💵',
      type: 'operational',
      metrics: ['cac', 'ltv', 'payback-period', 'acquisition-cost']
    }
  ],
  marketing: [
    {
      id: 'marketing-summary',
      name: 'Marketing Executive Summary',
      description: 'High-level overview of marketing ROI and lead generation',
      icon: '📈',
      type: 'executive',
      metrics: ['marketing-roi', 'mqls', 'cost-per-lead', 'conversion-rate']
    },
    {
      id: 'campaign-performance',
      name: 'Campaign Performance',
      description: 'Campaign effectiveness, reach, and conversion analysis',
      icon: '📊',
      type: 'operational',
      metrics: ['impressions', 'clicks', 'conversions', 'roi']
    },
    {
      id: 'lead-generation',
      name: 'Lead Generation Report',
      description: 'MQL/SQL metrics, lead quality, and funnel analysis',
      icon: '🎯',
      type: 'operational',
      metrics: ['mqls', 'sqls', 'mql-to-sql', 'lead-quality']
    },
    {
      id: 'channel-analysis',
      name: 'Channel Performance',
      description: 'Performance by marketing channel and attribution analysis',
      icon: '📺',
      type: 'operational',
      metrics: ['channel-roi', 'attribution', 'engagement', 'cost-per-channel']
    }
  ],
  'customer-success': [
    {
      id: 'cs-summary',
      name: 'Customer Success Executive Summary',
      description: 'High-level overview of customer health and retention',
      icon: '⭐',
      type: 'executive',
      metrics: ['nps', 'churn-rate', 'nrr', 'health-score']
    },
    {
      id: 'retention-analysis',
      name: 'Retention Analysis',
      description: 'Churn analysis, at-risk accounts, and retention strategies',
      icon: '📉',
      type: 'operational',
      metrics: ['churn-rate', 'retention-rate', 'at-risk-accounts', 'win-back']
    },
    {
      id: 'satisfaction-report',
      name: 'Customer Satisfaction Report',
      description: 'NPS, CSAT, CES trends and feedback analysis',
      icon: '😊',
      type: 'operational',
      metrics: ['nps', 'csat', 'ces', 'feedback-themes']
    },
    {
      id: 'expansion-report',
      name: 'Expansion & Upsell Report',
      description: 'Expansion revenue, upsell opportunities, and growth metrics',
      icon: '📈',
      type: 'operational',
      metrics: ['expansion-revenue', 'upsell-rate', 'cross-sell', 'ltv-growth']
    }
  ],
  'supply-chain': [
    {
      id: 'sc-summary',
      name: 'Supply Chain Executive Summary',
      description: 'High-level overview of supply chain performance and efficiency',
      icon: '🚚',
      type: 'executive',
      metrics: ['perfect-order-rate', 'otif', 'inventory-turnover', 'sc-cost']
    },
    {
      id: 'inventory-analysis',
      name: 'Inventory Analysis',
      description: 'Inventory levels, turnover, and optimization opportunities',
      icon: '📦',
      type: 'operational',
      metrics: ['inventory-turnover', 'days-on-hand', 'stockout-rate', 'carrying-cost']
    },
    {
      id: 'supplier-performance',
      name: 'Supplier Performance',
      description: 'Supplier quality, delivery, and relationship metrics',
      icon: '🤝',
      type: 'operational',
      metrics: ['supplier-otd', 'supplier-quality', 'lead-time', 'cost-variance']
    },
    {
      id: 'logistics-report',
      name: 'Logistics & Distribution',
      description: 'Freight costs, delivery performance, and warehouse efficiency',
      icon: '🚢',
      type: 'operational',
      metrics: ['freight-cost', 'delivery-time', 'warehouse-utilization', 'order-accuracy']
    }
  ],
  qc: [
    {
      id: 'qc-summary',
      name: 'Quality Control Executive Summary',
      description: 'High-level overview of quality performance and compliance',
      icon: '✅',
      type: 'executive',
      metrics: ['first-pass-yield', 'defect-rate', 'copq', 'audit-score']
    },
    {
      id: 'defect-analysis',
      name: 'Defect Analysis',
      description: 'Defect types, root causes, and trend analysis',
      icon: '🔍',
      type: 'operational',
      metrics: ['defect-rate', 'pareto-analysis', 'root-causes', 'corrective-actions']
    },
    {
      id: 'audit-compliance',
      name: 'Audit & Compliance Report',
      description: 'Quality audit results, NCRs, and compliance status',
      icon: '📋',
      type: 'compliance',
      metrics: ['audit-score', 'ncr-rate', 'capa-effectiveness', 'certifications']
    },
    {
      id: 'supplier-quality',
      name: 'Supplier Quality Report',
      description: 'Incoming quality, supplier ratings, and improvement plans',
      icon: '🤝',
      type: 'operational',
      metrics: ['incoming-quality', 'supplier-rating', 'returns', 'improvement-plans']
    }
  ],
  administration: [
    {
      id: 'it-summary',
      name: 'IT & Administration Executive Summary',
      description: 'High-level overview of IT performance and service levels',
      icon: '🖥️',
      type: 'executive',
      metrics: ['system-uptime', 'helpdesk-response', 'it-cost', 'security-incidents']
    },
    {
      id: 'service-performance',
      name: 'IT Service Performance',
      description: 'Helpdesk metrics, SLA compliance, and user satisfaction',
      icon: '🎫',
      type: 'operational',
      metrics: ['ticket-resolution', 'sla-compliance', 'user-satisfaction', 'backlog']
    },
    {
      id: 'infrastructure-report',
      name: 'Infrastructure Report',
      description: 'System availability, capacity, and performance metrics',
      icon: '🏢',
      type: 'operational',
      metrics: ['uptime', 'capacity-utilization', 'performance', 'backup-success']
    },
    {
      id: 'security-report',
      name: 'Security & Compliance Report',
      description: 'Security incidents, vulnerabilities, and compliance status',
      icon: '🔒',
      type: 'compliance',
      metrics: ['security-incidents', 'vulnerabilities', 'patch-compliance', 'access-reviews']
    }
  ]
};

// Helper to get department from URL path
const getDepartmentFromPath = (pathname: string): { department: string; backLink: string; departmentName: string } => {
  if (pathname.includes('/hse/')) return { department: 'hse', backLink: '/hse', departmentName: 'HSE' };
  if (pathname.includes('/ops/')) return { department: 'ops', backLink: '/ops', departmentName: 'Operations' };
  if (pathname.includes('/finance/')) return { department: 'finance', backLink: '/finance', departmentName: 'Finance' };
  if (pathname.includes('/sales/')) return { department: 'sales', backLink: '/sales', departmentName: 'Sales' };
  if (pathname.includes('/marketing/')) return { department: 'marketing', backLink: '/marketing', departmentName: 'Marketing' };
  if (pathname.includes('/customer-success/')) return { department: 'customer-success', backLink: '/customer-success', departmentName: 'Customer Success' };
  if (pathname.includes('/supply-chain/')) return { department: 'supply-chain', backLink: '/supply-chain', departmentName: 'Supply Chain' };
  if (pathname.includes('/qc/')) return { department: 'qc', backLink: '/qc', departmentName: 'Quality Control' };
  if (pathname.includes('/administration/')) return { department: 'administration', backLink: '/administration', departmentName: 'Administration' };
  return { department: 'hr', backLink: '/', departmentName: 'HR Analytics' };
};

// Department-specific sample data
const getDepartmentData = (department: string) => {
  const dataMap: { [key: string]: any[] } = {
    hr: [
      { month: 'Jan', metric1: 12, metric2: 72, metric3: 95 },
      { month: 'Feb', metric1: 11, metric2: 74, metric3: 97 },
      { month: 'Mar', metric1: 13, metric2: 73, metric3: 96 },
      { month: 'Apr', metric1: 14, metric2: 71, metric3: 94 },
      { month: 'May', metric1: 15, metric2: 69, metric3: 93 },
      { month: 'Jun', metric1: 13, metric2: 75, metric3: 98 }
    ],
    hse: [
      { month: 'Jan', metric1: 2.8, metric2: 94, metric3: 89 },
      { month: 'Feb', metric1: 2.6, metric2: 95, metric3: 91 },
      { month: 'Mar', metric1: 2.4, metric2: 96, metric3: 92 },
      { month: 'Apr', metric1: 2.2, metric2: 97, metric3: 94 },
      { month: 'May', metric1: 2.1, metric2: 96, metric3: 93 },
      { month: 'Jun', metric1: 2.0, metric2: 97, metric3: 95 }
    ],
    ops: [
      { month: 'Jan', metric1: 82, metric2: 94, metric3: 95 },
      { month: 'Feb', metric1: 84, metric2: 95, metric3: 96 },
      { month: 'Mar', metric1: 85, metric2: 94, metric3: 97 },
      { month: 'Apr', metric1: 86, metric2: 96, metric3: 95 },
      { month: 'May', metric1: 87, metric2: 97, metric3: 98 },
      { month: 'Jun', metric1: 88, metric2: 96, metric3: 97 }
    ],
    finance: [
      { month: 'Jan', metric1: 32, metric2: 18, metric3: 12 },
      { month: 'Feb', metric1: 33, metric2: 19, metric3: 13 },
      { month: 'Mar', metric1: 34, metric2: 18, metric3: 14 },
      { month: 'Apr', metric1: 35, metric2: 20, metric3: 13 },
      { month: 'May', metric1: 36, metric2: 21, metric3: 15 },
      { month: 'Jun', metric1: 37, metric2: 22, metric3: 14 }
    ],
    sales: [
      { month: 'Jan', metric1: 28, metric2: 85, metric3: 1.2 },
      { month: 'Feb', metric1: 30, metric2: 87, metric3: 1.4 },
      { month: 'Mar', metric1: 32, metric2: 86, metric3: 1.5 },
      { month: 'Apr', metric1: 29, metric2: 88, metric3: 1.3 },
      { month: 'May', metric1: 35, metric2: 90, metric3: 1.6 },
      { month: 'Jun', metric1: 38, metric2: 89, metric3: 1.8 }
    ]
  };
  return dataMap[department] || dataMap.hr;
};

// Department-specific metrics for executive summary
const getDepartmentMetrics = (department: string) => {
  const metricsMap: { [key: string]: Array<{label: string; value: string; change: string; positive: boolean}> } = {
    hr: [
      { label: 'Employee Turnover', value: '13.5%', change: '-1.2%', positive: true },
      { label: 'Employee Engagement', value: '74.2%', change: '+2.5%', positive: true },
      { label: 'Revenue per Employee', value: '$103K', change: '+4.8%', positive: true },
      { label: 'Training ROI', value: '285%', change: '+12%', positive: true }
    ],
    hse: [
      { label: 'TRIR', value: '2.0', change: '-0.8', positive: true },
      { label: 'PPE Compliance', value: '97%', change: '+3%', positive: true },
      { label: 'Safety Training', value: '95%', change: '+5%', positive: true },
      { label: 'Audit Score', value: '92%', change: '+4%', positive: true }
    ],
    ops: [
      { label: 'OEE', value: '88%', change: '+6%', positive: true },
      { label: 'On-Time Delivery', value: '96%', change: '+2%', positive: true },
      { label: 'First Pass Yield', value: '97%', change: '+3%', positive: true },
      { label: 'Capacity Utilization', value: '85%', change: '+5%', positive: true }
    ],
    finance: [
      { label: 'Gross Margin', value: '37%', change: '+5%', positive: true },
      { label: 'Net Margin', value: '22%', change: '+4%', positive: true },
      { label: 'ROE', value: '18%', change: '+3%', positive: true },
      { label: 'Cash Flow', value: '$12.5M', change: '+8%', positive: true }
    ],
    sales: [
      { label: 'Win Rate', value: '38%', change: '+10%', positive: true },
      { label: 'Quota Attainment', value: '89%', change: '+4%', positive: true },
      { label: 'Pipeline Velocity', value: '$1.8M', change: '+15%', positive: true },
      { label: 'Avg Deal Size', value: '$45K', change: '+8%', positive: true }
    ],
    marketing: [
      { label: 'Marketing ROI', value: '340%', change: '+25%', positive: true },
      { label: 'Cost Per Lead', value: '$42', change: '-15%', positive: true },
      { label: 'MQL to SQL', value: '28%', change: '+5%', positive: true },
      { label: 'MQLs Generated', value: '1,250', change: '+18%', positive: true }
    ],
    'customer-success': [
      { label: 'NPS', value: '72', change: '+8', positive: true },
      { label: 'Churn Rate', value: '2.1%', change: '-0.5%', positive: true },
      { label: 'Net Revenue Retention', value: '115%', change: '+5%', positive: true },
      { label: 'Health Score', value: '85%', change: '+3%', positive: true }
    ],
    'supply-chain': [
      { label: 'Perfect Order Rate', value: '94%', change: '+4%', positive: true },
      { label: 'OTIF', value: '96%', change: '+3%', positive: true },
      { label: 'Inventory Turnover', value: '8.2x', change: '+1.2x', positive: true },
      { label: 'SC Cost %', value: '12%', change: '-2%', positive: true }
    ],
    qc: [
      { label: 'First Pass Yield', value: '97%', change: '+3%', positive: true },
      { label: 'Defect Rate', value: '450 PPM', change: '-120 PPM', positive: true },
      { label: 'COPQ', value: '2.8%', change: '-0.8%', positive: true },
      { label: 'Audit Score', value: '94%', change: '+4%', positive: true }
    ],
    administration: [
      { label: 'System Uptime', value: '99.9%', change: '+0.2%', positive: true },
      { label: 'Helpdesk Response', value: '2.5h', change: '-1.5h', positive: true },
      { label: 'IT Cost/Employee', value: '$4,200', change: '-8%', positive: true },
      { label: 'Ticket Resolution', value: '8h', change: '-4h', positive: true }
    ]
  };
  return metricsMap[department] || metricsMap.hr;
};

export default function CustomReports() {
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Get department info from URL
  const departmentInfo = getDepartmentFromPath(location.pathname);
  const reportTemplates = DEPARTMENT_REPORT_TEMPLATES[departmentInfo.department] || DEPARTMENT_REPORT_TEMPLATES.hr;
  const departmentMetrics = getDepartmentMetrics(departmentInfo.department);
  const chartData = getDepartmentData(departmentInfo.department);

  const handleGenerateReport = (templateId: string) => {
    setGeneratingReport(true);
    setSelectedTemplate(templateId);

    // Simulate report generation
    setTimeout(() => {
      setGeneratingReport(false);
    }, 1500);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'ppt') => {
    alert(`Exporting report to ${format.toUpperCase()}...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {departmentInfo.departmentName} Reports
            </h1>
            <p className="text-gray-400 text-lg">Generate comprehensive {departmentInfo.departmentName} analytics reports</p>
          </div>
          <Link
            to={departmentInfo.backLink}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {departmentInfo.departmentName}
          </Link>
        </div>

        {/* Report Templates Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📑</span> Report Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  selectedTemplate === template.id
                    ? 'border-cyan-500 shadow-cyan-500/20'
                    : 'border-gray-700 hover:border-cyan-500/50'
                }`}
                onClick={() => handleGenerateReport(template.id)}
              >
                <div className="text-5xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 bg-gray-700/50 rounded-full text-gray-300 capitalize">
                    {template.type}
                  </span>
                  <button className="text-cyan-400 hover:text-cyan-300 font-medium text-sm">
                    Generate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Report View */}
        {selectedTemplate && (
          <div className="space-y-6 animate-fade-in">
            {generatingReport ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                <p className="text-cyan-400 text-lg">Generating your report...</p>
              </div>
            ) : (
              <>
                {/* Report Header */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 animate-gradient-x"></div>
                  <div className="absolute inset-0 backdrop-blur-3xl"></div>

                  <div className="relative p-8 border border-cyan-500/30 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {REPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                        </h2>
                        <p className="text-gray-400">
                          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleExport('pdf')}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => handleExport('excel')}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📊 Excel
                        </button>
                        <button
                          onClick={() => handleExport('ppt')}
                          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 font-medium transition-all duration-200 shadow-lg"
                        >
                          📽️ PowerPoint
                        </button>
                      </div>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2">
                      {[
                        { value: '1m', label: '1 Month' },
                        { value: '3m', label: '3 Months' },
                        { value: '6m', label: '6 Months' },
                        { value: '1y', label: '1 Year' },
                        { value: '2y', label: '2 Years' }
                      ].map((range) => (
                        <button
                          key={range.value}
                          onClick={() => setTimeRange(range.value as TimeRange)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            timeRange === range.value
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Executive Summary Content */}
                {selectedTemplate === 'executive-summary' && (
                  <div className="space-y-6">
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {departmentMetrics.map((metric, idx) => (
                        <div key={idx} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                          <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                          <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                          <div className={`text-sm font-semibold ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {metric.change} vs last period
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trend Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">📉 Turnover Rate Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMetric1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="metric1" stroke="#06b6d4" fill="url(#colorMetric1)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">💙 Secondary Metric Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="metric2" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Performance Index Chart */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 Performance Index</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Bar dataKey="metric3" fill="#10b981" name="Performance Score" />
                          <Line type="monotone" dataKey="metric2" stroke="#3b82f6" strokeWidth={2} name="Secondary Metric" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Key Insights */}
                    <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>💡</span> Key Insights & Recommendations
                      </h3>
                      <div className="space-y-3">
                        {[
                          { icon: '✅', text: 'Employee engagement has increased by 2.5% over the last quarter, indicating positive workplace culture' },
                          { icon: '📊', text: 'Productivity levels are at an all-time high, correlating with reduced turnover rates' },
                          { icon: '⚠️', text: 'Manufacturing department shows 15.3% turnover - recommend focused retention initiatives' },
                          { icon: '🎯', text: 'Training ROI of 285% demonstrates strong learning and development effectiveness' }
                        ].map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
                            <span className="text-2xl">{insight.icon}</span>
                            <p className="text-gray-200 text-sm">{insight.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Report Templates */}
                {selectedTemplate !== 'executive-summary' && selectedTemplate !== reportTemplates[0]?.id && (
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">
                      {reportTemplates.find(t => t.id === selectedTemplate)?.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {reportTemplates.find(t => t.id === selectedTemplate)?.name}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Detailed report content for {reportTemplates.find(t => t.id === selectedTemplate)?.name.toLowerCase()}
                      would appear here with comprehensive analytics, charts, and insights.
                    </p>
                    <div className="inline-flex items-center gap-2 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span>Full report template coming soon</span>
                    </div>
                  </div>
                )}

                {/* First template for non-HR departments */}
                {selectedTemplate === reportTemplates[0]?.id && departmentInfo.department !== 'hr' && (
                  <div className="space-y-6">
                    {/* Key Metrics Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {departmentMetrics.map((metric, idx) => (
                        <div key={idx} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                          <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                          <div className="text-3xl font-bold text-white mb-2">{metric.value}</div>
                          <div className={`text-sm font-semibold ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {metric.change} vs last period
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Trend Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Primary Metric Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorMetricDept" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="metric1" stroke="#06b6d4" fill="url(#colorMetricDept)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 Performance Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="metric2" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!selectedTemplate && (
          <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-8 text-center backdrop-blur-sm">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2">Select a Report Template</h3>
            <p className="text-gray-400">
              Choose a report template above to generate comprehensive {departmentInfo.departmentName} reports
              with customizable time ranges and export options.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
