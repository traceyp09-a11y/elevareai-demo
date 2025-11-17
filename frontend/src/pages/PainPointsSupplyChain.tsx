import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, TrendingDown, DollarSign, Clock } from 'lucide-react';

interface PainPoint {
  id: string;
  title: string;
  description: string;
  impact: string;
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

export default function PainPointsSupplyChain() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [filteredPainPoints, setFilteredPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
      const response = await axios.get<PainPointsResponse>('/api/supplychain/pain-points');
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
      case 'Low': return 'border-blue-500 bg-blue-500/10 text-blue-400';
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'High': return <TrendingDown className="w-6 h-6 text-orange-400" />;
      case 'Medium': return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'Low': return <DollarSign className="w-6 h-6 text-blue-400" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading Supply Chain Pain Points...</div>
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
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent mb-2">
          Supply Chain Pain Points Analysis
        </h1>
        <p className="text-gray-400">
          Top 10 critical supply chain challenges requiring C-Suite attention and investment
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedSeverity('All')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            selectedSeverity === 'All'
              ? 'bg-orange-500 text-white'
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

      {/* Pain Points Grid */}
      <div className="space-y-6">
        {filteredPainPoints.map((painPoint, index) => {
          const isExpanded = expandedCard === painPoint.id;
          const severityColor = getSeverityColor(painPoint.severity);

          return (
            <div
              key={painPoint.id}
              className={`border-2 rounded-lg overflow-hidden transition-all ${severityColor}`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedCard(isExpanded ? null : painPoint.id)}
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getSeverityIcon(painPoint.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColor}`}>
                          {painPoint.severity}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{painPoint.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{painPoint.description}</p>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-900/50 rounded p-3">
                          <div className="text-xs text-gray-400">Affected Metric</div>
                          <div className="text-sm font-semibold text-orange-400 mt-1">
                            {painPoint.affected_metric}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-3">
                          <div className="text-xs text-gray-400">Current Value</div>
                          <div className="text-sm font-semibold text-red-400 mt-1">
                            {painPoint.current_value}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-3">
                          <div className="text-xs text-gray-400">Target Value</div>
                          <div className="text-sm font-semibold text-green-400 mt-1">
                            {painPoint.target_value}
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-3">
                          <div className="text-xs text-gray-400">Est. Cost Impact</div>
                          <div className="text-sm font-semibold text-yellow-400 mt-1">
                            {painPoint.estimated_cost}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white text-2xl ml-4">
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-700 bg-gray-900/30 p-6 space-y-6">
                  {/* Business Impact */}
                  <div>
                    <h4 className="text-sm font-semibold text-orange-400 mb-2 uppercase">Business Impact</h4>
                    <p className="text-gray-300">{painPoint.impact}</p>
                  </div>

                  {/* Recommended Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-orange-400 mb-3 uppercase">
                      Recommended Actions
                    </h4>
                    <ul className="space-y-2">
                      {painPoint.recommended_actions.map((action, idx) => (
                        <li key={idx} className="flex gap-3 text-gray-300">
                          <span className="text-orange-400 mt-1">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Responsible Department</div>
                      <div className="text-sm font-semibold text-white">
                        {painPoint.responsible_department}
                      </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="text-xs text-gray-400 mb-1">Implementation Timeline</div>
                      <div className="text-sm font-semibold text-white">{painPoint.timeline}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Total Critical Issues</div>
          <div className="text-4xl font-bold text-red-400">
            {painPoints.filter(p => p.severity === 'Critical').length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Immediate action required</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Total High Priority</div>
          <div className="text-4xl font-bold text-orange-400">
            {painPoints.filter(p => p.severity === 'High').length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Strategic planning needed</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-1">Total Medium Priority</div>
          <div className="text-4xl font-bold text-yellow-400">
            {painPoints.filter(p => p.severity === 'Medium').length}
          </div>
          <div className="text-xs text-gray-500 mt-2">Monitor and improve</div>
        </div>
      </div>

      {/* C-Suite Message */}
      <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-400 mb-2">
          💼 Executive Summary
        </h3>
        <p className="text-gray-300 text-sm">
          These supply chain pain points represent significant opportunities for operational improvement and cost reduction.
          Each issue includes specific, actionable recommendations with estimated cost impact and implementation timelines.
          Addressing these challenges can improve customer satisfaction, reduce working capital requirements, and enhance
          overall supply chain efficiency and profitability.
        </p>
      </div>
    </div>
  );
}
