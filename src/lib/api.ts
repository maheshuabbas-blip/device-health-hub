// API client for Device Account Status Monitoring

const API_BASE_URL = 'http://192.168.20.86:8000';

export type AccountStatus = 'active' | 'inactive' | 'error';

export interface SummaryItem {
  platform: string;
  active: number;
  inactive: number;
  error?: number; // Optional, defaults to 0 if not present
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
  account_status: AccountStatus | ''; // Can be empty string in some responses
  reason?: string;
  date: string;
  created_at?: string; // ISO timestamp when the record was created
}

export interface NoAppDevice {
  device_id: string;
  platform: string;
  reason: string;
}

export interface NoAppFoundResponse {
  date: string;
  count: number;
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

// Fetch daily summary
export async function fetchSummary(date: string, platform?: string): Promise<SummaryResponse> {
  const url = new URL(`${API_BASE_URL}/summary/${date}`);
  if (platform) url.searchParams.set('platform', platform);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch summary: ${response.statusText}`);
  }
  return response.json();
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
    error: summary.reduce((acc, s) => acc + (s.error || 0), 0),
  };
}

export function getPlatformData(summary: SummaryItem[]) {
  return summary.map(item => ({
    platform: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
    active: item.active,
    inactive: item.inactive,
    error: item.error || 0,
    total: item.active + item.inactive + (item.error || 0),
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
