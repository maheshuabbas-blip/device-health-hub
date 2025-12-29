import { useState } from 'react';
import { InactiveDevice } from '@/lib/api';
import { PlatformBadge } from './PlatformIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InactiveDevicesTableProps {
  devices: InactiveDevice[];
  onDeviceClick: (deviceId: string) => void;
}

export function InactiveDevicesTable({ devices, onDeviceClick }: InactiveDevicesTableProps) {
  const [search, setSearch] = useState('');
  
  const filteredDevices = devices.filter(device =>
    device.device_id.toLowerCase().includes(search.toLowerCase()) ||
    device.platforms.some(p => p.toLowerCase().includes(search.toLowerCase()))
  );
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by device ID or platform..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary/50 border-border/50"
        />
      </div>
      
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Device ID
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Issues
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Platforms
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDevices.map((device, index) => (
                <tr
                  key={device.device_id}
                  className="hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => onDeviceClick(device.device_id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-4">
                    <code className="font-mono text-sm text-foreground bg-secondary/50 px-2 py-1 rounded">
                      {device.device_id}
                    </code>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn(
                        "h-4 w-4",
                        device.inactive_count > 5 ? "text-destructive" : "text-warning"
                      )} />
                      <span className={cn(
                        "font-semibold",
                        device.inactive_count > 5 ? "text-destructive" : "text-warning"
                      )}>
                        {device.inactive_count}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {device.platforms.map(platform => (
                        <PlatformBadge key={platform} platform={platform} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDevices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No devices found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
