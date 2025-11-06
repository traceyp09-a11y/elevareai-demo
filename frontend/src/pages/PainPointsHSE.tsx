import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PainPoint {
  rank: number;
  title: string;
  description: string;
  relatedKPIs: string[];
  severity: 'Critical' | 'High' | 'Medium';
}

export default function PainPointsHSE() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    fetchPainPoints();
  }, []);

  const fetchPainPoints = async () => {
    try {
      const response = await fetch('/api/hse/pain-points');
      const data = await response.json();
      if (data.success) {
        setPainPoints(data.painPoints);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching HSE pain points:', error);
      setLoading(false);
    }
  };

  const filteredPainPoints = painPoints.filter(pp =>
    selectedSeverity === 'all' || pp.severity === selectedSeverity
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'from-red-500/20 to-red-600/20 border-red-500/40 text-red-400';
      case 'High':
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/40 text-orange-400';
      case 'Medium':
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 text-yellow-400';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/40 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return '🚨';
      case 'High':
        return '⚠️';
      case 'Medium':
        return '📋';
      default:
        return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading HSE Pain Points...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/hse"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-4 transition-colors"
          >
            ← Back to HSE Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Top 10 HSE Pain Points
          </h1>
          <p className="text-gray-400 text-lg">
            Critical health, safety, and environmental challenges facing manufacturing, construction, and logistics operations
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedSeverity('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            All ({painPoints.length})
          </button>
          <button
            onClick={() => setSelectedSeverity('Critical')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'Critical'
                ? 'bg-red-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            Critical ({painPoints.filter(p => p.severity === 'Critical').length})
          </button>
          <button
            onClick={() => setSelectedSeverity('High')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'High'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            High ({painPoints.filter(p => p.severity === 'High').length})
          </button>
          <button
            onClick={() => setSelectedSeverity('Medium')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'Medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            Medium ({painPoints.filter(p => p.severity === 'Medium').length})
          </button>
        </div>

        {/* Pain Points Grid */}
        <div className="space-y-6">
          {filteredPainPoints.map((painPoint) => (
            <div
              key={painPoint.rank}
              className={`
                relative overflow-hidden rounded-2xl p-8 backdrop-blur-xl
                border-2 bg-gradient-to-br ${getSeverityColor(painPoint.severity)}
                hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl
              `}
            >
              {/* Rank Badge */}
              <div className="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                #{painPoint.rank}
              </div>

              {/* Severity Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">{getSeverityIcon(painPoint.severity)}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  painPoint.severity === 'Critical' ? 'bg-red-500/30 text-red-300' :
                  painPoint.severity === 'High' ? 'bg-orange-500/30 text-orange-300' :
                  'bg-yellow-500/30 text-yellow-300'
                }`}>
                  {painPoint.severity.toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 text-white pr-20">
                {painPoint.title}
              </h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {painPoint.description}
              </p>

              {/* Related KPIs */}
              <div className="border-t border-white/10 pt-4">
                <div className="text-sm text-gray-400 mb-2 font-semibold">Related HSE KPIs:</div>
                <div className="flex flex-wrap gap-2">
                  {painPoint.relatedKPIs.map((kpi, index) => (
                    <Link
                      key={index}
                      to={`/hse/kpi/${encodeURIComponent(kpi)}`}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-sm font-medium hover:bg-cyan-500/30 hover:border-cyan-400/60 transition-all"
                    >
                      {kpi}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-4xl font-bold text-red-400 mb-2">
              {painPoints.filter(p => p.severity === 'Critical').length}
            </div>
            <div className="text-gray-300 font-semibold">Critical Issues</div>
            <div className="text-gray-500 text-sm mt-1">Require immediate attention</div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {painPoints.filter(p => p.severity === 'High').length}
            </div>
            <div className="text-gray-300 font-semibold">High Priority</div>
            <div className="text-gray-500 text-sm mt-1">Need proactive management</div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {painPoints.filter(p => p.severity === 'Medium').length}
            </div>
            <div className="text-gray-300 font-semibold">Medium Priority</div>
            <div className="text-gray-500 text-sm mt-1">Monitor and improve</div>
          </div>
        </div>

        {/* Action Card */}
        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-cyan-400">How ElevareIQ HSE Analytics Helps</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our platform provides real-time tracking of all 10 HSE KPIs, automated alerts for critical incidents,
                comprehensive incident investigations, compliance monitoring, and predictive analytics to identify
                risks before they become incidents. Transform your safety culture from reactive to proactive.
              </p>
              <Link
                to="/hse"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-cyan-500/50"
              >
                View HSE Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
