/**
 * Executive Recommendations Component
 * AI-powered strategic recommendations based on data analysis
 */

import React from 'react';
import { Lightbulb, AlertCircle, TrendingUp, Target, CheckCircle2, Clock, DollarSign } from 'lucide-react';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedROI?: number;
  timeline: string;
  kpisAffected: string[];
  actionItems: string[];
  risks: string[];
  dependencies?: string[];
}

interface ExecutiveRecommendationsProps {
  recommendations: Recommendation[];
}

const ExecutiveRecommendations: React.FC<ExecutiveRecommendationsProps> = ({ recommendations }) => {
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  // Group by category
  const categorized = sortedRecommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical': return 'red';
      case 'high': return 'amber';
      case 'medium': return 'cyan';
      case 'low': return 'gray';
    }
  };

  const getImpactColor = (impact: Recommendation['impact']) => {
    switch (impact) {
      case 'high': return 'green';
      case 'medium': return 'cyan';
      case 'low': return 'gray';
    }
  };

  const getEffortIcon = (effort: Recommendation['effort']) => {
    const bars = effort === 'high' ? 3 : effort === 'medium' ? 2 : 1;
    return (
      <div className="flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-1 h-3 rounded-sm ${
              i < bars ? 'bg-gray-400' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate quick stats
  const criticalCount = recommendations.filter(r => r.priority === 'critical').length;
  const highImpactCount = recommendations.filter(r => r.impact === 'high').length;
  const quickWinsCount = recommendations.filter(r => r.impact === 'high' && r.effort === 'low').length;
  const avgROI = recommendations
    .filter(r => r.estimatedROI !== undefined)
    .reduce((sum, r) => sum + (r.estimatedROI || 0), 0) /
    recommendations.filter(r => r.estimatedROI !== undefined).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-red-400 text-sm font-medium">Critical Actions</div>
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {criticalCount}
          </div>
          <div className="text-xs text-red-300">
            Require immediate attention
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-green-400 text-sm font-medium">High Impact</div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {highImpactCount}
          </div>
          <div className="text-xs text-green-300">
            Strategic priorities
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-cyan-400 text-sm font-medium">Quick Wins</div>
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {quickWinsCount}
          </div>
          <div className="text-xs text-cyan-300">
            High impact, low effort
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-purple-400 text-sm font-medium">Avg Est. ROI</div>
            <DollarSign className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {isNaN(avgROI) ? 'N/A' : `${avgROI.toFixed(0)}%`}
          </div>
          <div className="text-xs text-purple-300">
            Expected return
          </div>
        </div>
      </div>

      {/* Recommendations by Category */}
      {Object.entries(categorized).map(([category, recs]) => (
        <div key={category} className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 uppercase tracking-wide">
            {category}
          </h3>

          <div className="space-y-4">
            {recs.map((rec) => {
              const priorityColor = getPriorityColor(rec.priority);
              const impactColor = getImpactColor(rec.impact);

              return (
                <div
                  key={rec.id}
                  className={`bg-gray-900/50 border-l-4 rounded-lg p-5 ${
                    rec.priority === 'critical' ? 'border-red-500' :
                    rec.priority === 'high' ? 'border-amber-500' :
                    rec.priority === 'medium' ? 'border-cyan-500' :
                    'border-gray-500'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-md font-semibold text-white">{rec.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${priorityColor}-500/20 text-${priorityColor}-400 border border-${priorityColor}-500/50`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{rec.description}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Impact:</span>
                      <span className={`font-semibold text-${impactColor}-400`}>
                        {rec.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Effort:</span>
                      {getEffortIcon(rec.effort)}
                      <span className="text-gray-400">{rec.effort}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">{rec.timeline}</span>
                    </div>
                    {rec.estimatedROI && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">
                          {rec.estimatedROI}% ROI
                        </span>
                      </div>
                    )}
                  </div>

                  {/* KPIs Affected */}
                  {rec.kpisAffected.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        KPIs Affected:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.kpisAffected.map((kpi, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cyan-500/10 text-cyan-300 text-xs rounded border border-cyan-500/30"
                          >
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Action Items:
                    </div>
                    <ul className="space-y-1.5">
                      {rec.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  {rec.risks.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Risks & Considerations:
                      </div>
                      <ul className="space-y-1.5">
                        {rec.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-amber-300">
                            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dependencies */}
                  {rec.dependencies && rec.dependencies.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                        Dependencies:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rec.dependencies.map((dep, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded border border-purple-500/30"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Strategic Guidance */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-md font-semibold text-white mb-3">Strategic Implementation Guidance</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <strong className="text-white">Prioritization Framework:</strong> Focus first on{' '}
                {criticalCount > 0 ? (
                  <>
                    <span className="text-red-400 font-semibold">{criticalCount} critical items</span>, then{' '}
                  </>
                ) : ''}
                <span className="text-cyan-400 font-semibold">{quickWinsCount} quick wins</span>{' '}
                (high impact, low effort) to build momentum before tackling high-effort strategic initiatives.
              </p>

              <p>
                <strong className="text-white">Resource Allocation:</strong> High-impact recommendations with estimated ROI{' '}
                &gt;150% should receive priority funding. Consider phased implementation for high-effort items to manage risk.
              </p>

              <p>
                <strong className="text-white">Timeline Considerations:</strong> Balance short-term wins (0-3 months) with{' '}
                long-term strategic investments (6-12 months) to maintain consistent progress and stakeholder confidence.
              </p>

              <p>
                <strong className="text-white">Risk Mitigation:</strong> All recommendations include identified risks.{' '}
                Develop contingency plans for critical and high-priority items before implementation begins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveRecommendations;
