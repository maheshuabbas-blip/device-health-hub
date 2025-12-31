import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function HealthScoreRing({ score, size = 160, strokeWidth = 12 }: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
      setAnimatedScore(Math.round(score * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 90) return { stroke: 'hsl(var(--success))', text: 'text-success', label: 'Excellent' };
    if (s >= 70) return { stroke: 'hsl(142 76% 55%)', text: 'text-success', label: 'Good' };
    if (s >= 50) return { stroke: 'hsl(var(--warning))', text: 'text-warning', label: 'Fair' };
    if (s > 0) return { stroke: 'hsl(var(--destructive))', text: 'text-destructive', label: 'Critical' };
    return { stroke: 'hsl(var(--muted))', text: 'text-muted-foreground', label: 'No Data' };
  };

  const { stroke, text, label } = getScoreColor(score);
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Glow effect */}
      <div 
        className="absolute rounded-full blur-2xl opacity-30 transition-opacity duration-1000"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: stroke,
        }}
      />
      
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        
        {/* Animated progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${stroke}50)`,
          }}
        />
        
        {/* Accent marks */}
        {[0, 25, 50, 75].map((tick) => {
          const angle = (tick / 100) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = center + (radius - strokeWidth) * Math.cos(rad);
          const y1 = center + (radius - strokeWidth) * Math.sin(rad);
          const x2 = center + (radius + 2) * Math.cos(rad);
          const y2 = center + (radius + 2) * Math.sin(rad);
          
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1.5}
              opacity={0.3}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={cn("text-4xl font-bold tabular-nums", text)}>
          {animatedScore}%
        </p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}
