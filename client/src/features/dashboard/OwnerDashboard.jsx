import { useQuery } from '@tanstack/react-query';
import { AnalyticsChart } from './AnalyticsChart';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, BookOpen, AlertTriangle } from 'lucide-react';

export const OwnerDashboard = () => {
  const { data: res, isLoading, error } = useQuery({
    queryKey: ['owner-stats'],
    queryFn: async () => {
      const { data } = await api.get('/owner/stats');
      // Server returns { success: true, data: { totalEarnings, ... } }
      return data.data;
    },
    refetchInterval: 60000,
  });

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 text-danger p-4 rounded-card border border-red-100">
        Failed to load dashboard. <button onClick={() => window.location.reload()} className="underline">Retry</button>
      </div>
    </div>
  );

  const stats = res || {};
  const chartData = stats.chartData || [];
  const topItems = stats.topItems || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <Link to="/items/new" className="bg-primary text-white px-4 py-2 rounded-card text-sm font-medium hover:bg-primary-hover">
          + List an Item
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
          <p className="text-sm font-medium text-text-muted mb-1">Total Earnings</p>
          <p className="text-2xl font-bold text-text-main">{formatPrice(stats.totalEarnings || 0)}</p>
          <p className="text-xs text-text-muted mt-1">After service fee</p>
        </div>
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
          <p className="text-sm font-medium text-text-muted mb-1">Held Deposits</p>
          <p className="text-2xl font-bold text-amber-600">{formatPrice(stats.heldDeposits || 0)}</p>
          <p className="text-xs text-text-muted mt-1">Active bookings only</p>
        </div>
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
          <p className="text-sm font-medium text-text-muted mb-1">Active Bookings</p>
          <p className="text-2xl font-bold text-primary">{stats.counts?.active || 0}</p>
          <p className="text-xs text-text-muted mt-1">{stats.counts?.overdue || 0} overdue</p>
        </div>
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
          <p className="text-sm font-medium text-text-muted mb-1">Completed</p>
          <p className="text-2xl font-bold text-text-main">{stats.counts?.completed || 0}</p>
          <p className="text-xs text-text-muted mt-1">{stats.itemsCount || 0} items listed</p>
        </div>
      </div>

      {stats.counts?.disputed > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-card flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
          <span className="text-sm text-danger font-medium">
            {stats.counts.disputed} active dispute{stats.counts.disputed > 1 ? 's' : ''} need your attention.
          </span>
          <Link to="/bookings" className="ml-auto text-sm text-danger underline">View Bookings</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-card border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Earnings Overview</h3>
          {chartData.length > 0 ? (
            <AnalyticsChart data={chartData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <TrendingUp className="w-10 h-10 opacity-20 mx-auto mb-2" />
                <p>No earnings data yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Items */}
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Top Performing Gear</h3>
          {topItems.length > 0 ? (
            <div className="space-y-4">
              {topItems.map((item, i) => (
                <div key={item._id || i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center text-xs font-bold text-text-muted">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                      <p className="text-xs text-text-muted">{item.bookingsCount} booking{item.bookingsCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="font-semibold text-sm">{formatPrice(item.revenue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-10 h-10 opacity-20 mx-auto mb-2" />
              <p className="text-sm text-text-muted">No booking data yet</p>
              <Link to="/items/new" className="text-primary text-sm hover:underline mt-1 block">List your first item</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
