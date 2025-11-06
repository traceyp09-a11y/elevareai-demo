import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface PainPoint {
  rank: number;
  title: string;
  description: string;
  relatedKPIs: string[];
  severity: 'Critical' | 'High' | 'Medium';
}

interface PainPointsResponse {
  success: boolean;
  painPoints: PainPoint[];
}

function PainPoints() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PainPointsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPainPoints();
  }, []);

  const fetchPainPoints = async () => {
    try {
      const response = await axios.get<PainPointsResponse>('/api/pain-points');
      setData(response.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch pain points');
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return '🔴';
      case 'High':
        return '🟠';
      case 'Medium':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading pain points...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Top 10 HR Pain Points</h1>
        <p className="text-red-100 mb-4">
          Manufacturing, Construction & Logistics Industries - 2025
        </p>
        <div className="text-sm text-red-100">
          Based on comprehensive industry research and C-suite executive priorities
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🔴</div>
            <div>
              <div className="text-sm font-medium text-gray-600">Critical Issues</div>
              <div className="text-2xl font-bold text-red-600">
                {data.painPoints.filter(p => p.severity === 'Critical').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🟠</div>
            <div>
              <div className="text-sm font-medium text-gray-600">High Priority</div>
              <div className="text-2xl font-bold text-orange-600">
                {data.painPoints.filter(p => p.severity === 'High').length}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🟡</div>
            <div>
              <div className="text-sm font-medium text-gray-600">Medium Priority</div>
              <div className="text-2xl font-bold text-yellow-600">
                {data.painPoints.filter(p => p.severity === 'Medium').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pain Points List */}
      <div className="space-y-4">
        {data.painPoints.map((painPoint) => (
          <div
            key={painPoint.rank}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                    {painPoint.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {painPoint.title}
                      </h3>
                      <span className={`badge border ${getSeverityColor(painPoint.severity)}`}>
                        {getSeverityIcon(painPoint.severity)} {painPoint.severity}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-2">{painPoint.description}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  Related KPIs Tracking This Pain Point:
                </div>
                <div className="flex flex-wrap gap-2">
                  {painPoint.relatedKPIs.map((kpi, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      📊 {kpi}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Industry Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Industry Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Manufacturing</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Turnover rates: 15-20% annually</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Average time to hire: 42 days</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>TRIR benchmark: 3.5-4.2</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Construction</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>94% of firms struggle to fill craft positions</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Turnover rates: 21-25% annually</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 mr-2">•</span>
                <span>Workforce aged 25-54 declined 8%</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Logistics</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Turnover rates: 25-35% annually</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>Only 13% of workforce under 25</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>High demand for tech-savvy workers</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Overall Trends</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>82% of employees at risk of burnout</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>Only 26% feel engaged at work</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>75% of managers report feeling overwhelmed</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Actions</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-semibold text-gray-900">For HR Directors</h3>
            <p className="text-sm text-gray-700 mt-1">
              Focus on talent retention strategies, competitive compensation packages, and
              improving employee engagement scores through targeted initiatives.
            </p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-semibold text-gray-900">For VPs of HR</h3>
            <p className="text-sm text-gray-700 mt-1">
              Develop strategic workforce planning, succession programs for aging workforce,
              and ROI-driven training programs aligned with business objectives.
            </p>
          </div>
          <div className="border-l-4 border-purple-600 pl-4">
            <h3 className="font-semibold text-gray-900">For C-Suite</h3>
            <p className="text-sm text-gray-700 mt-1">
              Monitor KPIs that directly impact revenue per employee, labor cost ratios,
              and overall operational efficiency to drive strategic decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Link to Dashboard */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">
          Track these pain points with our comprehensive KPI dashboard
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          View KPI Dashboard →
        </Link>
      </div>
    </div>
  );
}

export default PainPoints;
