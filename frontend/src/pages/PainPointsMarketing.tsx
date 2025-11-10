import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Radio, AlertCircle, Filter, ArrowLeft, TrendingUp, DollarSign,
  Target, Users, BarChart3, Award, MousePointerClick, FileText, Zap, CheckCircle
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

const PainPointsMarketing: React.FC = () => {
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
          '/api/marketing/pain-points'
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
    if (category.includes('ROI')) {
      return <TrendingUp size={20} className="text-orange-400" />;
    }
    if (category.includes('Cost') || category.includes('CAC')) {
      return <DollarSign size={20} className="text-green-400" />;
    }
    if (category.includes('MQL') || category.includes('Lead')) {
      return <Target size={20} className="text-blue-400" />;
    }
    if (category.includes('Campaign')) {
      return <Radio size={20} className="text-purple-400" />;
    }
    if (category.includes('Channel')) {
      return <BarChart3 size={20} className="text-cyan-400" />;
    }
    if (category.includes('Content')) {
      return <FileText size={20} className="text-yellow-400" />;
    }
    return <Zap size={20} className="text-orange-400" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Marketing challenges...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a
              href="/marketing"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </a>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent mb-2">
            Marketing Performance Challenges
          </h1>
          <p className="text-gray-400 text-lg">
            Identified marketing issues prioritized by severity and business impact
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-semibold">High Severity</p>
                <p className="text-3xl font-bold text-white">{severityCounts.high}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-semibold">Medium Severity</p>
                <p className="text-3xl font-bold text-white">{severityCounts.medium}</p>
              </div>
              <AlertCircle className="text-yellow-500" size={32} />
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-semibold">Low Severity</p>
                <p className="text-3xl font-bold text-white">{severityCounts.low}</p>
              </div>
              <CheckCircle className="text-blue-500" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="text-orange-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Severity Level
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
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
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
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
              className={`${getSeverityColor(painPoint.severity)} border-2 rounded-lg p-6 hover:shadow-lg transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(painPoint.category)}
                  <h3 className="text-xl font-bold text-white">{painPoint.title}</h3>
                </div>
                <span className={`${getSeverityBadgeColor(painPoint.severity)} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                  {painPoint.severity}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-sm font-semibold mb-1">Category:</p>
                <p className="text-orange-400 text-sm">{painPoint.category}</p>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-sm font-semibold mb-1">Description:</p>
                <p className="text-gray-300">{painPoint.description}</p>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-sm font-semibold mb-1">Business Impact:</p>
                <p className="text-gray-300">{painPoint.impact}</p>
              </div>

              <div className="mb-3">
                <p className="text-gray-400 text-sm font-semibold mb-1">Recommendation:</p>
                <p className="text-green-400">{painPoint.recommendation}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div>
                  <p className="text-gray-400 text-sm">Estimated Cost Impact:</p>
                  <p className="text-red-400 font-bold">{painPoint.estimatedCost}</p>
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
          <p>Marketing Performance Challenge Tracker</p>
          <p className="mt-1">Prioritized by severity and business impact</p>
        </div>
      </div>
    </div>
  );
};

export default PainPointsMarketing;
