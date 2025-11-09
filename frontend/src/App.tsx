import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KPIDetail from './pages/KPIDetail';
import PainPoints from './pages/PainPoints';
import CustomReports from './pages/CustomReports';
import DashboardHSE from './pages/DashboardHSE';
import PainPointsHSE from './pages/PainPointsHSE';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import MobileSafetyApp from './pages/MobileSafetyApp';
import DashboardOps from './pages/DashboardOps';
import PainPointsOps from './pages/PainPointsOps';
import DashboardQC from './pages/DashboardQC';
import PainPointsQC from './pages/PainPointsQC';
import DashboardSupplyChain from './pages/DashboardSupplyChain';
import PainPointsSupplyChain from './pages/PainPointsSupplyChain';
import DashboardFinance from './pages/DashboardFinance';
import PainPointsFinance from './pages/PainPointsFinance';
import ElevareLogo from './components/ElevareLogo';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHSE = location.pathname.startsWith('/hse');
  const isOps = location.pathname.startsWith('/ops');
  const isQC = location.pathname.startsWith('/qc');
  const isSC = location.pathname.startsWith('/supplychain');
  const isFinance = location.pathname.startsWith('/finance');
  const isExecutive = location.pathname.startsWith('/executive');
  const currentDept = isHSE ? 'hse' : isOps ? 'ops' : isQC ? 'qc' : isSC ? 'supplychain' : isFinance ? 'finance' : isExecutive ? 'executive' : 'hr';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header with Dark Theme */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Department Switcher */}
          <div className="flex items-center justify-center gap-2 py-2 border-b border-gray-700/50">
            <span className="text-xs text-gray-500 mr-2">Department:</span>
            <Link
              to="/"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'hr'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              👥 HR Analytics
            </Link>
            <Link
              to="/hse"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'hse'
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              🦺 HSE Analytics
            </Link>
            <Link
              to="/ops"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'ops'
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              ⚙️ Operations Analytics
            </Link>
            <Link
              to="/qc"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'qc'
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              ✓ Quality Control Analytics
            </Link>
            <Link
              to="/supplychain"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'supplychain'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              🚚 Supply Chain Analytics
            </Link>
            <Link
              to="/finance"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'finance'
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              💰 Finance Analytics
            </Link>
            <Link
              to="/executive"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentDept === 'executive'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              }`}
            >
              💼 Executive Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <ElevareLogo variant="dark" size="md" />
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <span className="text-sm font-semibold text-cyan-400">
                {currentDept === 'hr' ? 'HR Analytics' : currentDept === 'hse' ? 'HSE Analytics' : currentDept === 'ops' ? 'Operations Analytics' : currentDept === 'qc' ? 'Quality Control Analytics' : currentDept === 'supplychain' ? 'Supply Chain Analytics' : currentDept === 'finance' ? 'Finance Analytics' : 'Executive View'}
              </span>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-6">
              {currentDept === 'hr' && (
                <>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/reports"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Custom Reports</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/pain-points"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'hse' && (
                <>
                  <Link
                    to="/hse"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/predictive"
                    className="text-gray-300 hover:text-purple-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">🔮 Predictive Analytics</span>
                    <div className="absolute inset-0 bg-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/reports"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">HSE Reports</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/pain-points"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'ops' && (
                <>
                  <Link
                    to="/ops"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/ops/reports"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Operations Reports</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/ops/pain-points"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'qc' && (
                <>
                  <Link
                    to="/qc"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/qc/reports"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">QC Reports</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/qc/pain-points"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'supplychain' && (
                <>
                  <Link
                    to="/supplychain"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/supplychain/reports"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">SC Reports</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/supplychain/pain-points"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'finance' && (
                <>
                  <Link
                    to="/finance"
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/finance/reports"
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Finance Reports</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/finance/pain-points"
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'executive' && (
                <>
                  <Link
                    to="/executive"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Overview</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/executive/strategic"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-200 relative group"
                  >
                    <span className="relative z-10">Strategic View</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
            </nav>

            {/* Company Info */}
            <div className="text-right">
              <p className="text-sm font-semibold text-white">TitanBuild M&L</p>
              <p className="text-xs text-cyan-400">Q4 2024</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Routes>
          {/* HR Analytics Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/reports" element={<CustomReports />} />
          <Route path="/pain-points" element={<PainPoints />} />

          {/* HSE Analytics Routes */}
          <Route path="/hse" element={<DashboardHSE />} />
          <Route path="/hse/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/hse/predictive" element={<PredictiveAnalytics />} />
          <Route path="/hse/reports" element={<CustomReports />} />
          <Route path="/hse/pain-points" element={<PainPointsHSE />} />
          <Route path="/hse/mobile" element={<MobileSafetyApp />} />

          {/* Operations Analytics Routes */}
          <Route path="/ops" element={<DashboardOps />} />
          <Route path="/ops/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/ops/reports" element={<CustomReports />} />
          <Route path="/ops/pain-points" element={<PainPointsOps />} />

          {/* Quality Control Analytics Routes */}
          <Route path="/qc" element={<DashboardQC />} />
          <Route path="/qc/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/qc/reports" element={<CustomReports />} />
          <Route path="/qc/pain-points" element={<PainPointsQC />} />

          {/* Supply Chain Analytics Routes */}
          <Route path="/supplychain" element={<DashboardSupplyChain />} />
          <Route path="/supplychain/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/supplychain/reports" element={<CustomReports />} />
          <Route path="/supplychain/pain-points" element={<PainPointsSupplyChain />} />

          {/* Finance Analytics Routes */}
          <Route path="/finance" element={<DashboardFinance />} />
          <Route path="/finance/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/finance/reports" element={<CustomReports />} />
          <Route path="/finance/pain-points" element={<PainPointsFinance />} />

          {/* Executive Routes - Placeholder for now */}
          <Route path="/executive" element={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                  Executive Dashboard - Coming Soon
                </h1>
                <p className="text-gray-400 text-lg">
                  Unified view combining HR and HSE metrics for C-Suite executives.
                </p>
              </div>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-cyan-500/30 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-400">
            © 2024 ElevareIQ Platform | HR • HSE • Operations • Quality Control • Supply Chain • Finance Analytics for C-Suite Executives |
            <span className="ml-2 text-cyan-400">All Calculations Transparent & Auditable</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
