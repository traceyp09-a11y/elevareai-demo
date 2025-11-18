import React from 'react';
import { TrendingUp, TrendingDown, Minus, Zap, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * Premium Circular Progress Ring - C-Suite Status Indicator
 * Features: Smooth animations, gradient colors, responsive sizing
 */
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  showLabel?: boolean;
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  status = 'good',
  showLabel = true,
  label = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const statusColors = {
    excellent: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.1)' },
    good: { stroke: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(59, 130, 246, 0.1)' },
    warning: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.1)' },
    critical: { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.3)', bg: 'rgba(239, 68, 68, 0.1)' }
  };

  const colors = statusColors[status];

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle with gradient */}
        <defs>
          <linearGradient id={`gradient-${status}-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`glow-${status}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${status}-${value})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#glow-${status})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{value}</span>
        {showLabel && <span className="text-xs text-gray-400 mt-1">{label}</span>}
      </div>
    </div>
  );
};

/**
 * Mini Sparkline Chart - Trend visualization for KPIs
 * Shows last 7 data points with smooth curves
 */
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export const MiniSparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 30,
  color = '#3b82f6',
  showDots = false,
  trend = 'stable'
}) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[index - 1];
    const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3;
    const cpy1 = prevPoint.y;
    const cpx2 = prevPoint.x + 2 * (point.x - prevPoint.x) / 3;
    const cpy2 = point.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
  }, '');

  const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    stable: '#6b7280'
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trendColors[trend]} stopOpacity="0.3" />
          <stop offset="100%" stopColor={trendColors[trend]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Fill area under curve */}
      <path
        d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#sparkline-gradient-${trend})`}
      />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={trendColors[trend]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2.5"
          fill={trendColors[trend]}
          className="drop-shadow-md"
        />
      ))}
    </svg>
  );
};

/**
 * Executive KPI Card - Premium metric display
 * Features: Trend indicators, sparklines, status colors
 */
interface ExecutiveKPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  sparklineData?: number[];
  icon?: React.ReactNode;
  subtitle?: string;
}

export const ExecutiveKPICard: React.FC<ExecutiveKPICardProps> = ({
  title,
  value,
  change,
  trend = 'stable',
  status = 'good',
  sparklineData = [],
  icon,
  subtitle
}) => {
  const statusStyles = {
    excellent: 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5',
    good: 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/5',
    warning: 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/5',
    critical: 'border-red-500/50 bg-gradient-to-br from-red-500/10 to-pink-500/5'
  };

  const trendIcons = {
    up: <TrendingUp className="text-green-400" size={16} />,
    down: <TrendingDown className="text-red-400" size={16} />,
    stable: <Minus className="text-gray-400" size={16} />
  };

  return (
    <div className={`${statusStyles[status]} border-2 rounded-xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-pointer group backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {icon && <div className="text-gray-400">{icon}</div>}
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</h3>
          </div>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trendIcons[trend]}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div className="flex-1">
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {change && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold px-2 py-1 rounded ${
                trend === 'up' ? 'bg-green-500/20 text-green-400' :
                trend === 'down' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>

        {sparklineData.length > 0 && (
          <div className="ml-4">
            <MiniSparkline data={sparklineData} trend={trend} />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AI Insight Card - Strategic recommendations
 * Features: Priority indicators, action buttons
 */
interface InsightCardProps {
  type: 'opportunity' | 'risk' | 'achievement' | 'action';
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  impact?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  type,
  title,
  description,
  priority = 'medium',
  impact,
  actionLabel,
  onAction
}) => {
  const typeStyles = {
    opportunity: {
      icon: <Zap className="text-yellow-400" size={20} />,
      bg: 'bg-gradient-to-br from-yellow-500/10 to-orange-500/5',
      border: 'border-yellow-500/50',
      badge: 'bg-yellow-500/20 text-yellow-300'
    },
    risk: {
      icon: <AlertTriangle className="text-red-400" size={20} />,
      bg: 'bg-gradient-to-br from-red-500/10 to-pink-500/5',
      border: 'border-red-500/50',
      badge: 'bg-red-500/20 text-red-300'
    },
    achievement: {
      icon: <CheckCircle2 className="text-green-400" size={20} />,
      bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/5',
      border: 'border-green-500/50',
      badge: 'bg-green-500/20 text-green-300'
    },
    action: {
      icon: <Target className="text-blue-400" size={20} />,
      bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5',
      border: 'border-blue-500/50',
      badge: 'bg-blue-500/20 text-blue-300'
    }
  };

  const priorityLabels = {
    high: 'HIGH PRIORITY',
    medium: 'MEDIUM',
    low: 'LOW'
  };

  const style = typeStyles[type];

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-xl p-5 hover:scale-[1.01] transition-all duration-200 backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">{style.icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-white font-semibold text-lg">{title}</h3>
            <span className={`${style.badge} text-xs font-bold px-2 py-1 rounded uppercase`}>
              {priorityLabels[priority]}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">{description}</p>

          <div className="flex items-center justify-between">
            {impact && (
              <div className="text-xs text-gray-400">
                <span className="font-semibold">Impact:</span> {impact}
              </div>
            )}
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                {actionLabel} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Status Badge - Quick visual indicator
 */
interface StatusBadgeProps {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  label?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true
}) => {
  const styles = {
    excellent: {
      bg: 'bg-green-500/20',
      text: 'text-green-300',
      border: 'border-green-500/50',
      icon: <CheckCircle2 size={14} />
    },
    good: {
      bg: 'bg-blue-500/20',
      text: 'text-blue-300',
      border: 'border-blue-500/50',
      icon: <CheckCircle2 size={14} />
    },
    warning: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-300',
      border: 'border-yellow-500/50',
      icon: <AlertTriangle size={14} />
    },
    critical: {
      bg: 'bg-red-500/20',
      text: 'text-red-300',
      border: 'border-red-500/50',
      icon: <AlertTriangle size={14} />
    }
  };

  const style = styles[status];
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className={`inline-flex items-center gap-1.5 ${style.bg} ${style.text} ${style.border} border px-3 py-1.5 rounded-full text-xs font-semibold uppercase`}>
      {showIcon && style.icon}
      {displayLabel}
    </div>
  );
};

/**
 * Metric Comparison Bar - Visual comparison between two values
 */
interface MetricComparisonProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

export const MetricComparison: React.FC<MetricComparisonProps> = ({
  label,
  current,
  target,
  unit = ''
}) => {
  const percentage = (current / target) * 100;
  const isGood = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-semibold">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
            isGood ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-yellow-500 to-orange-400'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 text-right">
        {percentage.toFixed(0)}% of target
      </div>
    </div>
  );
};
