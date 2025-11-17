import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CalculationDetails from '../components/CalculationDetails';

interface KPIResult {
  kpiName: string;
  value: number;
  unit: string;
  formula: string;
  components: Record<string, number>;
  calculationSteps: string[];
  benchmark: number;
  status: 'Excellent' | 'Good' | 'Warning' | 'Critical';
  industryContext: string;
}

interface FinanceKPIs {
  grossProfitMargin: KPIResult;
  netProfitMargin: KPIResult;
  operatingCashFlowRatio: KPIResult;
  currentRatio: KPIResult;
  quickRatio: KPIResult;
  returnOnAssets: KPIResult;
  returnOnEquity: KPIResult;
  debtToEquityRatio: KPIResult;
  workingCapitalRatio: KPIResult;
  ebitdaMargin: KPIResult;
}

interface PainPoint {
  id: number;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affected_metric: string;
  current_value: string;
  target_value: string;
  estimated_cost: string;
  recommended_actions: string[];
  responsible_department: string;
  timeline: string;
}

const DashboardFinance: React.FC = () => {
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchFinanceData();
    const interval = setInterval(fetchFinanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [kpisResponse, painPointsResponse] = await Promise.all([
        axios.get('/api/finance/kpis/current'),
        axios.get('/api/finance/pain-points'),
      ]);

      setKpis(kpisResponse.data.kpis);
      setPainPoints(painPointsResponse.data.pain_points);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Excellent':
        return 'border-blue-500 bg-blue-500/10';
      case 'Good':
        return 'border-green-500 bg-green-500/10';
      case 'Warning':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'Critical':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Excellent':
        return '✓';
      case 'Good':
        return '→';
      case 'Warning':
        return '⚠';
      case 'Critical':
        return '✗';
      default:
        return '•';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 border-red-500/50';
      case 'High':
        return 'bg-orange-500/10 border-orange-500/50';
      case 'Medium':
        return 'bg-yellow-500/10 border-yellow-500/50';
      case 'Low':
        return 'bg-blue-500/10 border-blue-500/50';
      default:
        return 'bg-gray-500/10 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading Finance Analytics...</div>
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

  if (!kpis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">No data available</div>
        </div>
      </div>
    );
  }

  const kpiArray = Object.values(kpis);
  const statusCounts = kpiArray.reduce(
    (acc, kpi) => {
      acc[kpi.status] = (acc[kpi.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Finance Analytics Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Real-time financial performance metrics and insights • Q4 2024
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Last Updated</div>
            <div className="text-lg font-semibold">{lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🌟 Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓ Good</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚠ Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-400">✗ Critical</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total KPIs</div>
          <div className="text-2xl font-bold text-white">{kpiArray.length}</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
          <div className="text-sm text-blue-300">Excellent</div>
          <div className="text-2xl font-bold text-blue-400">{statusCounts['Excellent'] || 0}</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
          <div className="text-sm text-green-300">Good</div>
          <div className="text-2xl font-bold text-green-400">{statusCounts['Good'] || 0}</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="text-sm text-yellow-300">Warning</div>
          <div className="text-2xl font-bold text-yellow-400">{statusCounts['Warning'] || 0}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <div className="text-sm text-red-300">Critical</div>
          <div className="text-2xl font-bold text-red-400">{statusCounts['Critical'] || 0}</div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {kpiArray.map((kpi, index) => {
          const calculation = {
            formula: kpi.formula,
            components: kpi.components,
            steps: kpi.calculationSteps
          };
          return (
            <div key={index} className="group">
              <CalculationDetails kpiName={kpi.kpiName} calculation={calculation}>
                <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all hover:scale-105 ${getStatusColor(kpi.status)}`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide flex-1">
                {kpi.kpiName}
              </h3>
              <span className="text-2xl ml-2">{getStatusIcon(kpi.status)}</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {kpi.value.toLocaleString()}
              <span className="text-lg ml-1">{kpi.unit}</span>
            </div>
            <div className="text-sm text-gray-400">
              Target: {kpi.benchmark.toLocaleString()}{kpi.unit}
            </div>
                </div>
              </CalculationDetails>
            </div>
          );
        })}
      </div>

      {/* Separator */}
      <div className="my-8 border-t-2 border-green-500/30"></div>

      {/* Pain Points Section */}
      <div className="bg-gray-800/50 border-2 border-green-500 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Critical Finance Pain Points
            </span>
          </h2>
          <div className="bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/50">
            <span className="text-green-400 font-bold">{painPoints.length} Issues Identified</span>
          </div>
        </div>

        {painPoints.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No pain points data available. Check API connection.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {painPoints.map((painPoint) => (
            <details
              key={painPoint.id}
              className={`p-4 rounded-lg border ${getSeverityColor(painPoint.severity)}`}
            >
              <summary className="cursor-pointer font-semibold text-lg flex items-center justify-between text-white hover:text-green-400 transition-colors">
                <span>
                  {painPoint.id}. {painPoint.title}
                </span>
                <span className="ml-4 px-3 py-1 rounded-full text-xs font-bold bg-gray-700 text-white">
                  {painPoint.severity}
                </span>
              </summary>
              <div className="mt-4 space-y-3">
                <p className="text-gray-300">{painPoint.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-green-400">Affected Metric:</span>
                    <span className="text-gray-300 ml-2">{painPoint.affected_metric}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Current Value:</span>
                    <span className="text-gray-300 ml-2">{painPoint.current_value}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Target Value:</span>
                    <span className="text-gray-300 ml-2">{painPoint.target_value}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Estimated Cost:</span>
                    <span className="text-gray-300 ml-2">{painPoint.estimated_cost}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Responsible:</span>
                    <span className="text-gray-300 ml-2">{painPoint.responsible_department}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-green-400">Timeline:</span>
                    <span className="text-gray-300 ml-2">{painPoint.timeline}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-green-400">Recommended Actions:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    {painPoint.recommended_actions.map((action, idx) => (
                      <li key={idx} className="text-gray-300">{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardFinance;
