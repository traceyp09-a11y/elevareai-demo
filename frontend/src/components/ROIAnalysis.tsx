/**
 * ROI Analysis Component
 * Comprehensive ROI calculations and visualizations for executive reports
 */

import React from 'react';
import { TrendingUp, DollarSign, Target, Award, AlertCircle } from 'lucide-react';
import AdvancedChart, { ChartDataPoint } from './charts/AdvancedChart';

export interface ROIMetric {
  initiative: string;
  investment: number;
  return: number;
  roi: number;
  paybackPeriod: number; // months
  npv: number; // Net Present Value
  irr: number; // Internal Rate of Return
  status: 'excellent' | 'good' | 'fair' | 'poor';
  category: string;
}

interface ROIAnalysisProps {
  metrics: ROIMetric[];
  chartType?: 'bar' | 'horizontal-bar' | 'waterfall';
}

const ROIAnalysis: React.FC<ROIAnalysisProps> = ({ metrics, chartType = 'horizontal-bar' }) => {
  // Calculate aggregate ROI metrics
  const totalInvestment = metrics.reduce((sum, m) => sum + m.investment, 0);
  const totalReturn = metrics.reduce((sum, m) => sum + m.return, 0);
  const overallROI = ((totalReturn - totalInvestment) / totalInvestment) * 100;
  const avgPaybackPeriod = metrics.reduce((sum, m) => sum + m.paybackPeriod, 0) / metrics.length;

  // Sort by ROI descending
  const sortedMetrics = [...metrics].sort((a, b) => b.roi - a.roi);

  // Prepare chart data
  const chartData: ChartDataPoint[] = sortedMetrics.map((metric, index) => ({
    label: metric.initiative,
    value: metric.roi,
    color: getROIColor(metric.status),
    trend: metric.roi > 0 ? 'up' : metric.roi < 0 ? 'down' : 'neutral',
    trendValue: metric.roi
  }));

  function getROIColor(status: ROIMetric['status']): string {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#06b6d4';
      case 'fair': return '#f59e0b';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getStatusLabel(status: ROIMetric['status']): string {
    switch (status) {
      case 'excellent': return 'Excellent ROI (>200%)';
      case 'good': return 'Good ROI (100-200%)';
      case 'fair': return 'Fair ROI (50-100%)';
      case 'poor': return 'Poor ROI (<50%)';
      default: return 'Unknown';
    }
  }

  // Group by category
  const categorizedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, ROIMetric[]>);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-green-400 text-sm font-medium">Overall ROI</div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {overallROI.toFixed(1)}%
          </div>
          <div className="text-xs text-green-300">
            ${(totalReturn / 1000000).toFixed(2)}M return on ${(totalInvestment / 1000000).toFixed(2)}M invested
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-cyan-400 text-sm font-medium">Total Investment</div>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${(totalInvestment / 1000000).toFixed(2)}M
          </div>
          <div className="text-xs text-cyan-300">
            Across {metrics.length} initiatives
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-purple-400 text-sm font-medium">Avg Payback</div>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {avgPaybackPeriod.toFixed(1)} mo
          </div>
          <div className="text-xs text-purple-300">
            Average across all initiatives
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-amber-400 text-sm font-medium">Top Performer</div>
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {sortedMetrics[0]?.roi.toFixed(0)}%
          </div>
          <div className="text-xs text-amber-300 truncate">
            {sortedMetrics[0]?.initiative}
          </div>
        </div>
      </div>

      {/* ROI Chart */}
      <AdvancedChart
        type={chartType}
        data={chartData}
        title="ROI by Initiative"
        subtitle="Return on Investment percentage for each business initiative"
        height={400}
        showValues={true}
        colorScheme="financial"
      />

      {/* Detailed Table by Category */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed ROI Analysis</h3>

        {Object.entries(categorizedMetrics).map(([category, categoryMetrics]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h4 className="text-md font-semibold text-cyan-400 mb-3 uppercase tracking-wide">
              {category}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Initiative</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Investment</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Return</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">ROI</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Payback</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">NPV</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">IRR</th>
                    <th className="text-center text-sm font-medium text-gray-400 pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryMetrics.map((metric, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 pr-4 text-sm text-white font-medium">
                        {metric.initiative}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300 text-right">
                        ${(metric.investment / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300 text-right">
                        ${(metric.return / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className={`text-sm font-semibold ${
                          metric.roi > 200 ? 'text-green-400' :
                          metric.roi > 100 ? 'text-cyan-400' :
                          metric.roi > 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          {metric.roi.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300 text-right">
                        {metric.paybackPeriod} mo
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300 text-right">
                        ${(metric.npv / 1000).toFixed(0)}K
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-300 text-right">
                        {metric.irr.toFixed(1)}%
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${getROIColor(metric.status)}30`,
                            color: getROIColor(metric.status)
                          }}
                        >
                          {metric.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-md font-semibold text-white mb-3">Executive Insights</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Portfolio Performance:</strong> Overall ROI of{' '}
                  <span className="text-green-400 font-semibold">{overallROI.toFixed(1)}%</span>{' '}
                  exceeds industry benchmark of 120%, demonstrating effective capital allocation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Top Performer:</strong>{' '}
                  {sortedMetrics[0]?.initiative} delivers exceptional{' '}
                  <span className="text-green-400 font-semibold">{sortedMetrics[0]?.roi.toFixed(0)}% ROI</span>{' '}
                  with {sortedMetrics[0]?.paybackPeriod} month payback period.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>
                  <strong className="text-white">Quick Wins:</strong>{' '}
                  {metrics.filter(m => m.paybackPeriod <= 6).length} initiatives offer payback in ≤6 months,
                  providing rapid cash flow improvement.
                </span>
              </li>
              {metrics.filter(m => m.status === 'poor').length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>
                    <strong className="text-white">Review Needed:</strong>{' '}
                    {metrics.filter(m => m.status === 'poor').length} initiative(s) showing poor ROI
                    require strategic review or potential reallocation of resources.
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROIAnalysis;
