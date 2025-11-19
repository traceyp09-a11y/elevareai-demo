import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import AlertBanner from '../components/AlertBanner';

interface KPIData {
  value: number;
  displayValue: string;
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
}

interface AllKPIsResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  kpis: {
    turnoverRate: KPIData;
    timeToHire: KPIData;
    costPerHire: KPIData;
    productivity: KPIData;
    trir: KPIData;
    absenteeism: KPIData;
    trainingROI: KPIData;
    engagement: KPIData;
    offerAcceptance: KPIData;
    revenuePerEmployee: KPIData;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  value: string;
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AllKPIsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchKPIs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchKPIs(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKPIs = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await axios.get<AllKPIsResponse>('/api/kpis/current');
      setData(response.data);
      setLastRefresh(new Date());
      generateAlerts(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPI data');
      setLoading(false);
    }
  };

  const generateAlerts = (kpiData: AllKPIsResponse) => {
    const newAlerts: Alert[] = [];

    // Check turnover rate
    if (kpiData.kpis.turnoverRate.benchmark?.status === 'above') {
      newAlerts.push({
        id: 'turnover-high',
        type: 'critical',
        metric: 'Turnover Rate',
        message: 'Turnover rate is significantly above industry benchmark. Immediate retention strategies recommended.',
        value: kpiData.kpis.turnoverRate.displayValue
      });
    }

    // Check safety incidents
    if (kpiData.kpis.trir.benchmark?.status === 'above') {
      newAlerts.push({
        id: 'safety-warning',
        type: 'warning',
        metric: 'Safety Incident Rate',
        message: 'TRIR exceeds benchmark. Review safety protocols and training programs.',
        value: kpiData.kpis.trir.displayValue
      });
    }

    // Check engagement
    if (kpiData.kpis.engagement.value < 70) {
      newAlerts.push({
        id: 'engagement-low',
        type: 'warning',
        metric: 'Employee Engagement',
        message: 'Engagement score below 70%. Consider employee satisfaction initiatives.',
        value: kpiData.kpis.engagement.displayValue
      });
    }

    setAlerts(newAlerts);
  };

  const handleExportPDF = () => {
    alert('PDF Export functionality - Generating comprehensive HR Analytics Report...');
    // In production, this would generate a PDF using libraries like jsPDF or html2pdf
  };

  const getStatusColor = (status?: 'above' | 'at' | 'below', inverse: boolean = false) => {
    if (!status) return 'text-gray-400';

    if (inverse) {
      if (status === 'below') return 'text-green-400';
      if (status === 'above') return 'text-red-400';
    } else {
      if (status === 'above') return 'text-green-400';
      if (status === 'below') return 'text-red-400';
    }
    return 'text-yellow-400';
  };

  const getTrendIcon = (status?: 'above' | 'at' | 'below', inverse: boolean = false) => {
    if (!status) return '●';

    const isPositive = inverse
      ? status === 'below'
      : status === 'above';

    return isPositive ? '↗' : '↘';
  };

  // Mock historical data for charts
  const generateHistoricalData = () => {
    return [
      { month: 'Jan', turnover: 12, engagement: 72, productivity: 95000 },
      { month: 'Feb', turnover: 11, engagement: 74, productivity: 97000 },
      { month: 'Mar', turnover: 13, engagement: 73, productivity: 96000 },
      { month: 'Apr', turnover: 14, engagement: 71, productivity: 94000 },
      { month: 'May', turnover: 15, engagement: 69, productivity: 93000 },
      { month: 'Jun', turnover: 13, engagement: 75, productivity: 98000 },
      { month: 'Jul', turnover: 12, engagement: 76, productivity: 99000 },
      { month: 'Aug', turnover: 11, engagement: 77, productivity: 101000 },
      { month: 'Sep', turnover: 10, engagement: 78, productivity: 102000 },
      { month: 'Oct', turnover: 12, engagement: 76, productivity: 103000 },
      { month: 'Nov', turnover: 13, engagement: 75, productivity: 101000 },
      { month: 'Dec', turnover: 14, engagement: 74, productivity: 103000 }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-cyan-400 mt-4 text-lg">Loading Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 backdrop-blur-sm">
          <p className="text-red-300 text-lg">⚠️ Error: {error}</p>
          <p className="text-sm text-red-400 mt-2">Make sure the backend server is running on port 3001</p>
          <button
            onClick={() => fetchKPIs()}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    {
      name: 'Employee Turnover Rate',
      key: 'turnoverRate',
      data: data.kpis.turnoverRate,
      inverse: true,
      description: 'Monthly employee separations',
      icon: '👥',
      priority: 1,
      category: 'workforce'
    },
    {
      name: 'Revenue per Employee',
      key: 'revenuePerEmployee',
      data: data.kpis.revenuePerEmployee,
      inverse: false,
      description: 'Enterprise efficiency',
      icon: '💵',
      priority: 2,
      category: 'financial'
    },
    {
      name: 'Employee Engagement',
      key: 'engagement',
      data: data.kpis.engagement,
      inverse: false,
      description: 'Latest survey score',
      icon: '💙',
      priority: 3,
      category: 'culture'
    },
    {
      name: 'Safety Incident Rate (TRIR)',
      key: 'trir',
      data: data.kpis.trir,
      inverse: true,
      description: 'Per 200,000 hours worked',
      icon: '🛡️',
      priority: 4,
      category: 'safety'
    },
    {
      name: 'Time to Hire',
      key: 'timeToHire',
      data: data.kpis.timeToHire,
      inverse: true,
      description: 'Average days to fill position',
      icon: '⏱️',
      priority: 5,
      category: 'recruitment'
    },
    {
      name: 'Productivity',
      key: 'productivity',
      data: data.kpis.productivity,
      inverse: false,
      description: 'Revenue per employee',
      icon: '📈',
      priority: 6,
      category: 'performance'
    },
    {
      name: 'Cost per Hire',
      key: 'costPerHire',
      data: data.kpis.costPerHire,
      inverse: true,
      description: 'Total recruitment cost per hire',
      icon: '💰',
      priority: 7,
      category: 'financial'
    },
    {
      name: 'Absenteeism Rate',
      key: 'absenteeism',
      data: data.kpis.absenteeism,
      inverse: true,
      description: 'Unplanned absences',
      icon: '📅',
      priority: 8,
      category: 'workforce'
    },
    {
      name: 'Training ROI',
      key: 'trainingROI',
      data: data.kpis.trainingROI,
      inverse: false,
      description: 'Return on training investment',
      icon: '🎓',
      priority: 9,
      category: 'development'
    },
    {
      name: 'Offer Acceptance Rate',
      key: 'offerAcceptance',
      data: data.kpis.offerAcceptance,
      inverse: false,
      description: 'Job offers accepted',
      icon: '✅',
      priority: 10,
      category: 'recruitment'
    }
  ];

  // Sort by priority
  const sortedKPIs = [...kpiCards].sort((a, b) => a.priority - b.priority);

  const historicalData = generateHistoricalData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero Header with Glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 animate-gradient-x"></div>
          <div className="absolute inset-0 backdrop-blur-3xl"></div>

          <div className="relative p-8 border border-cyan-500/30 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  HR Analytics Command Center
                </h1>
                <p className="text-gray-400 text-lg">TitanBuild Manufacturing & Logistics</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Last Updated</div>
                <div className="text-cyan-400 font-mono text-sm">
                  {lastRefresh.toLocaleTimeString()}
                </div>
                <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-xs inline-block">
                  ● Live
                </div>
              </div>
            </div>

            {/* Quick Stats with Glow Effect */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-cyan-300 mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-white">$87.5M</div>
                    <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <span>↗</span> +4.9% YoY
                    </div>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">💰</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-blue-400/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-blue-300 mb-1">Total Employees</div>
                    <div className="text-2xl font-bold text-white">847</div>
                    <div className="text-xs text-gray-400 mt-1">Across 4 facilities</div>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">👥</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-purple-300 mb-1">Labor Costs</div>
                    <div className="text-2xl font-bold text-white">$46.6M</div>
                    <div className="text-xs text-gray-400 mt-1">53.2% of revenue</div>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">📊</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-green-300 mb-1">HR Budget</div>
                    <div className="text-2xl font-bold text-white">$2.5M</div>
                    <div className="text-xs text-green-400 mt-1">✓ On track</div>
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">💼</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <AlertBanner alerts={alerts} onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))} />

        {/* Historical Trends Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Turnover Trend */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span>📉</span> Turnover Rate Trend
              <span className="ml-auto text-xs text-gray-400 font-normal">Last 12 Months</span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="turnover" stroke="#06b6d4" fillOpacity={1} fill="url(#colorTurnover)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Trend */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              <span>💙</span> Employee Engagement Trend
              <span className="ml-auto text-xs text-gray-400 font-normal">Last 12 Months</span>
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#3b82f6' }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              Key Performance Indicators
              <span className="text-sm font-normal text-gray-400 ml-2">
                (Sorted by Priority)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedKPIs.map((kpi, index) => (
              <Link
                key={kpi.key}
                to={`/kpi/${kpi.key}`}
                className="group relative"
              >
                {/* Priority Badge */}
                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {kpi.priority}
                </div>

                <div className="h-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">
                        {kpi.icon}
                      </div>
                      <h4 className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors mb-1">
                        {kpi.name}
                      </h4>
                      <p className="text-xs text-gray-400">{kpi.description}</p>
                    </div>
                  </div>

                  {/* Main Value with Glow */}
                  <div className="text-3xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {kpi.data.displayValue}
                  </div>

                  {/* Benchmark Comparison */}
                  {kpi.data.benchmark && (
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs text-gray-400">
                        Benchmark: <span className="text-gray-300">{kpi.data.benchmark.value}%</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${getStatusColor(kpi.data.benchmark.status, kpi.inverse)}`}>
                        <span className="text-lg">{getTrendIcon(kpi.data.benchmark.status, kpi.inverse)}</span>
                        <span>
                          {kpi.inverse
                            ? (kpi.data.benchmark.status === 'below' ? 'Below' : 'Above')
                            : (kpi.data.benchmark.status === 'above' ? 'Above' : 'Below')
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, (kpi.data.value / 100) * 100)}%` }}
                    ></div>
                  </div>

                  {/* View Details */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-1 bg-gray-700/50 rounded text-gray-300 capitalize">
                      {kpi.category}
                    </span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 font-medium flex items-center gap-1">
                      View Details
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Footer */}
        <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-2">
                🔬 All Calculations are Transparent & Auditable
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Click on any KPI card to see the complete calculation breakdown, including formulas,
                data sources, step-by-step calculations, and industry benchmarks. All metrics feed
                into executive dashboards for CEO and CFO decision-making. Data refreshes automatically every 30 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
