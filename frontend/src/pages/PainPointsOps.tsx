import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PainPoint {
  rank: number;
  title: string;
  description: string;
  relatedKPIs: string[];
  severity: 'Critical' | 'High' | 'Medium';
}

export default function PainPointsOps() {
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    fetchPainPoints();
  }, []);

  const fetchPainPoints = async () => {
    try {
      const response = await fetch('/api/ops/pain-points');
      const data = await response.json();
      if (data.success) {
        setPainPoints(data.painPoints);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Operations pain points:', error);
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Operations Pain Points...</p>
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
            to="/ops"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            ← Back to Operations Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-600 bg-clip-text text-transparent mb-4">
            Top 10 Operations Pain Points
          </h1>
          <p className="text-gray-400 text-lg">
            Critical manufacturing, logistics, and supply chain challenges facing operations teams in industrial environments
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedSeverity('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedSeverity === 'all'
                ? 'bg-blue-500 text-white'
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
              <div className="absolute top-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl font-bold shadow-lg">
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
                <div className="text-sm text-gray-400 mb-2 font-semibold">Related Operations KPIs:</div>
                <div className="flex flex-wrap gap-2">
                  {painPoint.relatedKPIs.map((kpi, index) => (
                    <Link
                      key={index}
                      to={`/ops/kpi/${encodeURIComponent(kpi)}`}
                      className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-sm font-medium hover:bg-blue-500/30 hover:border-blue-400/60 transition-all"
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
            <div className="text-sm text-red-300 font-semibold mb-1">CRITICAL PAIN POINTS</div>
            <p className="text-xs text-gray-400">Require immediate executive attention and intervention</p>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-4xl font-bold text-orange-400 mb-2">
              {painPoints.filter(p => p.severity === 'High').length}
            </div>
            <div className="text-sm text-orange-300 font-semibold mb-1">HIGH PRIORITY ISSUES</div>
            <p className="text-xs text-gray-400">Need operational focus and resource allocation</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-xl">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {painPoints.filter(p => p.severity === 'Medium').length}
            </div>
            <div className="text-sm text-yellow-300 font-semibold mb-1">MEDIUM PRIORITY ITEMS</div>
            <p className="text-xs text-gray-400">Continuous improvement opportunities to optimize performance</p>
          </div>
        </div>

        {/* Industry Context */}
        <div className="mt-12 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Operations Excellence Context</h2>
          <div className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              These pain points represent the most common and impactful challenges facing manufacturing, logistics, and supply chain operations in industrial environments. They are ranked by their potential impact on:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-blue-400">Customer Satisfaction:</strong> On-time delivery, quality, and service reliability</li>
              <li><strong className="text-cyan-400">Operational Costs:</strong> Downtime, rework, inventory carrying costs, and waste</li>
              <li><strong className="text-teal-400">Financial Performance:</strong> Margins, working capital, and profitability</li>
              <li><strong className="text-green-400">Competitive Position:</strong> Lead times, flexibility, and market responsiveness</li>
            </ul>
            <p className="leading-relaxed mt-6">
              Addressing these pain points through the ElevareIQ analytics platform helps operations teams identify root causes, prioritize improvements, and measure the impact of operational excellence initiatives using real-time KPI tracking and transparent calculations.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Link
            to="/ops"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            ← Return to Operations Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
