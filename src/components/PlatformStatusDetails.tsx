import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SummaryItem } from '@/lib/api';
import { PlatformIcon } from './PlatformIcon';
import { StatusDetailModal } from './StatusDetailModal';
import { StatusCompareModal } from './StatusCompareModal';
import { ExternalLink, GitCompare } from 'lucide-react';

interface PlatformStatusDetailsProps {
  summary: SummaryItem[];
  date: string;
}

export function PlatformStatusDetails({ summary, date }: PlatformStatusDetailsProps) {
  const [selectedStatus, setSelectedStatus] = useState<{
    platform: string;
    status: string;
    count: number;
  } | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const handleStatusClick = (platform: string, status: string, count: number) => {
    setSelectedStatus({ platform, status, count });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle>Detailed Status Breakdown</CardTitle>
              <CardDescription>Click on any status to view affected devices</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareModalOpen(true)}
              className="gap-2"
            >
              <GitCompare className="h-4 w-4" />
              Compare with Yesterday
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {summary.map((item) => {
              // Merge duplicate statuses (case-insensitive)
              const mergedStatuses = new Map<string, { displayName: string; count: number }>();

              Object.entries(item.details).forEach(([status, count]) => {
                const lowerStatus = status.toLowerCase();

                if (mergedStatuses.has(lowerStatus)) {
                  const existing = mergedStatuses.get(lowerStatus)!;
                  existing.count += count;
                } else {
                  mergedStatuses.set(lowerStatus, { displayName: status, count });
                }
              });

              // Convert back to array and sort by count
              const sortedStatuses = Array.from(mergedStatuses.values()).sort(
                (a, b) => b.count - a.count
              );

              return (
                <div key={item.platform} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <PlatformIcon platform={item.platform} showTooltip={false} />
                    <span className="font-semibold capitalize text-lg">
                      {item.platform}
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      {item.total} total
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-8">
                    {sortedStatuses.map(({ displayName, count }) => {
                      const percentage = ((count / item.total) * 100).toFixed(1);
                      return (
                        <button
                          key={displayName}
                          onClick={() => handleStatusClick(item.platform, displayName, count)}
                          className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/70 transition-colors cursor-pointer group text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={displayName}>
                              {displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {count}
                            </Badge>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedStatus && (
        <StatusDetailModal
          open={!!selectedStatus}
          onOpenChange={(open) => !open && setSelectedStatus(null)}
          date={date}
          platform={selectedStatus.platform}
          status={selectedStatus.status}
          count={selectedStatus.count}
        />
      )}

      <StatusCompareModal
        open={compareModalOpen}
        onOpenChange={setCompareModalOpen}
        currentDate={date}
      />
    </>
  );
}