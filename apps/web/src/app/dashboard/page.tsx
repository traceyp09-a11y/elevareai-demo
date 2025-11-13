'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Tenant, Question, Department } from '@/types';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <p className="text-gray-600 text-xs mt-4">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Elevare AI Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform overview and quick stats</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Tenants" value={tenants.length} color="blue" />
          <StatCard title="Departments" value={departments.length} color="indigo" />
          <StatCard title="Assessment Questions" value={questions.length} color="green" />
          <StatCard
            title="Question Scopes"
            value={Object.keys(questionsByScope).length}
            color="purple"
          />
        </div>

        {/* Departments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage AI readiness assessments by department
            </p>
          </div>
          <div className="p-6">
            {departments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No departments found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Questions by Scope</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(questionsByScope).map(([scope, count]) => (
                  <div key={scope} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{scope.replace('_', ' ')}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Dimension */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Questions by Dimension</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(questionsByDimension).map(([dimension, count]) => (
                  <div key={dimension} className="flex items-center justify-between">
                    <span className="text-gray-700 capitalize">{dimension}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
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

  const getDepartmentColor = (type: string) => {
    const colors: Record<string, string> = {
      sales: 'border-blue-200 bg-blue-50',
      supply_chain: 'border-green-200 bg-green-50',
      finance: 'border-yellow-200 bg-yellow-50',
      operations: 'border-purple-200 bg-purple-50',
      admin: 'border-gray-200 bg-gray-50',
      hr: 'border-pink-200 bg-pink-50',
      hse: 'border-orange-200 bg-orange-50',
      marketing: 'border-indigo-200 bg-indigo-50',
      rnd: 'border-violet-200 bg-violet-50',
      procurement: 'border-cyan-200 bg-cyan-50',
      quality: 'border-emerald-200 bg-emerald-50',
      customer_success: 'border-rose-200 bg-rose-50',
      strategy: 'border-teal-200 bg-teal-50',
    };
    return colors[type] || 'border-gray-200 bg-gray-50';
  };

  return (
    <div
      className={`border-2 rounded-lg p-5 hover:shadow-lg transition-all ${getDepartmentColor(
        department.type
      )}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getDepartmentIcon(department.type)}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{department.name}</h3>
            <p className="text-xs text-gray-600 capitalize">{department.type.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => alert(`Start Assessment for ${department.name}`)}
        >
          Start Assessment
        </button>
        <button
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors"
          onClick={() => alert(`View ${department.name} Details`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: 'blue' | 'indigo' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}
