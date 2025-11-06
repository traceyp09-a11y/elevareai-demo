import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

interface KPIDetailData {
  success: boolean;
  kpi: string;
  value: number;
  displayValue: string;
  calculation: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  benchmark?: {
    value: number;
    status: 'above' | 'at' | 'below';
  };
  trend?: {
    previous: number;
    change: number;
    changePercent: number;
  };
}

const KPI_CONFIG: { [key: string]: { endpoint: string; title: string; icon: string } } = {
  turnoverRate: { endpoint: 'turnover', title: 'Employee Turnover Rate', icon: '👥' },
  timeToHire: { endpoint: 'time-to-hire', title: 'Time to Hire', icon: '⏱️' },
  costPerHire: { endpoint: 'cost-per-hire', title: 'Cost per Hire', icon: '💰' },
  productivity: { endpoint: 'productivity', title: 'Employee Productivity', icon: '📈' },
  trir: { endpoint: 'safety', title: 'Safety Incident Rate (TRIR)', icon: '🛡️' },
  absenteeism: { endpoint: 'absenteeism', title: 'Absenteeism Rate', icon: '📅' },
  trainingROI: { endpoint: 'training-roi', title: 'Training ROI', icon: '🎓' },
  engagement: { endpoint: 'engagement', title: 'Employee Engagement Score', icon: '💙' },
  offerAcceptance: { endpoint: 'offer-acceptance', title: 'Offer Acceptance Rate', icon: '✅' },
  revenuePerEmployee: { endpoint: 'revenue-per-employee', title: 'Revenue per Employee', icon: '💵' }
};

function KPIDetail() {
  const { kpiName } = useParams<{ kpiName: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KPIDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kpiName && KPI_CONFIG[kpiName]) {
      fetchKPIDetail();
    } else {
      setError('Invalid KPI name');
      setLoading(false);
    }
  }, [kpiName]);

  const fetchKPIDetail = async () => {
    if (!kpiName) return;

    try {
      const config = KPI_CONFIG[kpiName];
      const response = await axios.get<KPIDetailData>(`/api/kpis/${config.endpoint}`);
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPI detail');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading KPI details...</div>
      </div>
    );
  }

  if (error || !data || !kpiName) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error || 'Failed to load KPI'}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const config = KPI_CONFIG[kpiName];

  const renderComponentValue = (key: string, value: any): JSX.Element => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <div className="ml-4 mt-2 space-y-1">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey} className="text-sm">
              <span className="font-medium text-gray-700">{subKey}:</span>{' '}
              <span className="text-gray-900">{renderComponentValue(subKey, subValue)}</span>
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'number') {
      if (key.toLowerCase().includes('cost') || key.toLowerCase().includes('revenue') ||
          key.toLowerCase().includes('income') || key.toLowerCase().includes('budget')) {
        return <>{`$${value.toLocaleString()}`}</>;
      }
      return <>{value.toLocaleString()}</>;
    }

    return <>{String(value)}</>;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{config.icon}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
              <p className="text-gray-600 mt-1">Detailed Calculation Breakdown</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Value</div>
            <div className="text-4xl font-bold text-blue-600">{data.displayValue}</div>
            {data.benchmark && (
              <div className="text-sm text-gray-600 mt-2">
                Benchmark: {data.benchmark.value}
                {config.title.includes('Rate') || config.title.includes('ROI') ? '%' : ''}
                {' '}
                <span className={
                  data.benchmark.status === 'below' ? 'text-green-600' :
                  data.benchmark.status === 'above' ? 'text-red-600' :
                  'text-yellow-600'
                }>
                  ({data.benchmark.status})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Formula</h2>
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <code className="text-blue-900 font-mono text-sm">{data.calculation.formula}</code>
        </div>
      </div>

      {/* Calculation Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Step-by-Step Calculation</h2>
        <div className="space-y-3">
          {data.calculation.steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-gray-800 font-mono text-sm whitespace-pre-wrap">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Components Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data.calculation.components).map(([key, value]) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-gray-900">
                {renderComponentValue(key, value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <div className="font-semibold text-gray-900">HRIS System</div>
              <div className="text-sm text-gray-600">Employee records & demographics</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-semibold text-gray-900">Time Tracking</div>
              <div className="text-sm text-gray-600">Hours worked & attendance</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-semibold text-gray-900">Financial System</div>
              <div className="text-sm text-gray-600">Revenue & cost data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Context */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Industry Context</h2>
        <p className="text-gray-700 mb-4">
          This metric is particularly important for manufacturing, construction, and logistics
          industries where C-suite executives use it to:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Track operational efficiency and workforce productivity</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Make informed decisions about resource allocation</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Compare performance against industry benchmarks</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Identify trends and predict future performance</span>
          </li>
        </ul>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Export & Share</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Export to PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
            Export to Excel
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium">
            Share with C-Suite
          </button>
        </div>
      </div>
    </div>
  );
}

export default KPIDetail;
