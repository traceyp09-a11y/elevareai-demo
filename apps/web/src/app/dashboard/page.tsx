'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Tenant, Question, Department } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [tenantsData, questionsData] = await Promise.all([
          api.tenants.list(),
          api.assessments.getQuestions(),
        ]);
        setTenants(tenantsData as Tenant[]);
        setQuestions(questionsData as Question[]);

        // Get departments from Acme Corporation (demo tenant) or first tenant with departments
        if ((tenantsData as Tenant[]).length > 0) {
          const tenants = tenantsData as Tenant[];

          // Try to find Acme Corporation first
          let targetTenant = tenants.find(t => t.name === 'Acme Corporation');

          // If not found, try each tenant until we find one with departments
          if (!targetTenant) {
            for (const tenant of tenants) {
              const tenantWithDepts = await api.tenants.get(tenant.id);
              if ((tenantWithDepts as any).departments?.length > 0) {
                setDepartments((tenantWithDepts as any).departments);
                break;
              }
            }
          } else {
            const tenantWithDepts = await api.tenants.get(targetTenant.id);
            setDepartments((tenantWithDepts as any).departments || []);
          }
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-indigo-950 flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-cyan-400 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-indigo-950 flex items-center justify-center transition-colors duration-500">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md backdrop-blur-sm">
          <h2 className="text-red-800 dark:text-red-400 font-semibold mb-3 text-xl">Error Loading Dashboard</h2>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 text-xs">
            Make sure the API server is running on http://localhost:3001
          </p>
        </div>
      </div>
    );
  }

  const questionsByScope = questions.reduce(
    (acc, q) => {
      const scope = q.options?.scope || 'unknown';
      acc[scope] = (acc[scope] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const questionsByDimension = questions.reduce(
    (acc, q) => {
      acc[q.dimension] = (acc[q.dimension] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 dark:opacity-10 animate-float" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 dark:opacity-10 animate-float animation-delay-2000" />
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400">
                  Elevare AI Dashboard
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Platform overview and quick stats</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300 transition-colors"
              >
                ← Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Tenants" value={tenants.length} color="blue" gradient="from-blue-500 to-indigo-500" darkGradient="from-blue-400 to-indigo-400" />
          <StatCard title="Departments" value={departments.length} color="indigo" gradient="from-indigo-500 to-purple-500" darkGradient="from-indigo-400 to-purple-400" />
          <StatCard title="Assessment Questions" value={questions.length} color="green" gradient="from-green-500 to-emerald-500" darkGradient="from-green-400 to-emerald-400" />
          <StatCard
            title="Question Scopes"
            value={Object.keys(questionsByScope).length}
            color="purple"
            gradient="from-purple-500 to-pink-500"
            darkGradient="from-purple-400 to-pink-400"
          />
        </div>

        {/* Departments Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage AI readiness assessments by department
            </p>
          </div>
          <div className="p-8">
            {departments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No departments found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {departments.map((department) => (
                  <DepartmentCard key={department.id} department={department} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Questions Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Scope */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions by Scope</h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {Object.entries(questionsByScope).map(([scope, count]) => (
                  <div key={scope} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/30 border border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{scope.replace('_', ' ')}</span>
                    <span className="font-bold text-indigo-600 dark:text-cyan-400 text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Dimension */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Questions by Dimension</h2>
            </div>
            <div className="p-8">
              <div className="space-y-4">
                {Object.entries(questionsByDimension).map(([dimension, count]) => (
                  <div key={dimension} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800/50 dark:to-purple-900/30 border border-gray-200/50 dark:border-gray-700/50">
                    <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{dimension}</span>
                    <span className="font-bold text-purple-600 dark:text-pink-400 text-lg">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 rounded-2xl p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="absolute inset-0 rounded-full bg-green-500 dark:bg-green-400 animate-ping opacity-20" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                API Connected - All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentCard({ department }: { department: Department }) {
  const getDepartmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      sales: '💼',
      supply_chain: '🚚',
      finance: '💰',
      operations: '⚙️',
      admin: '📋',
      hr: '👥',
      hse: '🛡️',
      marketing: '📢',
      rnd: '🔬',
      procurement: '🛒',
      quality: '✅',
      customer_success: '🎯',
      strategy: '📈',
    };
    return icons[type] || '🏢';
  };

  const getDepartmentColors = (type: string) => {
    const colors: Record<string, { light: string; dark: string; gradient: string; darkGradient: string }> = {
      sales: {
        light: 'from-blue-50 to-indigo-50',
        dark: 'dark:from-blue-900/30 dark:to-indigo-900/30',
        gradient: 'from-blue-500 to-indigo-500',
        darkGradient: 'dark:from-blue-400 dark:to-indigo-400',
      },
      supply_chain: {
        light: 'from-green-50 to-emerald-50',
        dark: 'dark:from-green-900/30 dark:to-emerald-900/30',
        gradient: 'from-green-500 to-emerald-500',
        darkGradient: 'dark:from-green-400 dark:to-emerald-400',
      },
      finance: {
        light: 'from-yellow-50 to-amber-50',
        dark: 'dark:from-yellow-900/30 dark:to-amber-900/30',
        gradient: 'from-yellow-500 to-amber-500',
        darkGradient: 'dark:from-yellow-400 dark:to-amber-400',
      },
      operations: {
        light: 'from-purple-50 to-violet-50',
        dark: 'dark:from-purple-900/30 dark:to-violet-900/30',
        gradient: 'from-purple-500 to-violet-500',
        darkGradient: 'dark:from-purple-400 dark:to-violet-400',
      },
      admin: {
        light: 'from-gray-50 to-slate-50',
        dark: 'dark:from-gray-800/30 dark:to-slate-800/30',
        gradient: 'from-gray-500 to-slate-500',
        darkGradient: 'dark:from-gray-400 dark:to-slate-400',
      },
      hr: {
        light: 'from-pink-50 to-rose-50',
        dark: 'dark:from-pink-900/30 dark:to-rose-900/30',
        gradient: 'from-pink-500 to-rose-500',
        darkGradient: 'dark:from-pink-400 dark:to-rose-400',
      },
      hse: {
        light: 'from-orange-50 to-red-50',
        dark: 'dark:from-orange-900/30 dark:to-red-900/30',
        gradient: 'from-orange-500 to-red-500',
        darkGradient: 'dark:from-orange-400 dark:to-red-400',
      },
      marketing: {
        light: 'from-indigo-50 to-purple-50',
        dark: 'dark:from-indigo-900/30 dark:to-purple-900/30',
        gradient: 'from-indigo-500 to-purple-500',
        darkGradient: 'dark:from-indigo-400 dark:to-purple-400',
      },
      rnd: {
        light: 'from-violet-50 to-fuchsia-50',
        dark: 'dark:from-violet-900/30 dark:to-fuchsia-900/30',
        gradient: 'from-violet-500 to-fuchsia-500',
        darkGradient: 'dark:from-violet-400 dark:to-fuchsia-400',
      },
      procurement: {
        light: 'from-cyan-50 to-teal-50',
        dark: 'dark:from-cyan-900/30 dark:to-teal-900/30',
        gradient: 'from-cyan-500 to-teal-500',
        darkGradient: 'dark:from-cyan-400 dark:to-teal-400',
      },
      quality: {
        light: 'from-emerald-50 to-green-50',
        dark: 'dark:from-emerald-900/30 dark:to-green-900/30',
        gradient: 'from-emerald-500 to-green-500',
        darkGradient: 'dark:from-emerald-400 dark:to-green-400',
      },
      customer_success: {
        light: 'from-rose-50 to-pink-50',
        dark: 'dark:from-rose-900/30 dark:to-pink-900/30',
        gradient: 'from-rose-500 to-pink-500',
        darkGradient: 'dark:from-rose-400 dark:to-pink-400',
      },
      strategy: {
        light: 'from-teal-50 to-cyan-50',
        dark: 'dark:from-teal-900/30 dark:to-cyan-900/30',
        gradient: 'from-teal-500 to-cyan-500',
        darkGradient: 'dark:from-teal-400 dark:to-cyan-400',
      },
    };
    return colors[type] || {
      light: 'from-gray-50 to-slate-50',
      dark: 'dark:from-gray-800/30 dark:to-slate-800/30',
      gradient: 'from-gray-500 to-slate-500',
      darkGradient: 'dark:from-gray-400 dark:to-slate-400',
    };
  };

  const colors = getDepartmentColors(department.type);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.light} ${colors.dark} p-0.5 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} ${colors.darkGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{getDepartmentIcon(department.type)}</span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{department.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{department.type.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.darkGradient} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg`}
            onClick={() => alert(`Start Assessment for ${department.name}`)}
          >
            Start Assessment
          </button>
          <button
            className="w-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
            onClick={() => alert(`View ${department.name} Details`)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  gradient,
  darkGradient,
}: {
  title: string;
  value: number;
  color: 'blue' | 'indigo' | 'green' | 'purple';
  gradient: string;
  darkGradient: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} ${darkGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">{title}</h3>
        <p className={`text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient} ${darkGradient}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
