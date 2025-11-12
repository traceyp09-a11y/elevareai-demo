import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Elevare AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Enterprise SaaS Platform for AI Readiness, Portfolio Management, Compliance & ROI
            Analytics
          </p>
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Go to Dashboard
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <ModuleCard
                title="Strategic Dashboard"
                description="Real-time AI readiness scoring by department with portfolio status and ROI summaries"
              />
              <ModuleCard
                title="AI Assessment"
                description="Interactive multi-step wizard with benchmarking and auto-generated reports"
              />
              <ModuleCard
                title="Portfolio Management"
                description="Project lifecycle tracking from intake to benefits realization with Jira integration"
              />
              <ModuleCard
                title="Compliance Monitoring"
                description="Real-time scoring across privacy, security, model risk, and ethics with alerts"
              />
              <ModuleCard
                title="ROI Analytics"
                description="Project-level ROI with scenarios, payback analysis, and portfolio aggregation"
              />
              <ModuleCard
                title="Integrations"
                description="Okta SSO, Snowflake data connector, and Jira cloud synchronization"
              />
            </div>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>Multi-tenant • SOC 2 Ready • GDPR Aligned • Enterprise Security</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
