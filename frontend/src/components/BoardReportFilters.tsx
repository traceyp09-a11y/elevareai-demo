/**
 * Board Report Filters Component
 * Advanced filtering system for Board Reports
 */

import React from 'react';
import { Calendar, Filter, TrendingUp, BarChart3, Download } from 'lucide-react';
import { ChartType } from './charts/AdvancedChart';

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'all';
  year: string;
  departments: string[];
  metrics: string[];
  chartType: ChartType;
  compareWith?: 'previous-period' | 'previous-year' | 'budget' | 'forecast';
}

interface BoardReportFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableDepartments: Array<{ id: string; name: string }>;
  availableMetrics: Array<{ id: string; name: string; category: string }>;
}

const QUARTERS = [
  { value: 'Q1', label: 'Q1 2024', months: 'Jan-Mar', dates: { start: '2024-01-01', end: '2024-03-31' } },
  { value: 'Q2', label: 'Q2 2024', months: 'Apr-Jun', dates: { start: '2024-04-01', end: '2024-06-30' } },
  { value: 'Q3', label: 'Q3 2024', months: 'Jul-Sep', dates: { start: '2024-07-01', end: '2024-09-30' } },
  { value: 'Q4', label: 'Q4 2024', months: 'Oct-Dec', dates: { start: '2024-10-01', end: '2024-12-31' } }
];

const CHART_TYPES: Array<{ value: ChartType; label: string; icon: string }> = [
  { value: 'bar', label: 'Bar Chart', icon: '📊' },
  { value: 'horizontal-bar', label: 'Horizontal Bar', icon: '📈' },
  { value: 'line', label: 'Line Chart', icon: '📉' },
  { value: 'area', label: 'Area Chart', icon: '🗻' },
  { value: 'pie', label: 'Pie Chart', icon: '🥧' },
  { value: 'donut', label: 'Donut Chart', icon: '🍩' },
  { value: 'gauge', label: 'Gauge', icon: '⏱️' },
  { value: 'waterfall', label: 'Waterfall', icon: '🏔️' },
  { value: 'funnel', label: 'Funnel', icon: '🔻' },
  { value: 'heatmap', label: 'Heatmap', icon: '🔥' }
];

const BoardReportFilters: React.FC<BoardReportFiltersProps> = ({
  filters,
  onFiltersChange,
  availableDepartments,
  availableMetrics
}) => {
  const handlePeriodChange = (period: FilterOptions['period']) => {
    let dateRange = filters.dateRange;

    if (period === 'quarterly' && filters.quarter !== 'all') {
      const quarter = QUARTERS.find(q => q.value === filters.quarter);
      if (quarter) {
        dateRange = quarter.dates;
      }
    } else if (period === 'yearly') {
      dateRange = { start: `${filters.year}-01-01`, end: `${filters.year}-12-31` };
    } else if (period === 'monthly') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateRange = {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
      };
    }

    onFiltersChange({ ...filters, period, dateRange });
  };

  const handleQuarterChange = (quarter: FilterOptions['quarter']) => {
    const quarterData = QUARTERS.find(q => q.value === quarter);
    const dateRange = quarterData ? quarterData.dates : filters.dateRange;

    onFiltersChange({
      ...filters,
      quarter,
      period: 'quarterly',
      dateRange
    });
  };

  const toggleDepartment = (deptId: string) => {
    const departments = filters.departments.includes(deptId)
      ? filters.departments.filter(d => d !== deptId)
      : [...filters.departments, deptId];

    onFiltersChange({ ...filters, departments });
  };

  const toggleMetric = (metricId: string) => {
    const metrics = filters.metrics.includes(metricId)
      ? filters.metrics.filter(m => m !== metricId)
      : [...filters.metrics, metricId];

    onFiltersChange({ ...filters, metrics });
  };

  const groupedMetrics = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-400" />
          Report Filters & Configuration
        </h2>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Period Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Time Period
          </label>
          <select
            value={filters.period}
            onChange={(e) => handlePeriodChange(e.target.value as FilterOptions['period'])}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Quarter Selection */}
        {filters.period === 'quarterly' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Quarter
            </label>
            <div className="grid grid-cols-2 gap-2">
              {QUARTERS.map((quarter) => (
                <button
                  key={quarter.value}
                  onClick={() => handleQuarterChange(quarter.value as FilterOptions['quarter'])}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.quarter === quarter.value
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div>{quarter.label}</div>
                  <div className="text-xs opacity-75">{quarter.months}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => onFiltersChange({ ...filters, year: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        {/* Comparison */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Compare With
          </label>
          <select
            value={filters.compareWith || ''}
            onChange={(e) => onFiltersChange({
              ...filters,
              compareWith: e.target.value as FilterOptions['compareWith']
            })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">No Comparison</option>
            <option value="previous-period">Previous Period</option>
            <option value="previous-year">Previous Year</option>
            <option value="budget">Budget/Target</option>
            <option value="forecast">Forecast</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.period === 'custom' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      )}

      {/* Chart Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          Visualization Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {CHART_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onFiltersChange({ ...filters, chartType: type.value })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.chartType === type.value
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              title={type.label}
            >
              <div className="text-lg mb-1">{type.icon}</div>
              <div className="text-xs">{type.label.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Department Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Departments ({filters.departments.length} selected)
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFiltersChange({
              ...filters,
              departments: filters.departments.length === availableDepartments.length
                ? []
                : availableDepartments.map(d => d.id)
            })}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 transition-colors"
          >
            {filters.departments.length === availableDepartments.length ? 'Deselect All' : 'Select All'}
          </button>
          {availableDepartments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => toggleDepartment(dept.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filters.departments.includes(dept.id)
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Key Metrics ({filters.metrics.length} selected)
        </label>
        <div className="space-y-4">
          {Object.entries(groupedMetrics).map(([category, metrics]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {category}
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      filters.metrics.includes(metric.id)
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                    }`}
                  >
                    {metric.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BoardReportFilters;
