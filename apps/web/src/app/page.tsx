import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-500">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 dark:opacity-10 animate-float" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 dark:opacity-10 animate-float animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-20 dark:opacity-10 animate-float animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-500 dark:via-blue-500 dark:to-indigo-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-indigo-500/50 dark:shadow-cyan-500/50 animate-gradient-shift bg-200%">
              Built for Manufacturing, Construction & Logistics
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 mb-6 leading-tight">
            Transform Your Operations with AI Readiness
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-4 font-medium">
            Strategic AI implementation platform designed for industrial enterprises
          </p>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Assess AI readiness across all departments, manage AI projects from R&D to deployment,
            ensure compliance, and measure ROI with confidence
          </p>

          <div className="mb-16 flex gap-4 justify-center flex-wrap">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-500 dark:via-blue-500 dark:to-indigo-500 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Go to Dashboard
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 dark:from-cyan-600 dark:via-blue-600 dark:to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <button className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-cyan-400 transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl border-2 border-indigo-600 dark:border-cyan-500 shadow-lg hover:shadow-xl hover:scale-105">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Features Grid - Glass Morphism */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Comprehensive AI Readiness for Industrial Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              <ModuleCard
                icon="📊"
                title="AI Readiness Assessment"
                description="Evaluate 13 departments from Operations to R&D. Benchmark against industry standards for manufacturing, construction, and logistics."
              />
              <ModuleCard
                icon="🎯"
                title="Project Portfolio Management"
                description="Track AI initiatives from proof-of-concept to production. Manage procurement, quality assurance, and deployment timelines."
              />
              <ModuleCard
                icon="💰"
                title="ROI Analytics & Forecasting"
                description="Calculate payback periods for AI investments. Model scenarios for automation, predictive maintenance, and supply chain optimization."
              />
              <ModuleCard
                icon="✅"
                title="Compliance & Risk Management"
                description="Monitor ISO 42001, NIST AI RMF, and industry-specific safety standards. Track HSE compliance for AI deployments."
              />
              <ModuleCard
                icon="🔬"
                title="Innovation Pipeline"
                description="Manage R&D experiments, pilot programs, and technology partnerships. Connect strategy to execution."
              />
              <ModuleCard
                icon="🔗"
                title="Enterprise Integrations"
                description="Connect with Okta SSO, Snowflake warehouses, and Jira. Secure data flows for multi-site operations."
              />
            </div>
          </div>

          {/* Industry Focus Section - Glass Morphism */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
              Built for Your Industry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <IndustryCard
                icon="🏭"
                title="Manufacturing"
                examples={[
                  'Predictive maintenance',
                  'Quality control automation',
                  'Supply chain optimization',
                  'Production forecasting',
                ]}
              />
              <IndustryCard
                icon="🏗️"
                title="Construction"
                examples={[
                  'Project risk assessment',
                  'Resource optimization',
                  'Safety monitoring',
                  'Schedule prediction',
                ]}
              />
              <IndustryCard
                icon="📦"
                title="Logistics"
                examples={[
                  'Route optimization',
                  'Demand forecasting',
                  'Warehouse automation',
                  'Fleet management',
                ]}
              />
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              Multi-tenant • SOC 2 Ready • GDPR Aligned • Enterprise Security
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Trusted by industrial enterprises to assess, deploy, and measure AI initiatives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-400/50 dark:hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 dark:from-cyan-500/0 dark:via-blue-500/0 dark:to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 dark:group-hover:from-cyan-500/10 dark:group-hover:via-blue-500/10 dark:group-hover:to-indigo-500/10 transition-all duration-300" />
      <div className="relative z-10">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function IndustryCard({
  icon,
  title,
  examples,
}: {
  icon: string;
  title: string;
  examples: string[];
}) {
  return (
    <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-indigo-400/50 dark:hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:scale-105">
      <div className="text-6xl mb-5 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-2xl">{title}</h3>
      <ul className="text-left space-y-3">
        {examples.map((example, index) => (
          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
            <span className="text-indigo-600 dark:text-cyan-400 mr-2 font-bold text-base">✓</span>
            <span>{example}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
