import { useState } from 'react';
import { format } from 'date-fns';
import { Activity, AlertTriangle, CheckCircle2, XCircle, AppWindow, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { PlatformChart } from '@/components/PlatformChart';
import { InactiveDevicesTable } from '@/components/InactiveDevicesTable';
import { DeviceDetailModal } from '@/components/DeviceDetailModal';
import { DatePicker } from '@/components/DatePicker';
import { LoadingState, ErrorState, EmptyState } from '@/components/LoadingState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSummary, useInactiveDevices, useNoAppFound } from '@/hooks/useDeviceData';
import { getTotalCounts, getPlatformData } from '@/lib/api';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  
  const handleDeviceClick = (deviceId: string) => {
    setSelectedDevice(deviceId);
    setIsModalOpen(true);
  };
  
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['summary', dateString] });
    queryClient.invalidateQueries({ queryKey: ['inactive-devices', dateString] });
    queryClient.invalidateQueries({ queryKey: ['no-app-found', dateString] });
  };
  
  const isLoading = summaryLoading;
  const hasError = summaryError;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Monitor account status across all devices and platforms
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              className="border-border/50 bg-secondary/50 hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Accounts"
                value={totalAccounts}
                icon={Activity}
                variant="default"
              />
              <StatCard
                title="Active"
                value={totals.active}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="Inactive"
                value={totals.inactive}
                icon={AlertTriangle}
                variant="warning"
              />
              <StatCard
                title="Errors"
                value={totals.error}
                icon={XCircle}
                variant="destructive"
              />
            </div>
            
            {/* Health Score & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Platform Breakdown</h3>
                    <p className="text-sm text-muted-foreground">Account status by platform</p>
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
              
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  <svg className="w-40 h-40 -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="hsl(var(--secondary))"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="hsl(var(--success))"
                      strokeWidth="12"
                      strokeDasharray={`${(healthScore / 100) * 440} 440`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <p className="text-4xl font-bold">{healthScore}%</p>
                      <p className="text-sm text-muted-foreground">Health</p>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1">System Health</h3>
                <p className="text-sm text-muted-foreground">
                  {healthScore >= 90 ? 'Excellent' : healthScore >= 70 ? 'Good' : healthScore > 0 ? 'Needs Attention' : 'No Data'}
                </p>
              </div>
            </div>
            
            {/* Tabs for Tables */}
            <Tabs defaultValue="inactive" className="space-y-6">
              <TabsList className="bg-secondary/50 p-1">
                <TabsTrigger value="inactive" className="data-[state=active]:bg-card">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Inactive Devices
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-warning/20 text-warning">
                    {inactiveDevices.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="noapp" className="data-[state=active]:bg-card">
                  <AppWindow className="h-4 w-4 mr-2" />
                  No App Found
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-destructive/20 text-destructive">
                    {noAppDevices.length}
                  </span>
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
                              Platform
                            </th>
                            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {noAppDevices.map((device) => (
                            <tr key={`${device.device_id}-${device.platform}`} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-4 py-4">
                                <code className="font-mono text-sm text-foreground bg-secondary/50 px-2 py-1 rounded">
                                  {device.device_id}
                                </code>
                              </td>
                              <td className="px-4 py-4 capitalize">{device.platform}</td>
                              <td className="px-4 py-4 text-muted-foreground">{device.reason}</td>
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
