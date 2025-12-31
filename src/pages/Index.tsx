import { useState } from 'react';
import { format } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle2, XCircle, AppWindow, RefreshCw, TrendingUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PlatformChart } from '@/components/PlatformChart';
import { InactiveDevicesTable } from '@/components/InactiveDevicesTable';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { DatePicker } from '@/components/DatePicker';
import { LoadingState, ErrorState, EmptyState } from '@/components/LoadingState';
import { QuickInsights } from '@/components/QuickInsights';
import { HealthScoreRing } from '@/components/HealthScoreRing';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSummary, useInactiveDevices, useNoAppFound } from '@/hooks/useDeviceData';
import { getTotalCounts, getPlatformData } from '@/lib/api';
import { cn } from '@/lib/utils';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Fetch data from API
  const { 
    data: summaryData, 
    isLoading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary 
  } = useSummary(dateString);
  
  const { 
    data: inactiveDevicesData, 
    isLoading: devicesLoading, 
    error: devicesError,
    refetch: refetchDevices 
  } = useInactiveDevices(dateString, { limit: 50 });
  
  const { 
    data: noAppData, 
    isLoading: noAppLoading, 
    error: noAppError,
    refetch: refetchNoApp 
  } = useNoAppFound(dateString);
  
  const summary = summaryData?.summary || [];
  const inactiveDevices = inactiveDevicesData?.devices || [];
  const noAppDevices = noAppData?.devices || [];
  
  const totals = getTotalCounts(summary);
  const platformData = getPlatformData(summary);
  const totalAccounts = totals.active + totals.inactive + totals.error;
  const healthScore = totalAccounts > 0 ? Math.round((totals.active / totalAccounts) * 100) : 0;
  
  // Calculate percentages for stat cards
  const activePercentage = totalAccounts > 0 ? (totals.active / totalAccounts) * 100 : 0;
  const inactivePercentage = totalAccounts > 0 ? (totals.inactive / totalAccounts) * 100 : 0;
  const errorPercentage = totalAccounts > 0 ? (totals.error / totalAccounts) * 100 : 0;
  
  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setIsModalOpen(true);
  };
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['summary', dateString] }),
      queryClient.invalidateQueries({ queryKey: ['inactive-devices', dateString] }),
      queryClient.invalidateQueries({ queryKey: ['no-app-found', dateString] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };
  
  const isLoading = summaryLoading;
  const hasError = summaryError;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Monitor account status across all devices and platforms
            </p>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "border-border/50 bg-secondary/50 hover:bg-secondary transition-all",
                isRefreshing && "animate-pulse"
              )}
            >
              <RefreshCw className={cn("h-4 w-4 transition-transform", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <LoadingState text="Loading dashboard data..." className="min-h-[400px]" />
        ) : hasError ? (
          <ErrorState 
            message="Failed to connect to API. Please check if the server is running."
            onRetry={() => refetchSummary()}
            className="min-h-[400px]"
          />
        ) : (
          <>
            {/* Quick Insights */}
            <QuickInsights 
              summary={summary} 
              totalAccounts={totalAccounts} 
              healthScore={healthScore} 
            />
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                <StatCard
                  title="Total Accounts"
                  value={totalAccounts}
                  icon={Activity}
                  variant="default"
                  subtitle={`Across ${summary.length} platforms`}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                <StatCard
                  title="Active"
                  value={totals.active}
                  icon={CheckCircle2}
                  variant="success"
                  percentage={activePercentage}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <StatCard
                  title="Inactive"
                  value={totals.inactive}
                  icon={AlertTriangle}
                  variant="warning"
                  percentage={inactivePercentage}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                <StatCard
                  title="Errors"
                  value={totals.error}
                  icon={XCircle}
                  variant="destructive"
                  percentage={errorPercentage}
                />
              </div>
            </div>
            
            {/* Health Score & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Platform Breakdown</h3>
                    <p className="text-sm text-muted-foreground">Account status distribution by platform</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-success" />
                      <span className="text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-warning" />
                      <span className="text-muted-foreground">Inactive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-destructive" />
                      <span className="text-muted-foreground">Error</span>
                    </div>
                  </div>
                </div>
                {platformData.length > 0 ? (
                  <PlatformChart data={platformData} />
                ) : (
                  <EmptyState 
                    title="No platform data" 
                    description="No account data available for this date."
                  />
                )}
              </div>
              
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center animate-fade-in" style={{ animationDelay: '250ms' }}>
                <HealthScoreRing score={healthScore} />
                <h3 className="text-lg font-semibold mt-4 mb-1">System Health</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Overall account health score
                </p>
                
                {/* Mini stats */}
                <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-success">{totals.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-warning">{totals.inactive}</p>
                    <p className="text-xs text-muted-foreground">Inactive</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-destructive">{totals.error}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tabs for Tables */}
            <Tabs defaultValue="inactive" className="space-y-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <TabsList className="bg-secondary/50 p-1">
                <TabsTrigger value="inactive" className="data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Inactive Devices
                  {inactiveDevices.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning font-medium">
                      {inactiveDevices.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="noapp" className="data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all">
                  <AppWindow className="h-4 w-4 mr-2" />
                  No App Found
                  {noAppDevices.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive font-medium">
                      {noAppDevices.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="inactive" className="animate-fade-in">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Inactive Devices</h3>
                    <p className="text-sm text-muted-foreground">
                      Devices with inactive or error accounts that need attention
                    </p>
                  </div>
                  {devicesLoading ? (
                    <LoadingState text="Loading devices..." />
                  ) : devicesError ? (
                    <ErrorState 
                      message="Failed to load inactive devices" 
                      onRetry={() => refetchDevices()} 
                    />
                  ) : inactiveDevices.length === 0 ? (
                    <EmptyState 
                      title="All clear!" 
                      description="No inactive devices found for this date."
                    />
                  ) : (
                    <InactiveDevicesTable devices={inactiveDevices} onDeviceClick={handleDeviceClick} />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="noapp" className="animate-fade-in">
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold">Missing Applications</h3>
                    <p className="text-sm text-muted-foreground">
                      Devices where the expected app was not found
                    </p>
                  </div>
                  {noAppLoading ? (
                    <LoadingState text="Loading data..." />
                  ) : noAppError ? (
                    <ErrorState 
                      message="Failed to load no app found devices" 
                      onRetry={() => refetchNoApp()} 
                    />
                  ) : noAppDevices.length === 0 ? (
                    <EmptyState 
                      title="All apps installed" 
                      description="No missing applications found for this date."
                    />
                  ) : (
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30">
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Device ID
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Platforms
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Missing Apps
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {noAppDevices.map((device, idx) => (
                            <tr 
                              key={device.device_id} 
                              className="hover:bg-secondary/20 transition-colors"
                              style={{ animationDelay: `${idx * 30}ms` }}
                            >
                              <td className="px-4 py-4">
                                <code className="font-mono text-sm text-foreground bg-secondary/50 px-2 py-1 rounded">
                                  {device.device_id}
                                </code>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {device.platforms.map(p => (
                                    <span key={p} className="capitalize text-sm px-2 py-0.5 rounded bg-secondary/50">{p}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-semibold text-destructive">{device.missing_app_count}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
      
      <DeviceDetailModal
        deviceId={selectedDevice}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default Index;
