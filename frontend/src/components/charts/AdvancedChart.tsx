/**
 * Advanced Chart Component
 * Supports multiple visualization types with beautiful, modern designs
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export type ChartType =
  | 'line'
  | 'bar'
  | 'horizontal-bar'
  | 'area'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'heatmap'
  | 'waterfall'
  | 'funnel'
  | 'gauge'
  | 'sparkline';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  category?: string;
}

export interface ChartProps {
  type: ChartType;
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showValues?: boolean;
  colorScheme?: 'default' | 'financial' | 'performance' | 'risk' | 'satisfaction';
  animated?: boolean;
}

const COLOR_SCHEMES = {
  default: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'],
  financial: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'],
  performance: ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7'],
  risk: ['#10b981', '#f59e0b', '#ef4444', '#dc2626'],
  satisfaction: ['#10b981', '#84cc16', '#f59e0b', '#ef4444']
};

const AdvancedChart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  subtitle,
  height = 300,
  showLegend = true,
  showGrid = true,
  showValues = false,
  colorScheme = 'default',
  animated = true
}) => {
  const colors = COLOR_SCHEMES[colorScheme];

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));

  // Render different chart types
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'horizontal-bar':
        return renderHorizontalBarChart();
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'pie':
        return renderPieChart();
      case 'donut':
        return renderDonutChart();
      case 'gauge':
        return renderGaugeChart();
      case 'sparkline':
        return renderSparkline();
      case 'waterfall':
        return renderWaterfallChart();
      case 'funnel':
        return renderFunnelChart();
      case 'heatmap':
        return renderHeatmap();
      default:
        return renderBarChart();
    }
  };

  const renderBarChart = () => {
    return (
      <div className="flex items-end justify-around h-full gap-2 px-4 pb-8">
        {data.map((item, index) => {
          const heightPercent = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex flex-col items-center justify-end" style={{ height: height - 60 }}>
                {showValues && (
                  <div className="text-xs font-semibold text-white mb-2 bg-gray-800/80 px-2 py-1 rounded">
                    {item.value.toLocaleString()}
                  </div>
                )}
                <div
                  className={`w-full rounded-t-lg transition-all duration-1000 ${animated ? 'animate-grow-up' : ''}`}
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}40`
                  }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center max-w-full truncate">
                {item.label}
              </div>
              {item.trend && (
                <div className={`flex items-center gap-1 text-xs ${
                  item.trend === 'up' ? 'text-green-400' : item.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {item.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  {item.trendValue && `${item.trendValue > 0 ? '+' : ''}${item.trendValue}%`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHorizontalBarChart = () => {
    return (
      <div className="flex flex-col gap-3 px-4">
        {data.map((item, index) => {
          const widthPercent = (item.value / maxValue) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={index} className="flex items-center gap-3">
              <div className="text-sm text-gray-300 w-32 text-right truncate">
                {item.label}
              </div>
              <div className="flex-1 relative">
                <div
                  className={`h-8 rounded-lg transition-all duration-1000 ${animated ? 'animate-grow-right' : ''}`}
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 15px ${color}40`
                  }}
                />
                {showValues && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                    {item.value.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / (maxValue - minValue)) * 100;
      return { x, y, item };
    });

    const pathD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
      <div className="relative w-full h-full px-4">
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: height - 40 }}>
          {/* Grid lines */}
          {showGrid && (
            <g className="opacity-20">
              {[0, 25, 50, 75, 100].map(y => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#ffffff" strokeWidth="0.2" />
              ))}
            </g>
          )}

          {/* Line path */}
          <path
            d={pathD}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            className="drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 10px ${colors[0]}80)` }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="2"
              fill={colors[0]}
              className="drop-shadow-lg"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-center" style={{ width: `${100 / data.length}%` }}>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / (maxValue - minValue)) * 100;
      return { x, y, item };
    });

    const pathD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    const areaD = `${pathD} L 100 100 L 0 100 Z`;

    return (
      <div className="relative w-full h-full px-4">
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: height - 40 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={colors[0]} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path
            d={areaD}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={colors[0]}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 10px ${colors[0]}80)` }}
          />
        </svg>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          {data.map((item, index) => (
            <div key={index}>{item.label}</div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center gap-8 h-full">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((currentAngle - 90) * Math.PI / 180);

            const largeArc = angle > 180 ? 1 : 0;
            const color = item.color || colors[index % colors.length];

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={color}
                className="transition-all duration-300 hover:opacity-80"
                style={{ filter: `drop-shadow(0 0 5px ${color}60)` }}
              />
            );
          })}
        </svg>

        {showLegend && (
          <div className="flex flex-col gap-2">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              const color = item.color || colors[index % colors.length];

              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className="text-sm text-gray-500">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderDonutChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center gap-8 h-full">
        <svg viewBox="0 0 100 100" className="w-64 h-64">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;

            const outerRadius = 40;
            const innerRadius = 25;

            const x1 = 50 + outerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + outerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + outerRadius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y2 = 50 + outerRadius * Math.sin((currentAngle - 90) * Math.PI / 180);

            const x3 = 50 + innerRadius * Math.cos((currentAngle - 90) * Math.PI / 180);
            const y3 = 50 + innerRadius * Math.sin((currentAngle - 90) * Math.PI / 180);
            const x4 = 50 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y4 = 50 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);

            const largeArc = angle > 180 ? 1 : 0;
            const color = item.color || colors[index % colors.length];

            return (
              <path
                key={index}
                d={`M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`}
                fill={color}
                className="transition-all duration-300 hover:opacity-80"
                style={{ filter: `drop-shadow(0 0 5px ${color}60)` }}
              />
            );
          })}

          {/* Center text */}
          <text x="50" y="50" textAnchor="middle" className="text-lg font-bold fill-white">
            {total.toLocaleString()}
          </text>
        </svg>

        {showLegend && (
          <div className="flex flex-col gap-2">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              const color = item.color || colors[index % colors.length];

              return (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className="text-sm text-gray-500">({percentage}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderGaugeChart = () => {
    const value = data[0]?.value || 0;
    const max = 100;
    const percentage = (value / max) * 100;
    const angle = (percentage / 100) * 180 - 90; // -90 to 90 degrees

    const getColor = (pct: number) => {
      if (pct >= 80) return '#10b981';
      if (pct >= 60) return '#06b6d4';
      if (pct >= 40) return '#f59e0b';
      return '#ef4444';
    };

    const color = getColor(percentage);

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg viewBox="0 0 200 120" className="w-full max-w-sm">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#374151"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
            style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
          />

          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 70 * Math.cos(angle * Math.PI / 180)}
            y2={100 + 70 * Math.sin(angle * Math.PI / 180)}
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="5" fill="#ffffff" />

          {/* Value text */}
          <text x="100" y="100" textAnchor="middle" dy="30" className="text-2xl font-bold fill-white">
            {value}
          </text>
          {data[0]?.label && (
            <text x="100" y="100" textAnchor="middle" dy="45" className="text-sm fill-gray-400">
              {data[0].label}
            </text>
          )}
        </svg>
      </div>
    );
  };

  const renderSparkline = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((item.value - minValue) / (maxValue - minValue)) * 80 - 10;
      return { x, y };
    });

    const pathD = points.map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={pathD}
          fill="none"
          stroke={colors[0]}
          strokeWidth="2"
        />
      </svg>
    );
  };

  const renderWaterfallChart = () => {
    let runningTotal = 0;
    const bars = data.map((item, index) => {
      const start = runningTotal;
      runningTotal += item.value;
      return {
        ...item,
        start,
        end: runningTotal,
        isPositive: item.value >= 0
      };
    });

    const maxTotal = Math.max(...bars.map(b => Math.abs(b.end)));

    return (
      <div className="flex items-end justify-around h-full gap-2 px-4 pb-8">
        {bars.map((bar, index) => {
          const topPercent = ((maxTotal - bar.end) / (maxTotal * 2)) * 100 + 50;
          const heightPercent = (Math.abs(bar.value) / (maxTotal * 2)) * 100;
          const color = bar.isPositive ? '#10b981' : '#ef4444';

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full" style={{ height: height - 60 }}>
                <div
                  className="absolute w-full rounded transition-all duration-1000"
                  style={{
                    top: `${topPercent}%`,
                    height: `${heightPercent}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}40`
                  }}
                />
                {index > 0 && (
                  <div
                    className="absolute w-full border-t-2 border-dashed border-gray-600"
                    style={{ top: `${((maxTotal - bars[index - 1].end) / (maxTotal * 2)) * 100 + 50}%` }}
                  />
                )}
              </div>
              <div className="text-xs text-gray-400 text-center">{bar.label}</div>
              <div className={`text-xs font-semibold ${bar.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {bar.isPositive ? '+' : ''}{bar.value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFunnelChart = () => {
    const maxVal = Math.max(...data.map(d => d.value));

    return (
      <div className="flex flex-col gap-2 px-4 py-4">
        {data.map((item, index) => {
          const widthPercent = (item.value / maxVal) * 100;
          const color = item.color || colors[index % colors.length];

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="relative transition-all duration-1000"
                style={{
                  width: `${widthPercent}%`,
                  height: '50px',
                  backgroundColor: color,
                  clipPath: 'polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)',
                  boxShadow: `0 0 15px ${color}40`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                  <span className="text-xs text-white/80 ml-2">({item.value.toLocaleString()})</span>
                </div>
              </div>
              {index < data.length - 1 && (
                <div className="text-xs text-gray-500 py-1">
                  ↓ {(((data[index].value - data[index + 1].value) / data[index].value) * 100).toFixed(1)}% drop
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderHeatmap = () => {
    const categories = [...new Set(data.map(d => d.category || 'Default'))];
    const labels = [...new Set(data.map(d => d.label))];

    return (
      <div className="grid gap-1 p-4" style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}>
        {data.map((item, index) => {
          const intensity = (item.value / maxValue);
          const color = colors[0];

          return (
            <div
              key={index}
              className="aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:scale-110"
              style={{
                backgroundColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                border: `1px solid ${color}40`
              }}
              title={`${item.label}: ${item.value}`}
            >
              {showValues && item.value}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}

      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default AdvancedChart;
