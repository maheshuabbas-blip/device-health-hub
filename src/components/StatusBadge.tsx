import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Define which statuses belong to which category
const ACTIVE_STATUSES = ['active', 'Active'];

const INACTIVE_STATUSES = [
  'inactive', 'Inactive',
  'Not Logged In', 'not logged in', 'not_logged_in',
  'offline', 'Offline',
  'suspended', 'Suspended', 'account_suspended',
  'locked', 'Locked', 'account_locked',
  'banned', 'Banned',
  'removed', 'Removed', 'terminated', 'Terminated',
  'channel removed', 'Content Removed',
  'Restricted', 'Under Review', 'review_required',
  'session_expired'
];

const ERROR_STATUSES = [
  'error', 'Error', 'error_screen',
  'temporary_error', 'connection_error',
  'feed_error', 'feed error', 'Feed Error',
  'failed_to_load', 'Loading', 'loading',
  'security_check', 'challenge_required',
  'verification_in_progress', 'verification_required',
  'Human Verification Required', 'Verification Needed',
  'Security Confirmation Required',
  'Suspicious Activity Detected',
  'No Internet Connection',
  'No account found', 'no_account_found'
];

function categorizeStatus(status: string): 'active' | 'inactive' | 'error' | 'other' {
  const lowerStatus = status.toLowerCase();

  if (ACTIVE_STATUSES.some(s => lowerStatus === s.toLowerCase())) {
    return 'active';
  }
  if (INACTIVE_STATUSES.some(s => lowerStatus === s.toLowerCase())) {
    return 'inactive';
  }
  if (ERROR_STATUSES.some(s => lowerStatus === s.toLowerCase())) {
    return 'error';
  }

  return 'other';
}

const statusConfig = {
  active: {
    className: 'bg-success/10 text-success border-success/20',
    dotClassName: 'bg-success',
  },
  inactive: {
    className: 'bg-warning/10 text-warning border-warning/20',
    dotClassName: 'bg-warning',
  },
  error: {
    className: 'bg-destructive/10 text-destructive border-destructive/20',
    dotClassName: 'bg-destructive',
  },
  other: {
    className: 'bg-muted/50 text-muted-foreground border-muted',
    dotClassName: 'bg-muted-foreground',
  },
};

// Format status text for display (convert underscores to spaces and capitalize)
function formatStatusText(status: string): string {
  // Replace underscores with spaces
  const formatted = status.replace(/_/g, ' ');

  // Capitalize first letter of each word
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const category = categorizeStatus(status);
  const config = statusConfig[category];
  const displayText = formatStatusText(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.className,
        className
      )}
      title={`Category: ${category}`}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotClassName)} />
      {displayText}
    </span>
  );
}