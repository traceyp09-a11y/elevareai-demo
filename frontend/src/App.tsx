import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KPIDetail from './pages/KPIDetail';
import PainPoints from './pages/PainPoints';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-blue-600">ElevareIQ</h1>
                  <p className="text-xs text-gray-500">HR Analytics Platform</p>
                </div>
              </div>
              <nav className="flex space-x-8">
                <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/pain-points" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Pain Points
                </Link>
              </nav>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">TitanBuild M&L</p>
                <p className="text-xs text-gray-500">Q4 2024</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/kpi/:kpiName" element={<KPIDetail />} />
            <Route path="/pain-points" element={<PainPoints />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              © 2024 ElevareIQ Platform | For Director-VP Level HR Analytics |
              <span className="ml-2 text-blue-600">All Calculations Transparent & Auditable</span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
