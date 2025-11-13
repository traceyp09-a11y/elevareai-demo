import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AnimatedChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: string;
  children: ReactNode;
  actions?: ReactNode;
  fullHeight?: boolean;
}

export default function AnimatedChartCard({
  title,
  subtitle,
  icon: Icon,
  gradient = 'from-cyan-500 to-blue-600',
  children,
  actions,
  fullHeight = false
}: AnimatedChartCardProps) {
  return (
    <div className="relative group">
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500`} />

      {/* Card */}
      <div className={`relative rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden ${fullHeight ? 'h-full' : ''}`}>
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          />
        </div>

        {/* Header */}
        <div className="relative z-10 p-6 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {Icon && (
                <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex-1">
                <h3 className={`text-lg font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>

        {/* Shine Effect on Hover */}
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/3 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"
        />

        {/* Corner Accent */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 blur-3xl group-hover:opacity-10 transition-opacity duration-500`} />
      </div>
    </div>
  );
}
