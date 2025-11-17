import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  TrendingUp, AlertTriangle, Building2, BarChart3, ArrowRight,
  CheckCircle, XCircle, AlertCircle, Activity
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
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

        {/* Department Quick Navigation */}
        <div className="mb-8 bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="text-purple-400" size={20} />
            <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Quick Department Access</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 border border-gray-600 hover:border-cyan-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-cyan-400"
            >
              <span>👥</span>
              <span>HR</span>
            </Link>
            <Link
              to="/hse"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-cyan-500/20 border border-gray-600 hover:border-cyan-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-cyan-400"
            >
              <span>🦺</span>
              <span>HSE</span>
            </Link>
            <Link
              to="/ops"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-blue-500/20 border border-gray-600 hover:border-blue-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-blue-400"
            >
              <span>⚙️</span>
              <span>Operations</span>
            </Link>
            <Link
              to="/qc"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-teal-500/20 border border-gray-600 hover:border-teal-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-teal-400"
            >
              <span>✓</span>
              <span>QC</span>
            </Link>
            <Link
              to="/supplychain"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-orange-500/20 border border-gray-600 hover:border-orange-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-orange-400"
            >
              <span>🚚</span>
              <span>Supply Chain</span>
            </Link>
            <Link
              to="/finance"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-green-500/20 border border-gray-600 hover:border-green-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-green-400"
            >
              <span>💰</span>
              <span>Finance</span>
            </Link>
            <Link
              to="/administration"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-blue-500/20 border border-gray-600 hover:border-blue-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-blue-400"
            >
              <span>💻</span>
              <span>IT & Admin</span>
            </Link>
            <Link
              to="/sales"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-amber-500/20 border border-gray-600 hover:border-amber-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-amber-400"
            >
              <span>💰</span>
              <span>Sales</span>
            </Link>
            <Link
              to="/customer-success"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-teal-500/20 border border-gray-600 hover:border-teal-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-teal-400"
            >
              <span>❤️</span>
              <span>Customer Success</span>
            </Link>
            <Link
              to="/marketing"
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-orange-500/20 border border-gray-600 hover:border-orange-500 rounded-lg transition-all text-xs font-medium text-gray-300 hover:text-orange-400"
            >
              <span>📢</span>
              <span>Marketing</span>
            </Link>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Health */}
          <div className={`${getHealthColor(executiveSummary?.overallHealth || 0)} border-2 rounded-lg p-6`}>
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
          <div className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="text-blue-400" size={32} />
              <p className="text-4xl font-bold text-white">{executiveSummary?.departmentsMonitored || 0}</p>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Departments Monitored</p>
            <p className="text-gray-500 text-xs mt-1">Full business coverage</p>
          </div>

          {/* Total KPIs */}
          <div className="bg-purple-500/10 border-2 border-purple-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-purple-400" size={32} />
              <p className="text-4xl font-bold text-white">{executiveSummary?.totalKPIs || 0}+</p>
            </div>
            <p className="text-gray-300 text-sm font-semibold">Total KPIs Tracked</p>
            <p className="text-gray-500 text-xs mt-1">Real-time monitoring</p>
          </div>

          {/* Critical Alerts */}
          <div className={`${(executiveSummary?.criticalAlerts || 0) > 0 ? 'bg-red-500/10 border-red-500' : 'bg-green-500/10 border-green-500'} border-2 rounded-lg p-6`}>
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
