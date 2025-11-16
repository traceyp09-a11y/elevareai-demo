import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, DollarSign, Target, Users, BarChart3, Award,
  MousePointerClick, FileText, Radio, Zap, ChevronDown,
  ChevronUp, AlertCircle
} from 'lucide-react';
import CalculationDetails from '../components/CalculationDetails';

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
    marketingROI: KPI;
    costPerLead: KPI;
    mqlToSqlConversion: KPI;
    customerAcquisitionCost: KPI;
    mqlsGenerated: KPI;
    campaignEffectiveness: KPI;
    leadToCustomerRate: KPI;
    avgDealSize: KPI;
    channelROI: KPI;
    contentEngagement: KPI;
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

const DashboardMarketing: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIResponse | null>(null);
  const [painPoints, setPainPoints] = useState<PainPointsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kpisResponse, painPointsResponse] = await Promise.all([
          axios.get('/api/marketing/kpis/current'),
          axios.get('/api/marketing/pain-points')
        ]);

        setKpiData(kpisResponse.data);
        setPainPoints(painPointsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Marketing data:', err);
        setError('Failed to load Marketing data. Please ensure the backend is running.');
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
    const calculation = {
      formula: kpi.formula,
      components: kpi.dataPoints,
      steps: [] as string[]
    };

    return (
      <div key={kpiKey} className="group">
        <CalculationDetails kpiName={kpi.name} calculation={calculation}>
          <div className={`bg-gray-800 rounded-lg border-2 ${getStatusColor(kpi.status)} p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}>
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
          </div>
        </CalculationDetails>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Marketing data...</p>
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
          <div className="p-3 rounded-lg bg-gradient-to-br from-orange-400 to-red-500">
            <Radio size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Marketing Analytics Dashboard
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
                  Marketing Performance Issues Detected
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {painPoints.count} marketing challenges need attention to improve ROI and lead generation efficiency.
                </p>
                <a
                  href="/marketing/pain-points"
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
          'marketingROI',
          kpiData.kpis.marketingROI,
          <TrendingUp size={24} className="text-white" />,
          'from-orange-400 to-red-500'
        )}

        {renderKPICard(
          'costPerLead',
          kpiData.kpis.costPerLead,
          <DollarSign size={24} className="text-white" />,
          'from-green-400 to-emerald-500'
        )}

        {renderKPICard(
          'mqlToSqlConversion',
          kpiData.kpis.mqlToSqlConversion,
          <Target size={24} className="text-white" />,
          'from-blue-400 to-cyan-500'
        )}

        {renderKPICard(
          'customerAcquisitionCost',
          kpiData.kpis.customerAcquisitionCost,
          <Users size={24} className="text-white" />,
          'from-purple-400 to-pink-500'
        )}

        {renderKPICard(
          'mqlsGenerated',
          kpiData.kpis.mqlsGenerated,
          <BarChart3 size={24} className="text-white" />,
          'from-yellow-400 to-orange-500'
        )}

        {renderKPICard(
          'campaignEffectiveness',
          kpiData.kpis.campaignEffectiveness,
          <Award size={24} className="text-white" />,
          'from-indigo-400 to-purple-500'
        )}

        {renderKPICard(
          'leadToCustomerRate',
          kpiData.kpis.leadToCustomerRate,
          <MousePointerClick size={24} className="text-white" />,
          'from-teal-400 to-cyan-500'
        )}

        {renderKPICard(
          'avgDealSize',
          kpiData.kpis.avgDealSize,
          <FileText size={24} className="text-white" />,
          'from-lime-400 to-green-500'
        )}

        {renderKPICard(
          'channelROI',
          kpiData.kpis.channelROI,
          <Radio size={24} className="text-white" />,
          'from-orange-400 to-amber-500'
        )}

        {renderKPICard(
          'contentEngagement',
          kpiData.kpis.contentEngagement,
          <Zap size={24} className="text-white" />,
          'from-pink-400 to-rose-500'
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Marketing Analytics Dashboard</p>
        <p className="mt-1">Data updated in real-time from campaigns, leads, and channel performance</p>
      </div>
    </div>
  );
};

export default DashboardMarketing;
