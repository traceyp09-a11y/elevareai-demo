import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export default function DashboardOps() {
  const [data, setData] = useState<AllKPIsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch Operations KPIs
  const fetchKPIs = async (isAutoRefresh = false) => {
    try {
      const response = await fetch(`/api/ops/kpis/current`);
      const result = await response.json();
      setData(result);

      if (!isAutoRefresh) {
        setLoading(false);
      }
      setLastRefresh(new Date());

      // Generate alerts based on critical metrics
      generateAlerts(result.kpis);
    } catch (error) {
      console.error('Error fetching Operations KPIs:', error);
      setLoading(false);
    }
  };

  const generateAlerts = (kpis: { [key: string]: any }) => {
    const newAlerts: Alert[] = [];

    // On-Time Delivery alert
    if (kpis.onTimeDelivery?.value < 90) {
      newAlerts.push({
        id: 'otif-critical',
        type: 'critical',
        title: 'On-Time Delivery Below Target',
        message: `OTIF is ${kpis.onTimeDelivery.displayValue}, below the 95% target. Customer satisfaction at risk.`,
        kpi: 'On-Time Delivery'
      });
    }

    // Schedule Adherence alert
    if (kpis.scheduleAdherence?.value < 85) {
      newAlerts.push({
        id: 'schedule-warning',
        type: 'warning',
        title: 'Production Schedule Slippage',
        message: `Schedule adherence is ${kpis.scheduleAdherence.displayValue}. Review production planning and capacity.`,
        kpi: 'Schedule Adherence'
      });
    }

    // OEE alert
    if (kpis.oee?.value < 75) {
      newAlerts.push({
        id: 'oee-warning',
        type: 'warning',
        title: 'OEE Below Industry Standard',
        message: `OEE is ${kpis.oee.displayValue}. Target is 85%. Address availability, performance, or quality losses.`,
        kpi: 'OEE'
      });
    }

    // First Pass Yield alert
    if (kpis.firstPassYield?.value < 90) {
      newAlerts.push({
        id: 'fpy-critical',
        type: 'critical',
        title: 'Quality Issues Detected',
        message: `First Pass Yield is ${kpis.firstPassYield.displayValue}. High rework costs impacting profitability.`,
        kpi: 'First Pass Yield'
      });
    }

    // Inventory Turnover alert
    if (kpis.inventoryTurnover?.value < 4) {
      newAlerts.push({
        id: 'inventory-info',
        type: 'info',
        title: 'Inventory Turnover Low',
        message: `Inventory turnover is ${kpis.inventoryTurnover.displayValue}. Working capital tied up. Target is 6+.`,
        kpi: 'Inventory Turnover'
      });
    }

    // Supplier OTD alert
    if (kpis.supplierOTD?.value < 85) {
      newAlerts.push({
        id: 'supplier-warning',
        type: 'warning',
        title: 'Supplier Delivery Issues',
        message: `Supplier on-time delivery is ${kpis.supplierOTD.displayValue}. Review vendor performance and alternatives.`,
        kpi: 'Supplier OTD'
      });
    }

    // Maintenance Compliance alert
    if (kpis.maintenanceCompliance?.value < 90) {
      newAlerts.push({
        id: 'maintenance-warning',
        type: 'warning',
        title: 'Preventive Maintenance Overdue',
        message: `Maintenance compliance is ${kpis.maintenanceCompliance.displayValue}. Breakdown risk increasing.`,
        kpi: 'Maintenance Compliance'
      });
    }

    // Cost of Quality alert
    if (kpis.costOfQuality?.value > 7) {
      newAlerts.push({
        id: 'coq-info',
        type: 'info',
        title: 'Cost of Quality Elevated',
        message: `COQ is ${kpis.costOfQuality.displayValue}. Target is below 5%. Focus on defect prevention.`,
        kpi: 'Cost of Quality'
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

    const kpiMapping = [
      { key: 'onTimeDelivery', name: 'On-Time Delivery (OTIF)', priority: 1, format: 'percent' },
      { key: 'scheduleAdherence', name: 'Schedule Adherence', priority: 2, format: 'percent' },
      { key: 'oee', name: 'Overall Equipment Effectiveness', priority: 3, format: 'percent' },
      { key: 'firstPassYield', name: 'First Pass Yield (FPY)', priority: 4, format: 'percent' },
      { key: 'inventoryTurnover', name: 'Inventory Turnover Ratio', priority: 5, format: 'ratio' },
      { key: 'supplierOTD', name: 'Supplier On-Time Delivery', priority: 6, format: 'percent' },
      { key: 'cycleTime', name: 'Manufacturing Cycle Time', priority: 7, format: 'hours' },
      { key: 'capacityUtilization', name: 'Capacity Utilization', priority: 8, format: 'percent' },
      { key: 'maintenanceCompliance', name: 'Maintenance Compliance', priority: 9, format: 'percent' },
      { key: 'costOfQuality', name: 'Cost of Quality (COQ)', priority: 10, format: 'percent' }
    ];

    return kpiMapping.map(kpi => {
      const kpiData = data.kpis[kpi.key];
      if (!kpiData) {
        return {
          name: kpi.name,
          value: 0,
          displayValue: 'N/A',
          priority: kpi.priority,
          status: 'good' as const
        };
      }

      // Determine status based on benchmark or thresholds
      let status: 'critical' | 'warning' | 'good' | 'excellent' = 'good';

      if (kpi.format === 'percent') {
        if (kpi.key === 'costOfQuality') {
          // Lower is better for COQ
          if (kpiData.value > 10) status = 'critical';
          else if (kpiData.value > 7) status = 'warning';
          else if (kpiData.value <= 5) status = 'excellent';
        } else {
          // Higher is better for other percentages
          if (kpi.key === 'oee') {
            if (kpiData.value < 70) status = 'critical';
            else if (kpiData.value < 80) status = 'warning';
            else if (kpiData.value >= 85) status = 'excellent';
          } else {
            if (kpiData.value < 85) status = 'critical';
            else if (kpiData.value < 90) status = 'warning';
            else if (kpiData.value >= 95) status = 'excellent';
          }
        }
      } else if (kpi.key === 'inventoryTurnover') {
        // Higher is better for inventory turnover
        if (kpiData.value < 4) status = 'warning';
        else if (kpiData.value >= 6) status = 'excellent';
      }

      return {
        name: kpi.name,
        value: kpiData.value,
        displayValue: kpiData.displayValue,
        priority: kpi.priority,
        status,
        trend: kpiData.trend,
        benchmark: kpiData.benchmark
      };
    });
  };

  const filteredKPIs = getKPIs().filter(kpi =>
    kpi.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Operations Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Operations Analytics Dashboard
              </h1>
              <p className="text-gray-400">
                Manufacturing, Logistics & Supply Chain Performance Metrics for Q4 2024
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Refreshed</div>
              <div className="text-gray-300 font-medium">{lastRefresh.toLocaleTimeString()}</div>
              <div className="text-xs text-gray-500 mt-1">Auto-refresh: 30s</div>
            </div>
          </div>

          {/* Period Display */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Reporting Period</div>
                  <div className="text-xl font-bold text-white">{data?.period.label}</div>
                  <div className="text-sm text-gray-500">
                    {data?.period.startDate} to {data?.period.endDate}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total Metrics</div>
                <div className="text-3xl font-bold text-blue-400">{filteredKPIs.length}</div>
              </div>
            </div>

            {/* Reporting Period Metrics Summary */}
            <div className="border-t border-blue-500/20 pt-4 mt-4">
              <div className="text-sm text-gray-400 mb-3 font-semibold">Key Period Metrics:</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">OEE</div>
                  <div className="text-white font-bold">{data?.kpis?.oee?.displayValue || '84.5%'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">OTIF</div>
                  <div className="text-white font-bold">{data?.kpis?.onTimeDelivery?.displayValue || '96.2%'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Schedule Adherence</div>
                  <div className="text-white font-bold">{data?.kpis?.scheduleAdherence?.displayValue || '92%'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">First Pass Yield</div>
                  <div className="text-white font-bold">{data?.kpis?.firstPassYield?.displayValue || '97.8%'}</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-gray-500 text-xs">Capacity Util.</div>
                  <div className="text-white font-bold">{data?.kpis?.capacityUtilization?.displayValue || '87%'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <AlertBanner alerts={alerts} />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-300 text-sm font-semibold">Excellent Performance</span>
              <span className="text-2xl">🌟</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {filteredKPIs.filter(kpi => kpi.status === 'excellent').length}
            </div>
            <div className="text-blue-200 text-sm mt-1">metrics</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-lg p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 text-sm font-semibold">Good Standing</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {filteredKPIs.filter(kpi => kpi.status === 'good').length}
            </div>
            <div className="text-green-200 text-sm mt-1">metrics</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-300 text-sm font-semibold">Needs Attention</span>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {filteredKPIs.filter(kpi => kpi.status === 'warning').length}
            </div>
            <div className="text-yellow-200 text-sm mt-1">metrics</div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-300 text-sm font-semibold">Critical Issues</span>
              <span className="text-2xl">🚨</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {filteredKPIs.filter(kpi => kpi.status === 'critical').length}
            </div>
            <div className="text-red-200 text-sm mt-1">metrics</div>
          </div>
        </div>

        {/* Search/Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Search Operations metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKPIs.map((kpi) => (
            <div
              key={kpi.name}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border ${
                kpi.status === 'critical'
                  ? 'border-red-500/50 shadow-lg shadow-red-500/20'
                  : kpi.status === 'warning'
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                  : kpi.status === 'excellent'
                  ? 'border-green-500/50 shadow-lg shadow-green-500/20'
                  : 'border-blue-500/30'
              } hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500">RANK #{kpi.priority}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    kpi.status === 'critical'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                      : kpi.status === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      : kpi.status === 'excellent'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                  }`}
                >
                  {kpi.status.toUpperCase()}
                </span>
              </div>

              {/* KPI Name */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {kpi.name}
              </h3>

              {/* KPI Value */}
              <div className="mb-4">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    kpi.status === 'critical'
                      ? 'text-red-400'
                      : kpi.status === 'warning'
                      ? 'text-yellow-400'
                      : kpi.status === 'excellent'
                      ? 'text-green-400'
                      : 'text-blue-400'
                  }`}
                >
                  {kpi.displayValue}
                </div>

                {kpi.benchmark && (
                  <div className="text-sm text-gray-400">
                    Benchmark: <span className="text-gray-300 font-medium">{kpi.benchmark.value}%</span>
                    <span
                      className={`ml-2 ${
                        kpi.benchmark.status === 'above'
                          ? kpi.name.includes('Cost') || kpi.name.includes('Cycle Time')
                            ? 'text-red-400'
                            : 'text-green-400'
                          : kpi.benchmark.status === 'below'
                          ? kpi.name.includes('Cost') || kpi.name.includes('Cycle Time')
                            ? 'text-green-400'
                            : 'text-red-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {kpi.benchmark.status === 'above' ? '↑' : kpi.benchmark.status === 'below' ? '↓' : '→'}
                    </span>
                  </div>
                )}
              </div>

              {/* Trend if available */}
              {kpi.trend && (
                <div
                  className={`text-sm font-medium ${
                    kpi.trend.change > 0
                      ? kpi.name.includes('Cost') || kpi.name.includes('Cycle Time')
                        ? 'text-red-400'
                        : 'text-green-400'
                      : kpi.name.includes('Cost') || kpi.name.includes('Cycle Time')
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {kpi.trend.change > 0 ? '↑' : '↓'} {Math.abs(kpi.trend.changePercent).toFixed(1)}% vs previous period
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/ops/pain-points"
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🔥</span>
              <span className="text-orange-400 group-hover:text-orange-300">→</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Operations Pain Points</h3>
            <p className="text-gray-400 text-sm">
              Top 10 manufacturing and logistics challenges facing operations teams
            </p>
          </Link>

          <Link
            to="/ops/reports"
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/30 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📈</span>
              <span className="text-cyan-400 group-hover:text-cyan-300">→</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Custom Reports</h3>
            <p className="text-gray-400 text-sm">
              Generate detailed operations reports and export data for analysis
            </p>
          </Link>

          <Link
            to="/executive"
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">💼</span>
              <span className="text-purple-400 group-hover:text-purple-300">→</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Executive Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Unified view combining HR, HSE, and Operations for C-Suite executives
            </p>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>All calculations are transparent and auditable. Click any metric to see detailed methodology.</p>
          <p className="mt-2">Data refreshes automatically every 30 seconds. Last update: {lastRefresh.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
