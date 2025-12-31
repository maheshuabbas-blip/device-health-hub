import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import { PlatformIcon } from './PlatformIcon';
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import * as React from "react";

interface StatusDevice {
  date: string;
  device_id: string;
  platform: string;
  account_status: string;
  created_at: string;
  reason?: string;
}

interface StatusDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  platform: string;
  status: string;
  count: number;
}

export function StatusDetailModal({
  open,
  onOpenChange,
  date,
  platform,
  status,
  count,
}: StatusDetailModalProps) {
  const [devices, setDevices] = useState<StatusDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch devices when modal opens
  const fetchDevices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `http://192.168.20.86:8000/devices/?date=${date}&platform=${platform}&account_status=${status}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }

      const data = await response.json();
      setDevices(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load devices');
      setDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when modal opens
  React.useEffect(() => {
    if (open) {
      fetchDevices();
    } else {
      setDevices([]);
      setError(null);
    }
  }, [open, date, platform, status]);

  const handleCopyDeviceId = (deviceId: string) => {
    navigator.clipboard.writeText(deviceId);
    setCopiedId(deviceId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <PlatformIcon platform={platform} size={32} showTooltip={false} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="capitalize text-xl">{platform}</span>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm font-normal text-muted-foreground mt-1">
                {count} {count === 1 ? 'device' : 'devices'} with this status
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-destructive">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-center">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDevices}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No devices found with this status.
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map((device, idx) => (
                <div
                  key={`${device.device_id}-${idx}`}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="font-mono text-sm text-foreground bg-secondary px-2 py-1 rounded">
                          {device.device_id}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyDeviceId(device.device_id)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === device.device_id ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>

                      {device.reason && (
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">Reason:</span> {device.reason}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <span className="font-medium">Detected:</span>{' '}
                          {new Date(device.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={device.account_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
          <span>
            Showing {devices.length} of {count} devices
          </span>
          <span className="text-xs">
            {date} • {platform}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}