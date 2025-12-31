import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  percentage?: number;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    border: 'border-primary/20 hover:border-primary/40',
    glow: 'group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-primary/20',
  },
  success: {
    icon: 'bg-success/10 text-success',
    border: 'border-success/20 hover:border-success/40',
    glow: 'group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-success/20',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    border: 'border-warning/20 hover:border-warning/40',
    glow: 'group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-warning/20',
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    border: 'border-destructive/20 hover:border-destructive/40',
    glow: 'group-hover:shadow-[0_0_30px_-5px] group-hover:shadow-destructive/20',
  },
};

function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.round(startValue + diff * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toLocaleString()}</>;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  percentage,
  subtitle,
  variant = 'default', 
  className 
}: StatCardProps) {
  const styles = variantStyles[variant];
  const numericValue = typeof value === 'number' ? value : 0;
  
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300",
        styles.border,
        styles.glow,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? (
              <AnimatedCounter value={numericValue} />
            ) : (
              value
            )}
          </p>
          {percentage !== undefined && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    variant === 'success' ? 'bg-success' :
                    variant === 'warning' ? 'bg-warning' :
                    variant === 'destructive' ? 'bg-destructive' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
            </div>
          )}
          {trend !== undefined && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend >= 0 ? "text-success" : "text-destructive"
            )}>
              <span className="text-lg">{trend >= 0 ? '↑' : '↓'}</span>
              {Math.abs(trend)}% from yesterday
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          "rounded-xl p-3 transition-transform duration-300 group-hover:scale-110",
          styles.icon
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Animated gradient background on hover */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-transform duration-500 group-hover:scale-150" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-primary/3 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
