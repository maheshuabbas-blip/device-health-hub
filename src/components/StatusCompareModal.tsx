import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PlatformIcon } from './PlatformIcon';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from './ui/button';

interface StatusCompareData {
  platform: string;
  summary: Record<string, number>;
}

interface CompareResponse {
  date: string;
  summary: StatusCompareData[];
}

interface StatusCompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: string;
}

export function StatusCompareModal({
  open,
  onOpenChange,
  currentDate,
}: StatusCompareModalProps) {
  const [todayData, setTodayData] = useState<CompareResponse | null>(null);
  const [yesterdayData, setYesterdayData] = useState<CompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate yesterday's date
  const getYesterdayDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const yesterdayDate = getYesterdayDate(currentDate);

  // Fetch comparison data
  const fetchComparisonData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [todayResponse, yesterdayResponse] = await Promise.all([
        fetch(`http://192.168.20.86:8000/summary/${currentDate}`),
        fetch(`http://192.168.20.86:8000/summary/${yesterdayDate}`),
      ]);

      if (!todayResponse.ok || !yesterdayResponse.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      const today = await todayResponse.json();
      const yesterday = await yesterdayResponse.json();

      setTodayData(today);
      setYesterdayData(yesterday);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comparison');
      setTodayData(null);
      setYesterdayData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchComparisonData();
    } else {
      setTodayData(null);
      setYesterdayData(null);
      setError(null);
    }
  }, [open, currentDate]);

  // Get all unique platforms
  const getAllPlatforms = () => {
    const platforms = new Set<string>();
    todayData?.summary.forEach(item => platforms.add(item.platform));
    yesterdayData?.summary.forEach(item => platforms.add(item.platform));
    return Array.from(platforms).sort();
  };

  // Get status data for a platform
  const getPlatformData = (data: CompareResponse | null, platform: string) => {
    return data?.summary.find(item => item.platform === platform)?.summary || {};
  };

  // Get all unique statuses for a platform
  const getAllStatuses = (platform: string) => {
    const todayStatuses = getPlatformData(todayData, platform);
    const yesterdayStatuses = getPlatformData(yesterdayData, platform);

    const statuses = new Set<string>();
    Object.keys(todayStatuses).forEach(status => statuses.add(status));
    Object.keys(yesterdayStatuses).forEach(status => statuses.add(status));

    return Array.from(statuses).sort();
  };

  // Calculate difference
  const getDifference = (todayCount: number, yesterdayCount: number) => {
    const diff = todayCount - yesterdayCount;
    const percentChange = yesterdayCount > 0 ? ((diff / yesterdayCount) * 100).toFixed(1) : null;
    return { diff, percentChange };
  };

  // Get trend icon
  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-destructive" />;
    if (diff < 0) return <TrendingDown className="h-3 w-3 text-success" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const platforms = getAllPlatforms();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Status Comparison
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Comparing {currentDate} (Today) vs {yesterdayDate} (Yesterday)
          </p>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] -mx-6 px-6">
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
                onClick={fetchComparisonData}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : !todayData || !yesterdayData ? (
            <div className="text-center py-12 text-muted-foreground">
              No comparison data available.
            </div>
          ) : (
            <div className="space-y-8">
              {platforms.map((platform) => {
                const todayStatuses = getPlatformData(todayData, platform);
                const yesterdayStatuses = getPlatformData(yesterdayData, platform);
                const allStatuses = getAllStatuses(platform);

                const todayTotal = Object.values(todayStatuses).reduce((a, b) => a + b, 0);
                const yesterdayTotal = Object.values(yesterdayStatuses).reduce((a, b) => a + b, 0);
                const totalDiff = getDifference(todayTotal, yesterdayTotal);

                return (
                  <div key={platform} className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-border">
                      <PlatformIcon platform={platform} size={32} showTooltip={false} />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold capitalize">{platform}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Today: {todayTotal}</span>
                          <span>•</span>
                          <span>Yesterday: {yesterdayTotal}</span>
                          {totalDiff.diff !== 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(totalDiff.diff)}
                                <span className={totalDiff.diff > 0 ? 'text-destructive' : 'text-success'}>
                                  {Math.abs(totalDiff.diff)}
                                  {totalDiff.percentChange && ` (${totalDiff.percentChange}%)`}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Status
                            </th>
                            <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Yesterday
                            </th>
                            <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Today
                            </th>
                            <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Change
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {allStatuses.map((status) => {
                            const todayCount = todayStatuses[status] || 0;
                            const yesterdayCount = yesterdayStatuses[status] || 0;
                            const { diff, percentChange } = getDifference(todayCount, yesterdayCount);

                            // Format status text
                            const formatStatus = (s: string) =>
                              s.replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                .join(' ');

                            return (
                              <tr key={status} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-4 py-3">
                                  <span className="text-sm font-medium">
                                    {formatStatus(status)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge variant="outline" className="font-mono">
                                    {yesterdayCount}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Badge variant="outline" className="font-mono">
                                    {todayCount}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-center gap-2">
                                    {diff === 0 ? (
                                      <Badge variant="secondary" className="font-mono">
                                        <Minus className="h-3 w-3 mr-1" />
                                        No change
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant={diff > 0 ? "destructive" : "default"}
                                        className="font-mono"
                                      >
                                        {getTrendIcon(diff)}
                                        <span className="ml-1">
                                          {diff > 0 ? '+' : ''}{diff}
                                          {percentChange && ` (${percentChange}%)`}
                                        </span>
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            🔴 Red = Increase (worse) • 🟢 Green = Decrease (better)
          </span>
          <span>
            {platforms.length} platforms compared
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}