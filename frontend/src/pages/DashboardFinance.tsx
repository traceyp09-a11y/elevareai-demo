import React, { useEffect, useState } from 'react';
import axios from 'axios';

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
  const [selectedKPI, setSelectedKPI] = useState<KPIResult | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchFinanceData();
    const interval = setInterval(fetchFinanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [kpisResponse, painPointsResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/finance/kpis/current'),
        axios.get('http://localhost:3001/api/finance/pain-points'),
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
        return 'text-blue-600 bg-blue-100';
      case 'Good':
        return 'text-green-600 bg-green-100';
      case 'Warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'Critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'Excellent':
        return '🌟';
      case 'Good':
        return '✅';
      case 'Warning':
        return '⚠️';
      case 'Critical':
        return '🚨';
      default:
        return '📊';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading Finance Analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">No data available</div>
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 Finance Analytics Dashboard</h1>
        <p className="text-gray-600">
          Real-time financial performance metrics and insights
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total KPIs</p>
              <p className="text-2xl font-bold text-gray-900">{kpiArray.length}</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Excellent</p>
              <p className="text-2xl font-bold text-blue-900">{statusCounts['Excellent'] || 0}</p>
            </div>
            <div className="text-3xl">🌟</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Good</p>
              <p className="text-2xl font-bold text-green-900">{statusCounts['Good'] || 0}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">Warning</p>
              <p className="text-2xl font-bold text-yellow-900">{statusCounts['Warning'] || 0}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Critical</p>
              <p className="text-2xl font-bold text-red-900">{statusCounts['Critical'] || 0}</p>
            </div>
            <div className="text-3xl">🚨</div>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌟</span>
            <span className="text-sm">Excellent: ≥110% of benchmark</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm">Good: 100-110% of benchmark</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚠️</span>
            <span className="text-sm">Warning: 80-100% of benchmark</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚨</span>
            <span className="text-sm">Critical: &lt;80% of benchmark</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {kpiArray.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-l-4 border-green-500"
            onClick={() => setSelectedKPI(selectedKPI?.kpiName === kpi.kpiName ? null : kpi)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{kpi.kpiName}</h3>
                <span className="text-2xl ml-2">{getStatusIcon(kpi.status)}</span>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-green-600">
                  {kpi.value.toLocaleString()}
                  <span className="text-lg ml-1">{kpi.unit}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Benchmark: {kpi.benchmark.toLocaleString()}{kpi.unit}
                </div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kpi.status)}`}>
                {kpi.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected KPI Detail Panel */}
      {selectedKPI && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-2 border-green-500">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{selectedKPI.kpiName} - Detailed Analysis</h2>
            <button
              onClick={() => setSelectedKPI(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Value vs Benchmark */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Current Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-bold text-green-600">
                    {selectedKPI.value.toLocaleString()} {selectedKPI.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Benchmark:</span>
                  <span className="font-bold">{selectedKPI.benchmark.toLocaleString()} {selectedKPI.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedKPI.status)}`}>
                    {selectedKPI.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Formula */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Calculation Formula</h3>
              <p className="text-sm font-mono bg-white p-3 rounded border border-gray-200">
                {selectedKPI.formula}
              </p>
            </div>

            {/* Components */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Components</h3>
              <div className="space-y-2">
                {Object.entries(selectedKPI.components).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-medium">
                      {typeof value === 'number' ? value.toLocaleString() : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Calculation Steps</h3>
              <ol className="space-y-2 text-sm">
                {selectedKPI.calculationSteps.map((step, idx) => (
                  <li key={idx} className="text-gray-700">{step}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Industry Context */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold mb-2 text-blue-900">Industry Context</h3>
            <p className="text-sm text-blue-800">{selectedKPI.industryContext}</p>
          </div>
        </div>
      )}

      {/* Pain Points Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Critical Finance Pain Points</h2>
        <div className="space-y-4">
          {painPoints.map((painPoint) => (
            <details
              key={painPoint.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(painPoint.severity)}`}
            >
              <summary className="cursor-pointer font-semibold text-lg flex items-center justify-between">
                <span>
                  {painPoint.id}. {painPoint.title}
                </span>
                <span className="ml-4 px-3 py-1 rounded-full text-sm font-bold">
                  {painPoint.severity}
                </span>
              </summary>
              <div className="mt-4 space-y-3">
                <p className="text-gray-700">{painPoint.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Affected Metric:</span> {painPoint.affected_metric}
                  </div>
                  <div>
                    <span className="font-semibold">Current Value:</span> {painPoint.current_value}
                  </div>
                  <div>
                    <span className="font-semibold">Target Value:</span> {painPoint.target_value}
                  </div>
                  <div>
                    <span className="font-semibold">Estimated Cost:</span> {painPoint.estimated_cost}
                  </div>
                  <div>
                    <span className="font-semibold">Responsible:</span> {painPoint.responsible_department}
                  </div>
                  <div>
                    <span className="font-semibold">Timeline:</span> {painPoint.timeline}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Recommended Actions:</span>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {painPoint.recommended_actions.map((action, idx) => (
                      <li key={idx} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardFinance;
