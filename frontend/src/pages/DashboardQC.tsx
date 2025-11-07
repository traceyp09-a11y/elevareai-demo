import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, XCircle, Activity } from 'lucide-react';

interface KPIData {
  name: string;
  value: number;
  displayValue: string;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: string;
  calculation: {
    description: string;
    formula: string;
    numerator: number;
    denominator: number;
  };
  benchmark: {
    value: number;
    status: 'below' | 'at' | 'above';
    label: string;
  };
  trend_data: Array<{ date: string; value: number }>;
}

interface APIResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  kpis: {
    defect_rate_ppm: KPIData;
    first_pass_yield: KPIData;
    scrap_rate: KPIData;
    rework_rate: KPIData;
    customer_return_rate: KPIData;
    supplier_quality_index: KPIData;
    ncr_rate: KPIData;
    capa_effectiveness: KPIData;
    copq: KPIData;
    quality_audit_score: KPIData;
  };
}

const DashboardQC: React.FC = () => {
  const [kpiData, setKpiData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchKPIData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/qc/kpis/current');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: APIResponse = await response.json();
      setKpiData(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI data');
      console.error('Error fetching KPI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIData();
    const interval = setInterval(fetchKPIData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-400';
      case 'good': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-emerald-500/20';
      case 'good': return 'bg-green-500/20';
      case 'warning': return 'bg-yellow-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'good': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      case 'stable': return <Minus className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: string, name: string) => {
    // For some metrics, "up" is bad (defect rate, scrap rate, etc.)
    const inverseTrendMetrics = ['defect_rate_ppm', 'scrap_rate', 'rework_rate', 'customer_return_rate', 'ncr_rate', 'copq'];
    const isInverse = inverseTrendMetrics.includes(name);

    if (trend === 'up') return isInverse ? 'text-red-400' : 'text-green-400';
    if (trend === 'down') return isInverse ? 'text-green-400' : 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-400 text-lg">Loading Quality Control Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <button
            onClick={fetchKPIData}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-lg">No data available</p>
      </div>
    );
  }

  const kpiArray = Object.entries(kpiData.kpis).map(([key, value]) => ({
    key,
    ...value
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Quality Control Analytics Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Activity className="w-4 h-4 animate-pulse text-teal-400" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <p className="text-gray-400 text-lg">
          {kpiData.period.label} • Monitoring Quality, Compliance, and Continuous Improvement
        </p>
      </div>

      {/* Alert Banner */}
      <div className="mb-6">
        {kpiArray.filter(kpi => kpi.status === 'critical' || kpi.status === 'warning').length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-yellow-400 font-semibold mb-1">Quality Alerts Detected</h3>
              <p className="text-gray-300 text-sm">
                {kpiArray.filter(kpi => kpi.status === 'critical').length} critical and{' '}
                {kpiArray.filter(kpi => kpi.status === 'warning').length} warning metrics require attention.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {kpiArray.map((kpi) => (
          <div
            key={kpi.key}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
          >
            {/* KPI Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-gray-400 text-sm font-medium mb-1">
                  {kpi.name.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{kpi.displayValue}</span>
                </div>
              </div>
              <div className={`${getStatusBgColor(kpi.status)} p-2 rounded-lg`}>
                {getStatusIcon(kpi.status)}
              </div>
            </div>

            {/* Trend Indicator */}
            <div className={`flex items-center gap-2 mb-4 ${getTrendColor(kpi.trend, kpi.key)}`}>
              {getTrendIcon(kpi.trend)}
              <span className="text-sm font-medium">{kpi.change}</span>
            </div>

            {/* Mini Trend Chart */}
            <div className="h-16 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.trend_data}>
                  <defs>
                    <linearGradient id={`gradient-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill={`url(#gradient-${kpi.key})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Benchmark Comparison */}
            <div className="border-t border-teal-500/20 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Benchmark</span>
                <span className={getStatusColor(kpi.status)}>{kpi.benchmark.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Defect Rate PPM Trend */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Defect Rate Trend (PPM)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpiData.kpis.defect_rate_ppm.trend_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #14b8a6', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* First Pass Yield Trend */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">First Pass Yield Trend (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={kpiData.kpis.first_pass_yield.trend_data}>
              <defs>
                <linearGradient id="fpyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#fpyGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost of Poor Quality Trend */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Cost of Poor Quality (% of Sales)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={kpiData.kpis.copq.trend_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #14b8a6', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="value" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Audit Score Trend */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-teal-400 mb-4">Quality Audit Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpiData.kpis.quality_audit_score.trend_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calculation Transparency Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">KPI Calculation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpiArray.slice(0, 4).map((kpi) => (
            <div key={kpi.key} className="bg-slate-900/50 rounded-lg p-4 border border-teal-500/20">
              <h4 className="text-teal-300 font-semibold mb-2">{kpi.name.replace(/_/g, ' ').toUpperCase()}</h4>
              <p className="text-gray-400 text-sm mb-2">{kpi.calculation.description}</p>
              <div className="bg-slate-950/50 rounded p-3 font-mono text-xs text-gray-300">
                <div className="mb-1">{kpi.calculation.formula}</div>
                <div className="text-teal-400">
                  = {kpi.calculation.numerator.toLocaleString()} / {kpi.calculation.denominator.toLocaleString()}
                </div>
                <div className="text-emerald-400 font-semibold mt-1">= {kpi.displayValue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardQC;
