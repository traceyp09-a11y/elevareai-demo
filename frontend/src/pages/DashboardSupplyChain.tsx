import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface KPIData {
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  benchmark?: {
    value: number;
    status: 'below' | 'at' | 'above';
    description: string;
  };
}

interface KPIResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  kpis: {
    perfectOrderRate: KPIData;
    otif: KPIData;
    inventoryTurnover: KPIData;
    dso: KPIData;
    cashToCashCycle: KPIData;
    supplierLeadTime: KPIData;
    freightCostPct: KPIData;
    warehouseUtilization: KPIData;
    orderAccuracy: KPIData;
    scCostPct: KPIData;
  };
}

// Supply Chain KPI names for display
const supplyChainKPINames = [
  'Perfect Order Rate',
  'On Time In Full (OTIF)',
  'Inventory Turnover',
  'Days Sales Outstanding',
  'Cash-to-Cash Cycle Time',
  'Supplier Lead Time',
  'Freight Cost Percentage',
  'Warehouse Utilization',
  'Order Accuracy',
  'Supply Chain Cost Percentage'
];

export default function DashboardSupplyChain() {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);

  const showAllKPIs = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const kpiList = supplyChainKPINames.map((name, i) => `${i + 1}. ${name}`).join('\n');
    alert(`Supply Chain Department KPIs:\n\n${kpiList}`);
  };

  useEffect(() => {
    fetchKPIData();
    const interval = setInterval(fetchKPIData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchKPIData = async () => {
    try {
      const response = await axios.get<KPIResponse>('http://localhost:3001/api/supplychain/kpis/current');
      setKpiData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getKpiStatus = (kpi: KPIData, kpiName: string): string => {
    if (!kpi.benchmark) return 'good';

    // For metrics where lower is better
    const lowerIsBetter = ['dso', 'cashToCashCycle', 'supplierLeadTime', 'freightCostPct', 'scCostPct'];
    const isLowerBetter = lowerIsBetter.includes(kpiName);

    if (isLowerBetter) {
      // For these metrics, "below" benchmark is good, "above" is bad
      if (kpi.benchmark.status === 'below') return 'excellent';
      if (kpi.benchmark.status === 'at') return 'good';
      return 'critical';
    } else {
      // For metrics where higher is better
      if (kpi.benchmark.status === 'above') return 'excellent';
      if (kpi.benchmark.status === 'at') return 'good';
      return 'warning';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return 'border-green-500 bg-green-500/10';
      case 'good': return 'border-blue-500 bg-blue-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'critical': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'excellent': return '✓';
      case 'good': return '→';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '•';
    }
  };

  const formatKpiName = (key: string): string => {
    const names: { [key: string]: string } = {
      perfectOrderRate: 'Perfect Order Rate',
      otif: 'OTIF (On-Time In-Full)',
      inventoryTurnover: 'Inventory Turnover',
      dso: 'Days Sales Outstanding',
      cashToCashCycle: 'Cash-to-Cash Cycle',
      supplierLeadTime: 'Supplier Lead Time',
      freightCostPct: 'Freight Cost % of Sales',
      warehouseUtilization: 'Warehouse Utilization',
      orderAccuracy: 'Order Accuracy Rate',
      scCostPct: 'SC Cost % of Revenue'
    };
    return names[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading Supply Chain Analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!kpiData) return null;

  const kpiArray = Object.entries(kpiData.kpis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Supply Chain Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time supply chain performance metrics • Period: {kpiData.period.label}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-lg font-semibold">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓ Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">→ Good</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠ Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">✗ Critical</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {kpiArray.map(([key, kpi]) => {
          const status = getKpiStatus(kpi, key);
          const statusColor = getStatusColor(status);
          const statusIcon = getStatusIcon(status);

          return (
            <div
              key={key}
              onClick={(e) => {
                showAllKPIs(e);
                setSelectedKPI(selectedKPI === key ? null : key);
              }}
              className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-105 ${statusColor}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                  {formatKpiName(key)}
                </h3>
                <span className="text-2xl">{statusIcon}</span>
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {kpi.displayValue}
              </div>
              {kpi.benchmark && (
                <div className="text-xs text-gray-400">
                  Target: {kpi.benchmark.value}
                  {kpi.displayValue.includes('%') ? '%' : kpi.displayValue.includes('days') ? ' days' : kpi.displayValue.includes('x') ? 'x' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* KPI Detail Section */}
      {selectedKPI && kpiData.kpis[selectedKPI as keyof typeof kpiData.kpis] && (
        <div className="bg-gray-800/50 border border-orange-500/30 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-orange-400">
              {formatKpiName(selectedKPI)}
            </h2>
            <button
              onClick={() => setSelectedKPI(null)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>

          {(() => {
            const kpi = kpiData.kpis[selectedKPI as keyof typeof kpiData.kpis];
            return (
              <div className="space-y-6">
                {/* Current Value & Benchmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Current Value</div>
                    <div className="text-4xl font-bold text-orange-400">{kpi.displayValue}</div>
                  </div>
                  {kpi.benchmark && (
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Benchmark</div>
                      <div className="text-2xl font-semibold text-blue-400">
                        {kpi.benchmark.value}
                        {kpi.displayValue.includes('%') ? '%' : kpi.displayValue.includes('days') ? ' days' : kpi.displayValue.includes('x') ? 'x' : ''}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{kpi.benchmark.description}</div>
                    </div>
                  )}
                </div>

                {/* Formula */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-400 mb-2 uppercase">Calculation Formula</h3>
                  <div className="font-mono text-sm text-gray-300 bg-black/30 rounded p-3">
                    {kpi.calculation.formula}
                  </div>
                </div>

                {/* Components */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase">Components</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(kpi.calculation.components).map(([compKey, compValue]) => (
                      <div key={compKey} className="bg-black/30 rounded p-3">
                        <div className="text-xs text-gray-400 capitalize">
                          {compKey.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm font-semibold text-white mt-1">
                          {typeof compValue === 'number'
                            ? compValue.toLocaleString(undefined, { maximumFractionDigits: 2 })
                            : compValue}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculation Steps */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-orange-400 mb-3 uppercase">Calculation Steps</h3>
                  <ol className="space-y-2">
                    {kpi.calculation.steps.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-orange-400 font-semibold">{index + 1}.</span>
                        <span className="text-gray-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Excellent</div>
          <div className="text-3xl font-bold text-green-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'excellent').length}
          </div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Good</div>
          <div className="text-3xl font-bold text-blue-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'good').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Warning</div>
          <div className="text-3xl font-bold text-yellow-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'warning').length}
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-400">
            {kpiArray.filter(([key, kpi]) => getKpiStatus(kpi, key) === 'critical').length}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          to="/supply-chain/reports"
          className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-sm rounded-lg p-6 border border-orange-500/30 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Custom Reports</h3>
          <p className="text-gray-400 text-sm">Generate detailed Supply Chain reports</p>
        </Link>

        <Link
          to="/supply-chain/pain-points"
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-6 border border-red-500/30 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🔥</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Pain Points</h3>
          <p className="text-gray-400 text-sm">View critical supply chain challenges</p>
        </Link>

        <Link
          to="/supply-chain/predictive"
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">🔮</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Predictive Analytics</h3>
          <p className="text-gray-400 text-sm">AI-powered supply chain forecasting</p>
        </Link>
      </div>

      {/* Transparency Message */}
      <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-400 mb-2">
          📊 Calculation Transparency
        </h3>
        <p className="text-gray-300 text-sm">
          All KPI calculations are fully transparent and auditable. Click on any KPI card above to view the detailed
          formula, data components, and step-by-step calculation breakdown. This ensures complete visibility into
          how supply chain performance metrics are derived from your operational data.
        </p>
      </div>
    </div>
  );
}
