import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Heart, AlertCircle, Filter, ArrowLeft, Star, Smile,
  UserX, DollarSign, TrendingUp, Activity, Clock,
  CheckCircle, LifeBuoy
} from 'lucide-react';

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

const PainPointsCustomerSuccess: React.FC = () => {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [filteredPainPoints, setFilteredPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPainPoints = async () => {
      try {
        setLoading(true);
        const response = await axios.get<PainPointsResponse>(
          '/api/customer-success/pain-points'
        );

        if (response.data.success) {
          setPainPoints(response.data.painPoints);
          setFilteredPainPoints(response.data.painPoints);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching pain points:', err);
        setError('Failed to load pain points. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchPainPoints();
  }, []);

  useEffect(() => {
    let filtered = painPoints;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(pp => pp.severity === selectedSeverity);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pp => pp.category === selectedCategory);
    }

    setFilteredPainPoints(filtered);
  }, [selectedSeverity, selectedCategory, painPoints]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-500/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-blue-500 bg-blue-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'NPS':
        return <Heart size={20} className="text-teal-400" />;
      case 'CSAT':
        return <Star size={20} className="text-blue-400" />;
      case 'CES':
        return <Smile size={20} className="text-purple-400" />;
      case 'Churn':
        return <UserX size={20} className="text-red-400" />;
      case 'LTV':
        return <DollarSign size={20} className="text-green-400" />;
      case 'NRR':
        return <TrendingUp size={20} className="text-cyan-400" />;
      case 'Health Score':
        return <Activity size={20} className="text-lime-400" />;
      case 'Time to Value':
        return <Clock size={20} className="text-orange-400" />;
      case 'Adoption':
        return <CheckCircle size={20} className="text-emerald-400" />;
      case 'Support':
        return <LifeBuoy size={20} className="text-sky-400" />;
      default:
        return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  const categories = Array.from(new Set(painPoints.map(pp => pp.category)));
  const severityCounts = {
    high: painPoints.filter(pp => pp.severity === 'high').length,
    medium: painPoints.filter(pp => pp.severity === 'medium').length,
    low: painPoints.filter(pp => pp.severity === 'low').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Customer Success challenges...</p>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/customer-success"
          className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </a>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
            <AlertCircle size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
              Customer Success Challenges
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {filteredPainPoints.length} retention and experience issues identified
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">High Severity</p>
                <p className="text-2xl font-bold text-white mt-1">{severityCounts.high}</p>
              </div>
              <AlertCircle className="text-red-400" size={32} />
            </div>
          </div>

          <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Medium Severity</p>
                <p className="text-2xl font-bold text-white mt-1">{severityCounts.medium}</p>
              </div>
              <AlertCircle className="text-yellow-400" size={32} />
            </div>
          </div>

          <div className="bg-blue-900/20 border-2 border-blue-500/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Low Severity</p>
                <p className="text-2xl font-bold text-white mt-1">{severityCounts.low}</p>
              </div>
              <AlertCircle className="text-blue-400" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-teal-400" />
          <h3 className="text-lg font-semibold text-teal-400">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Severity Level
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Pain Points Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPainPoints.map((painPoint) => (
          <div
            key={painPoint.id}
            className={`bg-gray-800 rounded-lg border-2 ${getSeverityColor(painPoint.severity)} p-6 hover:shadow-xl transition-all duration-200`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {getCategoryIcon(painPoint.category)}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {painPoint.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadgeColor(painPoint.severity)}`}>
                      {painPoint.severity.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-700 text-teal-400">
                      {painPoint.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Description</h4>
                <p className="text-gray-300">{painPoint.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Business Impact</h4>
                <p className="text-gray-300">{painPoint.impact}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-teal-400 mb-1">Recommendation</h4>
                <p className="text-gray-300">{painPoint.recommendation}</p>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estimated Cost Impact</span>
                  <span className="text-lg font-bold text-red-400">{painPoint.estimatedCost}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPainPoints.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <p className="text-gray-400 text-lg">No challenges match the selected filters</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Customer Success & Experience Challenge Tracker</p>
        <p className="mt-1">Prioritized by severity and business impact</p>
      </div>
    </div>
  );
};

export default PainPointsCustomerSuccess;
