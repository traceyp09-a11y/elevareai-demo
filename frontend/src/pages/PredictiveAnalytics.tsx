import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface RiskScore {
  facilityId: number;
  facilityName: string;
  overallRisk: number;
  incidentRisk: number;
  complianceRisk: number;
  behavioralRisk: number;
  trend: 'improving' | 'stable' | 'declining';
  predictedIncidents: number;
}

interface TrendForecast {
  metric: string;
  currentValue: number;
  forecast: Array<{
    month: string;
    predicted: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  }>;
}

interface Anomaly {
  date: string;
  metric: string;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

interface Insight {
  type: 'warning' | 'opportunity' | 'critical' | 'info';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  relatedMetrics: string[];
}

export default function PredictiveAnalytics() {
  const [loading, setLoading] = useState(true);
  const [riskScores, setRiskScores] = useState<RiskScore[]>([]);
  const [forecasts, setForecasts] = useState<TrendForecast[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    fetchPredictiveAnalytics();
  }, []);

  const fetchPredictiveAnalytics = async () => {
    try {
      const response = await fetch('/api/predictive/all');
      const data = await response.json();

      if (data.success) {
        setRiskScores(data.riskScores);
        setForecasts(data.forecasts);
        setAnomalies(data.anomalies);
        setInsights(data.insights);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictive analytics:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'from-red-500 to-red-600';
    if (risk >= 50) return 'from-orange-500 to-orange-600';
    if (risk >= 30) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getRiskBorderColor = (risk: number) => {
    if (risk >= 70) return 'border-red-500/50';
    if (risk >= 50) return 'border-orange-500/50';
    if (risk >= 30) return 'border-yellow-500/50';
    return 'border-green-500/50';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'opportunity': return '💡';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'critical': return 'from-red-500/20 to-red-600/20 border-red-500/40';
      case 'warning': return 'from-orange-500/20 to-orange-600/20 border-orange-500/40';
      case 'opportunity': return 'from-green-500/20 to-green-600/20 border-green-500/40';
      case 'info': return 'from-blue-500/20 to-blue-600/20 border-blue-500/40';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/40';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Analyzing data and generating predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/hse"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            ← Back to HSE Dashboard
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
            🔮 Predictive Safety Analytics
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered risk prediction, trend forecasting, and proactive safety insights
          </p>
        </div>

        {/* Risk Scores Heat Map */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">🎯 Facility Risk Scores</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {riskScores.map((risk) => (
              <div
                key={risk.facilityId}
                className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border-2 ${getRiskBorderColor(risk.overallRisk)} bg-gradient-to-br ${getRiskColor(risk.overallRisk)}/10`}
              >
                {/* Facility Name */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{risk.facilityName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-400">Trend:</span>
                    <span className={`text-sm font-semibold ${
                      risk.trend === 'improving' ? 'text-green-400' :
                      risk.trend === 'declining' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {risk.trend === 'improving' ? '↓ Improving' :
                       risk.trend === 'declining' ? '↑ Declining' : '→ Stable'}
                    </span>
                  </div>
                </div>

                {/* Overall Risk Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Overall Risk</span>
                    <span className="text-3xl font-bold">{risk.overallRisk}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getRiskColor(risk.overallRisk)}`}
                      style={{ width: `${risk.overallRisk}%` }}
                    ></div>
                  </div>
                </div>

                {/* Risk Breakdown */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Incident</div>
                    <div className="text-lg font-bold">{risk.incidentRisk}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Compliance</div>
                    <div className="text-lg font-bold">{risk.complianceRisk}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Behavioral</div>
                    <div className="text-lg font-bold">{risk.behavioralRisk}</div>
                  </div>
                </div>

                {/* Predicted Incidents */}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Predicted incidents (30 days)</span>
                    <span className={`text-lg font-bold ${
                      risk.predictedIncidents === 0 ? 'text-green-400' :
                      risk.predictedIncidents <= 2 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {risk.predictedIncidents}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forecasts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">📈 6-Month Safety Forecasts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecasts.map((forecast) => (
              <div
                key={forecast.metric}
                className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20"
              >
                <h3 className="text-xl font-semibold mb-4 text-purple-300">{forecast.metric}</h3>
                <div className="mb-4">
                  <span className="text-sm text-gray-400">Current Value: </span>
                  <span className="text-2xl font-bold text-white">{forecast.currentValue.toFixed(2)}</span>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={forecast.forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="#a78bfa"
                      fill="#a78bfa"
                      fillOpacity={0.2}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                      strokeWidth={3}
                      name="Predicted"
                    />
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="#a78bfa"
                      fill="#a78bfa"
                      fillOpacity={0.2}
                      name="Lower Bound"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>

        {/* Anomalies */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">🔍 Detected Anomalies</h2>
          {anomalies.length === 0 ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-400">No Anomalies Detected</h3>
                  <p className="text-gray-400">All safety metrics are within expected ranges</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden rounded-xl p-5 backdrop-blur-xl border ${
                    anomaly.severity === 'critical' ? 'bg-red-500/10 border-red-500/40' :
                    anomaly.severity === 'high' ? 'bg-orange-500/10 border-orange-500/40' :
                    anomaly.severity === 'medium' ? 'bg-yellow-500/10 border-yellow-500/40' :
                    'bg-blue-500/10 border-blue-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          anomaly.severity === 'critical' ? 'bg-red-500 text-white' :
                          anomaly.severity === 'high' ? 'bg-orange-500 text-white' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500 text-black' :
                          'bg-blue-500 text-white'
                        }`}>
                          {anomaly.severity.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-400">{anomaly.date}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2">{anomaly.metric}</h3>
                      <p className="text-gray-300 mb-3">{anomaly.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Actual: </span>
                          <span className="font-semibold">{anomaly.actualValue.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Expected: </span>
                          <span className="font-semibold">{anomaly.expectedValue.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Deviation: </span>
                          <span className="font-semibold">{anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Predictive Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">💡 Predictive Insights & Recommendations</h2>
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border-2 bg-gradient-to-br ${getInsightColor(insight.type)}`}
              >
                {/* Insight Header */}
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{getInsightIcon(insight.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        insight.impact === 'high' ? 'bg-red-500 text-white' :
                        insight.impact === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-blue-500 text-white'
                      }`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-400">Confidence:</span>
                      <div className="flex-1 max-w-xs bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 mb-4 leading-relaxed">{insight.description}</p>

                {/* Recommendation */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-purple-400 mb-2">Recommended Action:</div>
                  <p className="text-gray-300">{insight.recommendation}</p>
                </div>

                {/* Related Metrics */}
                <div className="border-t border-white/10 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Related Metrics:</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.relatedMetrics.map((metric, i) => (
                      <Link
                        key={i}
                        to={`/hse/kpi/${encodeURIComponent(metric)}`}
                        className="px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/30 hover:border-purple-400/60 transition-all"
                      >
                        {metric}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🤖</div>
            <div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                AI-Powered Predictive Safety
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Our predictive analytics engine analyzes thousands of data points including incidents, near misses,
                compliance metrics, training records, and behavioral observations to forecast safety risks and
                identify opportunities for proactive intervention. Models are continuously refined as new data becomes available.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{riskScores.length}</div>
                  <div className="text-sm text-gray-400">Risk Profiles</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{forecasts.length}</div>
                  <div className="text-sm text-gray-400">Forecasts</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{anomalies.length}</div>
                  <div className="text-sm text-gray-400">Anomalies</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">{insights.length}</div>
                  <div className="text-sm text-gray-400">Insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
