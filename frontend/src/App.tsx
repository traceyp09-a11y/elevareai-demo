import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KPIDetail from './pages/KPIDetail';
import PainPoints from './pages/PainPoints';
import CustomReports from './pages/CustomReports';
import ElevareLogo from './components/ElevareLogo';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header with Dark Theme */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/30 sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                  <ElevareLogo variant="dark" size="md" />
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex space-x-6">
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/kpi/:kpiName" element={<KPIDetail />} />
            <Route path="/reports" element={<CustomReports />} />
            <Route path="/pain-points" element={<PainPoints />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-cyan-500/30 mt-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-400">
              © 2024 ElevareIQ Platform | For Director-VP Level HR Analytics |
              <span className="ml-2 text-cyan-400">All Calculations Transparent & Auditable</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
