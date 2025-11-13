import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
              Built for Manufacturing, Construction & Logistics
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Operations with AI Readiness
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Strategic AI implementation platform designed for industrial enterprises
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
            Assess AI readiness across all departments, manage AI projects from R&D to deployment,
            ensure compliance, and measure ROI with confidence
          </p>
          <div className="mb-12 flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
            <button className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-600">
              Watch Demo
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Comprehensive AI Readiness for Industrial Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
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

          {/* Industry Focus Section */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
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

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Multi-tenant • SOC 2 Ready • GDPR Aligned • Enterprise Security
            </p>
            <p className="text-xs text-gray-400">
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
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow hover:border-indigo-300">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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
    <div className="text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 mb-4 text-xl">{title}</h3>
      <ul className="text-left space-y-2">
        {examples.map((example, index) => (
          <li key={index} className="text-sm text-gray-600 flex items-start">
            <span className="text-indigo-600 mr-2">✓</span>
            <span>{example}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
