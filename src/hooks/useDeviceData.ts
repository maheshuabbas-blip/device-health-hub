import { useQuery } from '@tanstack/react-query';
import {
  fetchSummary,
  fetchInactiveDevices,
  fetchNoAppFound,
  fetchDeviceHistory,
  groupDeviceRecords,
  SummaryResponse,
  InactiveDevicesResponse,
  NoAppFoundResponse,
  DeviceHistoryResponse,
} from '@/lib/api';

// Hook for fetching daily summary
export function useSummary(date: string, platform?: string) {
  return useQuery<SummaryResponse>({
    queryKey: ['summary', date, platform],
    queryFn: () => fetchSummary(date, platform),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });
}

// Hook for fetching inactive devices
export function useInactiveDevices(
  date: string,
  options?: { platform?: string; limit?: number }
) {
  return useQuery({
    queryKey: ['inactive-devices', date, options?.platform, options?.limit],
    queryFn: async () => {
      const response = await fetchInactiveDevices(date, options);
      // Transform raw data into grouped devices for UI
      return {
        date: response.date,
        devices: groupDeviceRecords(response.data),
      };
    },
    staleTime: 30 * 1000,
    retry: 2,
  });
}

// Hook for fetching no app found devices
export function useNoAppFound(date: string, platform?: string) {
  return useQuery<NoAppFoundResponse>({
    queryKey: ['no-app-found', date, platform],
    queryFn: () => fetchNoAppFound(date, { platform }),
    staleTime: 30 * 1000,
    retry: 2,
  });
}

// Hook for fetching device history
export function useDeviceHistory(deviceId: string | null) {
  return useQuery<DeviceHistoryResponse>({
    queryKey: ['device-history', deviceId],
    queryFn: () => fetchDeviceHistory(deviceId!),
    enabled: !!deviceId,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
}