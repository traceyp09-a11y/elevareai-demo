import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardFilters from '../components/DashboardFilters';
import AlertBanner, { Alert } from '../components/AlertBanner';

interface KPIData {
  name: string;
  value: number;
  displayValue: string;
  priority: number;
  target?: number;
  status: 'critical' | 'warning' | 'good' | 'excellent';
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
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
  kpis: { [key: string]: any };
}

export default function DashboardHSE() {
  const [data, setData] = useState<AllKPIsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch HSE KPIs
  const fetchKPIs = async (isAutoRefresh = false) => {
    try {
      const response = await fetch(`/api/hse/kpis/current`);
      const result = await response.json();
      setData(result);

      if (!isAutoRefresh) {
        setLoading(false);
      }
      setLastRefresh(new Date());

      // Generate alerts based on critical metrics
      generateAlerts(result.kpis);
    } catch (error) {
      console.error('Error fetching HSE KPIs:', error);
      setLoading(false);
    }
  };

  const generateAlerts = (kpis: { [key: string]: any }) => {
    const newAlerts: Alert[] = [];

    // TRIR alert
    if (kpis['TRIR']?.benchmark?.status === 'above') {
      newAlerts.push({
        id: 'trir-critical',
        type: 'critical',
        title: 'TRIR Above Industry Benchmark',
        message: `TRIR is ${kpis['TRIR'].displayValue}, above the benchmark of ${kpis['TRIR'].benchmark.value}. Immediate safety review required.`,
        kpi: 'TRIR'
      });
    }

    // LTIFR alert
    if (kpis['LTIFR']?.value > 1.0) {
      newAlerts.push({
        id: 'ltifr-warning',
        type: 'warning',
        title: 'Lost Time Injuries Elevated',
        message: `LTIFR is ${kpis['LTIFR'].displayValue}. Review incident investigations and corrective actions.`,
        kpi: 'LTIFR'
      });
    }

    // PPE Compliance alert
    if (kpis['PPE Compliance']?.value < 95) {
      newAlerts.push({
        id: 'ppe-warning',
        type: 'warning',
        title: 'PPE Compliance Below Target',
        message: `PPE compliance is ${kpis['PPE Compliance'].displayValue}. Target is 95%. Increase enforcement and training.`,
        kpi: 'PPE Compliance'
      });
    }

    // Environmental Compliance alert
    if (kpis['Environmental Compliance']?.value < 98) {
      newAlerts.push({
        id: 'env-warning',
        type: 'warning',
        title: 'Environmental Compliance Issue',
        message: `Environmental compliance is ${kpis['Environmental Compliance'].displayValue}. Review violations and corrective actions.`,
        kpi: 'Environmental Compliance'
      });
    }

    // Investigation Closure Time alert
    if (kpis['Investigation Closure Time']?.value > 30) {
      newAlerts.push({
        id: 'investigation-info',
        type: 'info',
        title: 'Investigation Closure Time High',
        message: `Average closure time is ${kpis['Investigation Closure Time'].displayValue}. Target is 30 days. Streamline investigation process.`,
        kpi: 'Investigation Closure Time'
      });
    }

    // Safety Training alert
    if (kpis['Safety Training Rate']?.value < 95) {
      newAlerts.push({
        id: 'training-info',
        type: 'info',
        title: 'Safety Training Completion Low',
        message: `Safety training completion is ${kpis['Safety Training Rate'].displayValue}. Push for 95%+ completion.`,
        kpi: 'Safety Training Rate'
      });
    }

    setAlerts(newAlerts);
  };

  useEffect(() => {
    fetchKPIs();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchKPIs(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Transform KPI data for display
  const getKPIs = (): KPIData[] => {
    if (!data?.kpis) return [];

    return [
      {
        name: 'TRIR',
        value: data.kpis['TRIR']?.value || 0,
        displayValue: data.kpis['TRIR']?.displayValue || '0',
        priority: 1,
        target: 3.0,
        status: data.kpis['TRIR']?.value < 2.0 ? 'excellent' : data.kpis['TRIR']?.value < 3.0 ? 'good' : data.kpis['TRIR']?.value < 4.0 ? 'warning' : 'critical',
        benchmark: data.kpis['TRIR']?.benchmark
      },
      {
        name: 'LTIFR',
        value: data.kpis['LTIFR']?.value || 0,
        displayValue: data.kpis['LTIFR']?.displayValue || '0',
        priority: 2,
        target: 1.0,
        status: data.kpis['LTIFR']?.value < 0.5 ? 'excellent' : data.kpis['LTIFR']?.value < 1.0 ? 'good' : data.kpis['LTIFR']?.value < 2.0 ? 'warning' : 'critical',
        benchmark: data.kpis['LTIFR']?.benchmark
      },
      {
        name: 'PPE Compliance',
        value: data.kpis['PPE Compliance']?.value || 0,
        displayValue: data.kpis['PPE Compliance']?.displayValue || '0%',
        priority: 3,
        target: 95,
        status: data.kpis['PPE Compliance']?.value >= 98 ? 'excellent' : data.kpis['PPE Compliance']?.value >= 95 ? 'good' : data.kpis['PPE Compliance']?.value >= 90 ? 'warning' : 'critical',
        benchmark: data.kpis['PPE Compliance']?.benchmark
      },
      {
        name: 'Environmental Compliance',
        value: data.kpis['Environmental Compliance']?.value || 0,
        displayValue: data.kpis['Environmental Compliance']?.displayValue || '0%',
        priority: 4,
        target: 98,
        status: data.kpis['Environmental Compliance']?.value >= 99 ? 'excellent' : data.kpis['Environmental Compliance']?.value >= 98 ? 'good' : data.kpis['Environmental Compliance']?.value >= 95 ? 'warning' : 'critical',
        benchmark: data.kpis['Environmental Compliance']?.benchmark
      },
      {
        name: 'Safety Audit Score',
        value: data.kpis['Safety Audit Score']?.value || 0,
        displayValue: data.kpis['Safety Audit Score']?.displayValue || '0%',
        priority: 5,
        target: 90,
        status: data.kpis['Safety Audit Score']?.value >= 95 ? 'excellent' : data.kpis['Safety Audit Score']?.value >= 90 ? 'good' : data.kpis['Safety Audit Score']?.value >= 85 ? 'warning' : 'critical',
        benchmark: data.kpis['Safety Audit Score']?.benchmark
      },
      {
        name: 'Safety Training Rate',
        value: data.kpis['Safety Training Rate']?.value || 0,
        displayValue: data.kpis['Safety Training Rate']?.displayValue || '0%',
        priority: 6,
        target: 95,
        status: data.kpis['Safety Training Rate']?.value >= 98 ? 'excellent' : data.kpis['Safety Training Rate']?.value >= 95 ? 'good' : data.kpis['Safety Training Rate']?.value >= 90 ? 'warning' : 'critical',
        benchmark: data.kpis['Safety Training Rate']?.benchmark
      },
      {
        name: 'Near Miss Rate',
        value: data.kpis['Near Miss Rate']?.value || 0,
        displayValue: data.kpis['Near Miss Rate']?.displayValue || '0%',
        priority: 7,
        target: 10,
        status: data.kpis['Near Miss Rate']?.value >= 15 ? 'excellent' : data.kpis['Near Miss Rate']?.value >= 10 ? 'good' : data.kpis['Near Miss Rate']?.value >= 5 ? 'warning' : 'critical',
        benchmark: data.kpis['Near Miss Rate']?.benchmark
      },
      {
        name: 'Hazard Identification Rate',
        value: data.kpis['Hazard Identification Rate']?.value || 0,
        displayValue: data.kpis['Hazard Identification Rate']?.displayValue || '0%',
        priority: 8,
        target: 15,
        status: data.kpis['Hazard Identification Rate']?.value >= 20 ? 'excellent' : data.kpis['Hazard Identification Rate']?.value >= 15 ? 'good' : data.kpis['Hazard Identification Rate']?.value >= 10 ? 'warning' : 'critical',
        benchmark: data.kpis['Hazard Identification Rate']?.benchmark
      },
      {
        name: 'Emergency Preparedness',
        value: data.kpis['Emergency Preparedness']?.value || 0,
        displayValue: data.kpis['Emergency Preparedness']?.displayValue || '0%',
        priority: 9,
        target: 90,
        status: data.kpis['Emergency Preparedness']?.value >= 95 ? 'excellent' : data.kpis['Emergency Preparedness']?.value >= 90 ? 'good' : data.kpis['Emergency Preparedness']?.value >= 85 ? 'warning' : 'critical',
        benchmark: data.kpis['Emergency Preparedness']?.benchmark
      },
      {
        name: 'Investigation Closure Time',
        value: data.kpis['Investigation Closure Time']?.value || 0,
        displayValue: data.kpis['Investigation Closure Time']?.displayValue || '0 days',
        priority: 10,
        target: 30,
        status: data.kpis['Investigation Closure Time']?.value <= 20 ? 'excellent' : data.kpis['Investigation Closure Time']?.value <= 30 ? 'good' : data.kpis['Investigation Closure Time']?.value <= 45 ? 'warning' : 'critical',
        benchmark: data.kpis['Investigation Closure Time']?.benchmark
      }
    ];
  };

  // Filter and sort KPIs
  const filteredKPIs = getKPIs()
    .filter(kpi => kpi.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.priority - b.priority);

  // Sample historical data for trends
  const trendData = [
    { month: 'Jul', trir: 2.8, ltifr: 0.9, compliance: 94 },
    { month: 'Aug', trir: 2.6, ltifr: 0.8, compliance: 95 },
    { month: 'Sep', trir: 2.4, ltifr: 0.7, compliance: 96 },
    { month: 'Oct', trir: 2.2, ltifr: 0.6, compliance: 97 },
    { month: 'Nov', trir: 2.1, ltifr: 0.5, compliance: 96 },
    { month: 'Dec', trir: 2.0, ltifr: 0.4, compliance: 97 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading HSE Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              HSE Analytics Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50 text-green-400 text-sm">
                ● Live
              </div>
            </div>
          </div>
          <p className="text-gray-400">
            {data?.period.label || 'Current Period'} • TitanBuild Manufacturing & Logistics
          </p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <AlertBanner
              alerts={alerts}
              onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <DashboardFilters
            onSearch={setSearchQuery}
            onDepartmentChange={setSelectedDepartment}
            onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            onRefresh={() => fetchKPIs()}
            onExportPDF={() => alert('PDF export feature coming soon!')}
            hideDepartmentFilter={true}
          />
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg hover:border-orange-500/50 cursor-pointer transition-all" onClick={() => alert('Total HSE KPIs: ' + filteredKPIs.length + '\n\nAll safety and environmental metrics are being tracked.')}>
            <div className="text-sm text-gray-400">Total KPIs</div>
            <div className="text-2xl font-bold text-white">{filteredKPIs.length}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg hover:border-green-500/50 cursor-pointer transition-all" onClick={() => alert('Excellent/Good: ' + filteredKPIs.filter(kpi => kpi.status === 'excellent' || kpi.status === 'good').length + '\n\nThese safety metrics are performing well.')}>
            <div className="text-sm text-green-300">Good/Excellent</div>
            <div className="text-2xl font-bold text-green-400">{filteredKPIs.filter(kpi => kpi.status === 'excellent' || kpi.status === 'good').length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg hover:border-yellow-500/50 cursor-pointer transition-all" onClick={() => alert('Warnings: ' + filteredKPIs.filter(kpi => kpi.status === 'warning').length + '\n\nThese metrics need attention to prevent incidents.')}>
            <div className="text-sm text-yellow-300">Warnings</div>
            <div className="text-2xl font-bold text-yellow-400">{filteredKPIs.filter(kpi => kpi.status === 'warning').length}</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg hover:border-red-500/50 cursor-pointer transition-all" onClick={() => alert('Critical: ' + filteredKPIs.filter(kpi => kpi.status === 'critical').length + '\n\nImmediate safety intervention required.')}>
            <div className="text-sm text-red-300">Critical</div>
            <div className="text-2xl font-bold text-red-400">{filteredKPIs.filter(kpi => kpi.status === 'critical').length}</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg hover:border-orange-500/50 cursor-pointer transition-all" onClick={() => alert('Active Alerts: ' + alerts.length + '\n\n' + (alerts.length > 0 ? alerts.map(a => '- ' + a.title).join('\n') : 'No active alerts'))}>
            <div className="text-sm text-orange-300">Active Alerts</div>
            <div className="text-2xl font-bold text-orange-400">{alerts.length}</div>
          </div>
        </div>

        {/* HSE Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredKPIs.map((kpi) => (
            <Link
              key={kpi.name}
              to={`/hse/kpi/${encodeURIComponent(kpi.name)}`}
              className="group"
            >
              <div className={`
                relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                border backdrop-blur-xl
                ${kpi.status === 'critical'
                  ? 'bg-red-500/10 border-red-500/30 hover:border-red-400/60'
                  : kpi.status === 'warning'
                  ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-400/60'
                  : kpi.status === 'good'
                  ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-400/60'
                  : 'bg-green-500/10 border-green-500/30 hover:border-green-400/60'
                }
                group-hover:scale-105 group-hover:shadow-2xl
              `}>
                {/* Priority Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {kpi.priority}
                </div>

                {/* KPI Name */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-200 mb-1">{kpi.name}</h3>
                  <div className={`text-3xl font-bold ${
                    kpi.status === 'critical' ? 'text-red-400' :
                    kpi.status === 'warning' ? 'text-yellow-400' :
                    kpi.status === 'good' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {kpi.displayValue}
                  </div>
                </div>

                {/* Target */}
                {kpi.target && (
                  <div className="text-sm text-gray-400 mb-2">
                    Target: {kpi.name.includes('Time') ? `${kpi.target} days` :
                             kpi.name.includes('Rate') && !kpi.name.includes('TRIR') && !kpi.name.includes('LTIFR') ? `${kpi.target}%` :
                             kpi.target}
                  </div>
                )}

                {/* Benchmark Status */}
                {kpi.benchmark && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">vs Benchmark:</span>
                    <span className={`font-semibold ${
                      kpi.benchmark.status === 'below' ? 'text-green-400' :
                      kpi.benchmark.status === 'above' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {kpi.benchmark.status === 'below' ? '↓ Below' :
                       kpi.benchmark.status === 'above' ? '↑ Above' : '= At'} {kpi.benchmark.value}
                    </span>
                  </div>
                )}

                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* TRIR & LTIFR Trend */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Safety Incident Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend />
                <Line type="monotone" dataKey="trir" stroke="#06b6d4" name="TRIR" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ltifr" stroke="#3b82f6" name="LTIFR" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Trend */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <h3 className="text-xl font-semibold mb-4 text-cyan-400">Overall Compliance %</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" domain={[90, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Area
                  type="monotone"
                  dataKey="compliance"
                  stroke="#10b981"
                  fill="url(#complianceGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/hse/predictive"
            className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/50"
          >
            <div className="text-2xl mb-2">🔮</div>
            <h3 className="text-lg font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-gray-400 text-sm">AI-powered risk prediction and forecasting</p>
          </Link>

          <Link
            to="/hse/mobile"
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 hover:border-green-400/60 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/50"
          >
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-lg font-semibold mb-2">Mobile Reporter</h3>
            <p className="text-gray-400 text-sm">Report incidents from mobile devices</p>
          </Link>

          <Link
            to="/hse/pain-points"
            className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-400/60 transition-all duration-300 hover:scale-105"
          >
            <div className="text-2xl mb-2">🚨</div>
            <h3 className="text-lg font-semibold mb-2">HSE Pain Points</h3>
            <p className="text-gray-400 text-sm">View top 10 HSE challenges and solutions</p>
          </Link>

          <Link
            to="/hse/reports"
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/60 transition-all duration-300 hover:scale-105"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-lg font-semibold mb-2">Custom Reports</h3>
            <p className="text-gray-400 text-sm">Generate detailed HSE reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
