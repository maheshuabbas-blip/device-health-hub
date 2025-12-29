import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeviceRecord, generateMockDeviceHistory } from '@/lib/mockData';
import { StatusBadge } from './StatusBadge';
import { PlatformIcon } from './PlatformIcon';
import { Smartphone, Clock, Activity } from 'lucide-react';

interface DeviceDetailModalProps {
  deviceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceDetailModal({ deviceId, open, onOpenChange }: DeviceDetailModalProps) {
  const [history, setHistory] = useState<DeviceRecord[]>([]);
  
  useEffect(() => {
    if (deviceId) {
      setHistory(generateMockDeviceHistory(deviceId));
    }
  }, [deviceId]);
  
  if (!deviceId) return null;
  
  // Group by date
  const groupedByDate = history.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, DeviceRecord[]>);
  
  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-lg">{deviceId}</p>
              <p className="text-sm font-normal text-muted-foreground">Device History</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pr-2 -mr-2">
          <div className="space-y-6">
            {dates.slice(0, 7).map(date => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground sticky top-0 bg-card py-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                
                <div className="grid gap-2 pl-6">
                  {groupedByDate[date].map((record, idx) => (
                    <div
                      key={`${record.platform}-${idx}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={record.platform} />
                        <div>
                          <p className="font-medium capitalize">{record.platform}</p>
                          {record.reason && (
                            <p className="text-xs text-muted-foreground">{record.reason}</p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={record.account_status} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-4 border-t border-border text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Showing last 7 days of activity</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
