import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2, XCircle, Activity } from 'lucide-react';

interface KPIData {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
  benchmark?: {
    value: number;
    status: 'below' | 'at' | 'above';
  };
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
  const [showAlertDetails, setShowAlertDetails] = useState(false);

  // Quality Control KPI names for this department
  const qcKPINames = [
    'Defect Rate PPM',
    'First Pass Yield',
    'Scrap Rate',
    'Rework Rate',
    'Customer Return Rate',
    'Supplier Quality Index',
    'NCR Rate',
    'CAPA Effectiveness',
    'Cost of Poor Quality (COPQ)',
    'Quality Audit Score'
  ];

  // Function to show all KPIs for this department
  const showAllKPIs = () => {
    const kpiList = qcKPINames.map((name, i) => `${i + 1}. ${name}`).join('\n');
    alert(`Quality Control Department KPIs:\n\n${kpiList}`);
  };

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

  // Derive status from benchmark (simple logic for now)
  const getKpiStatus = (kpi: KPIData, kpiName: string): string => {
    if (!kpi.benchmark) return 'good';

    const badMetrics = ['defectRatePPM', 'scrapRate', 'reworkRate', 'customerReturnRate', 'ncrRate', 'copq'];
    const isBadMetric = badMetrics.includes(kpiName);

    if (isBadMetric) {
      // For "lower is better" metrics
      if (kpi.benchmark.status === 'below') return 'excellent';
      if (kpi.benchmark.status === 'at') return 'good';
      return 'critical';
    } else {
      // For "higher is better" metrics
      if (kpi.benchmark.status === 'above') return 'excellent';
      if (kpi.benchmark.status === 'at') return 'good';
      return 'warning';
    }
  };

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

  const getTrendDisplay = (kpi: KPIData) => {
    if (!kpi.trend) return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: 'No change' };

    const changePercent = kpi.trend.changePercent;
    if (Math.abs(changePercent) < 1) {
      return { icon: <Minus className="w-4 h-4" />, color: 'text-gray-400', text: 'Stable' };
    } else if (changePercent > 0) {
      return { icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-400', text: `+${changePercent.toFixed(2)}%` };
    } else {
      return { icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-400', text: `${changePercent.toFixed(2)}%` };
    }
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

  const kpiArray = Object.entries(kpiData.kpis);

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
        {(() => {
          const criticalKPIs = kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'critical');
          const warningKPIs = kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'warning');
          const criticalCount = criticalKPIs.length;
          const warningCount = warningKPIs.length;

          // Generate specific alert details
          const alertDetails = [
            ...criticalKPIs.map(([key, kpi]) => ({
              type: 'critical',
              name: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
              value: kpi.displayValue,
              message: `${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()} is at ${kpi.displayValue} - requires immediate attention`
            })),
            ...warningKPIs.map(([key, kpi]) => ({
              type: 'warning',
              name: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
              value: kpi.displayValue,
              message: `${key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()} is at ${kpi.displayValue} - monitoring recommended`
            }))
          ];

          return (criticalCount + warningCount) > 0 && (
            <div>
              <div
                className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-yellow-500/20 transition-all"
                onClick={() => setShowAlertDetails(!showAlertDetails)}
              >
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-yellow-400 font-semibold mb-1">Quality Alerts Detected - Click to View Details</h3>
                  <p className="text-gray-300 text-sm">
                    {criticalCount} critical and {warningCount} warning metrics require attention.
                  </p>
                </div>
                <div className="text-yellow-400">
                  {showAlertDetails ? '▲' : '▼'}
                </div>
              </div>

              {showAlertDetails && (
                <div className="mt-3 bg-gray-800/50 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                  <h4 className="text-white font-semibold mb-3">Alert Details:</h4>
                  {alertDetails.map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        alert.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/30'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          alert.type === 'critical' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                        }`}>
                          {alert.type.toUpperCase()}
                        </span>
                        <span className="font-semibold text-white">{alert.name}</span>
                        <span className="ml-auto text-sm font-mono text-gray-300">{alert.value}</span>
                      </div>
                      <p className="text-sm text-gray-400">{alert.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* KPI Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total KPIs</div>
          <div className="text-2xl font-bold text-white">{kpiArray.length}</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg">
          <div className="text-sm text-emerald-300">Excellent</div>
          <div className="text-2xl font-bold text-emerald-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'excellent').length}
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <div className="text-sm text-green-300">Good</div>
          <div className="text-2xl font-bold text-green-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'good').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="text-sm text-yellow-300">Warning</div>
          <div className="text-2xl font-bold text-yellow-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'warning').length}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <div className="text-sm text-red-300">Critical</div>
          <div className="text-2xl font-bold text-red-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'critical').length}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {kpiArray.map(([key, kpi]) => {
          const status = getKpiStatus(kpi, key);
          const trendInfo = getTrendDisplay(kpi);
          return (
            <div
              key={key}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 cursor-pointer"
              onClick={showAllKPIs}
            >
              {/* KPI Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-gray-400 text-sm font-medium mb-1">
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{kpi.displayValue}</span>
                  </div>
                </div>
                <div className={`${getStatusBgColor(status)} p-2 rounded-lg`}>
                  {getStatusIcon(status)}
                </div>
              </div>

              {/* Trend Indicator */}
              <div className={`flex items-center gap-2 mb-4 ${trendInfo.color}`}>
                {trendInfo.icon}
                <span className="text-sm font-medium">{trendInfo.text}</span>
              </div>

              {/* Benchmark Comparison */}
              <div className="border-t border-teal-500/20 pt-3 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Benchmark</span>
                  <span className={getStatusColor(status)}>
                    {kpi.benchmark ? kpi.benchmark.status : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calculation Transparency Section */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-teal-400 mb-6">KPI Calculation Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kpiArray.slice(0, 4).map(([key, kpi]) => (
            <div key={key} className="bg-slate-900/50 rounded-lg p-4 border border-teal-500/20">
              <h4 className="text-teal-300 font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1').toUpperCase().trim()}</h4>
              <div className="bg-slate-950/50 rounded p-3 font-mono text-xs text-gray-300">
                <div className="mb-2 text-gray-400">{kpi.calculation.formula}</div>
                {kpi.calculation.steps.slice(0, 3).map((step, idx) => (
                  <div key={idx} className="text-teal-400 mb-1">{step}</div>
                ))}
                <div className="text-emerald-400 font-semibold mt-2">Result: {kpi.displayValue}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardQC;
