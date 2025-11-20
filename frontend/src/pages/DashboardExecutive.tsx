import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, Building2, BarChart3, ArrowRight,
  CheckCircle, XCircle, AlertCircle, Activity, Zap, DollarSign,
  Users, Target, TrendingDown, Sparkles, Brain, ChevronRight
} from 'lucide-react';
import {
  CircularProgress,
  ExecutiveKPICard,
  InsightCard,
  StatusBadge,
  MiniSparkline
} from '../components/ExecutiveComponents';
import DashboardFilters from '../components/DashboardFilters';

interface Metric {
  name: string;
  value: string;
  status?: string;
}

interface Department {
  id: string;
  name: string;
  icon: string;
  theme: string;
  healthScore: number;
  keyMetrics: Metric[];
  url: string;
}

interface ExecutiveSummary {
  overallHealth: number;
  overallHealthStatus: string;
  departmentsMonitored: number;
  totalKPIs: number;
  criticalAlerts: number;
  warningAlerts: number;
  period: {
    label: string;
    startDate: string;
    endDate: string;
  };
}

interface ExecutiveKPI {
  name: string;
  value: string;
  status?: string;
  change: string;
}

interface ExecutiveKPICategory {
  category: string;
  kpis: ExecutiveKPI[];
}

interface DashboardData {
  success: boolean;
  executiveSummary: ExecutiveSummary;
  departments: Department[];
  topExecutiveKPIs: ExecutiveKPICategory[];
  generatedAt: string;
}

const DashboardExecutive: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/executive/dashboard');
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching Executive Dashboard data:', err);
      setError('Failed to load Executive Dashboard. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters when data or filters change
    if (data?.departments) {
      applyFilters();
    }
  }, [data, searchQuery, selectedDepartment]);

  const applyFilters = () => {
    if (!data?.departments) return;

    let filtered = [...data.departments];

    // Filter by department
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(dept =>
        dept.id.toLowerCase() === selectedDepartment.toLowerCase() ||
        dept.name.toLowerCase().includes(selectedDepartment.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(query) ||
        dept.keyMetrics.some(metric =>
          metric.name.toLowerCase().includes(query) ||
          metric.value.toLowerCase().includes(query)
        )
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    // Could implement date filtering in the future
    console.log('Date range changed:', startDate, endDate);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Exporting to PDF...');
    alert('PDF export functionality coming soon!');
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500 bg-green-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500 bg-blue-500/10';
    if (score >= 50) return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
    return 'text-red-400 border-red-500 bg-red-500/10';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getThemeColor = (theme: string) => {
    const colors: { [key: string]: string } = {
      cyan: 'from-cyan-500 to-blue-600',
      orange: 'from-orange-500 to-red-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      teal: 'from-teal-500 to-cyan-600',
      green: 'from-green-500 to-emerald-600',
      amber: 'from-amber-500 to-orange-600',
    };
    return colors[theme] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <p className="text-red-400 mb-2 text-xl">Error Loading Dashboard</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { executiveSummary, departments = [], topExecutiveKPIs = [] } = data;
  const displayDepartments = filteredDepartments.length > 0 ? filteredDepartments : departments;

  // Generate sample sparkline data for KPIs (in production, this would come from API)
  const generateSparklineData = () => {
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 70);
  };

  // AI-powered strategic insights with TitanBuild data
  const aiInsights = [
    {
      type: 'opportunity' as const,
      title: 'Revenue Growth Opportunity Identified',
      description: 'Customer Success NPS of 72 and 94% CSAT indicate strong loyalty. Cross-selling to top 50 accounts could yield $2.4M in Q1.',
      priority: 'high' as const,
      impact: '+$2.4M potential revenue',
      actionLabel: 'View Strategy',
      details: 'AI Strategy: Cross-Sell Initiative\n\nAnalysis:\n- Current NPS: 72 (Industry avg: 45)\n- CSAT: 94%\n- Retention: 96.8%\n- Top 50 accounts CLV: $284K avg\n\nRecommended Actions:\n1. Identify upsell opportunities in accounts with >90% health score\n2. Launch targeted campaign for premium tier\n3. Train CS team on consultative selling\n\nProjected ROI: 340%\nTimeline: 90 days\nInvestment Required: $180K'
    },
    {
      type: 'risk' as const,
      title: 'Supply Chain Bottleneck Detected',
      description: 'Inventory turnover at 8.2x vs target 10x. Supplier lead time increased 12%. Action needed to maintain Q1 production.',
      priority: 'high' as const,
      impact: 'Potential 8% cost increase',
      actionLabel: 'Review Options',
      details: 'AI Strategy: Supply Chain Optimization\n\nRisk Analysis:\n- Current Inventory Turnover: 8.2x\n- Target: 10x\n- Supplier Lead Time: +12% increase\n- At-risk revenue: $3.8M\n\nRecommended Actions:\n1. Engage 3 alternative suppliers (pre-qualified list attached)\n2. Increase safety stock for critical components\n3. Negotiate expedited shipping for top 20 SKUs\n\nCost to Mitigate: $420K\nCost of Inaction: $3.8M\nROI of Action: 804%'
    },
    {
      type: 'achievement' as const,
      title: 'Safety Performance Milestone',
      description: 'HSE achieved 180 days incident-free with TRIR of 0.82. This performance saved an estimated $450K in potential costs.',
      priority: 'medium' as const,
      impact: '$450K cost avoidance',
      actionLabel: 'View Details',
      details: 'AI Analysis: Safety Excellence\n\nPerformance Metrics:\n- Days Without Incident: 180\n- TRIR: 0.82 (Industry avg: 2.1)\n- DART: 0.45\n- Training Compliance: 98%\n\nCost Avoidance Calculation:\n- Avg incident cost: $75K\n- Incidents avoided: 6\n- Total savings: $450K\n\nBest Practices to Maintain:\n1. Weekly safety toolbox talks\n2. Near-miss reporting incentives\n3. Leadership safety walks\n4. Real-time hazard monitoring'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 p-4 md:p-8">
      <div className="max-w-[2000px] mx-auto">
        {/* Premium Header with Quick Stats */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
                  <Sparkles className="text-purple-400" size={32} />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    Executive Command Center
                  </h1>
                  <p className="text-gray-400 text-lg mt-1">
                    Real-time intelligence for strategic decision-making
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">
                  📅 {executiveSummary?.period?.startDate || 'N/A'} → {executiveSummary?.period?.endDate || 'N/A'}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500">
                  🔄 Updated {new Date(data.generatedAt).toLocaleTimeString()}
                </span>
                <span className="text-gray-600">•</span>
                <StatusBadge status={executiveSummary?.overallHealthStatus === 'Excellent' ? 'excellent' : 'good'} label={executiveSummary?.overallHealthStatus} />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Filters */}
        <div className="mb-8">
          <DashboardFilters
            onSearch={handleSearch}
            onDepartmentChange={handleDepartmentChange}
            onDateRangeChange={handleDateRangeChange}
            onRefresh={handleRefresh}
            onExportPDF={handleExportPDF}
          />
        </div>

        {/* Hero Metrics - Circular Progress Rings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Company Health Score - Main Hero Metric */}
          <div
            className="lg:col-span-1 bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-gray-800/80 border-2 border-purple-500/30 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-purple-500/60 transition-all duration-300 animate-scale-in backdrop-blur-sm cursor-pointer"
            onClick={() => alert(`Company Health Score: ${executiveSummary?.overallHealth}%\n\nCalculation:\n- HR Health: 82% (weighted 20%)\n- HSE Safety: 94% (weighted 25%)\n- Operations: 85% (weighted 20%)\n- Finance: 88% (weighted 20%)\n- Customer Success: 91% (weighted 15%)\n\nFormula: Weighted Average of Department Scores\nResult: ${executiveSummary?.overallHealth}%\n\nStatus: ${executiveSummary?.overallHealthStatus}\nTrend: +5% improvement vs last quarter`)}
          >
            <CircularProgress
              value={executiveSummary?.overallHealth || 0}
              status={executiveSummary?.overallHealth >= 80 ? 'excellent' : executiveSummary?.overallHealth >= 65 ? 'good' : executiveSummary?.overallHealth >= 50 ? 'warning' : 'critical'}
              size={140}
              strokeWidth={12}
              showLabel={false}
            />
            <h3 className="text-white font-bold text-lg mt-6 text-center">Company Health Score</h3>
            <p className="text-gray-400 text-sm text-center mt-1">{executiveSummary?.overallHealthStatus}</p>
            <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
              <TrendingUp size={16} />
              <span className="font-semibold">+5% vs last period</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Departments */}
            <div
              className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-blue-500/10 border-2 border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
              onClick={() => alert(`Departments Monitored: ${executiveSummary?.departmentsMonitored}\n\nDepartment Breakdown:\n- HR: Health Score 82%\n- HSE: Health Score 94%\n- Operations: Health Score 85%\n- Quality Control: Health Score 88%\n- Supply Chain: Health Score 86%\n- Finance: Health Score 88%\n- IT & Admin: Health Score 92%\n- Sales: Health Score 84%\n- Customer Success: Health Score 91%\n\nCoverage: 100% of all business units\nData Sources: 47 integrated systems`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="text-blue-400" size={28} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white mb-1">{executiveSummary?.departmentsMonitored || 0}</p>
                  <p className="text-xs text-blue-400 font-semibold uppercase tracking-wide">Departments</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Full Coverage</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">100%</span>
                </div>
              </div>
            </div>

            {/* KPIs Tracked */}
            <div
              className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-500/10 border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300 backdrop-blur-sm group cursor-pointer"
              onClick={() => alert(`Total KPIs Tracked: ${executiveSummary?.totalKPIs}\n\nKPI Distribution by Department:\n- HR: 12 KPIs\n- HSE: 10 KPIs\n- Operations: 10 KPIs\n- Quality Control: 10 KPIs\n- Supply Chain: 10 KPIs\n- Finance: 10 KPIs\n- IT & Admin: 8 KPIs\n- Sales: 10 KPIs\n- Customer Success: 8 KPIs\n\nPerformance Breakdown:\n- Excellent: 28 (35%)\n- Good: 36 (45%)\n- Warning: 12 (15%)\n- Critical: 4 (5%)\n\nRefresh Rate: Real-time (30s intervals)`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="text-purple-400" size={28} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white mb-1">{executiveSummary?.totalKPIs || 0}</p>
                  <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">KPIs</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Real-Time Monitoring</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Activity size={12} className="text-purple-400 animate-pulse" />
                  <span>Live data stream</span>
                </div>
              </div>
            </div>

            {/* Alerts Status */}
            <div
              className={`bg-gradient-to-br ${(executiveSummary?.criticalAlerts || 0) > 0 ? 'from-red-500/10 via-orange-500/5 to-red-500/10 border-red-500/30' : 'from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/30'} border-2 rounded-xl p-6 hover:border-opacity-60 transition-all duration-300 backdrop-blur-sm group cursor-pointer`}
              onClick={() => alert(`Alert Status Summary\n\nCritical Alerts: ${executiveSummary?.criticalAlerts || 0}\nWarning Alerts: ${executiveSummary?.warningAlerts || 0}\n\nActive Alerts:\n- Supply Chain: Inventory turnover below target\n- Operations: Schedule adherence at 92%\n- Quality: Defect rate trending up 2.3%\n\nResolved This Week: 5\nAverage Resolution Time: 4.2 hours\n\nAlert Thresholds:\n- Critical: Immediate action required\n- Warning: Monitor within 24 hours\n- Info: Review during next planning cycle`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${(executiveSummary?.criticalAlerts || 0) > 0 ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                  {(executiveSummary?.criticalAlerts || 0) > 0 ? (
                    <AlertTriangle className="text-red-400" size={28} />
                  ) : (
                    <CheckCircle className="text-green-400" size={28} />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white mb-1">{executiveSummary?.criticalAlerts || 0}</p>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${(executiveSummary?.criticalAlerts || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(executiveSummary?.criticalAlerts || 0) > 0 ? 'CRITICAL' : 'ALL CLEAR'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">
                  {(executiveSummary?.criticalAlerts || 0) > 0 ? 'Requires Attention' : 'Systems Normal'}
                </p>
                {(executiveSummary?.warningAlerts || 0) > 0 && (
                  <p className="text-xs text-yellow-400">+{executiveSummary?.warningAlerts} warnings</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Strategic Insights */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                <Brain className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Strategic Insights</h2>
                <p className="text-sm text-gray-400">Intelligent recommendations for executive action</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-semibold transition-all duration-200">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="animate-slide-in-right" style={{ animationDelay: `${idx * 100}ms` }}>
                <InsightCard
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  priority={insight.priority}
                  impact={insight.impact}
                  actionLabel={insight.actionLabel}
                  onAction={() => alert(insight.details)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Strategic View Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                <Target className="text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Strategic View</h2>
                <p className="text-sm text-gray-400">Key business objectives and performance analysis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Performance Overview */}
            <div
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-xl p-6 cursor-pointer hover:border-blue-500/60 transition-all"
              onClick={() => alert('Performance Overview\n\nQ4 2024 Results:\n- Revenue: $48.2M (+12% YoY)\n- Gross Margin: 42.5%\n- Operating Margin: 18.2%\n- EBITDA: $11.9M\n\nOperational Metrics:\n- OEE: 84.5%\n- OTIF: 96.2%\n- Customer Satisfaction: 94%\n\nEmployee Metrics:\n- Engagement: 74.2%\n- Retention: 86.5%\n- Productivity Index: 103\n\nOverall: Strong performance across all key dimensions')}
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-blue-400" size={24} />
                <h3 className="text-lg font-bold text-white">Performance Overview</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Comprehensive view of Q4 2024 business performance across all dimensions</p>
              <div className="text-blue-400 text-sm font-semibold">Click to view details →</div>
            </div>

            {/* ROI Analysis */}
            <div
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-xl p-6 cursor-pointer hover:border-green-500/60 transition-all"
              onClick={() => alert('ROI Analysis\n\nInitiative ROI Summary:\n\n1. Digital Transformation\n   Investment: $2.4M\n   Return: $8.2M\n   ROI: 242%\n\n2. Safety Program\n   Investment: $180K\n   Return: $450K\n   ROI: 150%\n\n3. Quality Improvement\n   Investment: $320K\n   Return: $1.2M\n   ROI: 275%\n\n4. Sales Enablement\n   Investment: $95K\n   Return: $380K\n   ROI: 300%\n\nTotal Portfolio ROI: 228%\nPayback Period: 8.4 months')}
            >
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="text-green-400" size={24} />
                <h3 className="text-lg font-bold text-white">ROI Analysis</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Return on investment across strategic initiatives and programs</p>
              <div className="text-green-400 text-sm font-semibold">Click to view details →</div>
            </div>

            {/* Quick Wins */}
            <div
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-xl p-6 cursor-pointer hover:border-amber-500/60 transition-all"
              onClick={() => alert('Quick Wins Identified\n\nImmediate Opportunities (0-30 days):\n\n1. Automate AP Processing\n   Effort: Low\n   Impact: $45K/year savings\n   Owner: Finance\n\n2. Reduce Scrap Rate\n   Effort: Medium\n   Impact: $120K/year savings\n   Owner: Quality\n\n3. Optimize Shipping Routes\n   Effort: Low\n   Impact: $68K/year savings\n   Owner: Supply Chain\n\n4. Cross-train Production Staff\n   Effort: Medium\n   Impact: 15% flexibility increase\n   Owner: Operations\n\nTotal Quick Win Value: $233K/year\nImplementation Cost: $28K')}
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-amber-400" size={24} />
                <h3 className="text-lg font-bold text-white">Quick Wins</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Low-effort, high-impact opportunities for immediate action</p>
              <div className="text-amber-400 text-sm font-semibold">Click to view details →</div>
            </div>

            {/* ROI Projections */}
            <div
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-xl p-6 cursor-pointer hover:border-purple-500/60 transition-all"
              onClick={() => alert('ROI Projections - 2025\n\nProjected Returns by Quarter:\n\nQ1 2025:\n- Digital initiatives: $2.8M\n- Operational savings: $1.4M\n- Revenue growth: $4.2M\n- Total: $8.4M\n\nQ2 2025:\n- Digital initiatives: $3.2M\n- Operational savings: $1.6M\n- Revenue growth: $5.1M\n- Total: $9.9M\n\nAnnual 2025 Projection:\n- Total Investment: $6.8M\n- Projected Return: $42.4M\n- Net ROI: 524%\n\nKey Assumptions:\n- Market growth: 8%\n- Execution rate: 85%\n- Inflation adjustment: 3%')}
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-purple-400" size={24} />
                <h3 className="text-lg font-bold text-white">2025 ROI Projections</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Forward-looking return projections for strategic planning</p>
              <div className="text-purple-400 text-sm font-semibold">Click to view details →</div>
            </div>
          </div>
        </div>

        {/* Premium Executive KPIs with Sparklines */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                <TrendingUp className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Key Performance Indicators</h2>
                <p className="text-sm text-gray-400">Critical metrics driving business success</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {topExecutiveKPIs.map((category, idx) => (
              <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
                  {category?.category || 'Category'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {(category?.kpis || []).map((kpi, kpiIdx) => {
                    const isPositive = kpi?.change?.startsWith('+');
                    const isNegative = kpi?.change?.startsWith('-');
                    const trend = isPositive ? 'up' : isNegative ? 'down' : 'stable';
                    const status = kpi?.status?.toLowerCase() === 'excellent' ? 'excellent' :
                                   kpi?.status?.toLowerCase() === 'good' ? 'good' :
                                   kpi?.status?.toLowerCase() === 'warning' ? 'warning' : 'critical';

                    return (
                      <ExecutiveKPICard
                        key={kpiIdx}
                        title={kpi?.name || 'N/A'}
                        value={kpi?.value || 'N/A'}
                        change={kpi?.change}
                        trend={trend as 'up' | 'down' | 'stable'}
                        status={status as 'excellent' | 'good' | 'warning' | 'critical'}
                        sparklineData={generateSparklineData()}
                        icon={
                          category?.category === 'Financial Performance' ? <DollarSign size={18} /> :
                          category?.category === 'Operational Efficiency' ? <Target size={18} /> :
                          <Users size={18} />
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overview Grid - Premium Design */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
                <Building2 className="text-orange-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Department Performance</h2>
                <p className="text-sm text-gray-400">Cross-functional health at a glance</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {displayDepartments.length > 0 ? displayDepartments.map((dept, idx) => (
              <Link
                key={dept?.id || Math.random()}
                to={dept?.url || '#'}
                className="group block animate-scale-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative bg-gradient-to-br from-gray-800/60 via-gray-900/60 to-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 rounded-2xl p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getThemeColor(dept?.theme)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header with Icon and Health Score */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-br ${getThemeColor(dept?.theme)} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{dept?.icon || '📊'}</span>
                      </div>
                      <div className="text-right">
                        <div className="relative inline-block">
                          <svg width="50" height="50" className="transform -rotate-90">
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="#1f2937"
                              strokeWidth="4"
                            />
                            <circle
                              cx="25"
                              cy="25"
                              r="20"
                              fill="none"
                              stroke="url(#mini-gradient)"
                              strokeWidth="4"
                              strokeDasharray={`${(dept?.healthScore || 0) * 1.26} 126`}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id="mini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={dept?.healthScore >= 80 ? '#10b981' : dept?.healthScore >= 65 ? '#3b82f6' : dept?.healthScore >= 50 ? '#f59e0b' : '#ef4444'} />
                                <stop offset="100%" stopColor={dept?.healthScore >= 80 ? '#059669' : dept?.healthScore >= 65 ? '#2563eb' : dept?.healthScore >= 50 ? '#d97706' : '#dc2626'} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-white">{dept?.healthScore || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Department Name */}
                    <h3 className="text-white font-bold text-lg mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all">
                      {dept?.name || 'Department'}
                    </h3>

                    {/* Key Metrics - Cleaner Design */}
                    <div className="space-y-2 mb-4">
                      {(dept?.keyMetrics || []).slice(0, 2).map((metric, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400 text-xs">{metric?.name || 'N/A'}</span>
                          <span className="text-white font-semibold">{metric?.value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/50 group-hover:border-gray-600 transition-colors">
                      <span className="text-gray-400 text-sm font-medium group-hover:text-white transition-colors">View Dashboard</span>
                      <ArrowRight className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="mx-auto mb-4 text-gray-500" size={48} />
                <p className="text-gray-400 text-lg">No departments found matching your search criteria</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>

        {/* Premium Footer */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live Data</span>
              </div>
              <span>•</span>
              <span>Last Updated: {new Date(data.generatedAt).toLocaleTimeString()}</span>
              <span>•</span>
              <span>{executiveSummary?.totalKPIs}+ Metrics Tracked</span>
            </div>
            <div className="text-sm text-gray-500">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-semibold">
                ElevareAI™ Executive Intelligence Platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardExecutive;
