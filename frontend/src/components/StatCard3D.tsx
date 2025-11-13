import { LucideIcon } from 'lucide-react';
import { useState, useRef, MouseEvent } from 'react';

interface StatCard3DProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  description?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

export default function StatCard3D({
  title,
  value,
  icon: Icon,
  gradient = 'from-cyan-500 to-blue-600',
  description,
  trend
}: StatCard3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const trendSymbols = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <div
      ref={cardRef}
      className="relative perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glow Layer */}
        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition duration-500`} />

        {/* Card */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden">
          {/* Floating Orbs Background */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl" />

          {/* Content */}
          <div className="relative z-10">
            {/* Icon */}
            <div className="mb-6">
              <div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
                style={{
                  transform: `translateZ(20px)`,
                  boxShadow: `0 20px 40px rgba(6, 182, 212, 0.3)`
                }}
              >
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
              {title}
            </h3>

            {/* Value */}
            <div className="mb-3">
              <div
                className={`text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                style={{ transform: `translateZ(10px)` }}
              >
                {value}
              </div>
            </div>

            {/* Description or Trend */}
            <div className="flex items-center justify-between">
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
              {trend && (
                <div className={`flex items-center gap-1 text-sm font-semibold ${trendColors[trend.direction]}`}>
                  <span className="text-lg">{trendSymbols[trend.direction]}</span>
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shine Effect */}
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              transform: `translateZ(5px)`
            }}
          />

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        </div>
      </div>
    </div>
  );
}
