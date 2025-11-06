import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const KPI_CONFIG: { [key: string]: { endpoint: string; title: string; icon: string; color: string } } = {
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
};

function KPIDetail() {
  const { kpiName } = useParams<{ kpiName: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KPIDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'trend' | 'department' | 'comparative'>('overview');

  useEffect(() => {
    if (kpiName && KPI_CONFIG[kpiName]) {
      fetchKPIDetail();
    } else {
      setError('Invalid KPI name');
      setLoading(false);
    }
  }, [kpiName]);

  const fetchKPIDetail = async () => {
    if (!kpiName) return;

    try {
      const config = KPI_CONFIG[kpiName];
      const response = await axios.get<KPIDetailData>(`/api/kpis/${config.endpoint}`);
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

  if (error || !data || !kpiName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-red-300 text-lg">⚠️ Error: {error || 'Failed to load KPI'}</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 text-sm mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const config = KPI_CONFIG[kpiName];
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
          to="/"
          className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
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
