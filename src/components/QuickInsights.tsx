import { TrendingDown, TrendingUp, AlertCircle, Shield, Zap } from 'lucide-react';
import { SummaryItem } from '@/lib/api';
import { cn } from '@/lib/utils';

interface QuickInsightsProps {
  summary: SummaryItem[];
  totalAccounts: number;
  healthScore: number;
}

interface InsightItem {
  icon: React.ElementType;
  label: string;
  value: string;
  type: 'success' | 'warning' | 'destructive' | 'info';
}

export function QuickInsights({ summary, totalAccounts, healthScore }: QuickInsightsProps) {
  // Find worst performing platform
  const platformHealth = summary.map(p => {
    const total = p.active + p.inactive + (p.error || 0);
    const healthPct = total > 0 ? (p.active / total) * 100 : 0;
    return { ...p, healthPct, total };
  }).sort((a, b) => a.healthPct - b.healthPct);

  const worstPlatform = platformHealth[0];
  const bestPlatform = platformHealth[platformHealth.length - 1];
  
  // Calculate total issues
  const totalInactive = summary.reduce((acc, s) => acc + s.inactive, 0);
  const totalErrors = summary.reduce((acc, s) => acc + (s.error || 0), 0);
  const totalIssues = totalInactive + totalErrors;

  const insights: InsightItem[] = [];

  if (worstPlatform && worstPlatform.healthPct < 100) {
    insights.push({
      icon: TrendingDown,
      label: 'Needs Attention',
      value: `${worstPlatform.platform.charAt(0).toUpperCase() + worstPlatform.platform.slice(1)} (${worstPlatform.healthPct.toFixed(0)}% healthy)`,
      type: worstPlatform.healthPct < 50 ? 'destructive' : 'warning',
    });
  }

  if (bestPlatform && bestPlatform.healthPct >= 90) {
    insights.push({
      icon: TrendingUp,
      label: 'Top Performer',
      value: `${bestPlatform.platform.charAt(0).toUpperCase() + bestPlatform.platform.slice(1)} (${bestPlatform.healthPct.toFixed(0)}% healthy)`,
      type: 'success',
    });
  }

  if (totalIssues > 0) {
    insights.push({
      icon: AlertCircle,
      label: 'Total Issues',
      value: `${totalIssues} accounts need attention`,
      type: totalIssues > 10 ? 'destructive' : 'warning',
    });
  }

  if (healthScore >= 90) {
    insights.push({
      icon: Shield,
      label: 'System Status',
      value: 'All systems operational',
      type: 'success',
    });
  }

  if (summary.length > 0) {
    insights.push({
      icon: Zap,
      label: 'Platforms Active',
      value: `${summary.length} platforms monitored`,
      type: 'info',
    });
  }

  if (insights.length === 0) return null;

  const typeStyles = {
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {insights.slice(0, 4).map((insight, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02]",
            typeStyles[insight.type]
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <insight.icon className="h-5 w-5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium opacity-80">{insight.label}</p>
            <p className="text-sm font-semibold truncate">{insight.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
