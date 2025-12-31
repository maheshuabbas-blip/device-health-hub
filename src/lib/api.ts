// API client for Device Account Status Monitoring

const API_BASE_URL = 'http://192.168.20.86:8000';

export type AccountStatus = 'active' | 'inactive' | 'error';

// Raw API response with dynamic status keys
export interface SummaryItemRaw {
  platform: string;
  summary: Record<string, number>; // Dynamic keys like "active", "suspended", "Not Logged In", etc.
}

export interface SummaryResponseRaw {
  date: string;
  summary: SummaryItemRaw[];
}

// Processed summary item for UI consumption
export interface SummaryItem {
  platform: string;
  active: number;
  inactive: number;
  error: number;
  other: number; // All other statuses combined
  details: Record<string, number>; // Original status breakdown
  total: number;
}

export interface SummaryResponse {
  date: string;
  summary: SummaryItem[];
}

export interface InactiveDevice {
  device_id: string;
  inactive_count: number;
  platforms: string[];
}

export interface InactiveDevicesResponse {
  date: string;
  filters: {
    platform: string | null;
    device_id: string | null;
  };
  inactive_count: number;
  data: DeviceRecord[];
}

export interface DeviceRecord {
  device_id: string;
  platform: string;
  account_status: string; // Can be any status string now
  reason?: string;
  date: string;
  created_at?: string;
}

export interface NoAppDevice {
  device_id: string;
  missing_app_count: number;
  platforms: string[];
}

export interface NoAppFoundResponse {
  date: string;
  platform: string | null;
  device_count: number;
  devices: NoAppDevice[];
}

export interface DeviceHistoryResponse {
  device_id: string;
  records: DeviceRecord[];
}

export interface DeviceHistoryDateResponse {
  device_id: string;
  date: string;
  records: DeviceRecord[];
}

// Status categorization rules
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

// Categorize a status string into active/inactive/error
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

// Process raw summary data into categorized format
function processSummaryData(raw: SummaryResponseRaw): SummaryResponse {
  const processedSummary: SummaryItem[] = raw.summary.map(item => {
    let active = 0;
    let inactive = 0;
    let error = 0;
    let other = 0;

    // Categorize each status
    Object.entries(item.summary).forEach(([status, count]) => {
      const category = categorizeStatus(status);
      switch (category) {
        case 'active':
          active += count;
          break;
        case 'inactive':
          inactive += count;
          break;
        case 'error':
          error += count;
          break;
        case 'other':
          other += count;
          break;
      }
    });

    const total = active + inactive + error + other;

    return {
      platform: item.platform,
      active,
      inactive,
      error,
      other,
      total,
      details: item.summary, // Keep original breakdown
    };
  });

  return {
    date: raw.date,
    summary: processedSummary,
  };
}

// Fetch daily summary
export async function fetchSummary(date: string, platform?: string): Promise<SummaryResponse> {
  const url = new URL(`${API_BASE_URL}/summary/${date}`);
  if (platform) url.searchParams.set('platform', platform);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.statusText}`);
  }

  const rawData: SummaryResponseRaw = await response.json();
  return processSummaryData(rawData);
}

// Fetch inactive devices (returns raw records, will be grouped in the hook)
export async function fetchInactiveDevices(
  date: string,
  options?: { platform?: string; device_id?: string; limit?: number }
): Promise<InactiveDevicesResponse> {
  const url = new URL(`${API_BASE_URL}/inactive/${date}`);
  if (options?.platform) url.searchParams.set('platform', options.platform);
  if (options?.device_id) url.searchParams.set('device_id', options.device_id);
  if (options?.limit) url.searchParams.set('limit', options.limit.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch inactive devices: ${response.statusText}`);
  }
  return response.json();
}

// Fetch no app found devices
export async function fetchNoAppFound(
  date: string,
  options?: { platform?: string; device_id?: string }
): Promise<NoAppFoundResponse> {
  const url = new URL(`${API_BASE_URL}/no-app-found/${date}`);
  if (options?.platform) url.searchParams.set('platform', options.platform);
  if (options?.device_id) url.searchParams.set('device_id', options.device_id);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch no app found devices: ${response.statusText}`);
  }
  return response.json();
}

// Fetch device history (all dates)
export async function fetchDeviceHistory(deviceId: string): Promise<DeviceHistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/device/${encodeURIComponent(deviceId)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch device history: ${response.statusText}`);
  }
  return response.json();
}

// Fetch device history for specific date
export async function fetchDeviceHistoryByDate(
  deviceId: string,
  date: string
): Promise<DeviceHistoryDateResponse> {
  const response = await fetch(
    `${API_BASE_URL}/device/${encodeURIComponent(deviceId)}/${date}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch device history: ${response.statusText}`);
  }
  return response.json();
}

// Helper functions
export function getTotalCounts(summary: SummaryItem[]) {
  return {
    active: summary.reduce((acc, s) => acc + s.active, 0),
    inactive: summary.reduce((acc, s) => acc + s.inactive, 0),
    error: summary.reduce((acc, s) => acc + s.error, 0),
    other: summary.reduce((acc, s) => acc + s.other, 0),
  };
}

export function getPlatformData(summary: SummaryItem[]) {
  return summary.map(item => ({
    platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
    active: item.active,
    inactive: item.inactive,
    error: item.error,
    other: item.other,
    total: item.total,
    details: item.details,
  }));
}

// Transform raw device records into grouped devices by device_id
export function groupDeviceRecords(records: DeviceRecord[]): InactiveDevice[] {
  const deviceMap = new Map<string, { platforms: Set<string>; count: number }>();

  records.forEach(record => {
    if (!deviceMap.has(record.device_id)) {
      deviceMap.set(record.device_id, { platforms: new Set(), count: 0 });
    }
    const device = deviceMap.get(record.device_id)!;
    device.platforms.add(record.platform);
    device.count++;
  });

  return Array.from(deviceMap.entries()).map(([device_id, data]) => ({
    device_id,
    inactive_count: data.count,
    platforms: Array.from(data.platforms),
  }));
}

// Get all unique statuses from summary details
export function getAllStatuses(summary: SummaryItem[]): string[] {
  const statusSet = new Set<string>();
  summary.forEach(item => {
    Object.keys(item.details).forEach(status => statusSet.add(status));
  });
  return Array.from(statusSet).sort();
}

// Get status breakdown for a specific platform
export function getPlatformStatusBreakdown(
  summary: SummaryItem[],
  platform: string
): Record<string, number> | null {
  const item = summary.find(s => s.platform.toLowerCase() === platform.toLowerCase());
  return item ? item.details : null;
}