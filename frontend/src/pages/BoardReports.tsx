/**
 * Board Reports Page
 * Comprehensive executive board reporting with advanced analytics
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Share2, TrendingUp, BarChart3, Brain, Lightbulb } from 'lucide-react';
import BoardReportFilters, { FilterOptions } from '../components/BoardReportFilters';
import AdvancedChart, { ChartDataPoint, ChartType } from '../components/charts/AdvancedChart';
import ROIAnalysis, { ROIMetric } from '../components/ROIAnalysis';
import ForecastAnalysis, { ForecastData } from '../components/ForecastAnalysis';
import ExecutiveRecommendations, { Recommendation } from '../components/ExecutiveRecommendations';

interface DepartmentPerformance {
  id: string;
  name: string;
  score: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  revenue?: number;
  costs?: number;
}

const BoardReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'roi' | 'forecast' | 'recommendations'>('overview');
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<DepartmentPerformance[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '2024-10-01', end: '2024-12-31' },
    period: 'quarterly',
    quarter: 'Q4',
    year: '2024',
    departments: ['hr', 'hse', 'operations', 'quality', 'supplychain', 'finance', 'it', 'sales', 'customersuccess', 'marketing'],
    metrics: ['revenue', 'costs', 'efficiency', 'satisfaction', 'quality'],
    chartType: 'bar' as ChartType,
    compareWith: 'previous-period'
  });

  // Available options for filters
  const availableDepartments = [
    { id: 'hr', name: 'HR Analytics' },
    { id: 'hse', name: 'HSE' },
    { id: 'operations', name: 'Operations' },
    { id: 'quality', name: 'Quality Control' },
    { id: 'supplychain', name: 'Supply Chain' },
    { id: 'finance', name: 'Finance' },
    { id: 'it', name: 'IT & Admin' },
    { id: 'sales', name: 'Sales & Revenue' },
    { id: 'customersuccess', name: 'Customer Success' },
    { id: 'marketing', name: 'Marketing' }
  ];

  const availableMetrics = [
    // Financial
    { id: 'revenue', name: 'Revenue', category: 'Financial' },
    { id: 'costs', name: 'Operating Costs', category: 'Financial' },
    { id: 'profit_margin', name: 'Profit Margin', category: 'Financial' },
    { id: 'roi', name: 'ROI', category: 'Financial' },

    // Operations
    { id: 'efficiency', name: 'Operational Efficiency', category: 'Operations' },
    { id: 'capacity', name: 'Capacity Utilization', category: 'Operations' },
    { id: 'quality', name: 'Quality Metrics', category: 'Operations' },
    { id: 'delivery', name: 'On-Time Delivery', category: 'Operations' },

    // People
    { id: 'engagement', name: 'Employee Engagement', category: 'People & Culture' },
    { id: 'turnover', name: 'Turnover Rate', category: 'People & Culture' },
    { id: 'safety', name: 'Safety Performance', category: 'People & Culture' },

    // Customer
    { id: 'satisfaction', name: 'Customer Satisfaction', category: 'Customer' },
    { id: 'nps', name: 'Net Promoter Score', category: 'Customer' },
    { id: 'retention', name: 'Customer Retention', category: 'Customer' }
  ];

  useEffect(() => {
    fetchBoardData();
  }, [filters]);

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/executive/dashboard');

      // Transform API data into department performance metrics
      if (response.data.departments) {
        const perfData: DepartmentPerformance[] = response.data.departments
          .filter((dept: any) => filters.departments.includes(dept.id))
          .map((dept: any) => ({
            id: dept.id,
            name: dept.name,
            score: dept.healthScore,
            trend: dept.healthScore >= 75 ? 'up' : dept.healthScore >= 50 ? 'neutral' : 'down',
            trendValue: (dept.healthScore - 70), // Simulated change
            revenue: Math.random() * 5000000 + 1000000,
            costs: Math.random() * 3000000 + 500000
          }));

        setDepartmentData(perfData);
      }
    } catch (error) {
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample ROI Data (in production, this would come from API)
  const roiMetrics: ROIMetric[] = [
    {
      initiative: 'Digital Transformation Program',
      investment: 2500000,
      return: 7800000,
      roi: 212,
      paybackPeriod: 8,
      npv: 5300000,
      irr: 38.5,
      status: 'excellent',
      category: 'Technology & Innovation'
    },
    {
      initiative: 'HSE Automation System',
      investment: 850000,
      return: 2100000,
      roi: 147,
      paybackPeriod: 11,
      npv: 1250000,
      irr: 28.3,
      status: 'good',
      category: 'Safety & Compliance'
    },
    {
      initiative: 'Supply Chain Optimization',
      investment: 1200000,
      return: 3600000,
      roi: 200,
      paybackPeriod: 6,
      npv: 2400000,
      irr: 42.1,
      status: 'excellent',
      category: 'Operations Excellence'
    },
    {
      initiative: 'Customer Experience Platform',
      investment: 950000,
      return: 2400000,
      roi: 153,
      paybackPeriod: 9,
      npv: 1450000,
      irr: 31.7,
      status: 'good',
      category: 'Customer Success'
    },
    {
      initiative: 'Employee Engagement Program',
      investment: 450000,
      return: 1100000,
      roi: 144,
      paybackPeriod: 12,
      npv: 650000,
      irr: 26.8,
      status: 'good',
      category: 'People & Culture'
    },
    {
      initiative: 'Quality Management System',
      investment: 680000,
      return: 1850000,
      roi: 172,
      paybackPeriod: 7,
      npv: 1170000,
      irr: 35.2,
      status: 'excellent',
      category: 'Operations Excellence'
    },
    {
      initiative: 'Marketing Automation Suite',
      investment: 520000,
      return: 870000,
      roi: 67,
      paybackPeriod: 18,
      npv: 350000,
      irr: 15.3,
      status: 'fair',
      category: 'Growth & Revenue'
    },
    {
      initiative: 'Legacy System Migration',
      investment: 1800000,
      return: 2250000,
      roi: 25,
      paybackPeriod: 24,
      npv: 450000,
      irr: 8.7,
      status: 'poor',
      category: 'Technology & Innovation'
    }
  ];

  // Sample Forecast Data
  const forecastData: ForecastData[] = [
    {
      metric: 'Revenue ($M)',
      category: 'Financial',
      historical: [
        { period: 'Jan', value: 12.5 },
        { period: 'Feb', value: 13.2 },
        { period: 'Mar', value: 14.1 },
        { period: 'Apr', value: 13.8 },
        { period: 'May', value: 14.9 },
        { period: 'Jun', value: 15.8 },
        { period: 'Jul', value: 16.2 },
        { period: 'Aug', value: 15.9 },
        { period: 'Sep', value: 17.1 },
        { period: 'Oct', value: 18.2 },
        { period: 'Nov', value: 19.5 },
        { period: 'Dec', value: 21.3 }
      ],
      forecast: [
        { period: 'Jan-25', value: 22.1, confidence: { lower: 20.5, upper: 23.7 } },
        { period: 'Feb-25', value: 23.5, confidence: { lower: 21.8, upper: 25.2 } },
        { period: 'Mar-25', value: 24.8, confidence: { lower: 22.9, upper: 26.7 } },
        { period: 'Apr-25', value: 25.2, confidence: { lower: 23.1, upper: 27.3 } }
      ],
      accuracy: 94.2,
      trend: 'increasing',
      trendStrength: 85,
      seasonality: true,
      anomalies: [
        { period: 'Dec', severity: 'medium' }
      ]
    },
    {
      metric: 'Customer Satisfaction Score',
      category: 'Customer',
      historical: [
        { period: 'Jan', value: 87 },
        { period: 'Feb', value: 88 },
        { period: 'Mar', value: 86 },
        { period: 'Apr', value: 89 },
        { period: 'May', value: 88 },
        { period: 'Jun', value: 90 },
        { period: 'Jul', value: 91 },
        { period: 'Aug', value: 89 },
        { period: 'Sep', value: 92 },
        { period: 'Oct', value: 91 },
        { period: 'Nov', value: 93 },
        { period: 'Dec', value: 94 }
      ],
      forecast: [
        { period: 'Jan-25', value: 94, confidence: { lower: 92, upper: 96 } },
        { period: 'Feb-25', value: 95, confidence: { lower: 93, upper: 97 } },
        { period: 'Mar-25', value: 95, confidence: { lower: 93, upper: 97 } },
        { period: 'Apr-25', value: 96, confidence: { lower: 94, upper: 98 } }
      ],
      accuracy: 91.5,
      trend: 'increasing',
      trendStrength: 72,
      seasonality: false,
      anomalies: []
    },
    {
      metric: 'Operating Efficiency (%)',
      category: 'Operations',
      historical: [
        { period: 'Jan', value: 78 },
        { period: 'Feb', value: 79 },
        { period: 'Mar', value: 81 },
        { period: 'Apr', value: 80 },
        { period: 'May', value: 82 },
        { period: 'Jun', value: 84 },
        { period: 'Jul', value: 83 },
        { period: 'Aug', value: 85 },
        { period: 'Sep', value: 86 },
        { period: 'Oct', value: 87 },
        { period: 'Nov', value: 88 },
        { period: 'Dec', value: 89 }
      ],
      forecast: [
        { period: 'Jan-25', value: 90, confidence: { lower: 88, upper: 92 } },
        { period: 'Feb-25', value: 91, confidence: { lower: 89, upper: 93 } },
        { period: 'Mar-25', value: 92, confidence: { lower: 90, upper: 94 } },
        { period: 'Apr-25', value: 92, confidence: { lower: 90, upper: 94 } }
      ],
      accuracy: 88.7,
      trend: 'increasing',
      trendStrength: 78,
      seasonality: false,
      anomalies: []
    }
  ];

  // Sample Executive Recommendations
  const recommendations: Recommendation[] = [
    {
      id: 'rec-1',
      title: 'Accelerate Digital Transformation Investments',
      description: 'Current digital transformation program showing 212% ROI. Recommend doubling investment to capture additional market opportunities and maintain competitive advantage.',
      priority: 'high',
      category: 'Strategic Growth',
      impact: 'high',
      effort: 'high',
      estimatedROI: 185,
      timeline: '6-9 months',
      kpisAffected: ['Revenue Growth', 'Operating Efficiency', 'Customer Satisfaction'],
      actionItems: [
        'Secure additional $3M funding for expanded digital initiatives',
        'Hire 8-12 additional digital specialists across departments',
        'Launch AI-powered customer analytics platform',
        'Expand automation to supply chain and logistics operations'
      ],
      risks: [
        'Implementation complexity may extend timeline',
        'Change management challenges across organization',
        'Potential short-term productivity dips during transition'
      ],
      dependencies: ['IT Infrastructure Upgrade', 'Staff Training Program']
    },
    {
      id: 'rec-2',
      title: 'Address Legacy System Migration Delays',
      description: 'Legacy system migration showing only 25% ROI and 24-month payback. Critical to reassess approach or consider alternative solutions to avoid ongoing technical debt.',
      priority: 'critical',
      category: 'Risk Mitigation',
      impact: 'high',
      effort: 'medium',
      timeline: '1-2 months',
      kpisAffected: ['System Uptime', 'IT Costs', 'Security Compliance'],
      actionItems: [
        'Conduct emergency technical review with external consultants',
        'Evaluate cloud-native alternatives to full migration',
        'Implement interim API integration layer to reduce migration scope',
        'Develop phased approach with clear milestones and success criteria'
      ],
      risks: [
        'Continued reliance on legacy systems increases security vulnerabilities',
        'Rising maintenance costs eating into other IT budgets',
        'Potential data loss during any migration approach'
      ]
    },
    {
      id: 'rec-3',
      title: 'Expand HSE Automation to All Facilities',
      description: 'HSE automation pilot showing 147% ROI with 11-month payback. Roll out to remaining 8 facilities to capture full safety and compliance benefits.',
      priority: 'high',
      category: 'Safety & Compliance',
      impact: 'high',
      effort: 'medium',
      estimatedROI: 140,
      timeline: '4-6 months',
      kpisAffected: ['TRIR', 'Compliance Score', 'Training Completion Rate'],
      actionItems: [
        'Finalize rollout plan for 8 remaining facilities',
        'Allocate $6.8M budget for full deployment',
        'Train 150+ HSE coordinators on new system',
        'Integrate with existing incident reporting workflows'
      ],
      risks: [
        'User adoption challenges at some locations',
        'Integration complexity with legacy safety systems',
        'Temporary increase in administrative overhead during rollout'
      ],
      dependencies: ['Network Infrastructure Upgrades', 'Mobile Device Procurement']
    },
    {
      id: 'rec-4',
      title: 'Optimize Marketing Automation ROI',
      description: 'Marketing automation showing underperformance at 67% ROI. Recommend strategy review and potential platform optimization or replacement.',
      priority: 'medium',
      category: 'Efficiency Improvement',
      impact: 'medium',
      effort: 'low',
      estimatedROI: 125,
      timeline: '2-3 months',
      kpisAffected: ['Cost Per Lead', 'Marketing ROI', 'MQL→SQL Conversion'],
      actionItems: [
        'Audit current platform utilization and identify underused features',
        'Provide advanced training to marketing team',
        'Optimize lead scoring and nurture workflows',
        'Consider integration with CRM for better attribution'
      ],
      risks: [
        'Team resistance to workflow changes',
        'Potential learning curve impacting short-term results'
      ]
    },
    {
      id: 'rec-5',
      title: 'Launch Customer Experience Excellence Program',
      description: 'Customer satisfaction trending up (94%) but retention showing warning signs. Proactive investment in CX can prevent churn and drive organic growth.',
      priority: 'high',
      category: 'Customer Success',
      impact: 'high',
      effort: 'medium',
      estimatedROI: 165,
      timeline: '3-5 months',
      kpisAffected: ['NPS', 'Churn Rate', 'Customer Lifetime Value'],
      actionItems: [
        'Implement predictive churn model using AI/ML',
        'Launch customer success playbooks for at-risk accounts',
        'Expand customer onboarding program',
        'Create executive sponsor program for top 50 accounts'
      ],
      risks: [
        'Requires close coordination between sales and CS teams',
        'Success depends on data quality and integration'
      ],
      dependencies: ['CRM Data Cleanup', 'Customer Success Hiring']
    },
    {
      id: 'rec-6',
      title: 'Establish Cross-Functional Innovation Lab',
      description: 'Create dedicated innovation function to incubate new revenue streams and drive continuous improvement across all departments.',
      priority: 'medium',
      category: 'Strategic Growth',
      impact: 'medium',
      effort: 'high',
      estimatedROI: 220,
      timeline: '9-12 months',
      kpisAffected: ['New Product Revenue', 'Patent Filings', 'Employee Engagement'],
      actionItems: [
        'Secure board approval for $2M annual innovation budget',
        'Hire innovation director and core team (4-6 people)',
        'Establish quarterly innovation challenges with $50K prizes',
        'Partner with 3-5 universities for research collaboration',
        'Create fast-track approval process for pilot projects'
      ],
      risks: [
        'Long-term investment with uncertain near-term returns',
        'Potential culture clash with traditional operations',
        'Risk of isolated "innovation theater" without real impact'
      ],
      dependencies: ['Leadership Alignment', 'Budget Approval']
    }
  ];

  // Prepare chart data for overview
  const departmentChartData: ChartDataPoint[] = departmentData.map(dept => ({
    label: dept.name,
    value: dept.score,
    trend: dept.trend,
    trendValue: dept.trendValue
  }));

  const revenueChartData: ChartDataPoint[] = departmentData
    .filter(d => d.revenue)
    .map(dept => ({
      label: dept.name,
      value: dept.revenue! / 1000000, // Convert to millions
      color: dept.score >= 80 ? '#10b981' : dept.score >= 60 ? '#06b6d4' : '#f59e0b'
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Board Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10 text-cyan-400" />
                Executive Board Reports
              </h1>
              <p className="text-gray-400">
                Comprehensive analytics, forecasts, and strategic recommendations for Titan Build M&L
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Report Period Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-300">
            <span className="font-semibold">Report Period:</span>
            <span>Q4 2024 (Oct 1 - Dec 31, 2024)</span>
          </div>
        </div>

        {/* Filters */}
        <BoardReportFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableDepartments={availableDepartments}
          availableMetrics={availableMetrics}
        />

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-900/50 p-2 rounded-xl border border-cyan-500/30">
          {[
            { id: 'overview', label: 'Performance Overview', icon: BarChart3 },
            { id: 'roi', label: 'ROI Analysis', icon: TrendingUp },
            { id: 'forecast', label: 'Forecasts & Predictions', icon: Brain },
            { id: 'recommendations', label: 'Strategic Recommendations', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvancedChart
                  type={filters.chartType}
                  data={departmentChartData}
                  title="Department Health Scores"
                  subtitle="Overall performance rating by department"
                  height={400}
                  showValues={true}
                  colorScheme="performance"
                />

                <AdvancedChart
                  type="pie"
                  data={revenueChartData}
                  title="Revenue Distribution by Department"
                  subtitle="Q4 2024 revenue contribution ($M)"
                  height={400}
                  showLegend={true}
                  colorScheme="financial"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdvancedChart
                  type="horizontal-bar"
                  data={departmentChartData.slice().sort((a, b) => b.value - a.value)}
                  title="Top Performing Departments"
                  subtitle="Ranked by health score"
                  height={400}
                  showValues={true}
                  colorScheme="performance"
                />

                <AdvancedChart
                  type="gauge"
                  data={[{
                    label: 'Overall Company Health',
                    value: Math.round(departmentChartData.reduce((sum, d) => sum + d.value, 0) / departmentChartData.length)
                  }]}
                  title="Composite Health Index"
                  subtitle="Weighted average across all departments"
                  height={400}
                  colorScheme="performance"
                />
              </div>
            </>
          )}

          {activeTab === 'roi' && (
            <ROIAnalysis metrics={roiMetrics} chartType={filters.chartType as any} />
          )}

          {activeTab === 'forecast' && (
            <ForecastAnalysis forecasts={forecastData} selectedMetric="Revenue ($M)" />
          )}

          {activeTab === 'recommendations' && (
            <ExecutiveRecommendations recommendations={recommendations} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="text-center text-sm text-gray-500">
            <p>Report generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p className="mt-2">© 2024 Titan Build M&L | ElevareAI Platform | All calculations are transparent and auditable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReports;
