// Mock data for the device monitoring dashboard

export type AccountStatus = 'active' | 'inactive' | 'error';

export interface SummaryItem {
  platform: string;
  account_status: AccountStatus;
  count: number;
}

export interface InactiveDevice {
  device_id: string;
  inactive_count: number;
  platforms: string[];
}

export interface DeviceRecord {
  device_id: string;
  platform: string;
  account_status: AccountStatus;
  reason?: string;
  date: string;
}

export interface NoAppDevice {
  device_id: string;
  platform: string;
  reason: string;
}

const platforms = ['twitter', 'instagram', 'facebook', 'tiktok', 'linkedin', 'quora', 'reddit'];
const reasons = ['Login required', 'Session expired', 'Account suspended', 'Rate limited', 'Network error'];

export const generateMockSummary = (date: string): SummaryItem[] => {
  const summary: SummaryItem[] = [];
  
  platforms.forEach(platform => {
    const activeCount = Math.floor(Math.random() * 2000) + 500;
    const inactiveCount = Math.floor(Math.random() * 300) + 50;
    const errorCount = Math.floor(Math.random() * 50) + 5;
    
    summary.push({ platform, account_status: 'active', count: activeCount });
    summary.push({ platform, account_status: 'inactive', count: inactiveCount });
    summary.push({ platform, account_status: 'error', count: errorCount });
  });
  
  return summary;
};

export const generateMockInactiveDevices = (date: string, limit: number = 20): InactiveDevice[] => {
  const devices: InactiveDevice[] = [];
  
  for (let i = 0; i < limit; i++) {
    const ip = `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;
    const port = 5555;
    const platformCount = Math.floor(Math.random() * 4) + 1;
    const devicePlatforms = platforms.slice(0, platformCount).sort(() => Math.random() - 0.5);
    
    devices.push({
      device_id: `${ip}:${port}`,
      inactive_count: Math.floor(Math.random() * 8) + 1,
      platforms: devicePlatforms,
    });
  }
  
  return devices.sort((a, b) => b.inactive_count - a.inactive_count);
};

export const generateMockInactiveRecords = (date: string): DeviceRecord[] => {
  const records: DeviceRecord[] = [];
  
  for (let i = 0; i < 50; i++) {
    const ip = `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;
    const port = 5555;
    
    records.push({
      device_id: `${ip}:${port}`,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      account_status: Math.random() > 0.7 ? 'error' : 'inactive',
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      date,
    });
  }
  
  return records;
};

export const generateMockNoAppDevices = (date: string): NoAppDevice[] => {
  const devices: NoAppDevice[] = [];
  
  for (let i = 0; i < 12; i++) {
    const ip = `10.10.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 255)}`;
    const port = 5555;
    
    devices.push({
      device_id: `${ip}:${port}`,
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      reason: 'No app found',
    });
  }
  
  return devices;
};

export const generateMockDeviceHistory = (deviceId: string): DeviceRecord[] => {
  const records: DeviceRecord[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    platforms.slice(0, 4).forEach(platform => {
      const rand = Math.random();
      let status: AccountStatus = 'active';
      if (rand > 0.85) status = 'error';
      else if (rand > 0.7) status = 'inactive';
      
      records.push({
        device_id: deviceId,
        platform,
        account_status: status,
        reason: status !== 'active' ? reasons[Math.floor(Math.random() * reasons.length)] : undefined,
        date: dateStr,
      });
    });
  }
  
  return records;
};

export const getTotalCounts = (summary: SummaryItem[]) => {
  return {
    active: summary.filter(s => s.account_status === 'active').reduce((acc, s) => acc + s.count, 0),
    inactive: summary.filter(s => s.account_status === 'inactive').reduce((acc, s) => acc + s.count, 0),
    error: summary.filter(s => s.account_status === 'error').reduce((acc, s) => acc + s.count, 0),
  };
};

export const getPlatformData = (summary: SummaryItem[]) => {
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
};
