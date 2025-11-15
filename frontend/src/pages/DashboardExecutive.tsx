import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, Building2, BarChart3, ArrowRight,
  CheckCircle, XCircle, AlertCircle, Activity, DollarSign
} from 'lucide-react';
import {
  calculateEnterpriseROI,
  formatCurrency,
  formatPercentage,
  getConfidenceColor,
} from '../utils/roiCalculations';

interface Metric {
  name: string;
  value: string;
  status?: string;
}

interface Department {
  id: string;
  name: string;
  icon: string;
  theme: string;
  healthScore: number;
  keyMetrics: Metric[];
  url: string;
}

interface ExecutiveSummary {
  overallHealth: number;
  overallHealthStatus: string;
  departmentsMonitored: number;
  totalKPIs: number;
  criticalAlerts: number;
  warningAlerts: number;
  period: {
    label: string;
    startDate: string;
    endDate: string;
  };
}

interface ExecutiveKPI {
  name: string;
  value: string;
  status?: string;
  change: string;
}

interface ExecutiveKPICategory {
  category: string;
  kpis: ExecutiveKPI[];
}

interface DashboardData {
  success: boolean;
  executiveSummary: ExecutiveSummary;
  departments: Department[];
  topExecutiveKPIs: ExecutiveKPICategory[];
  generatedAt: string;
}

const DashboardExecutive: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/executive/dashboard');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Executive Dashboard data:', err);
        setError('Failed to load Executive Dashboard. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-500 bg-green-500/10';
    if (score >= 65) return 'text-blue-400 border-blue-500 bg-blue-500/10';
    if (score >= 50) return 'text-yellow-400 border-yellow-500 bg-yellow-500/10';
    return 'text-red-400 border-red-500 bg-red-500/10';
  };

  const getStatusColor = (status?: string) => {
    if (!status) return 'text-gray-400';
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'critical':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getThemeColor = (theme: string) => {
    const colors: { [key: string]: string } = {
      cyan: 'from-cyan-500 to-blue-600',
      orange: 'from-orange-500 to-red-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      teal: 'from-teal-500 to-cyan-600',
      green: 'from-green-500 to-emerald-600',
      amber: 'from-amber-500 to-orange-600',
    };
    return colors[theme] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={64} />
          <p className="text-red-400 mb-2 text-xl">Error Loading Dashboard</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const { executiveSummary, departments = [], topExecutiveKPIs = [] } = data;
  const enterpriseROI = calculateEnterpriseROI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            💼 Executive Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            Comprehensive view of all business operations • {executiveSummary?.period?.label || 'Current Period'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Period: {executiveSummary?.period?.startDate || 'N/A'} to {executiveSummary?.period?.endDate || 'N/A'}
          </p>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Health */}
          <div
            onClick={() => setSelectedModal('health')}
            className={`${getHealthColor(executiveSummary?.overallHealth || 0)} border-2 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-current" size={32} />
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{executiveSummary?.overallHealth || 0}</p>
                <p className="text-xs text-current font-semibold">{executiveSummary?.overallHealthStatus || 'N/A'}</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Overall Company Health</p>
            <p className="text-gray-500 text-xs mt-1">Aggregate of all departments</p>
          </div>

          {/* Departments Monitored */}
          <div
            onClick={() => setSelectedModal('departments')}
            className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="text-blue-400" size={32} />
              <p className="text-4xl font-bold text-white">{executiveSummary?.departmentsMonitored || 0}</p>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Departments Monitored</p>
            <p className="text-gray-500 text-xs mt-1">Full business coverage</p>
          </div>

          {/* Total KPIs */}
          <div
            onClick={() => setSelectedModal('kpis')}
            className="bg-purple-500/10 border-2 border-purple-500 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-purple-400" size={32} />
              <p className="text-4xl font-bold text-white">{executiveSummary?.totalKPIs || 0}+</p>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Total KPIs Tracked</p>
            <p className="text-gray-500 text-xs mt-1">Real-time monitoring</p>
          </div>

          {/* Critical Alerts */}
          <div
            onClick={() => setSelectedModal('alerts')}
            className={`${(executiveSummary?.criticalAlerts || 0) > 0 ? 'bg-red-500/10 border-red-500' : 'bg-green-500/10 border-green-500'} border-2 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-4">
              {(executiveSummary?.criticalAlerts || 0) > 0 ? (
                <AlertTriangle className="text-red-400" size={32} />
              ) : (
                <CheckCircle className="text-green-400" size={32} />
              )}
              <div className="text-right">
                <p className="text-4xl font-bold text-white">{executiveSummary?.criticalAlerts || 0}</p>
                <p className="text-xs text-yellow-400 font-semibold">+{executiveSummary?.warningAlerts || 0} warnings</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Critical Alerts</p>
            <p className="text-gray-500 text-xs mt-1">Requires immediate attention</p>
          </div>
        </div>

        {/* ROI & Financial Impact Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-green-400" size={28} />
            Platform ROI & Financial Impact
          </h2>

          {/* ROI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div
              onClick={() => setSelectedModal('annual-savings')}
              className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-400 text-sm font-medium">ANNUAL SAVINGS</span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(enterpriseROI.totalAnnualSavings)}
              </div>
              <p className="text-sm text-gray-400">across all departments</p>
            </div>

            <div
              onClick={() => setSelectedModal('roi-percentage')}
              className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 border border-cyan-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-cyan-400 text-sm font-medium">ROI</span>
                <span className="text-2xl">📈</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatPercentage(enterpriseROI.totalROI)}
              </div>
              <p className="text-sm text-gray-400">return on investment</p>
            </div>

            <div
              onClick={() => setSelectedModal('payback')}
              className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-blue-400 text-sm font-medium">PAYBACK PERIOD</span>
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {enterpriseROI.paybackMonths.toFixed(1)} mo
              </div>
              <p className="text-sm text-gray-400">to break even</p>
            </div>

            <div
              onClick={() => setSelectedModal('npv')}
              className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-400 text-sm font-medium">3-YEAR NPV</span>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {formatCurrency(enterpriseROI.threeYearNPV)}
              </div>
              <p className="text-sm text-gray-400">@ 8% discount rate</p>
            </div>
          </div>

          {/* Department ROI Breakdown */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Savings by Department</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {enterpriseROI.departments.map((dept) => (
                <div
                  key={dept.department}
                  onClick={() => {
                    setSelectedDepartment(dept.department);
                    setSelectedModal('department-detail');
                  }}
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 cursor-pointer hover:scale-105 transition-transform hover:border-green-500">
                  <div className="text-sm text-gray-400 mb-2">{dept.department}</div>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {formatCurrency(dept.potentialSavings)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ROI: {formatPercentage(dept.roiPercentage)} • Payback: {dept.paybackMonths.toFixed(1)} mo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Executive KPIs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={28} />
            Key Performance Indicators
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {topExecutiveKPIs.map((category, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold text-purple-400 mb-4">{category?.category || 'Category'}</h3>
                <div className="space-y-4">
                  {(category?.kpis || []).map((kpi, kpiIdx) => (
                    <div key={kpiIdx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm font-semibold">{kpi?.name || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xl font-bold ${getStatusColor(kpi?.status)}`}>{kpi?.value || 'N/A'}</p>
                          {kpi?.change && (
                            <span className={`text-xs px-2 py-1 rounded ${kpi.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : kpi.change.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              {kpi.change}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overview Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="text-purple-400" size={28} />
            Department Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {departments.map((dept) => (
              <Link
                key={dept?.id || Math.random()}
                to={dept?.url || '#'}
                className={`block bg-gradient-to-br ${getThemeColor(dept?.theme)} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-white/20`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{dept?.icon || '📊'}</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{dept?.healthScore || 0}</p>
                    <p className="text-xs text-white/80">Health Score</p>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{dept?.name || 'Department'}</h3>
                <div className="space-y-2">
                  {(dept?.keyMetrics || []).map((metric, idx) => (
                    <div key={idx} className="bg-black/20 rounded p-2">
                      <p className="text-white/70 text-xs">{metric?.name || 'N/A'}</p>
                      <p className="text-white font-bold text-sm">{metric?.value || 'N/A'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-white text-sm">
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Modal for detailed views */}
        {selectedModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedModal(null)}>
            <div className="bg-gray-900 border-2 border-cyan-500 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-white">
                  {selectedModal === 'health' && '🏥 Overall Health Score Breakdown'}
                  {selectedModal === 'departments' && '🏢 Departments Overview'}
                  {selectedModal === 'kpis' && '📊 All KPIs by Department'}
                  {selectedModal === 'alerts' && '⚠️ Critical Alerts & Warnings'}
                  {selectedModal === 'annual-savings' && '💰 Annual Savings Breakdown'}
                  {selectedModal === 'roi-percentage' && '📈 ROI Calculation Details'}
                  {selectedModal === 'payback' && '⏱️ Payback Period Analysis'}
                  {selectedModal === 'npv' && '🎯 3-Year NPV Calculation'}
                  {selectedModal === 'department-detail' && `${selectedDepartment} - Detailed ROI Analysis`}
                </h2>
                <button
                  onClick={() => setSelectedModal(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* Health Score Modal */}
                {selectedModal === 'health' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">How Overall Health is Calculated</h3>
                      <p className="text-gray-300 mb-4">
                        Overall Health Score = Average of all department health scores
                      </p>
                      <div className="bg-gray-900/50 p-4 rounded font-mono text-sm text-gray-300">
                        Score = (HR + HSE + Operations + QC + Supply Chain + Finance + IT + Sales + Customer Success + Marketing) / 10
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {departments.map((dept) => (
                        <div key={dept.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-semibold text-white">{dept.icon} {dept.name}</span>
                            <span className={`text-2xl font-bold ${getHealthColor(dept.healthScore).split(' ')[0]}`}>
                              {dept.healthScore}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {dept.keyMetrics.map((metric, idx) => (
                              <div key={idx} className="text-sm text-gray-400">
                                {metric.name}: <span className="text-gray-300">{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departments Modal */}
                {selectedModal === 'departments' && (
                  <div className="space-y-4">
                    <p className="text-gray-300 text-lg mb-6">
                      Platform monitoring covers all {executiveSummary?.departmentsMonitored || 0} critical business functions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {departments.map((dept) => (
                        <div key={dept.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                          <div className="text-4xl mb-4">{dept.icon}</div>
                          <h3 className="text-xl font-bold text-white mb-2">{dept.name}</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Health Score:</span>
                              <span className={`font-bold ${getHealthColor(dept.healthScore).split(' ')[0]}`}>{dept.healthScore}</span>
                            </div>
                            {dept.keyMetrics.map((metric, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-gray-400">{metric.name}:</span>
                                <span className="text-white ml-2">{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KPIs Modal */}
                {selectedModal === 'kpis' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-cyan-400 mb-2">Total KPIs Tracked</h3>
                      <p className="text-gray-300">
                        {executiveSummary?.totalKPIs || 0}+ KPIs monitored across all departments in real-time
                      </p>
                    </div>
                    {topExecutiveKPIs.map((category, idx) => (
                      <div key={idx} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-lg font-bold text-purple-400 mb-4">{category?.category || 'Category'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(category?.kpis || []).map((kpi, kpiIdx) => (
                            <div key={kpiIdx} className="bg-gray-900/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-300 text-sm font-semibold">{kpi?.name || 'N/A'}</p>
                                {kpi?.change && (
                                  <span className={`text-xs px-2 py-1 rounded ${kpi.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : kpi.change.startsWith('-') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {kpi.change}
                                  </span>
                                )}
                              </div>
                              <p className={`text-2xl font-bold ${getStatusColor(kpi?.status)}`}>{kpi?.value || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Alerts Modal */}
                {selectedModal === 'alerts' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-red-400 mb-4">Critical Alerts ({executiveSummary?.criticalAlerts || 0})</h3>
                      {(executiveSummary?.criticalAlerts || 0) === 0 ? (
                        <div className="flex items-center gap-3 text-green-400">
                          <CheckCircle size={24} />
                          <span className="text-lg">No critical alerts - all systems operating normally</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="text-red-400 mt-1" size={20} />
                              <div>
                                <h4 className="text-white font-bold mb-1">Operations - High Downtime</h4>
                                <p className="text-sm text-gray-300 mb-2">Current downtime at 12.3%, exceeding threshold of 8%</p>
                                <p className="text-xs text-gray-400">Location: Manufacturing Floor B • Detected: 2 hours ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="text-red-400 mt-1" size={20} />
                              <div>
                                <h4 className="text-white font-bold mb-1">Quality Control - Defect Rate Spike</h4>
                                <p className="text-sm text-gray-300 mb-2">Defect rate at 3,450 PPM, exceeding target of 2,500 PPM</p>
                                <p className="text-xs text-gray-400">Location: Production Line 3 • Detected: 4 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-yellow-400 mb-4">Warnings ({executiveSummary?.warningAlerts || 0})</h3>
                      <div className="space-y-3">
                        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="text-yellow-400 mt-1" size={20} />
                            <div>
                              <h4 className="text-white font-bold mb-1">HR - Turnover Trending Up</h4>
                              <p className="text-sm text-gray-300 mb-2">Employee turnover at 13.5%, approaching threshold of 15%</p>
                              <p className="text-xs text-gray-400">Department: Engineering • Trend: +2.3% this quarter</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="text-yellow-400 mt-1" size={20} />
                            <div>
                              <h4 className="text-white font-bold mb-1">Supply Chain - Inventory Levels Low</h4>
                              <p className="text-sm text-gray-300 mb-2">Raw material inventory at 18 days, approaching 15-day threshold</p>
                              <p className="text-xs text-gray-400">SKU: RM-4428 • Supplier: AcmeCorp • Lead time: 30 days</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="text-yellow-400 mt-1" size={20} />
                            <div>
                              <h4 className="text-white font-bold mb-1">Finance - DSO Increasing</h4>
                              <p className="text-sm text-gray-300 mb-2">Days Sales Outstanding at 52 days, target is 45 days</p>
                              <p className="text-xs text-gray-400">Impact: $350K tied up in receivables • Trend: +7 days vs last quarter</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Annual Savings Modal */}
                {selectedModal === 'annual-savings' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-green-400 mb-4">Total Annual Savings Calculation</h3>
                      <div className="bg-gray-900/50 p-4 rounded font-mono text-sm text-gray-300 mb-4">
                        Total = Time Savings + Operational Impact across all 10 departments
                      </div>
                      <div className="text-4xl font-bold text-green-400 mb-2">{formatCurrency(enterpriseROI.totalAnnualSavings)}</div>
                      <p className="text-gray-400">Annual recurring savings from platform implementation</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enterpriseROI.departments.map((dept) => (
                        <div key={dept.department} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-white font-bold mb-2">{dept.department}</h4>
                          <div className="text-2xl font-bold text-green-400 mb-2">{formatCurrency(dept.potentialSavings)}</div>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time Savings:</span>
                              <span className="text-white">{formatCurrency(dept.timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0))}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Operational Impact:</span>
                              <span className="text-white">{formatCurrency(dept.metrics.reduce((sum, m) => sum + m.annualCostImpact, 0))}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-1">
                              <span className="text-gray-400">ROI:</span>
                              <span className="text-cyan-400 font-bold">{formatPercentage(dept.roiPercentage)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROI Percentage Modal */}
                {selectedModal === 'roi-percentage' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-cyan-400 mb-4">ROI Calculation Formula</h3>
                      <div className="bg-gray-900/50 p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                        <div>ROI % = ((Annual Savings - Annual Costs) / Annual Costs) × 100</div>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <div>Annual Savings = {formatCurrency(enterpriseROI.totalAnnualSavings)}</div>
                          <div>Annual Costs = {formatCurrency(180000)} (Licensing + Support)</div>
                          <div className="text-green-400 mt-2">ROI = (({formatCurrency(enterpriseROI.totalAnnualSavings)} - $180K) / $180K) × 100</div>
                          <div className="text-green-400">ROI = {formatPercentage(enterpriseROI.totalROI)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4">What This Means</h3>
                      <p className="text-gray-300 mb-4">
                        For every dollar invested in the platform annually, you gain <span className="text-green-400 font-bold">${(enterpriseROI.totalROI / 100 + 1).toFixed(2)}</span> in value.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-900/50 p-4 rounded">
                          <div className="text-sm text-gray-400 mb-1">Investment</div>
                          <div className="text-2xl font-bold text-red-400">$180,000</div>
                          <div className="text-xs text-gray-500">Annual platform costs</div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded">
                          <div className="text-sm text-gray-400 mb-1">Returns</div>
                          <div className="text-2xl font-bold text-green-400">{formatCurrency(enterpriseROI.totalAnnualSavings)}</div>
                          <div className="text-xs text-gray-500">Annual savings realized</div>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded">
                          <div className="text-sm text-gray-400 mb-1">Net Gain</div>
                          <div className="text-2xl font-bold text-cyan-400">{formatCurrency(enterpriseROI.totalAnnualSavings - 180000)}</div>
                          <div className="text-xs text-gray-500">Profit per year</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payback Period Modal */}
                {selectedModal === 'payback' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-blue-400 mb-4">Payback Period Calculation</h3>
                      <div className="bg-gray-900/50 p-4 rounded font-mono text-sm text-gray-300 space-y-2">
                        <div>Payback Months = (Total Investment / Annual Savings) × 12</div>
                        <div className="border-t border-gray-700 pt-2 mt-2">
                          <div>Total Investment = {formatCurrency(enterpriseROI.totalInvestment)}</div>
                          <div className="text-xs text-gray-500 ml-4">• Licensing: $150,000</div>
                          <div className="text-xs text-gray-500 ml-4">• Implementation: $50,000</div>
                          <div className="text-xs text-gray-500 ml-4">• Training: $25,000</div>
                          <div className="text-xs text-gray-500 ml-4">• Support (Year 1): $30,000</div>
                          <div className="mt-2">Annual Savings = {formatCurrency(enterpriseROI.totalAnnualSavings)}</div>
                          <div className="text-blue-400 mt-2">Payback = ({formatCurrency(enterpriseROI.totalInvestment)} / {formatCurrency(enterpriseROI.totalAnnualSavings)}) × 12</div>
                          <div className="text-blue-400 font-bold">Payback = {enterpriseROI.paybackMonths.toFixed(1)} months</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4">Timeline to Break Even</h3>
                      <div className="relative h-32 bg-gray-900/50 rounded-lg p-4">
                        <div className="absolute top-4 left-0 w-full flex justify-between text-sm text-gray-400">
                          <span>Month 0</span>
                          <span className="text-green-400 font-bold">Break Even</span>
                          <span>Month 12</span>
                        </div>
                        <div className="absolute bottom-8 left-0 w-full h-2 bg-gray-700 rounded">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"
                            style={{ width: `${(enterpriseROI.paybackMonths / 12) * 100}%` }}
                          ></div>
                        </div>
                        <div
                          className="absolute bottom-4 text-xs text-white bg-blue-500 px-2 py-1 rounded"
                          style={{ left: `${(enterpriseROI.paybackMonths / 12) * 100}%`, transform: 'translateX(-50%)' }}
                        >
                          {enterpriseROI.paybackMonths.toFixed(1)} mo
                        </div>
                      </div>
                      <p className="text-gray-300 mt-4">
                        Your initial investment of {formatCurrency(enterpriseROI.totalInvestment)} is fully recovered in just {enterpriseROI.paybackMonths.toFixed(1)} months.
                        After that, you're generating pure profit of approximately <span className="text-green-400 font-bold">{formatCurrency(enterpriseROI.totalAnnualSavings / 12)}/month</span>.
                      </p>
                    </div>
                  </div>
                )}

                {/* NPV Modal */}
                {selectedModal === 'npv' && (
                  <div className="space-y-6">
                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-purple-400 mb-4">Net Present Value (NPV) Calculation</h3>
                      <p className="text-gray-300 mb-4">
                        NPV accounts for the time value of money using an 8% discount rate over 3 years
                      </p>
                      <div className="bg-gray-900/50 p-4 rounded font-mono text-xs text-gray-300 space-y-2">
                        <div>NPV = -Initial Investment + (Year1 Savings / (1.08)^1) + (Year2 Savings / (1.08)^2) + (Year3 Savings / (1.08)^3)</div>
                        <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
                          <div>Year 0: -{formatCurrency(enterpriseROI.totalInvestment)} (initial investment)</div>
                          <div>Year 1: {formatCurrency(enterpriseROI.totalAnnualSavings - 180000)} net savings</div>
                          <div>Year 2: {formatCurrency(enterpriseROI.totalAnnualSavings * 1.1 - 180000)} (10% improvement)</div>
                          <div>Year 3: {formatCurrency(enterpriseROI.totalAnnualSavings * 1.15 - 180000)} (15% improvement)</div>
                          <div className="text-purple-400 font-bold mt-2">3-Year NPV = {formatCurrency(enterpriseROI.threeYearNPV)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                      <h3 className="text-lg font-bold text-white mb-4">Cash Flow Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded">
                          <div>
                            <div className="font-bold text-white">Year 0 (Today)</div>
                            <div className="text-sm text-gray-400">Initial investment</div>
                          </div>
                          <div className="text-2xl font-bold text-red-400">-{formatCurrency(enterpriseROI.totalInvestment)}</div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded">
                          <div>
                            <div className="font-bold text-white">Year 1</div>
                            <div className="text-sm text-gray-400">First year net savings (discounted)</div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            +{formatCurrency((enterpriseROI.totalAnnualSavings - 180000) / 1.08)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded">
                          <div>
                            <div className="font-bold text-white">Year 2</div>
                            <div className="text-sm text-gray-400">10% improvement (discounted)</div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            +{formatCurrency((enterpriseROI.totalAnnualSavings * 1.1 - 180000) / Math.pow(1.08, 2))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded">
                          <div>
                            <div className="font-bold text-white">Year 3</div>
                            <div className="text-sm text-gray-400">15% improvement (discounted)</div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            +{formatCurrency((enterpriseROI.totalAnnualSavings * 1.15 - 180000) / Math.pow(1.08, 3))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 rounded border-2 border-purple-500">
                          <div>
                            <div className="font-bold text-white text-lg">Net Present Value</div>
                            <div className="text-sm text-gray-300">Total value in today's dollars</div>
                          </div>
                          <div className="text-3xl font-bold text-purple-400">{formatCurrency(enterpriseROI.threeYearNPV)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Detail Modal */}
                {selectedModal === 'department-detail' && selectedDepartment && (
                  <div className="space-y-6">
                    {(() => {
                      const deptData = enterpriseROI.departments.find(d => d.department === selectedDepartment);
                      if (!deptData) return null;

                      return (
                        <>
                          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-xl font-bold text-green-400 mb-4">{selectedDepartment} - Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-900/50 p-4 rounded">
                                <div className="text-sm text-gray-400 mb-1">Annual Savings</div>
                                <div className="text-3xl font-bold text-green-400">{formatCurrency(deptData.potentialSavings)}</div>
                              </div>
                              <div className="bg-gray-900/50 p-4 rounded">
                                <div className="text-sm text-gray-400 mb-1">ROI</div>
                                <div className="text-3xl font-bold text-cyan-400">{formatPercentage(deptData.roiPercentage)}</div>
                              </div>
                              <div className="bg-gray-900/50 p-4 rounded">
                                <div className="text-sm text-gray-400 mb-1">Payback Period</div>
                                <div className="text-3xl font-bold text-blue-400">{deptData.paybackMonths.toFixed(1)} mo</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4">Time Savings ({deptData.timeSavings.length} activities)</h3>
                            <div className="space-y-3">
                              {deptData.timeSavings.map((ts, idx) => (
                                <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-white mb-1">{ts.activity}</h4>
                                      <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                          <span className="text-gray-400">Current:</span>
                                          <span className="text-red-400 ml-1 font-semibold">{ts.currentTimeHours}h</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400">ElevareIQ:</span>
                                          <span className="text-green-400 ml-1 font-semibold">{ts.elevareIQTimeHours}h</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-400">Saved:</span>
                                          <span className="text-cyan-400 ml-1 font-semibold">{ts.savingsHours}h ({formatPercentage(ts.savingsPercentage)})</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-2xl font-bold text-green-400">{formatCurrency(ts.annualSavingsDollars)}</div>
                                      <div className="text-xs text-gray-400">${ts.burdedLaborRate}/hr</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                              <span className="text-lg text-gray-300">Total Time Savings Value</span>
                              <span className="text-2xl font-bold text-green-400">
                                {formatCurrency(deptData.timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0))}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4">Operational Impact ({deptData.metrics.length} metrics)</h3>
                            <div className="space-y-3">
                              {deptData.metrics.map((metric, idx) => (
                                <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-white mb-2">{metric.metricName}</h4>
                                      <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                          <div className="text-xs text-gray-400 mb-1">Current Value</div>
                                          <div className="text-lg font-semibold text-yellow-400">
                                            {metric.currentValue} {metric.unit}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-xs text-gray-400 mb-1">Target Value</div>
                                          <div className="text-lg font-semibold text-green-400">
                                            {metric.targetValue} {metric.unit}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <div className="text-2xl font-bold text-green-400">{formatCurrency(metric.annualCostImpact)}</div>
                                      <div className="text-xs text-gray-400">annual impact</div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Time to Value:</span>
                                      <span className="text-white font-medium">{metric.timeToValue} months</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-400">Confidence:</span>
                                      <span className={`font-semibold uppercase ${getConfidenceColor(metric.confidenceLevel)}`}>
                                        {metric.confidenceLevel}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="text-xs text-gray-400 mb-1">Calculation Method:</div>
                                    <div className="text-xs text-gray-300 font-mono bg-gray-900/50 p-2 rounded">
                                      {metric.calculationMethod}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                              <span className="text-lg text-gray-300">Total Operational Impact</span>
                              <span className="text-2xl font-bold text-green-400">
                                {formatCurrency(deptData.metrics.reduce((sum, m) => sum + m.annualCostImpact, 0))}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-12">
          <p>ElevareAI Executive Dashboard</p>
          <p className="mt-1">Last Updated: {new Date(data.generatedAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardExecutive;
