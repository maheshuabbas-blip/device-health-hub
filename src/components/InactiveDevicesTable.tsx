import { useState } from 'react';
import { InactiveDevice } from '@/lib/api';
import { PlatformBadge } from './PlatformIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight, AlertTriangle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InactiveDevicesTableProps {
  devices: InactiveDevice[];
  onDeviceClick: (deviceId: string) => void;
}

function getSeverity(count: number): { color: string; label: string; bg: string } {
  if (count >= 10) return { color: 'text-destructive', label: 'Critical', bg: 'bg-destructive/10' };
  if (count >= 5) return { color: 'text-warning', label: 'High', bg: 'bg-warning/10' };
  if (count >= 3) return { color: 'text-warning/80', label: 'Medium', bg: 'bg-warning/5' };
  return { color: 'text-muted-foreground', label: 'Low', bg: 'bg-secondary/50' };
}

export function InactiveDevicesTable({ devices, onDeviceClick }: InactiveDevicesTableProps) {
  const [search, setSearch] = useState('');
  
  const filteredDevices = devices.filter(device =>
    device.device_id.toLowerCase().includes(search.toLowerCase()) ||
    device.platforms.some(p => p.toLowerCase().includes(search.toLowerCase()))
  );

  // Sort by issue count (highest first)
  const sortedDevices = [...filteredDevices].sort((a, b) => b.inactive_count - a.inactive_count);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by device ID or platform..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{sortedDevices.length} devices</span>
        </div>
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
                  Severity
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
              {sortedDevices.map((device, index) => {
                const severity = getSeverity(device.inactive_count);
                return (
                  <tr
                    key={device.device_id}
                    className="hover:bg-secondary/20 transition-colors cursor-pointer group animate-fade-in"
                    onClick={() => onDeviceClick(device.device_id)}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-4 py-4">
                      <code className="font-mono text-sm text-foreground bg-secondary/50 px-2 py-1 rounded group-hover:bg-primary/10 transition-colors">
                        {device.device_id}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium",
                        severity.bg,
                        severity.color
                      )}>
                        {severity.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={cn("h-4 w-4", severity.color)} />
                        <span className={cn("font-semibold tabular-nums", severity.color)}>
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
                        className="opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedDevices.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No devices found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
