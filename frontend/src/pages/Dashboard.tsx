import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface KPIData {
  value: number;
  displayValue: string;
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
  kpis: {
    turnoverRate: KPIData;
    timeToHire: KPIData;
    costPerHire: KPIData;
    productivity: KPIData;
    trir: KPIData;
    absenteeism: KPIData;
    trainingROI: KPIData;
    engagement: KPIData;
    offerAcceptance: KPIData;
    revenuePerEmployee: KPIData;
  };
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AllKPIsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKPIs();
  }, []);

  const fetchKPIs = async () => {
    try {
      const response = await axios.get<AllKPIsResponse>('/api/kpis/current');
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPI data');
      setLoading(false);
    }
  };

  const getStatusColor = (status?: 'above' | 'at' | 'below', inverse: boolean = false) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    // For metrics where lower is better (costs, turnover, incidents)
    if (inverse) {
      if (status === 'below') return 'bg-green-100 text-green-800';
      if (status === 'above') return 'bg-red-100 text-red-800';
    } else {
      // For metrics where higher is better (revenue, engagement, acceptance)
      if (status === 'above') return 'bg-green-100 text-green-800';
      if (status === 'below') return 'bg-red-100 text-red-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (status?: 'above' | 'at' | 'below', inverse: boolean = false) => {
    if (!status) return '●';

    if (inverse) {
      if (status === 'below') return '↓';
      if (status === 'above') return '↑';
    } else {
      if (status === 'above') return '↑';
      if (status === 'below') return '↓';
    }
    return '●';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading KPI data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <p className="text-sm text-red-600 mt-2">Make sure the backend server is running on port 3001</p>
      </div>
    );
  }

  if (!data) return null;

  const kpiCards = [
    {
      name: 'Employee Turnover Rate',
      key: 'turnoverRate',
      data: data.kpis.turnoverRate,
      inverse: true,
      description: 'Monthly employee separations',
      icon: '👥'
    },
    {
      name: 'Time to Hire',
      key: 'timeToHire',
      data: data.kpis.timeToHire,
      inverse: true,
      description: 'Average days to fill position',
      icon: '⏱️'
    },
    {
      name: 'Cost per Hire',
      key: 'costPerHire',
      data: data.kpis.costPerHire,
      inverse: true,
      description: 'Total recruitment cost per hire',
      icon: '💰'
    },
    {
      name: 'Revenue per Employee',
      key: 'productivity',
      data: data.kpis.productivity,
      inverse: false,
      description: 'Productivity measure',
      icon: '📈'
    },
    {
      name: 'Safety Incident Rate (TRIR)',
      key: 'trir',
      data: data.kpis.trir,
      inverse: true,
      description: 'Per 200,000 hours worked',
      icon: '🛡️'
    },
    {
      name: 'Absenteeism Rate',
      key: 'absenteeism',
      data: data.kpis.absenteeism,
      inverse: true,
      description: 'Unplanned absences',
      icon: '📅'
    },
    {
      name: 'Training ROI',
      key: 'trainingROI',
      data: data.kpis.trainingROI,
      inverse: false,
      description: 'Return on training investment',
      icon: '🎓'
    },
    {
      name: 'Employee Engagement',
      key: 'engagement',
      data: data.kpis.engagement,
      inverse: false,
      description: 'Latest survey score',
      icon: '💙'
    },
    {
      name: 'Offer Acceptance Rate',
      key: 'offerAcceptance',
      data: data.kpis.offerAcceptance,
      inverse: false,
      description: 'Job offers accepted',
      icon: '✅'
    },
    {
      name: 'Revenue per Employee',
      key: 'revenuePerEmployee',
      data: data.kpis.revenuePerEmployee,
      inverse: false,
      description: 'Enterprise efficiency',
      icon: '💵'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">HR Analytics Dashboard</h2>
        <p className="text-blue-100 mb-4">TitanBuild Manufacturing & Logistics</p>
        <div className="flex items-center space-x-6 text-sm">
          <div>
            <span className="text-blue-200">Period:</span>
            <span className="ml-2 font-semibold">{data.period.label}</span>
          </div>
          <div>
            <span className="text-blue-200">Total Employees:</span>
            <span className="ml-2 font-semibold">847</span>
          </div>
          <div>
            <span className="text-blue-200">Facilities:</span>
            <span className="ml-2 font-semibold">4</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">$87.5M</div>
          <div className="text-xs text-green-600 mt-1">+4.9% YoY</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Labor Costs</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">$46.6M</div>
          <div className="text-xs text-gray-600 mt-1">53.2% of revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Operating Income</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">$12.3M</div>
          <div className="text-xs text-gray-600 mt-1">14.0% margin</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">HR Budget</div>
          <div className="text-2xl font-bold text-gray-900 mt-2">$2.5M</div>
          <div className="text-xs text-green-600 mt-1">Within budget</div>
        </div>
      </div>

      {/* Top 10 KPIs Grid */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Top 10 HR KPIs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiCards.map((kpi) => (
            <Link
              key={kpi.key}
              to={`/kpi/${kpi.key}`}
              className="metric-card block group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-3xl mb-2">{kpi.icon}</div>
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                    {kpi.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{kpi.description}</p>
                </div>
                {kpi.data.benchmark && (
                  <span className={`badge ${getStatusColor(kpi.data.benchmark.status, kpi.inverse)}`}>
                    {getStatusIcon(kpi.data.benchmark.status, kpi.inverse)} vs Benchmark
                  </span>
                )}
              </div>

              <div className="metric-value mt-4">{kpi.data.displayValue}</div>

              {kpi.data.benchmark && (
                <div className="mt-2 text-xs text-gray-600">
                  Benchmark: {kpi.data.benchmark.value}
                  {kpi.name.includes('Rate') || kpi.name.includes('ROI') ? '%' : kpi.name.includes('$') ? '' : ''}
                </div>
              )}

              <div className="mt-4 text-xs text-blue-600 group-hover:text-blue-800 font-medium">
                View detailed calculations →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              All Calculations are Transparent & Auditable
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Click on any KPI card to see the complete calculation breakdown, including formulas,
                data sources, step-by-step calculations, and industry benchmarks. All metrics feed
                into executive dashboards for CEO and CFO decision-making.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
