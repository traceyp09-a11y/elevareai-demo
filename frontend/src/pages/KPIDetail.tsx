import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';

interface KPIDetailData {
  success: boolean;
  kpi: string;
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
}

// Department-specific KPI configurations
const DEPARTMENT_KPI_CONFIGS: { [department: string]: { [key: string]: { endpoint: string; title: string; icon: string; color: string } } } = {
  // HR Analytics KPIs
  hr: {
    turnoverRate: { endpoint: 'turnover', title: 'Employee Turnover Rate', icon: '👥', color: '#06b6d4' },
    timeToHire: { endpoint: 'time-to-hire', title: 'Time to Hire', icon: '⏱️', color: '#3b82f6' },
    costPerHire: { endpoint: 'cost-per-hire', title: 'Cost per Hire', icon: '💰', color: '#8b5cf6' },
    productivity: { endpoint: 'productivity', title: 'Employee Productivity', icon: '📈', color: '#10b981' },
    trir: { endpoint: 'safety', title: 'Safety Incident Rate (TRIR)', icon: '🛡️', color: '#f59e0b' },
    absenteeism: { endpoint: 'absenteeism', title: 'Absenteeism Rate', icon: '📅', color: '#ef4444' },
    trainingROI: { endpoint: 'training-roi', title: 'Training ROI', icon: '🎓', color: '#8b5cf6' },
    engagement: { endpoint: 'engagement', title: 'Employee Engagement Score', icon: '💙', color: '#3b82f6' },
    offerAcceptance: { endpoint: 'offer-acceptance', title: 'Offer Acceptance Rate', icon: '✅', color: '#10b981' },
    revenuePerEmployee: { endpoint: 'revenue-per-employee', title: 'Revenue per Employee', icon: '💵', color: '#06b6d4' }
  },
  // HSE KPIs
  hse: {
    'TRIR': { endpoint: 'trir', title: 'Total Recordable Incident Rate', icon: '🛡️', color: '#ef4444' },
    'LTIFR': { endpoint: 'ltifr', title: 'Lost Time Injury Frequency Rate', icon: '⚠️', color: '#f59e0b' },
    'PPE Compliance': { endpoint: 'ppe-compliance', title: 'PPE Compliance Rate', icon: '🦺', color: '#10b981' },
    'Environmental Compliance': { endpoint: 'environmental-compliance', title: 'Environmental Compliance', icon: '🌍', color: '#06b6d4' },
    'Safety Audit Score': { endpoint: 'safety-audit', title: 'Safety Audit Score', icon: '📋', color: '#3b82f6' },
    'Safety Training Rate': { endpoint: 'safety-training', title: 'Safety Training Completion', icon: '🎓', color: '#8b5cf6' },
    'Near Miss Rate': { endpoint: 'near-miss', title: 'Near Miss Reporting Rate', icon: '👁️', color: '#f59e0b' },
    'Hazard Identification Rate': { endpoint: 'hazard-id', title: 'Hazard Identification Rate', icon: '🔍', color: '#ef4444' },
    'Emergency Preparedness': { endpoint: 'emergency-prep', title: 'Emergency Preparedness Score', icon: '🚨', color: '#06b6d4' },
    'Investigation Closure Time': { endpoint: 'investigation-closure', title: 'Investigation Closure Time', icon: '⏱️', color: '#3b82f6' }
  },
  // Operations KPIs
  ops: {
    'On-Time Delivery': { endpoint: 'on-time-delivery', title: 'On-Time Delivery Rate', icon: '🚚', color: '#10b981' },
    'Schedule Adherence': { endpoint: 'schedule-adherence', title: 'Schedule Adherence', icon: '📅', color: '#3b82f6' },
    'OEE': { endpoint: 'oee', title: 'Overall Equipment Effectiveness', icon: '⚙️', color: '#06b6d4' },
    'First Pass Yield': { endpoint: 'first-pass-yield', title: 'First Pass Yield', icon: '✅', color: '#10b981' },
    'Inventory Turnover': { endpoint: 'inventory-turnover', title: 'Inventory Turnover', icon: '📦', color: '#8b5cf6' },
    'Supplier OTD': { endpoint: 'supplier-otd', title: 'Supplier On-Time Delivery', icon: '🤝', color: '#f59e0b' },
    'Cycle Time': { endpoint: 'cycle-time', title: 'Production Cycle Time', icon: '⏱️', color: '#ef4444' },
    'Capacity Utilization': { endpoint: 'capacity-util', title: 'Capacity Utilization', icon: '📊', color: '#06b6d4' },
    'Maintenance Compliance': { endpoint: 'maintenance-compliance', title: 'Maintenance Compliance', icon: '🔧', color: '#3b82f6' },
    'Cost of Quality': { endpoint: 'cost-of-quality', title: 'Cost of Quality', icon: '💰', color: '#8b5cf6' }
  },
  // Finance KPIs
  finance: {
    'Gross Profit Margin': { endpoint: 'gross-profit-margin', title: 'Gross Profit Margin', icon: '💰', color: '#10b981' },
    'Net Profit Margin': { endpoint: 'net-profit-margin', title: 'Net Profit Margin', icon: '📈', color: '#06b6d4' },
    'Operating Cash Flow': { endpoint: 'operating-cash-flow', title: 'Operating Cash Flow Ratio', icon: '💵', color: '#3b82f6' },
    'Current Ratio': { endpoint: 'current-ratio', title: 'Current Ratio', icon: '⚖️', color: '#8b5cf6' },
    'Quick Ratio': { endpoint: 'quick-ratio', title: 'Quick Ratio', icon: '⚡', color: '#f59e0b' },
    'ROA': { endpoint: 'roa', title: 'Return on Assets', icon: '🏢', color: '#10b981' },
    'ROE': { endpoint: 'roe', title: 'Return on Equity', icon: '📊', color: '#06b6d4' },
    'Debt-to-Equity': { endpoint: 'debt-to-equity', title: 'Debt-to-Equity Ratio', icon: '📉', color: '#ef4444' },
    'Working Capital': { endpoint: 'working-capital', title: 'Working Capital', icon: '💼', color: '#3b82f6' },
    'EBITDA Margin': { endpoint: 'ebitda-margin', title: 'EBITDA Margin', icon: '💹', color: '#8b5cf6' }
  },
  // Sales KPIs
  sales: {
    'Win Rate': { endpoint: 'win-rate', title: 'Win Rate', icon: '🏆', color: '#10b981' },
    'Sales Cycle': { endpoint: 'sales-cycle', title: 'Sales Cycle Length', icon: '⏱️', color: '#3b82f6' },
    'Pipeline Velocity': { endpoint: 'pipeline-velocity', title: 'Pipeline Velocity', icon: '🚀', color: '#06b6d4' },
    'Quota Attainment': { endpoint: 'quota-attainment', title: 'Quota Attainment', icon: '🎯', color: '#8b5cf6' },
    'Avg Deal Size': { endpoint: 'avg-deal-size', title: 'Average Deal Size', icon: '💰', color: '#f59e0b' },
    'CAC': { endpoint: 'cac', title: 'Customer Acquisition Cost', icon: '💵', color: '#ef4444' },
    'Revenue per Rep': { endpoint: 'revenue-per-rep', title: 'Revenue per Rep', icon: '👤', color: '#10b981' },
    'Forecast Accuracy': { endpoint: 'forecast-accuracy', title: 'Forecast Accuracy', icon: '📊', color: '#06b6d4' },
    'Lead Conversion': { endpoint: 'lead-conversion', title: 'Lead Conversion Rate', icon: '🔄', color: '#3b82f6' },
    'MRR Growth': { endpoint: 'mrr-growth', title: 'MRR Growth', icon: '📈', color: '#8b5cf6' }
  },
  // Marketing KPIs
  marketing: {
    'Marketing ROI': { endpoint: 'marketing-roi', title: 'Marketing ROI', icon: '📈', color: '#10b981' },
    'Cost Per Lead': { endpoint: 'cost-per-lead', title: 'Cost Per Lead', icon: '💰', color: '#3b82f6' },
    'MQL to SQL': { endpoint: 'mql-to-sql', title: 'MQL to SQL Conversion', icon: '🔄', color: '#06b6d4' },
    'CAC': { endpoint: 'cac', title: 'Customer Acquisition Cost', icon: '💵', color: '#8b5cf6' },
    'MQLs Generated': { endpoint: 'mqls-generated', title: 'MQLs Generated', icon: '🎯', color: '#f59e0b' },
    'Campaign Effectiveness': { endpoint: 'campaign-effectiveness', title: 'Campaign Effectiveness', icon: '📊', color: '#ef4444' },
    'Lead to Customer': { endpoint: 'lead-to-customer', title: 'Lead to Customer Rate', icon: '👤', color: '#10b981' },
    'Channel ROI': { endpoint: 'channel-roi', title: 'Channel ROI', icon: '📺', color: '#06b6d4' },
    'Content Engagement': { endpoint: 'content-engagement', title: 'Content Engagement', icon: '📝', color: '#3b82f6' }
  },
  // Customer Success KPIs
  'customer-success': {
    'NPS': { endpoint: 'nps', title: 'Net Promoter Score', icon: '⭐', color: '#10b981' },
    'CSAT': { endpoint: 'csat', title: 'Customer Satisfaction Score', icon: '😊', color: '#3b82f6' },
    'CES': { endpoint: 'ces', title: 'Customer Effort Score', icon: '📊', color: '#06b6d4' },
    'Churn Rate': { endpoint: 'churn-rate', title: 'Churn Rate', icon: '📉', color: '#ef4444' },
    'Customer LTV': { endpoint: 'customer-ltv', title: 'Customer Lifetime Value', icon: '💰', color: '#8b5cf6' },
    'Net Revenue Retention': { endpoint: 'nrr', title: 'Net Revenue Retention', icon: '💵', color: '#f59e0b' },
    'Health Score': { endpoint: 'health-score', title: 'Average Health Score', icon: '❤️', color: '#10b981' },
    'Time to Value': { endpoint: 'time-to-value', title: 'Time to First Value', icon: '⏱️', color: '#06b6d4' },
    'Product Adoption': { endpoint: 'product-adoption', title: 'Product Adoption Rate', icon: '📈', color: '#3b82f6' },
    'Ticket Resolution': { endpoint: 'ticket-resolution', title: 'Avg Ticket Resolution Time', icon: '🎫', color: '#8b5cf6' }
  },
  // Supply Chain KPIs
  'supply-chain': {
    'Perfect Order Rate': { endpoint: 'perfect-order-rate', title: 'Perfect Order Rate', icon: '✅', color: '#10b981' },
    'OTIF': { endpoint: 'otif', title: 'On Time In Full', icon: '🚚', color: '#3b82f6' },
    'Inventory Turnover': { endpoint: 'inventory-turnover', title: 'Inventory Turnover', icon: '📦', color: '#06b6d4' },
    'DSO': { endpoint: 'dso', title: 'Days Sales Outstanding', icon: '📅', color: '#8b5cf6' },
    'Cash-to-Cash Cycle': { endpoint: 'cash-to-cash', title: 'Cash-to-Cash Cycle Time', icon: '💵', color: '#f59e0b' },
    'Supplier Lead Time': { endpoint: 'supplier-lead-time', title: 'Supplier Lead Time', icon: '⏱️', color: '#ef4444' },
    'Freight Cost': { endpoint: 'freight-cost', title: 'Freight Cost %', icon: '🚢', color: '#10b981' },
    'Warehouse Utilization': { endpoint: 'warehouse-util', title: 'Warehouse Utilization', icon: '🏭', color: '#06b6d4' },
    'Order Accuracy': { endpoint: 'order-accuracy', title: 'Order Accuracy', icon: '🎯', color: '#3b82f6' },
    'SC Cost': { endpoint: 'sc-cost', title: 'Supply Chain Cost %', icon: '💰', color: '#8b5cf6' }
  },
  // Quality Control KPIs
  qc: {
    'Defect Rate': { endpoint: 'defect-rate', title: 'Defect Rate PPM', icon: '🔍', color: '#ef4444' },
    'First Pass Yield': { endpoint: 'first-pass-yield', title: 'First Pass Yield', icon: '✅', color: '#10b981' },
    'Scrap Rate': { endpoint: 'scrap-rate', title: 'Scrap Rate', icon: '🗑️', color: '#f59e0b' },
    'Rework Rate': { endpoint: 'rework-rate', title: 'Rework Rate', icon: '🔄', color: '#3b82f6' },
    'Customer Return Rate': { endpoint: 'customer-return-rate', title: 'Customer Return Rate', icon: '📦', color: '#8b5cf6' },
    'Supplier Quality Index': { endpoint: 'supplier-quality', title: 'Supplier Quality Index', icon: '🤝', color: '#06b6d4' },
    'NCR Rate': { endpoint: 'ncr-rate', title: 'Non-Conformance Rate', icon: '⚠️', color: '#ef4444' },
    'CAPA Effectiveness': { endpoint: 'capa-effectiveness', title: 'CAPA Effectiveness', icon: '📋', color: '#10b981' },
    'COPQ': { endpoint: 'copq', title: 'Cost of Poor Quality', icon: '💰', color: '#f59e0b' },
    'Quality Audit Score': { endpoint: 'quality-audit', title: 'Quality Audit Score', icon: '📊', color: '#3b82f6' }
  },
  // Administration/IT KPIs
  administration: {
    'System Uptime': { endpoint: 'system-uptime', title: 'System Uptime', icon: '🖥️', color: '#10b981' },
    'Helpdesk Response': { endpoint: 'helpdesk-response', title: 'Helpdesk Response Time', icon: '🎫', color: '#3b82f6' },
    'IT Cost per Employee': { endpoint: 'it-cost-per-employee', title: 'IT Cost per Employee', icon: '💰', color: '#06b6d4' },
    'Security Incidents': { endpoint: 'security-incidents', title: 'Security Incident Rate', icon: '🔒', color: '#ef4444' },
    'License Utilization': { endpoint: 'license-util', title: 'License Utilization', icon: '📋', color: '#8b5cf6' },
    'Backup Success': { endpoint: 'backup-success', title: 'Backup Success Rate', icon: '💾', color: '#f59e0b' },
    'Project On-Time': { endpoint: 'project-on-time', title: 'Project On-Time Delivery', icon: '📅', color: '#10b981' },
    'Employee Satisfaction': { endpoint: 'employee-satisfaction', title: 'Employee Satisfaction', icon: '😊', color: '#06b6d4' },
    'Ticket Resolution': { endpoint: 'ticket-resolution', title: 'Ticket Resolution Time', icon: '⏱️', color: '#3b82f6' },
    'Infrastructure Util': { endpoint: 'infrastructure-util', title: 'Infrastructure Utilization', icon: '🏢', color: '#8b5cf6' }
  }
};

// Helper to get department from URL path
const getDepartmentFromPath = (pathname: string): { department: string; apiBase: string; backLink: string; departmentName: string } => {
  if (pathname.startsWith('/hse/')) return { department: 'hse', apiBase: '/api/hse/kpis', backLink: '/hse', departmentName: 'HSE Analytics' };
  if (pathname.startsWith('/ops/')) return { department: 'ops', apiBase: '/api/ops/kpis', backLink: '/ops', departmentName: 'Operations Analytics' };
  if (pathname.startsWith('/finance/')) return { department: 'finance', apiBase: '/api/finance/kpis', backLink: '/finance', departmentName: 'Finance Analytics' };
  if (pathname.startsWith('/sales/')) return { department: 'sales', apiBase: '/api/sales/kpis', backLink: '/sales', departmentName: 'Sales Analytics' };
  if (pathname.startsWith('/marketing/')) return { department: 'marketing', apiBase: '/api/marketing/kpis', backLink: '/marketing', departmentName: 'Marketing Analytics' };
  if (pathname.startsWith('/customer-success/')) return { department: 'customer-success', apiBase: '/api/customer-success/kpis', backLink: '/customer-success', departmentName: 'Customer Success' };
  if (pathname.startsWith('/supply-chain/')) return { department: 'supply-chain', apiBase: '/api/supplychain/kpis', backLink: '/supply-chain', departmentName: 'Supply Chain' };
  if (pathname.startsWith('/qc/')) return { department: 'qc', apiBase: '/api/qc/kpis', backLink: '/qc', departmentName: 'Quality Control' };
  if (pathname.startsWith('/administration/')) return { department: 'administration', apiBase: '/api/administration/kpis', backLink: '/administration', departmentName: 'Administration' };
  // Default to HR
  return { department: 'hr', apiBase: '/api/kpis', backLink: '/', departmentName: 'HR Analytics' };
};

function KPIDetail() {
  const { kpiName } = useParams<{ kpiName: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KPIDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'trend' | 'department' | 'comparative'>('overview');

  // Get department info from URL path
  const departmentInfo = getDepartmentFromPath(location.pathname);
  const departmentConfig = DEPARTMENT_KPI_CONFIGS[departmentInfo.department] || {};

  // Decode the KPI name (it may be URL encoded)
  const decodedKpiName = kpiName ? decodeURIComponent(kpiName) : '';
  const config = departmentConfig[decodedKpiName];

  useEffect(() => {
    if (decodedKpiName && config) {
      fetchKPIDetail();
    } else if (decodedKpiName) {
      // KPI not found in department config - show error with helpful message
      setError(`KPI "${decodedKpiName}" not found in ${departmentInfo.departmentName}`);
      setLoading(false);
    } else {
      setError('Invalid KPI name');
      setLoading(false);
    }
  }, [decodedKpiName, location.pathname]);

  const fetchKPIDetail = async () => {
    if (!decodedKpiName || !config) return;

    try {
      const response = await axios.get<KPIDetailData>(`${departmentInfo.apiBase}/${config.endpoint}`);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPI detail');
      setLoading(false);
    }
  };

  // Mock data for advanced visualizations
  const generateTrendData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      actual: Math.floor(Math.random() * 20) + 80,
      target: 95,
      benchmark: 90
    }));
  };

  const generateDepartmentData = () => {
    return [
      { department: 'Manufacturing', value: 12.5, employees: 425 },
      { department: 'Logistics', value: 10.2, employees: 280 },
      { department: 'Administration', value: 8.1, employees: 85 },
      { department: 'Sales', value: 15.3, employees: 35 },
      { department: 'IT', value: 6.8, employees: 22 }
    ];
  };

  const generateComparativeData = () => {
    return [
      { metric: 'Q1', company: 85, industry: 78, topPerformer: 95 },
      { metric: 'Q2', company: 88, industry: 80, topPerformer: 96 },
      { metric: 'Q3', company: 92, industry: 82, topPerformer: 97 },
      { metric: 'Q4', company: 90, industry: 83, topPerformer: 98 }
    ];
  };

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-cyan-400 mt-4 text-lg">Loading KPI Details...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-red-300 text-lg">⚠️ Error: {error || 'Failed to load KPI'}</p>
          <Link to={departmentInfo.backLink} className="text-cyan-400 hover:text-cyan-300 text-sm mt-4 inline-block">
            ← Back to {departmentInfo.departmentName}
          </Link>
        </div>
      </div>
    );
  }
  const trendData = generateTrendData();
  const departmentData = generateDepartmentData();
  const comparativeData = generateComparativeData();

  const renderComponentValue = (key: string, value: any): JSX.Element => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div className="ml-4 mt-2 space-y-1">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="text-sm">
              <span className="font-medium text-gray-400">{subKey}:</span>{' '}
              <span className="text-gray-200">{renderComponentValue(subKey, subValue)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'number') {
      if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('revenue') ||
          key.toLowerCase().includes('income') || key.toLowerCase().includes('budget')) {
        return <>{`$${value.toLocaleString()}`}</>;
      }
      return <>{value.toLocaleString()}</>;
    }

    return <>{String(value)}</>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 py-8">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Back Button */}
        <Link
          to={departmentInfo.backLink}
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {departmentInfo.departmentName}
        </Link>

        {/* Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 animate-gradient-x"></div>
          <div className="absolute inset-0 backdrop-blur-3xl"></div>

          <div className="relative p-8 border border-cyan-500/30 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-7xl animate-pulse-slow">{config.icon}</div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {config.title}
                  </h1>
                  <p className="text-gray-400 mt-2 text-lg">Detailed Analytics & Drill-Down</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-2">Current Value</div>
                <div className="text-5xl font-bold text-white mb-2">{data.displayValue}</div>
                {data.benchmark && (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm text-gray-400">Benchmark:</span>
                    <span className="text-lg font-semibold text-gray-300">{data.benchmark.value}%</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      data.benchmark.status === 'below' ? 'bg-green-500/20 text-green-400' :
                      data.benchmark.status === 'above' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {data.benchmark.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-2 flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'trend', label: 'Trend Analysis', icon: '📈' },
            { id: 'department', label: 'Department Breakdown', icon: '🏢' },
            { id: 'comparative', label: 'Comparative Analysis', icon: '⚖️' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id as any)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedView === view.id
                  ? 'bg-cyan-600 text-white shadow-lg'
                  : 'bg-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <span className="mr-2">{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        {/* Content based on selected view */}
        {selectedView === 'overview' && (
          <div className="space-y-6">

            {/* Formula */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>📐</span> Formula
              </h2>
              <div className="bg-gray-900/80 border border-cyan-500/30 rounded-lg p-6">
                <code className="text-cyan-300 font-mono text-lg">{data.calculation.formula}</code>
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>🔢</span> Step-by-Step Calculation
              </h2>
              <div className="space-y-4">
                {data.calculation.steps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-gray-200 font-mono text-sm leading-relaxed bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Components Grid */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>🧩</span> Data Components
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.calculation.components).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 rounded-lg p-5 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                  >
                    <div className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-white text-lg font-bold">
                      {renderComponentValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Sources */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span>💾</span> Data Sources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: '📋', title: 'HRIS System', desc: 'Employee records & demographics' },
                  { icon: '⏰', title: 'Time Tracking', desc: 'Hours worked & attendance' },
                  { icon: '💰', title: 'Financial System', desc: 'Revenue & cost data' }
                ].map((source, idx) => (
                  <div key={idx} className="flex items-start space-x-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="text-3xl">{source.icon}</div>
                    <div>
                      <div className="font-semibold text-white">{source.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{source.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedView === 'trend' && (
          <div className="space-y-6">
            {/* 12-Month Trend */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">📈 12-Month Performance Trend</h2>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={trendData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="actual" stroke="#06b6d4" fill="url(#colorActual)" name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                  <Line type="monotone" dataKey="benchmark" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 3" name="Industry Benchmark" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Quarterly Comparison */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">📊 Quarterly Comparison</h2>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={comparativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="metric" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="company" fill="#06b6d4" name="Company" />
                  <Bar dataKey="industry" fill="#3b82f6" name="Industry Avg" />
                  <Bar dataKey="topPerformer" fill="#10b981" name="Top Performer" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedView === 'department' && (
          <div className="space-y-6">
            {/* Department Bar Chart */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">🏢 Performance by Department</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="department" type="category" stroke="#9ca3af" width={120} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[0, 8, 8, 0]}>
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">📊 Distribution by Department</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ department, percent }) => `${department}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Department Details Table */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">📋 Department Details</h2>
                <div className="space-y-3">
                  {departmentData.map((dept, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between hover:border-cyan-500/50 transition-all">
                      <div>
                        <div className="font-semibold text-white">{dept.department}</div>
                        <div className="text-sm text-gray-400">{dept.employees} employees</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{dept.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'comparative' && (
          <div className="space-y-6">
            {/* Benchmark Comparison */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">⚖️ Competitive Benchmarking</h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparativeData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  <Radar name="Company" dataKey="company" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  <Radar name="Industry" dataKey="industry" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                  <Radar name="Top Performer" dataKey="topPerformer" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Competitive Position */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Your Company', value: data.displayValue, color: 'cyan', rank: '2nd Quartile' },
                { label: 'Industry Average', value: data.benchmark?.value + '%' || 'N/A', color: 'blue', rank: 'Median' },
                { label: 'Top Performer', value: '98%', color: 'green', rank: 'Top 10%' }
              ].map((item, idx) => (
                <div key={idx} className={`bg-gradient-to-br from-${item.color}-900/40 to-${item.color}-800/20 border border-${item.color}-500/30 rounded-xl p-6 backdrop-blur-sm`}>
                  <div className="text-sm text-gray-400 mb-2">{item.label}</div>
                  <div className="text-4xl font-bold text-white mb-2">{item.value}</div>
                  <div className="text-xs text-gray-400">{item.rank}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📤</span> Export & Share
          </h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/50">
              📄 Export to PDF
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/50">
              📊 Export to Excel
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/50">
              📧 Share with C-Suite
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 font-medium transition-all duration-200 shadow-lg">
              🔗 Generate Report Link
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default KPIDetail;
