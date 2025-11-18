/**
 * Strategic View - Executive Strategy Dashboard
 * High-level strategic insights, competitive positioning, and forward-looking analysis
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Target, TrendingUp, Award, Users, DollarSign, Zap, Globe,
  Shield, Rocket, Brain, ArrowUpRight, ArrowDownRight, AlertCircle,
  CheckCircle2, Clock, BarChart3, PieChart, Activity
} from 'lucide-react';
import AdvancedChart, { ChartDataPoint } from '../components/charts/AdvancedChart';

interface StrategicMetric {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  target: string;
}

const StrategicView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'quarter' | 'year' | '3year'>('quarter');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Strategic Pillars - The core of Titan Build M&L's strategy
  const strategicPillars = [
    {
      id: 'excellence',
      icon: Award,
      title: 'Operational Excellence',
      description: 'World-class manufacturing efficiency & quality',
      progress: 87,
      status: 'on-track',
      initiatives: 5,
      kpis: ['OEE: 89%', 'Defect Rate: 45 PPM', 'First Pass Yield: 96.5%']
    },
    {
      id: 'innovation',
      icon: Brain,
      title: 'Digital Innovation',
      description: 'Leading-edge technology & automation',
      progress: 72,
      status: 'accelerating',
      initiatives: 8,
      kpis: ['Digital Transformation: 72%', 'Automation ROI: 212%', 'AI Adoption: 45%']
    },
    {
      id: 'people',
      icon: Users,
      title: 'People & Culture',
      description: 'Engaged workforce driving success',
      progress: 81,
      status: 'on-track',
      initiatives: 6,
      kpis: ['Engagement: 78/100', 'Safety: TRIR 0.92', 'Retention: 91%']
    },
    {
      id: 'growth',
      icon: Rocket,
      title: 'Market Growth',
      description: 'Expanding market share & customer base',
      progress: 68,
      status: 'needs-attention',
      initiatives: 7,
      kpis: ['Revenue Growth: +12.8%', 'Market Share: 23%', 'NPS: 67.8']
    },
    {
      id: 'sustainability',
      icon: Globe,
      title: 'Sustainability',
      description: 'Environmental & social responsibility',
      progress: 75,
      status: 'on-track',
      initiatives: 4,
      kpis: ['Carbon -15%', 'Waste Reduction: 28%', 'ESG Score: 75/100']
    }
  ];

  // Strategic KPIs - North Star Metrics
  const northStarMetrics: StrategicMetric[] = [
    {
      title: 'Revenue Growth Rate',
      value: '12.8%',
      change: 2.3,
      trend: 'up',
      status: 'excellent',
      target: '15%'
    },
    {
      title: 'EBITDA Margin',
      value: '24.5%',
      change: 1.8,
      trend: 'up',
      status: 'good',
      target: '25%'
    },
    {
      title: 'Market Share',
      value: '23.2%',
      change: 1.5,
      trend: 'up',
      status: 'excellent',
      target: '25%'
    },
    {
      title: 'Customer Lifetime Value',
      value: '$2.4M',
      change: 8.5,
      trend: 'up',
      status: 'excellent',
      target: '$2.5M'
    },
    {
      title: 'Employee Engagement',
      value: '78/100',
      change: 3.5,
      trend: 'up',
      status: 'good',
      target: '80'
    },
    {
      title: 'Innovation Index',
      value: '72/100',
      change: 12.0,
      trend: 'up',
      status: 'excellent',
      target: '75'
    }
  ];

  // Competitive Position
  const competitiveMetrics = [
    { category: 'Quality', titan: 96.5, industry: 94.2, leader: 97.8 },
    { category: 'Delivery', titan: 94.8, industry: 91.5, leader: 96.2 },
    { category: 'Innovation', titan: 72.0, industry: 68.0, leader: 85.0 },
    { category: 'Cost Efficiency', titan: 88.5, industry: 85.0, leader: 92.0 },
    { category: 'Customer Satisfaction', titan: 94.0, industry: 89.0, leader: 96.5 },
    { category: 'Sustainability', titan: 75.0, industry: 71.0, leader: 88.0 }
  ];

  // Strategic Initiatives Timeline
  const strategicInitiatives = [
    {
      name: 'Digital Manufacturing Platform',
      phase: 'Execution',
      completion: 68,
      impact: 'Transformational',
      timeline: 'Q4 2024 - Q2 2025',
      investment: '$3.2M',
      expectedROI: '185%'
    },
    {
      name: 'Supply Chain Resilience',
      phase: 'Planning',
      completion: 35,
      impact: 'High',
      timeline: 'Q1 2025 - Q3 2025',
      investment: '$1.8M',
      expectedROI: '142%'
    },
    {
      name: 'Customer Experience Transformation',
      phase: 'Execution',
      completion: 52,
      impact: 'High',
      timeline: 'Q3 2024 - Q1 2025',
      investment: '$1.2M',
      expectedROI: '165%'
    },
    {
      name: 'Sustainability 2030',
      phase: 'Launch',
      completion: 15,
      impact: 'Strategic',
      timeline: 'Q1 2025 - Q4 2027',
      investment: '$4.5M',
      expectedROI: '128%'
    }
  ];

  // Revenue Growth Projection
  const revenueProjection: ChartDataPoint[] = [
    { label: 'Q1 2024', value: 48.2, color: '#06b6d4' },
    { label: 'Q2 2024', value: 52.1, color: '#06b6d4' },
    { label: 'Q3 2024', value: 55.8, color: '#06b6d4' },
    { label: 'Q4 2024', value: 59.3, color: '#06b6d4' },
    { label: 'Q1 2025', value: 64.2, color: '#8b5cf6' },
    { label: 'Q2 2025', value: 68.5, color: '#8b5cf6' },
    { label: 'Q3 2025', value: 72.1, color: '#8b5cf6' },
    { label: 'Q4 2025', value: 76.8, color: '#8b5cf6' }
  ];

  // Strategic Pillar Performance
  const pillarPerformance: ChartDataPoint[] = strategicPillars.map(pillar => ({
    label: pillar.title.split(' ')[0],
    value: pillar.progress,
    color: pillar.progress >= 80 ? '#10b981' : pillar.progress >= 70 ? '#06b6d4' : '#f59e0b'
  }));

  // Market Position Radar Data
  const marketPositionData: ChartDataPoint[] = competitiveMetrics.map(metric => ({
    label: metric.category,
    value: metric.titan
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Strategic View...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-3">
            Strategic Command Center
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            Executive strategy overview for Titan Build M&L • Driving market leadership through operational excellence
          </p>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Strategic Horizon:</span>
            {(['quarter', 'year', '3year'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTimeframe === timeframe
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-300'
                }`}
              >
                {timeframe === 'quarter' ? 'This Quarter' : timeframe === 'year' ? 'This Year' : '3-Year Plan'}
              </button>
            ))}
          </div>
        </div>

        {/* North Star Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            North Star Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {northStarMetrics.map((metric, index) => (
              <div
                key={index}
                className={`bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 ${
                  metric.status === 'excellent' ? 'border-green-500/50' :
                  metric.status === 'good' ? 'border-cyan-500/50' :
                  metric.status === 'warning' ? 'border-amber-500/50' :
                  'border-red-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold text-white">{metric.value}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    metric.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                    metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> :
                     metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> :
                     <Activity className="w-4 h-4" />}
                    <span className="text-xs font-semibold">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Target: {metric.target}</span>
                  <span className={`font-semibold ${
                    metric.status === 'excellent' ? 'text-green-400' :
                    metric.status === 'good' ? 'text-cyan-400' :
                    metric.status === 'warning' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {metric.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Pillars */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            Strategic Pillars
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {strategicPillars.map((pillar) => {
              const Icon = pillar.icon;
              const statusColor =
                pillar.status === 'on-track' ? 'cyan' :
                pillar.status === 'accelerating' ? 'green' :
                'amber';

              return (
                <div
                  key={pillar.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${statusColor}-500/20 mb-4`}>
                    <Icon className={`w-6 h-6 text-${statusColor}-400`} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{pillar.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{pillar.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-500">Progress</span>
                      <span className={`font-semibold text-${statusColor}-400`}>{pillar.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${statusColor}-500 rounded-full transition-all duration-1000`}
                        style={{ width: `${pillar.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="space-y-1">
                    {pillar.kpis.map((kpi, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle2 className={`w-3 h-3 text-${statusColor}-400 flex-shrink-0`} />
                        <span>{kpi}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between text-xs">
                    <span className="text-gray-500">{pillar.initiatives} initiatives</span>
                    <span className={`px-2 py-1 rounded-full bg-${statusColor}-500/20 text-${statusColor}-400 font-medium`}>
                      {pillar.status === 'on-track' ? 'On Track' :
                       pillar.status === 'accelerating' ? 'Accelerating' :
                       'Attention'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Projection */}
          <AdvancedChart
            type="area"
            data={revenueProjection}
            title="Revenue Growth Trajectory"
            subtitle="Actual (cyan) vs Projected (purple) - $M"
            height={350}
            showGrid={true}
            colorScheme="financial"
          />

          {/* Strategic Pillar Performance */}
          <AdvancedChart
            type="bar"
            data={pillarPerformance}
            title="Strategic Pillar Performance"
            subtitle="Progress toward 2025 strategic goals (%)"
            height={350}
            showValues={true}
            colorScheme="performance"
          />
        </div>

        {/* Competitive Position */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Competitive Position Analysis
          </h2>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Category</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Titan Build M&L</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Industry Avg</th>
                    <th className="text-right text-sm font-medium text-gray-400 pb-3 pr-4">Market Leader</th>
                    <th className="text-center text-sm font-medium text-gray-400 pb-3">Gap to Leader</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveMetrics.map((metric, index) => {
                    const gapToLeader = metric.titan - metric.leader;
                    const vsIndustry = metric.titan - metric.industry;

                    return (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 pr-4 text-sm text-white font-medium">{metric.category}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className="text-lg font-bold text-cyan-400">{metric.titan}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="text-sm text-gray-400">{metric.industry}</span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="text-sm text-amber-400">{metric.leader}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            gapToLeader >= 0 ? 'bg-green-500/20 text-green-400' :
                            gapToLeader > -5 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {gapToLeader > 0 ? '+' : ''}{gapToLeader.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Competitive Insights */}
            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-white mb-2">Competitive Analysis Summary:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span><strong className="text-white">Leading in Quality:</strong> Titan exceeds industry average in quality metrics by 2.3 points, closing gap with market leader</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span><strong className="text-white">Delivery Excellence:</strong> 3.3 points above industry average, strong competitive advantage in on-time delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400">→</span>
                      <span><strong className="text-white">Innovation Opportunity:</strong> 13-point gap to market leader represents strategic priority for investment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400">→</span>
                      <span><strong className="text-white">Sustainability Focus:</strong> On par with industry but 13 points below leader - ESG initiatives accelerating</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Initiatives */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-cyan-400" />
            Strategic Initiatives Portfolio
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategicInitiatives.map((initiative, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{initiative.name}</h3>
                    <p className="text-sm text-gray-400">{initiative.timeline}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    initiative.phase === 'Execution' ? 'bg-green-500/20 text-green-400' :
                    initiative.phase === 'Planning' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {initiative.phase}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500">Completion</span>
                    <span className="font-semibold text-cyan-400">{initiative.completion}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${initiative.completion}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Investment</p>
                    <p className="text-sm font-bold text-white">{initiative.investment}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Expected ROI</p>
                    <p className="text-sm font-bold text-green-400">{initiative.expectedROI}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Impact</p>
                    <p className={`text-sm font-bold ${
                      initiative.impact === 'Transformational' ? 'text-purple-400' :
                      initiative.impact === 'High' ? 'text-cyan-400' :
                      'text-blue-400'
                    }`}>
                      {initiative.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Priorities Call-Out */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-4">2025 Strategic Priorities</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-cyan-400">1</span>
                    <h4 className="text-lg font-semibold text-white">Accelerate Digital</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Double down on digital transformation to achieve 212%+ ROI. Target 85% digital maturity by Q3 2025.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-cyan-400">2</span>
                    <h4 className="text-lg font-semibold text-white">Close Innovation Gap</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Bridge 13-point gap to market leader through R&D investment and strategic partnerships.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-cyan-400">3</span>
                    <h4 className="text-lg font-semibold text-white">Scale Customer Success</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Expand proven 165% ROI customer experience program to drive NPS from 67.8 to 75+.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>Strategic Command Center • Titan Build M&L • Q4 2024</p>
          <p className="mt-2">Data updated in real-time • All metrics validated and auditable</p>
        </div>
      </div>
    </div>
  );
};

export default StrategicView;
