import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  calculateEnterpriseROI,
  calculateHRROI,
  calculateHSEROI,
  calculateOperationsROI,
  calculateQualityControlROI,
  formatCurrency,
  formatPercentage,
  getConfidenceColor,
  DepartmentROI,
} from '../utils/roiCalculations';
import ElevareLogo from '../components/ElevareLogo';

export default function ROIDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const enterpriseROI = calculateEnterpriseROI();

  const departmentCalculators: { [key: string]: () => DepartmentROI } = {
    HR: calculateHRROI,
    HSE: calculateHSEROI,
    Operations: calculateOperationsROI,
    'Quality Control': calculateQualityControlROI,
  };

  const selectedDeptData = selectedDepartment ? departmentCalculators[selectedDepartment]() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <ElevareLogo size="lg" variant="dark" />
            <div className="text-right text-sm text-gray-400">
              <div className="font-semibold text-white">Business Case</div>
              <div>ROI & Financial Impact Analysis</div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  ROI & Time Savings Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                  Quantified financial impact and productivity gains from ElevareIQ implementation
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 text-sm font-medium">TOTAL ANNUAL SAVINGS</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(enterpriseROI.totalAnnualSavings)}
            </div>
            <p className="text-sm text-gray-400">per year across all departments</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-cyan-400 text-sm font-medium">ROI</span>
              <span className="text-3xl">📈</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {formatPercentage(enterpriseROI.totalROI)}
            </div>
            <p className="text-sm text-gray-400">return on investment</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-blue-400 text-sm font-medium">PAYBACK PERIOD</span>
              <span className="text-3xl">⏱️</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {enterpriseROI.paybackMonths.toFixed(1)}
            </div>
            <p className="text-sm text-gray-400">months to break even</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-purple-400 text-sm font-medium">3-YEAR NPV</span>
              <span className="text-3xl">🎯</span>
            </div>
            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(enterpriseROI.threeYearNPV)}
            </div>
            <p className="text-sm text-gray-400">net present value @ 8% discount</p>
          </div>
        </div>

        {/* Investment Breakdown */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💼</span> Investment Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-2">Annual Licensing</div>
              <div className="text-2xl font-bold text-white">$150,000</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Implementation (One-Time)</div>
              <div className="text-2xl font-bold text-white">$50,000</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Training (One-Time)</div>
              <div className="text-2xl font-bold text-white">$25,000</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-2">Annual Support</div>
              <div className="text-2xl font-bold text-white">$30,000</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-300">Total First Year Investment</span>
              <span className="text-3xl font-bold text-cyan-400">{formatCurrency(enterpriseROI.totalInvestment)}</span>
            </div>
          </div>
        </div>

        {/* Department Selection */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🏢</span> Department ROI Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.keys(departmentCalculators).map((dept) => {
              const deptROI = departmentCalculators[dept]();
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedDepartment === dept
                      ? 'border-cyan-500 bg-cyan-900/30'
                      : 'border-gray-700 bg-gray-900/50 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="text-lg font-bold text-white mb-2">{dept}</div>
                  <div className="text-sm text-gray-400 mb-3">Annual Savings</div>
                  <div className="text-2xl font-bold text-cyan-400">{formatCurrency(deptROI.potentialSavings)}</div>
                  <div className="mt-3 text-sm">
                    <span className="text-gray-400">ROI: </span>
                    <span className="text-green-400 font-semibold">{formatPercentage(deptROI.roiPercentage)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Department Details */}
          {selectedDeptData && (
            <div className="mt-8 space-y-6 animate-fade-in">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-6">{selectedDepartment} - Time Savings Analysis</h3>
                <div className="space-y-4">
                  {selectedDeptData.timeSavings.map((ts, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold text-white text-lg">{ts.activity}</div>
                          <div className="text-sm text-gray-400 mt-1">
                            Labor Rate: ${ts.burdedLaborRate}/hour (burdened)
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{formatCurrency(ts.annualSavingsDollars)}</div>
                          <div className="text-sm text-gray-400">annual savings</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-700">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Current Time</div>
                          <div className="text-lg font-semibold text-red-400">{ts.currentTimeHours} hrs</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">With ElevareIQ</div>
                          <div className="text-lg font-semibold text-green-400">{ts.elevareIQTimeHours} hrs</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Time Saved</div>
                          <div className="text-lg font-semibold text-cyan-400">
                            {ts.savingsHours} hrs ({formatPercentage(ts.savingsPercentage)})
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-300">Total Time Savings Value</span>
                    <span className="text-3xl font-bold text-green-400">
                      {formatCurrency(selectedDeptData.timeSavings.reduce((sum, ts) => sum + ts.annualSavingsDollars, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-cyan-400 mb-6">{selectedDepartment} - Operational Impact</h3>
                <div className="space-y-4">
                  {selectedDeptData.metrics.map((metric, idx) => (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-lg mb-2">{metric.metricName}</div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Current</div>
                              <div className="text-lg font-semibold text-yellow-400">
                                {metric.currentValue} {metric.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400 mb-1">Target</div>
                              <div className="text-lg font-semibold text-green-400">
                                {metric.targetValue} {metric.unit}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-green-400">{formatCurrency(metric.annualCostImpact)}</div>
                          <div className="text-sm text-gray-400">annual impact</div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-700 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Time to Value:</span>
                          <span className="text-white font-medium">{metric.timeToValue} months</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Confidence Level:</span>
                          <span className={`font-semibold uppercase ${getConfidenceColor(metric.confidenceLevel)}`}>
                            {metric.confidenceLevel}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-1">Calculation Method:</div>
                          <div className="text-xs text-gray-300 font-mono bg-gray-900/50 p-2 rounded">
                            {metric.calculationMethod}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-300">Total Operational Impact</span>
                    <span className="text-3xl font-bold text-green-400">
                      {formatCurrency(selectedDeptData.metrics.reduce((sum, m) => sum + m.annualCostImpact, 0))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">{selectedDepartment} - Total ROI Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Total Annual Savings</div>
                    <div className="text-3xl font-bold text-green-400">{formatCurrency(selectedDeptData.potentialSavings)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Department ROI</div>
                    <div className="text-3xl font-bold text-cyan-400">{formatPercentage(selectedDeptData.roiPercentage)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Payback Period</div>
                    <div className="text-3xl font-bold text-blue-400">{selectedDeptData.paybackMonths.toFixed(1)} months</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Key Insights */}
        <div className="bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span> Key Business Case Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="font-semibold text-white mb-1">Rapid Payback</div>
                <p className="text-sm text-gray-300">
                  Platform investment pays for itself in {enterpriseROI.paybackMonths.toFixed(1)} months through time savings and operational improvements alone
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <div className="font-semibold text-white mb-1">87% Time Reduction</div>
                <p className="text-sm text-gray-300">
                  Automated reporting reduces manual effort by 87% on average, freeing analysts for strategic work
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-white mb-1">Measurable Impact</div>
                <p className="text-sm text-gray-300">
                  Every KPI improvement is tied to specific dollar savings with transparent calculation methodologies
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-900/50 p-4 rounded-lg">
              <span className="text-2xl">📈</span>
              <div>
                <div className="font-semibold text-white mb-1">Compounding Returns</div>
                <p className="text-sm text-gray-300">
                  3-year NPV of {formatCurrency(enterpriseROI.threeYearNPV)} assumes continuous improvement and expanding benefits
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
