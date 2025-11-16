import { useState, useMemo } from 'react';
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
const getReportTemplates = (department: string): ReportTemplate[] => {
  const templates: { [key: string]: ReportTemplate[] } = {
    hr: [
      {
        id: 'executive-summary',
        name: 'HR Executive Summary',
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
      }
    ],
    hse: [
      {
        id: 'safety-overview',
        name: 'Safety Overview',
        description: 'Comprehensive safety metrics including TRIR, LTIFR, and incident trends',
        icon: '🦺',
        type: 'executive',
        metrics: ['trir', 'ltifr', 'near-miss-rate', 'safety-training']
      },
      {
        id: 'incident-analysis',
        name: 'Incident Analysis',
        description: 'Detailed incident tracking, root cause analysis, and corrective actions',
        icon: '🚨',
        type: 'operational',
        metrics: ['incidents', 'lost-time-injuries', 'investigation-time', 'corrective-actions']
      },
      {
        id: 'compliance-report',
        name: 'Safety Compliance',
        description: 'OSHA compliance, audit scores, and regulatory reporting',
        icon: '📋',
        type: 'compliance',
        metrics: ['osha-compliance', 'audit-score', 'training-completion', 'ppe-compliance']
      }
    ],
    ops: [
      {
        id: 'operations-overview',
        name: 'Operations Overview',
        description: 'Key operational metrics including OEE, downtime, and throughput',
        icon: '⚙️',
        type: 'executive',
        metrics: ['oee', 'downtime', 'throughput', 'capacity-utilization']
      },
      {
        id: 'production-analysis',
        name: 'Production Analysis',
        description: 'Detailed production metrics, efficiency trends, and bottleneck analysis',
        icon: '🏭',
        type: 'operational',
        metrics: ['production-volume', 'cycle-time', 'changeover-time', 'scrap-rate']
      },
      {
        id: 'maintenance-report',
        name: 'Maintenance Report',
        description: 'Equipment reliability, maintenance costs, and preventive maintenance metrics',
        icon: '🔧',
        type: 'operational',
        metrics: ['mtbf', 'mttr', 'maintenance-cost', 'pm-completion']
      }
    ],
    qc: [
      {
        id: 'quality-overview',
        name: 'Quality Overview',
        description: 'Quality metrics including defect rates, first pass yield, and customer returns',
        icon: '✅',
        type: 'executive',
        metrics: ['defect-rate', 'first-pass-yield', 'customer-returns', 'scrap-rate']
      },
      {
        id: 'inspection-analysis',
        name: 'Inspection Analysis',
        description: 'Inspection results, non-conformance trends, and corrective actions',
        icon: '🔍',
        type: 'operational',
        metrics: ['inspection-pass-rate', 'non-conformances', 'capa-completion', 'audit-findings']
      },
      {
        id: 'supplier-quality',
        name: 'Supplier Quality',
        description: 'Incoming quality metrics, supplier scorecards, and material defects',
        icon: '📦',
        type: 'operational',
        metrics: ['incoming-quality', 'supplier-defects', 'material-rejections', 'supplier-audits']
      }
    ],
    supplychain: [
      {
        id: 'supply-chain-overview',
        name: 'Supply Chain Overview',
        description: 'Key supply chain metrics including OTIF, inventory turns, and order accuracy',
        icon: '🚚',
        type: 'executive',
        metrics: ['otif', 'inventory-turnover', 'order-accuracy', 'lead-time']
      },
      {
        id: 'inventory-analysis',
        name: 'Inventory Analysis',
        description: 'Inventory levels, stock-outs, excess inventory, and carrying costs',
        icon: '📊',
        type: 'operational',
        metrics: ['inventory-value', 'stockouts', 'excess-stock', 'carrying-cost']
      },
      {
        id: 'logistics-performance',
        name: 'Logistics Performance',
        description: 'Shipping performance, freight costs, and delivery reliability',
        icon: '🚛',
        type: 'operational',
        metrics: ['on-time-delivery', 'freight-cost', 'claims-rate', 'carrier-performance']
      }
    ],
    finance: [
      {
        id: 'financial-overview',
        name: 'Financial Overview',
        description: 'Key financial metrics including profit margins, cash flow, and ROI',
        icon: '💰',
        type: 'executive',
        metrics: ['gross-margin', 'ebitda', 'operating-cash-flow', 'roi']
      },
      {
        id: 'pnl-analysis',
        name: 'P&L Analysis',
        description: 'Detailed profit and loss analysis with variance reporting',
        icon: '📈',
        type: 'operational',
        metrics: ['revenue', 'cogs', 'operating-expenses', 'net-income']
      },
      {
        id: 'cash-flow-report',
        name: 'Cash Flow Report',
        description: 'Cash flow analysis, working capital, and liquidity metrics',
        icon: '💵',
        type: 'operational',
        metrics: ['operating-cash-flow', 'investing-cash-flow', 'financing-cash-flow', 'working-capital']
      }
    ],
    sales: [
      {
        id: 'sales-overview',
        name: 'Sales Overview',
        description: 'Sales performance metrics including revenue growth, win rate, and pipeline',
        icon: '💼',
        type: 'executive',
        metrics: ['revenue-growth', 'win-rate', 'pipeline-value', 'quota-attainment']
      },
      {
        id: 'sales-pipeline',
        name: 'Sales Pipeline',
        description: 'Pipeline analysis, deal stages, and conversion rates',
        icon: '🎯',
        type: 'operational',
        metrics: ['pipeline-coverage', 'stage-conversion', 'deal-velocity', 'average-deal-size']
      },
      {
        id: 'sales-rep-performance',
        name: 'Sales Rep Performance',
        description: 'Individual rep performance, activities, and quota achievement',
        icon: '👤',
        type: 'operational',
        metrics: ['rep-quota', 'activities', 'meetings-booked', 'deals-closed']
      }
    ],
    'customer-success': [
      {
        id: 'cs-overview',
        name: 'Customer Success Overview',
        description: 'Customer health metrics including NPS, churn, and satisfaction scores',
        icon: '❤️',
        type: 'executive',
        metrics: ['nps', 'churn-rate', 'csat', 'customer-health']
      },
      {
        id: 'retention-analysis',
        name: 'Retention Analysis',
        description: 'Customer retention, expansion, and at-risk account analysis',
        icon: '🔄',
        type: 'operational',
        metrics: ['retention-rate', 'expansion-mrr', 'at-risk-accounts', 'churn-reasons']
      },
      {
        id: 'support-metrics',
        name: 'Support Metrics',
        description: 'Support ticket metrics, resolution times, and customer satisfaction',
        icon: '🎫',
        type: 'operational',
        metrics: ['ticket-volume', 'resolution-time', 'first-response-time', 'satisfaction']
      }
    ],
    marketing: [
      {
        id: 'marketing-overview',
        name: 'Marketing Overview',
        description: 'Marketing performance including ROI, lead generation, and conversion rates',
        icon: '📢',
        type: 'executive',
        metrics: ['marketing-roi', 'mql', 'sql', 'conversion-rate']
      },
      {
        id: 'campaign-performance',
        name: 'Campaign Performance',
        description: 'Campaign analysis, channel performance, and attribution',
        icon: '🎯',
        type: 'operational',
        metrics: ['campaign-roi', 'channel-performance', 'cpl', 'cpa']
      },
      {
        id: 'content-marketing',
        name: 'Content Marketing',
        description: 'Content performance, engagement metrics, and SEO rankings',
        icon: '📝',
        type: 'operational',
        metrics: ['content-engagement', 'organic-traffic', 'seo-rankings', 'social-shares']
      }
    ],
    administration: [
      {
        id: 'it-overview',
        name: 'IT Overview',
        description: 'IT metrics including system uptime, helpdesk performance, and security',
        icon: '💻',
        type: 'executive',
        metrics: ['system-uptime', 'ticket-resolution', 'security-incidents', 'user-satisfaction']
      },
      {
        id: 'infrastructure-report',
        name: 'Infrastructure Report',
        description: 'Infrastructure health, capacity utilization, and performance metrics',
        icon: '🖥️',
        type: 'operational',
        metrics: ['server-uptime', 'capacity-utilization', 'backup-success', 'network-performance']
      },
      {
        id: 'security-report',
        name: 'Security Report',
        description: 'Security incidents, vulnerabilities, and compliance status',
        icon: '🔒',
        type: 'compliance',
        metrics: ['security-incidents', 'vulnerabilities', 'patch-compliance', 'audit-findings']
      }
    ]
  };

  return templates[department] || templates.hr;
};

const getDepartmentInfo = (department: string): { name: string; backLink: string; icon: string } => {
  const info: { [key: string]: { name: string; backLink: string; icon: string } } = {
    hr: { name: 'HR Analytics', backLink: '/', icon: '👥' },
    hse: { name: 'HSE Analytics', backLink: '/hse', icon: '🦺' },
    ops: { name: 'Operations', backLink: '/ops', icon: '⚙️' },
    qc: { name: 'Quality Control', backLink: '/qc', icon: '✅' },
    supplychain: { name: 'Supply Chain', backLink: '/supplychain', icon: '🚚' },
    finance: { name: 'Finance', backLink: '/finance', icon: '💰' },
    sales: { name: 'Sales', backLink: '/sales', icon: '💼' },
    'customer-success': { name: 'Customer Success', backLink: '/customer-success', icon: '❤️' },
    marketing: { name: 'Marketing', backLink: '/marketing', icon: '📢' },
    administration: { name: 'IT & Administration', backLink: '/administration', icon: '💻' }
  };

  return info[department] || info.hr;
};

export default function CustomReports() {
  const location = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Detect department from URL
  const department = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/hse/')) return 'hse';
    if (path.startsWith('/ops/')) return 'ops';
    if (path.startsWith('/qc/')) return 'qc';
    if (path.startsWith('/supplychain/')) return 'supplychain';
    if (path.startsWith('/finance/')) return 'finance';
    if (path.startsWith('/sales/')) return 'sales';
    if (path.startsWith('/customer-success/')) return 'customer-success';
    if (path.startsWith('/marketing/')) return 'marketing';
    if (path.startsWith('/administration/')) return 'administration';
    return 'hr';
  }, [location.pathname]);

  const REPORT_TEMPLATES = useMemo(() => getReportTemplates(department), [department]);
  const deptInfo = useMemo(() => getDepartmentInfo(department), [department]);

  // Mock data for charts
  const executiveSummaryData = [
    { month: 'Jan', turnover: 12, engagement: 72, productivity: 95 },
    { month: 'Feb', turnover: 11, engagement: 74, productivity: 97 },
    { month: 'Mar', turnover: 13, engagement: 73, productivity: 96 },
    { month: 'Apr', turnover: 14, engagement: 71, productivity: 94 },
    { month: 'May', turnover: 15, engagement: 69, productivity: 93 },
    { month: 'Jun', turnover: 13, engagement: 75, productivity: 98 },
    { month: 'Jul', turnover: 12, engagement: 76, productivity: 99 },
    { month: 'Aug', turnover: 11, engagement: 77, productivity: 101 },
    { month: 'Sep', turnover: 10, engagement: 78, productivity: 102 },
    { month: 'Oct', turnover: 12, engagement: 76, productivity: 103 },
    { month: 'Nov', turnover: 13, engagement: 75, productivity: 101 },
    { month: 'Dec', turnover: 14, engagement: 74, productivity: 103 }
  ];

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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <span>{deptInfo.icon}</span>
              {deptInfo.name} Reports
            </h1>
            <p className="text-gray-400 text-lg">Generate comprehensive {deptInfo.name.toLowerCase()} analytics reports</p>
          </div>
          <Link
            to={deptInfo.backLink}
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Report Templates Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>📑</span> Report Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_TEMPLATES.map((template) => (
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
                      {[
                        { label: 'Employee Turnover', value: '13.5%', change: '-1.2%', positive: true },
                        { label: 'Employee Engagement', value: '74.2%', change: '+2.5%', positive: true },
                        { label: 'Revenue per Employee', value: '$103K', change: '+4.8%', positive: true },
                        { label: 'Training ROI', value: '285%', change: '+12%', positive: true }
                      ].map((metric, idx) => (
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
                          <AreaChart data={executiveSummaryData}>
                            <defs>
                              <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
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
                            <Area type="monotone" dataKey="turnover" stroke="#06b6d4" fill="url(#colorTurnover)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-cyan-400 mb-4">💙 Engagement Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={executiveSummaryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <RechartsTooltip
                              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Productivity Chart */}
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">📈 Productivity Index</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={executiveSummaryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <RechartsTooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                          <Legend />
                          <Bar dataKey="productivity" fill="#10b981" name="Productivity Score" />
                          <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} name="Engagement" />
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
                {selectedTemplate !== 'executive-summary' && (
                  <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
                    <div className="text-6xl mb-4">
                      {REPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {REPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Detailed report content for {REPORT_TEMPLATES.find(t => t.id === selectedTemplate)?.name.toLowerCase()}
                      would appear here with comprehensive analytics, charts, and insights.
                    </p>
                    <div className="inline-flex items-center gap-2 text-cyan-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <span>Full report template coming soon</span>
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
              Choose a report template above to generate comprehensive HR analytics reports
              with customizable time ranges and export options.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
