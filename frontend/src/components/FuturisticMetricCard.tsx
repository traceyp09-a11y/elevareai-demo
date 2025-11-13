import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface FuturisticMetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  gradient?: string;
  subtitle?: string;
}

export default function FuturisticMetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  gradient = 'from-cyan-500 to-blue-600',
  subtitle
}: FuturisticMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />

      {/* Card */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
              animation: 'pulse-slow 3s ease-in-out infinite'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>

            {/* Icon with Gradient Background */}
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Value */}
          <div className="mb-2">
            <div
              className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block`}
            >
              {value}
            </div>
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${trendColors[trend]} flex items-center gap-1`}>
                <span className="text-lg">{trendIcons[trend]}</span>
                {change}
              </span>
              <span className="text-xs text-gray-500">vs last period</span>
            </div>
          )}
        </div>

        {/* Shine Effect on Hover */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none`}
        />
      </div>
    </div>
  );
}
