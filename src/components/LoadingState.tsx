import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  className?: string;
  text?: string;
}

export function LoadingState({ className, text = 'Loading...' }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

interface ErrorStateProps {
  className?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  className, 
  message = 'Failed to load data', 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <svg
          className="h-6 w-6 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-primary hover:underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  className,
  title = 'No data',
  description = 'No records found for the selected criteria.',
  icon,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      {icon && <div className="mb-4">{icon}</div>}
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground text-center max-w-sm">{description}</p>
    </div>
  );
}
