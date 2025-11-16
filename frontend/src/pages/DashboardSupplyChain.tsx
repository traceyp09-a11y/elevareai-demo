import { useState, useEffect } from 'react';
import axios from 'axios';
import CalculationDetails from '../components/CalculationDetails';

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

export default function DashboardSupplyChain() {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <div key={key} className="group">
              <CalculationDetails kpiName={formatKpiName(key)} calculation={kpi.calculation}>
                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-105 ${statusColor}`}>
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
              </CalculationDetails>
            </div>
          );
        })}
      </div>

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
