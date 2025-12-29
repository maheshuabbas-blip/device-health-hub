import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    icon: 'bg-primary/10 text-primary',
    border: 'border-primary/20',
  },
  success: {
    icon: 'bg-success/10 text-success',
    border: 'border-success/20',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    border: 'border-warning/20',
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    border: 'border-destructive/20',
  },
};

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className }: StatCardProps) {
  const styles = variantStyles[variant];
  
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 transition-all duration-300 hover:border-primary/30",
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend !== undefined && (
            <p className={cn(
              "text-sm font-medium",
              trend >= 0 ? "text-success" : "text-destructive"
            )}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% from yesterday
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-3", styles.icon)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
