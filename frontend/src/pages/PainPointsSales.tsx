import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingDown, DollarSign, Clock } from 'lucide-react';

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

interface PainPointsResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  pain_points: PainPoint[];
}

export default function PainPointsSales() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [filteredPainPoints, setFilteredPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    fetchPainPoints();
  }, []);

  useEffect(() => {
    if (selectedSeverity === 'All') {
      setFilteredPainPoints(painPoints);
    } else {
      setFilteredPainPoints(painPoints.filter(pp => pp.severity === selectedSeverity));
    }
  }, [selectedSeverity, painPoints]);

  const fetchPainPoints = async () => {
    try {
      const response = await axios.get<PainPointsResponse>('/api/sales/pain-points');
      setPainPoints(response.data.pain_points);
      setFilteredPainPoints(response.data.pain_points);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'Critical': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'High': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'Medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      case 'Low': return 'border-amber-500 bg-amber-500/10 text-amber-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'High': return <TrendingDown className="w-6 h-6 text-orange-400" />;
      case 'Medium': return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'Low': return <DollarSign className="w-6 h-6 text-amber-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading Sales Pain Points...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2">
          Sales & Revenue Pain Points Analysis
        </h1>
        <p className="text-gray-400">
          Top 10 critical revenue challenges requiring C-Suite attention
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedSeverity('All')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSeverity === 'All'
              ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({painPoints.length})
        </button>
        <button
          onClick={() => setSelectedSeverity('Critical')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSeverity === 'Critical'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Critical ({painPoints.filter(p => p.severity === 'Critical').length})
        </button>
        <button
          onClick={() => setSelectedSeverity('High')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSeverity === 'High'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          High ({painPoints.filter(p => p.severity === 'High').length})
        </button>
        <button
          onClick={() => setSelectedSeverity('Medium')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSeverity === 'Medium'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Medium ({painPoints.filter(p => p.severity === 'Medium').length})
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg">
          <div className="text-sm text-gray-400">Total Issues</div>
          <div className="text-3xl font-bold text-white">{filteredPainPoints.length}</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
          <div className="text-sm text-red-300">Critical</div>
          <div className="text-3xl font-bold text-red-400">
            {painPoints.filter(p => p.severity === 'Critical').length}
          </div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg">
          <div className="text-sm text-orange-300">High</div>
          <div className="text-3xl font-bold text-orange-400">
            {painPoints.filter(p => p.severity === 'High').length}
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
          <div className="text-sm text-yellow-300">Medium</div>
          <div className="text-3xl font-bold text-yellow-400">
            {painPoints.filter(p => p.severity === 'Medium').length}
          </div>
        </div>
      </div>

      {/* Pain Points Cards */}
      <div className="space-y-4">
        {filteredPainPoints.map((painPoint) => (
          <div
            key={painPoint.id}
            className={`border-2 rounded-lg p-6 transition-all ${getSeverityColor(painPoint.severity)}`}
          >
            {/* Card Header */}
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedCard(expandedCard === painPoint.id ? null : painPoint.id)}
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">
                  {getSeverityIcon(painPoint.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {painPoint.id}. {painPoint.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(painPoint.severity)}`}>
                      {painPoint.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{painPoint.description}</p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Current:</span>
                      <span className="ml-2 font-semibold text-red-400">{painPoint.current_value}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Target:</span>
                      <span className="ml-2 font-semibold text-green-400">{painPoint.target_value}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Cost Impact:</span>
                      <span className="ml-2 font-semibold text-yellow-400">{painPoint.estimated_cost}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timeline:</span>
                      <span className="ml-2 font-semibold text-amber-400">{painPoint.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse Icon */}
              <button className="text-gray-400 hover:text-white ml-4">
                {expandedCard === painPoint.id ? '−' : '+'}
              </button>
            </div>

            {/* Expanded Content */}
            {expandedCard === painPoint.id && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Affected Metric */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">Affected Metric</h4>
                    <p className="text-gray-300">{painPoint.affected_metric}</p>
                  </div>

                  {/* Responsible Department */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-400 mb-2">Responsible</h4>
                    <p className="text-gray-300">{painPoint.responsible_department}</p>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-amber-400 mb-3">Recommended Actions</h4>
                  <ul className="space-y-2">
                    {painPoint.recommended_actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-amber-400 mt-1">→</span>
                        <span className="text-gray-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPainPoints.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No pain points found for the selected filter.</p>
        </div>
      )}
    </div>
  );
}
