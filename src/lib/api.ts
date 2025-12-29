// API client for Device Account Status Monitoring

const API_BASE_URL = 'http://192.168.20.86:8000/api';

export type AccountStatus = 'active' | 'inactive' | 'error';

export interface SummaryItem {
  platform: string;
  account_status: AccountStatus;
  count: number;
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
  devices: InactiveDevice[];
}

export interface DeviceRecord {
  device_id: string;
  platform: string;
  account_status: AccountStatus;
  reason?: string;
  date: string;
}

export interface InactiveRecordsResponse {
  date: string;
  inactive_count: number;
  data: DeviceRecord[];
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

// Fetch inactive devices (grouped by device)
export async function fetchInactiveDevices(
  date: string,
  options?: { platform?: string; device_id?: string; limit?: number }
): Promise<InactiveDevicesResponse> {
  const url = new URL(`${API_BASE_URL}/inactive-devices/${date}`);
  if (options?.platform) url.searchParams.set('platform', options.platform);
  if (options?.device_id) url.searchParams.set('device_id', options.device_id);
  if (options?.limit) url.searchParams.set('limit', options.limit.toString());
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch inactive devices: ${response.statusText}`);
  }
  return response.json();
}

// Fetch raw inactive records
export async function fetchInactiveRecords(
  date: string,
  options?: { platform?: string; device_id?: string }
): Promise<InactiveRecordsResponse> {
  const url = new URL(`${API_BASE_URL}/inactive/${date}`);
  if (options?.platform) url.searchParams.set('platform', options.platform);
  if (options?.device_id) url.searchParams.set('device_id', options.device_id);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch inactive records: ${response.statusText}`);
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
    active: summary.filter(s => s.account_status === 'active').reduce((acc, s) => acc + s.count, 0),
    inactive: summary.filter(s => s.account_status === 'inactive').reduce((acc, s) => acc + s.count, 0),
    error: summary.filter(s => s.account_status === 'error').reduce((acc, s) => acc + s.count, 0),
  };
}

export function getPlatformData(summary: SummaryItem[]) {
  const platformMap = new Map<string, { active: number; inactive: number; error: number }>();
  
  summary.forEach(item => {
    if (!platformMap.has(item.platform)) {
      platformMap.set(item.platform, { active: 0, inactive: 0, error: 0 });
    }
    const data = platformMap.get(item.platform)!;
    data[item.account_status] = item.count;
  });
  
  return Array.from(platformMap.entries()).map(([platform, counts]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    ...counts,
    total: counts.active + counts.inactive + counts.error,
  }));
}
