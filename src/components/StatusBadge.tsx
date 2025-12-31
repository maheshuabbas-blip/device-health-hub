import { cn } from "@/lib/utils";
import { AccountStatus } from "@/lib/api";

interface StatusBadgeProps {
  status: AccountStatus | '' | undefined;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    className: 'bg-success/10 text-success border-success/20',
    dotClassName: 'bg-success',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-warning/10 text-warning border-warning/20',
    dotClassName: 'bg-warning',
  },
  error: {
    label: 'Error',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    dotClassName: 'bg-destructive',
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-muted/10 text-muted-foreground border-muted/20',
    dotClassName: 'bg-muted-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status && status in statusConfig ? status : 'unknown';
  const config = statusConfig[normalizedStatus as keyof typeof statusConfig];
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.className,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClassName)} />
      {config.label}
    </span>
  );
}
