interface ElevareLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function ElevareLogo({ size = 'md', variant = 'dark' }: ElevareLogoProps) {
  const sizes = {
    sm: 'w-32 h-10',
    md: 'w-40 h-12',
    lg: 'w-48 h-14'
  };

  const textColor = variant === 'dark' ? 'text-white' : 'text-gray-900';
  const accentColor = variant === 'dark' ? 'text-cyan-400' : 'text-blue-600';

  return (
    <div className={`flex items-center ${sizes[size]}`}>
      <svg
        viewBox="0 0 48 48"
        className="w-10 h-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Futuristic E icon with upward trend */}
        <defs>
          <linearGradient id="elevareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="24" cy="24" r="22" stroke="url(#elevareGradient)" strokeWidth="2" opacity="0.3" />

        {/* Inner design - stylized E with upward arrow */}
        <path
          d="M16 14 L32 14 M16 14 L16 34 M16 24 L28 24 M16 34 L32 34"
          stroke="url(#elevareGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Upward trend arrow */}
        <path
          d="M28 28 L34 20 M34 20 L30 20 M34 20 L34 24"
          stroke="url(#elevareGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Accent dots */}
        <circle cx="24" cy="8" r="1.5" fill="#06b6d4" opacity="0.6" />
        <circle cx="8" cy="24" r="1.5" fill="#3b82f6" opacity="0.6" />
        <circle cx="40" cy="24" r="1.5" fill="#06b6d4" opacity="0.6" />
      </svg>

      <div className="ml-3 flex flex-col justify-center">
        <div className={`font-bold text-xl tracking-tight ${textColor}`}>
          Elevare<span className={accentColor}>IQ</span>
        </div>
      </div>
    </div>
  );
}
