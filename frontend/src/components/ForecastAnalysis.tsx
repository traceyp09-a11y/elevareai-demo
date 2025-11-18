/**
 * Forecast Analysis Component
 * Predictive analytics and forecasting visualizations
 */

import React from 'react';
import { TrendingUp, AlertTriangle, Brain, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import AdvancedChart, { ChartDataPoint } from './charts/AdvancedChart';

export interface ForecastData {
  metric: string;
  category: string;
  historical: Array<{ period: string; value: number }>;
  forecast: Array<{ period: string; value: number; confidence: { lower: number; upper: number } }>;
  accuracy: number; // Model accuracy %
  trend: 'increasing' | 'decreasing' | 'stable';
  trendStrength: number; // 0-100
  seasonality: boolean;
  anomalies: Array<{ period: string; severity: 'low' | 'medium' | 'high' }>;
}

interface ForecastAnalysisProps {
  forecasts: ForecastData[];
  selectedMetric?: string;
}

const ForecastAnalysis: React.FC<ForecastAnalysisProps> = ({ forecasts, selectedMetric }) => {
  const activeForecast = selectedMetric
    ? forecasts.find(f => f.metric === selectedMetric)
    : forecasts[0];

  if (!activeForecast) {
    return null;
  }

  // Combine historical and forecast data for chart
  const combinedData: ChartDataPoint[] = [
    ...activeForecast.historical.map(h => ({
      label: h.period,
      value: h.value,
      color: '#06b6d4'
    })),
    ...activeForecast.forecast.map(f => ({
      label: f.period,
      value: f.value,
      color: '#8b5cf6'
    }))
  ];

  // Calculate key statistics
  const currentValue = activeForecast.historical[activeForecast.historical.length - 1]?.value || 0;
  const forecastedValue = activeForecast.forecast[activeForecast.forecast.length - 1]?.value || 0;
  const percentChange = ((forecastedValue - currentValue) / currentValue) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-purple-400 text-sm font-medium">Forecast Accuracy</div>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {activeForecast.accuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-purple-300">
            Model confidence level
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-cyan-400 text-sm font-medium">Current Value</div>
            <Target className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {currentValue.toLocaleString()}
          </div>
          <div className="text-xs text-cyan-300">
            Latest actual value
          </div>
        </div>

        <div className={`bg-gradient-to-br ${
          percentChange >= 0 ? 'from-green-500/20 to-green-600/20 border-green-500/50' : 'from-red-500/20 to-red-600/20 border-red-500/50'
        } border rounded-xl p-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`text-sm font-medium ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Projected Change
            </div>
            {percentChange >= 0 ? (
              <ArrowUpRight className="w-5 h-5 text-green-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className={`text-3xl font-bold ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'} mb-2`}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
          </div>
          <div className={`text-xs ${percentChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            Next period forecast
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-amber-400 text-sm font-medium">Anomalies Detected</div>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {activeForecast.anomalies.length}
          </div>
          <div className="text-xs text-amber-300">
            {activeForecast.anomalies.filter(a => a.severity === 'high').length} high severity
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{activeForecast.metric} - Forecast</h3>
            <p className="text-sm text-gray-400 mt-1">
              Historical data (cyan) and AI-powered forecast (purple) with confidence intervals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-xs text-gray-400">Historical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-gray-400">Forecast</span>
            </div>
          </div>
        </div>

        <AdvancedChart
          type="area"
          data={combinedData}
          height={350}
          showGrid={true}
          colorScheme="performance"
        />

        {/* Confidence Intervals */}
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Confidence Intervals (Next 3 Periods)</h4>
          <div className="grid grid-cols-3 gap-4">
            {activeForecast.forecast.slice(0, 3).map((forecast, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{forecast.period}</div>
                <div className="text-lg font-bold text-white mb-1">
                  {forecast.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">
                  {forecast.confidence.lower.toLocaleString()} - {forecast.confidence.upper.toLocaleString()}
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  ±{(((forecast.confidence.upper - forecast.confidence.lower) / 2 / forecast.value) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Trend Analysis
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Direction</span>
              <span className={`text-sm font-semibold ${
                activeForecast.trend === 'increasing' ? 'text-green-400' :
                activeForecast.trend === 'decreasing' ? 'text-red-400' :
                'text-gray-400'
              }`}>
                {activeForecast.trend === 'increasing' ? '↗ Increasing' :
                 activeForecast.trend === 'decreasing' ? '↘ Decreasing' :
                 '→ Stable'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Trend Strength</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      activeForecast.trendStrength > 70 ? 'bg-green-500' :
                      activeForecast.trendStrength > 40 ? 'bg-cyan-500' :
                      'bg-amber-500'
                    }`}
                    style={{ width: `${activeForecast.trendStrength}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-white">
                  {activeForecast.trendStrength}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Seasonality</span>
              <span className={`text-sm font-semibold ${
                activeForecast.seasonality ? 'text-cyan-400' : 'text-gray-500'
              }`}>
                {activeForecast.seasonality ? 'Detected' : 'Not Detected'}
              </span>
            </div>
          </div>

          {activeForecast.seasonality && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-xs text-cyan-300">
                <strong>Seasonal Pattern:</strong> Data shows recurring patterns,
                suggesting predictable cyclical behavior. Consider this when planning resources.
              </p>
            </div>
          )}
        </div>

        {/* Anomalies */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Anomaly Detection
          </h4>

          {activeForecast.anomalies.length > 0 ? (
            <div className="space-y-2">
              {activeForecast.anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    anomaly.severity === 'high' ? 'bg-red-500/10 border-red-500/50' :
                    anomaly.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/50' :
                    'bg-blue-500/10 border-blue-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{anomaly.period}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      anomaly.severity === 'high' ? 'bg-red-500 text-white' :
                      anomaly.severity === 'medium' ? 'bg-amber-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    anomaly.severity === 'high' ? 'text-red-300' :
                    anomaly.severity === 'medium' ? 'text-amber-300' :
                    'text-blue-300'
                  }`}>
                    Unusual variation detected - {anomaly.severity} severity
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No anomalies detected</p>
            </div>
          )}
        </div>
      </div>

      {/* All Forecasts Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
        <h4 className="text-md font-semibold text-white mb-4">Forecast Summary - All Metrics</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Metric</th>
                <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Category</th>
                <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Current</th>
                <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Forecast</th>
                <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Change</th>
                <th className="text-center text-sm font-medium text-gray-400 pb-3 pr-4">Trend</th>
                <th className="text-right text-sm font-medium text-gray-400 pb-3">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((forecast, index) => {
                const current = forecast.historical[forecast.historical.length - 1]?.value || 0;
                const forecasted = forecast.forecast[forecast.forecast.length - 1]?.value || 0;
                const change = ((forecasted - current) / current) * 100;

                return (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pr-4 text-sm text-white font-medium">{forecast.metric}</td>
                    <td className="py-3 pr-4 text-sm text-gray-400">{forecast.category}</td>
                    <td className="py-3 pr-4 text-sm text-gray-300 text-right">{current.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-sm text-purple-400 text-right font-semibold">
                      {forecasted.toLocaleString()}
                    </td>
                    <td className={`py-3 pr-4 text-sm text-right font-semibold ${
                      change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <span className={`text-sm ${
                        forecast.trend === 'increasing' ? 'text-green-400' :
                        forecast.trend === 'decreasing' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {forecast.trend === 'increasing' ? '↗' :
                         forecast.trend === 'decreasing' ? '↘' : '→'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-300 text-right">
                      {forecast.accuracy.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ForecastAnalysis;
