import React, { useState } from 'react';
import { X, Info } from 'lucide-react';

interface CalculationDetailsProps {
  kpiName: string;
  calculation?: {
    formula: string;
    components: { [key: string]: any };
    steps: string[];
  };
  children?: React.ReactNode;
}

export default function CalculationDetails({ kpiName, calculation, children }: CalculationDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!calculation) {
    // If no calculation but has children, render children without click handler
    return children ? <>{children}</> : null;
  }

  // If children provided, make them clickable; otherwise show info button
  const trigger = children ? (
    <div onClick={() => setIsOpen(true)}>
      {children}
    </div>
  ) : (
    <button
      onClick={() => setIsOpen(true)}
      className="ml-2 p-1 rounded-full hover:bg-gray-700/50 transition-colors group"
      title="View calculation details"
    >
      <Info className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
    </button>
  );

  return (
    <>
      {trigger}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-cyan-400">🧮</span>
                {kpiName} Calculation
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Formula */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Formula
                </h4>
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4">
                  <code className="text-cyan-300 font-mono text-sm">{calculation.formula}</code>
                </div>
              </div>

              {/* Components */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Components
                </h4>
                <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                  {calculation.components && Object.entries(calculation.components).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                      <span className="text-gray-300 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-white font-mono">
                        {typeof value === 'number'
                          ? value.toLocaleString()
                          : typeof value === 'object' && value !== null
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </div>
                  ))}
                  {!calculation.components && (
                    <p className="text-gray-400 text-sm">No component data available</p>
                  )}
                </div>
              </div>

              {/* Step-by-Step */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Step-by-Step Calculation
                </h4>
                <div className="space-y-3">
                  {calculation.steps && calculation.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-cyan-400">{index + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                  {!calculation.steps && (
                    <p className="text-gray-400 text-sm">No calculation steps available</p>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> All calculations are transparent and auditable. This ensures
                  compliance with industry standards and regulatory requirements.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
