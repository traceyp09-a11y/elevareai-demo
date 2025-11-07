import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, CheckCircle2, XCircle, Filter, Activity } from 'lucide-react';

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

interface APIResponse {
  success: boolean;
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  pain_points: PainPoint[];
}

const PainPointsQC: React.FC = () => {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [filteredPainPoints, setFilteredPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchPainPoints = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/qc/pain-points');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: APIResponse = await response.json();
      setPainPoints(data.pain_points);
      setFilteredPainPoints(data.pain_points);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pain points');
      console.error('Error fetching pain points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPainPoints();
    const interval = setInterval(fetchPainPoints, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSeverity === 'All') {
      setFilteredPainPoints(painPoints);
    } else {
      setFilteredPainPoints(painPoints.filter(pp => pp.severity === selectedSeverity));
    }
  }, [selectedSeverity, painPoints]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'High': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'Low': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return <XCircle className="w-5 h-5" />;
      case 'High': return <AlertTriangle className="w-5 h-5" />;
      case 'Medium': return <TrendingUp className="w-5 h-5" />;
      case 'Low': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-teal-400 text-lg">Loading QC Pain Points...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-8 max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-400 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-300 text-center mb-4">{error}</p>
          <button
            onClick={fetchPainPoints}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Quality Control Pain Points
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Activity className="w-4 h-4 animate-pulse text-teal-400" />
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <p className="text-gray-400 text-lg">
          Top 10 Quality Challenges Requiring C-Suite Attention • Q4 2024
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm font-medium mb-1">Critical</p>
              <p className="text-3xl font-bold text-white">
                {painPoints.filter(pp => pp.severity === 'Critical').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 backdrop-blur-sm border border-orange-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium mb-1">High</p>
              <p className="text-3xl font-bold text-white">
                {painPoints.filter(pp => pp.severity === 'High').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 backdrop-blur-sm border border-yellow-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium mb-1">Medium</p>
              <p className="text-3xl font-bold text-white">
                {painPoints.filter(pp => pp.severity === 'Medium').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-900/30 to-teal-950/30 backdrop-blur-sm border border-teal-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-400 text-sm font-medium mb-1">Total Issues</p>
              <p className="text-3xl font-bold text-white">{painPoints.length}</p>
            </div>
            <Activity className="w-8 h-8 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-3">
        <Filter className="w-5 h-5 text-teal-400" />
        <span className="text-gray-400">Filter by severity:</span>
        <div className="flex gap-2">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((severity) => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(severity)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedSeverity === severity
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Pain Points List */}
      <div className="space-y-6">
        {filteredPainPoints.map((painPoint, index) => (
          <div
            key={painPoint.id}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 font-bold text-lg flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{painPoint.title}</h3>
                  <p className="text-gray-400 mb-3">{painPoint.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getSeverityColor(painPoint.severity)}`}>
                      {getSeverityIcon(painPoint.severity)}
                      <span className="font-medium">{painPoint.severity}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/50">
                      <span className="font-medium">{painPoint.responsible_department}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-700/50 text-gray-300">
                      <span>Timeline: {painPoint.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-900/50 rounded-lg border border-teal-500/20">
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Impact</p>
                <p className="text-white font-medium">{painPoint.impact}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Affected Metric</p>
                <p className="text-teal-400 font-medium">{painPoint.affected_metric}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Estimated Cost</p>
                <p className="text-red-400 font-bold">{painPoint.estimated_cost}</p>
              </div>
            </div>

            {/* Current vs Target */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-900/50 rounded-lg border border-teal-500/20">
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Current Value</p>
                <p className="text-2xl font-bold text-red-400">{painPoint.current_value}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase mb-1">Target Value</p>
                <p className="text-2xl font-bold text-emerald-400">{painPoint.target_value}</p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
              <h4 className="text-teal-400 font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {painPoint.recommended_actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300">
                    <span className="text-teal-400 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPainPoints.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pain Points Found</h3>
          <p className="text-gray-400">
            {selectedSeverity === 'All'
              ? 'All quality metrics are within acceptable ranges.'
              : `No pain points with ${selectedSeverity} severity.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PainPointsQC;
