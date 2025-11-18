import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
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
import DashboardAdministration from './pages/DashboardAdministration';
import PainPointsAdministration from './pages/PainPointsAdministration';
import DashboardSales from './pages/DashboardSales';
import PainPointsSales from './pages/PainPointsSales';
import DashboardCustomerSuccess from './pages/DashboardCustomerSuccess';
import PainPointsCustomerSuccess from './pages/PainPointsCustomerSuccess';
import DashboardMarketing from './pages/DashboardMarketing';
import PainPointsMarketing from './pages/PainPointsMarketing';
import DashboardExecutive from './pages/DashboardExecutive';
import BoardReports from './pages/BoardReports';
import StrategicView from './pages/StrategicView';
import ElevareLogo from './components/ElevareLogo';
import ErrorBoundary from './components/ErrorBoundary';
import UserMenu from './components/UserMenu';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isHSE = location.pathname.startsWith('/hse');
  const isOps = location.pathname.startsWith('/ops');
  const isQC = location.pathname.startsWith('/qc');
  const isSC = location.pathname.startsWith('/supplychain');
  const isFinance = location.pathname.startsWith('/finance');
  const isAdmin = location.pathname.startsWith('/administration');
  const isSales = location.pathname.startsWith('/sales');
  const isCustomerSuccess = location.pathname.startsWith('/customer-success');
  const isMarketing = location.pathname.startsWith('/marketing');
  const isExecutive = location.pathname.startsWith('/executive');
  const currentDept = isHSE ? 'hse' : isOps ? 'ops' : isQC ? 'qc' : isSC ? 'supplychain' : isFinance ? 'finance' : isAdmin ? 'administration' : isSales ? 'sales' : isCustomerSuccess ? 'customer-success' : isMarketing ? 'marketing' : isExecutive ? 'executive' : 'hr';
  const [deptMenuOpen, setDeptMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header with Dark Theme - Hidden on Login Page */}
      {!isLoginPage && (
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-50 shadow-xl shadow-black/50">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo & Department Selector */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <ElevareLogo variant="dark" size="md" />
              </Link>

              {/* Elegant Department Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDeptMenuOpen(!deptMenuOpen)}
                  className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 rounded-lg transition-all duration-300 group"
                >
                  <span className="text-lg">
                    {currentDept === 'hr' ? '👥' : currentDept === 'hse' ? '🦺' : currentDept === 'ops' ? '⚙️' : currentDept === 'qc' ? '✓' : currentDept === 'supplychain' ? '🚚' : currentDept === 'finance' ? '💰' : currentDept === 'administration' ? '💻' : currentDept === 'sales' ? '💵' : currentDept === 'customer-success' ? '❤️' : currentDept === 'marketing' ? '📢' : '💼'}
                  </span>
                  <span className="text-base font-semibold text-white">
                    {currentDept === 'hr' ? 'HR Analytics' : currentDept === 'hse' ? 'HSE Analytics' : currentDept === 'ops' ? 'Operations' : currentDept === 'qc' ? 'Quality Control' : currentDept === 'supplychain' ? 'Supply Chain' : currentDept === 'finance' ? 'Finance' : currentDept === 'administration' ? 'IT & Admin' : currentDept === 'sales' ? 'Sales & Revenue' : currentDept === 'customer-success' ? 'Customer Success' : currentDept === 'marketing' ? 'Marketing' : 'Executive View'}
                  </span>
                  <svg className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${deptMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {deptMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDeptMenuOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-72 bg-gray-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                      <div className="p-2 space-y-1">
                        <Link to="/" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'hr' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">👥</span>
                          <span className="font-medium">HR Analytics</span>
                        </Link>
                        <Link to="/hse" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'hse' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">🦺</span>
                          <span className="font-medium">HSE Analytics</span>
                        </Link>
                        <Link to="/ops" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'ops' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">⚙️</span>
                          <span className="font-medium">Operations</span>
                        </Link>
                        <Link to="/qc" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'qc' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">✓</span>
                          <span className="font-medium">Quality Control</span>
                        </Link>
                        <Link to="/supplychain" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'supplychain' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">🚚</span>
                          <span className="font-medium">Supply Chain</span>
                        </Link>
                        <Link to="/finance" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'finance' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">💰</span>
                          <span className="font-medium">Finance</span>
                        </Link>
                        <Link to="/administration" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'administration' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">💻</span>
                          <span className="font-medium">IT & Administration</span>
                        </Link>
                        <Link to="/sales" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'sales' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">💵</span>
                          <span className="font-medium">Sales & Revenue</span>
                        </Link>
                        <Link to="/customer-success" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'customer-success' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">❤️</span>
                          <span className="font-medium">Customer Success</span>
                        </Link>
                        <Link to="/marketing" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'marketing' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}`}>
                          <span className="text-lg">📢</span>
                          <span className="font-medium">Marketing</span>
                        </Link>
                        <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2"></div>
                        <Link to="/executive" onClick={() => setDeptMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${currentDept === 'executive' ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300' : 'text-gray-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 hover:text-white'}`}>
                          <span className="text-lg">💼</span>
                          <span className="font-semibold">Executive View</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-2">
              {currentDept === 'hr' && (
                <>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/reports"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Custom Reports</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/pain-points"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
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
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/predictive"
                    className="text-gray-300 hover:text-purple-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">🔮 Predictive Analytics</span>
                    <div className="absolute inset-0 bg-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/reports"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">HSE Reports</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/hse/pain-points"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
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
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/ops/reports"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Operations Reports</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/ops/pain-points"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
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
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/qc/reports"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">QC Reports</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/qc/pain-points"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
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
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/supplychain/reports"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">SC Reports</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/supplychain/pain-points"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
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
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/finance/reports"
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Finance Reports</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/finance/pain-points"
                    className="text-gray-300 hover:text-green-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'administration' && (
                <>
                  <Link
                    to="/administration"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/administration/reports"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">IT Reports</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/administration/pain-points"
                    className="text-gray-300 hover:text-blue-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'sales' && (
                <>
                  <Link
                    to="/sales"
                    className="text-gray-300 hover:text-amber-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/sales/reports"
                    className="text-gray-300 hover:text-amber-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Sales Reports</span>
                    <div className="absolute inset-0 bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/sales/pain-points"
                    className="text-gray-300 hover:text-amber-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'customer-success' && (
                <>
                  <Link
                    to="/customer-success"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/customer-success/reports"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">CS Reports</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/customer-success/pain-points"
                    className="text-gray-300 hover:text-teal-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-teal-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'marketing' && (
                <>
                  <Link
                    to="/marketing"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Dashboard</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/marketing/reports"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Marketing Reports</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/marketing/pain-points"
                    className="text-gray-300 hover:text-orange-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Pain Points</span>
                    <div className="absolute inset-0 bg-orange-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
              {currentDept === 'executive' && (
                <>
                  <Link
                    to="/executive"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Overview</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/executive/board-reports"
                    className="text-gray-300 hover:text-purple-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Board Reports</span>
                    <div className="absolute inset-0 bg-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                  <Link
                    to="/executive/strategic"
                    className="text-gray-300 hover:text-cyan-400 px-4 py-2 text-[13px] font-semibold transition-all duration-200 relative group rounded-lg"
                  >
                    <span className="relative z-10">Strategic View</span>
                    <div className="absolute inset-0 bg-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </Link>
                </>
              )}
            </nav>

            {/* Company Info & User Menu */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-bold text-white tracking-wide">TitanBuild M&L</p>
                <p className="text-xs text-cyan-400 font-medium">Q4 2024</p>
              </div>
              <div className="h-10 w-px bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <main>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

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

          {/* IT & Administration Analytics Routes */}
          <Route path="/administration" element={<DashboardAdministration />} />
          <Route path="/administration/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/administration/reports" element={<CustomReports />} />
          <Route path="/administration/pain-points" element={<PainPointsAdministration />} />

          {/* Sales & Revenue Analytics Routes */}
          <Route path="/sales" element={<DashboardSales />} />
          <Route path="/sales/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/sales/reports" element={<CustomReports />} />
          <Route path="/sales/pain-points" element={<PainPointsSales />} />

          {/* Customer Success & Experience Analytics Routes */}
          <Route path="/customer-success" element={<DashboardCustomerSuccess />} />
          <Route path="/customer-success/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/customer-success/reports" element={<CustomReports />} />
          <Route path="/customer-success/pain-points" element={<PainPointsCustomerSuccess />} />

          {/* Marketing Analytics Routes */}
          <Route path="/marketing" element={<DashboardMarketing />} />
          <Route path="/marketing/kpi/:kpiName" element={<KPIDetail />} />
          <Route path="/marketing/reports" element={<CustomReports />} />
          <Route path="/marketing/pain-points" element={<PainPointsMarketing />} />

          {/* Executive Routes */}
          <Route path="/executive" element={
            <ErrorBoundary fallbackMessage="Unable to load Executive Dashboard. The page may be updating. Please refresh in a moment.">
              <DashboardExecutive />
            </ErrorBoundary>
          } />
          <Route path="/executive/board-reports" element={
            <ErrorBoundary fallbackMessage="Unable to load Board Reports. The page may be updating. Please refresh in a moment.">
              <BoardReports />
            </ErrorBoundary>
          } />
          <Route path="/executive/strategic" element={
            <ErrorBoundary fallbackMessage="Unable to load Strategic View. The page may be updating. Please refresh in a moment.">
              <StrategicView />
            </ErrorBoundary>
          } />
        </Routes>
      </main>

      {/* Footer - Hidden on Login Page */}
      {!isLoginPage && (
      <footer className="bg-gray-900/95 backdrop-blur-md border-t border-cyan-500/20 mt-16">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-center text-sm text-gray-400">
              © 2024 ElevareIQ Platform | Enterprise Analytics for Manufacturing & Logistics
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-400/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>All Calculations Transparent & Auditable</span>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
