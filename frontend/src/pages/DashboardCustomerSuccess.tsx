import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Heart, Star, Smile, UserX, DollarSign, TrendingUp,
  Activity, Clock, CheckCircle, LifeBuoy, ChevronDown,
  ChevronUp, AlertCircle
} from 'lucide-react';

interface KPI {
  name: string;
  value: number | string;
  unit: string;
  benchmark: number | string;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  formula: string;
  dataPoints: any;
}

interface KPIResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  kpis: {
    nps: KPI;
    csat: KPI;
    ces: KPI;
    churnRate: KPI;
    customerLTV: KPI;
    netRevenueRetention: KPI;
    avgHealthScore: KPI;
    timeToFirstValue: KPI;
    productAdoptionRate: KPI;
    avgTicketResolution: KPI;
  };
}

interface PainPoint {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
  description: string;
  impact: string;
  recommendation: string;
  estimatedCost: string;
}

interface PainPointsResponse {
  success: boolean;
  count: number;
  painPoints: PainPoint[];
}

const DashboardCustomerSuccess: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [painPoints, setPainPoints] = useState<PainPointsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpisResponse, painPointsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/customer-success/kpis/current'),
          axios.get('http://localhost:3001/api/customer-success/pain-points')
        ]);

        setKpiData(kpisResponse.data);
        setPainPoints(painPointsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Customer Success data:', err);
        setError('Failed to load Customer Success data. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleKPIExpansion = (kpiName: string) => {
    setExpandedKPI(expandedKPI === kpiName ? null : kpiName);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'border-green-500 bg-green-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusTextColor = (status: string) => {
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

  const renderKPICard = (
    kpiKey: string,
    kpi: KPI,
    icon: React.ReactNode,
    bgGradient: string
  ) => {
    const isExpanded = expandedKPI === kpiKey;

    return (
      <div
        key={kpiKey}
        className={`bg-gray-800 rounded-lg border-2 ${getStatusColor(kpi.status)} p-6 hover:shadow-lg transition-all duration-200`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-br ${bgGradient}`}>
            {icon}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusTextColor(kpi.status)} bg-gray-700`}>
            {kpi.status.toUpperCase()}
          </div>
        </div>

        <h3 className="text-gray-300 text-sm font-medium mb-2">{kpi.name}</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-white">
            {typeof kpi.value === 'number' ? kpi.value.toFixed(kpi.unit === '%' || kpi.unit === '/10' || kpi.unit === '/5.0' || kpi.unit === '/7.0' || kpi.unit === '/100' ? 1 : 0) : kpi.value}
          </span>
          <span className="text-gray-400 text-sm">{kpi.unit}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>
            Benchmark: {kpi.benchmark}{kpi.unit}
          </span>
        </div>

        <button
          onClick={() => toggleKPIExpansion(kpiKey)}
          className="w-full flex items-center justify-center gap-2 text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Hide Calculation
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Calculation
            </>
          )}
        </button>

        {isExpanded && kpi.formula && (
          <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
            <div>
              <h4 className="text-teal-400 text-xs font-semibold mb-1">Formula</h4>
              <code className="text-gray-300 text-xs bg-gray-900 px-2 py-1 rounded block">
                {kpi.formula}
              </code>
            </div>

            <div>
              <h4 className="text-teal-400 text-xs font-semibold mb-2">Data Points</h4>
              <div className="space-y-1">
                {Object.entries(kpi.dataPoints).map(([key, value], index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-gray-200 font-mono">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Customer Success data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-red-400 mb-2">Error Loading Data</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
            <Heart size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Customer Success & Experience Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Period: {kpiData.period.label} ({kpiData.period.startDate} to {kpiData.period.endDate})
            </p>
          </div>
        </div>
      </div>

      {/* Pain Points Alert */}
      {painPoints && painPoints.count > 0 && (
        <div className="mb-8 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-2 border-red-500/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-400 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  Customer Success Challenges Detected
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {painPoints.count} retention and experience issues require attention to improve customer satisfaction and reduce churn.
                </p>
                <a
                  href="/customer-success/pain-points"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View All Challenges
                  <span className="bg-red-800 px-2 py-0.5 rounded-full text-xs">
                    {painPoints.count}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {renderKPICard(
          'nps',
          kpiData.kpis.nps,
          <Heart size={24} className="text-white" />,
          'from-teal-400 to-cyan-500'
        )}

        {renderKPICard(
          'csat',
          kpiData.kpis.csat,
          <Star size={24} className="text-white" />,
          'from-blue-400 to-indigo-500'
        )}

        {renderKPICard(
          'ces',
          kpiData.kpis.ces,
          <Smile size={24} className="text-white" />,
          'from-purple-400 to-pink-500'
        )}

        {renderKPICard(
          'churnRate',
          kpiData.kpis.churnRate,
          <UserX size={24} className="text-white" />,
          'from-red-400 to-rose-500'
        )}

        {renderKPICard(
          'customerLTV',
          kpiData.kpis.customerLTV,
          <DollarSign size={24} className="text-white" />,
          'from-green-400 to-emerald-500'
        )}

        {renderKPICard(
          'netRevenueRetention',
          kpiData.kpis.netRevenueRetention,
          <TrendingUp size={24} className="text-white" />,
          'from-cyan-400 to-teal-500'
        )}

        {renderKPICard(
          'avgHealthScore',
          kpiData.kpis.avgHealthScore,
          <Activity size={24} className="text-white" />,
          'from-lime-400 to-green-500'
        )}

        {renderKPICard(
          'timeToFirstValue',
          kpiData.kpis.timeToFirstValue,
          <Clock size={24} className="text-white" />,
          'from-orange-400 to-amber-500'
        )}

        {renderKPICard(
          'productAdoptionRate',
          kpiData.kpis.productAdoptionRate,
          <CheckCircle size={24} className="text-white" />,
          'from-emerald-400 to-teal-500'
        )}

        {renderKPICard(
          'avgTicketResolution',
          kpiData.kpis.avgTicketResolution,
          <LifeBuoy size={24} className="text-white" />,
          'from-sky-400 to-blue-500'
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Customer Success & Experience Analytics Dashboard</p>
        <p className="mt-1">Data updated in real-time from customer interactions and product usage</p>
      </div>
    </div>
  );
};

export default DashboardCustomerSuccess;
