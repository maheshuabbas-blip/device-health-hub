import { Eye } from 'lucide-react';
import { InactiveDevice } from '@/lib/api';
import { Button } from './ui/button';
import { PlatformIcon } from './PlatformIcon';

interface InactiveDevicesTableProps {
  devices: InactiveDevice[];
  onDeviceClick?: (deviceId: string) => void;
}

export function InactiveDevicesTable({ devices, onDeviceClick }: InactiveDevicesTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
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
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {devices.map((device) => (
            <tr
              key={device.device_id}
              className="hover:bg-secondary/20 transition-colors group"
            >
              <td className="px-4 py-4">
                <code className="font-mono text-sm text-foreground bg-secondary/50 px-2 py-1 rounded">
                  {device.device_id}
                </code>
              </td>
              <td className="px-4 py-4">
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning border border-warning/20">
                  ⚠️ {device.inactive_count} {device.inactive_count === 1 ? 'issue' : 'issues'}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {device.platforms.map((platform) => (
                    <PlatformIcon key={platform} platform={platform} showTooltip={true} />
                  ))}
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                {onDeviceClick && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeviceClick(device.device_id)}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Quick View
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}