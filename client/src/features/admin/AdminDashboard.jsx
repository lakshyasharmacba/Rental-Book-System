import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Users, AlertTriangle, Clock, TrendingUp, Package, BookOpen } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const StatCard = ({ label, value, icon: Icon, color = 'text-text-main' }) => (
  <div className="bg-surface p-6 rounded-card border border-border shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-text-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
    {Icon && <Icon className="w-8 h-8 opacity-20" />}
  </div>
);

export const AdminDashboard = () => {
  const { data: res, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
    refetchInterval: 30000, // refresh every 30s
  });

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-red-50 text-danger p-4 rounded-card border border-red-100">
        Failed to load dashboard: {error.message}
      </div>
    </div>
  );

  const stats = res || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Control Panel</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard label="Open Disputes" value={stats.openDisputes ?? 0} icon={AlertTriangle} color="text-danger" />
        <StatCard label="Overdue Returns" value={stats.overdueBookings ?? 0} icon={Clock} color="text-amber-600" />
        <StatCard label="Monthly Revenue" value={formatPrice(stats.revenueThisMonth ?? 0)} icon={TrendingUp} color="text-primary" />
        <StatCard label="Active Users" value={stats.activeUsers ?? 0} icon={Users} />
        <StatCard label="Total Items" value={stats.totalItems ?? 0} icon={Package} />
        <StatCard label="Total Bookings" value={stats.totalBookings ?? 0} icon={BookOpen} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="bg-surface border border-border rounded-card p-4 space-y-1 h-fit">
          <div className="text-xs font-bold text-text-muted uppercase mb-4 px-2">Modules</div>
          {[
            { to: '/admin/disputes', label: 'Disputes', badge: stats.openDisputes },
            { to: '/admin/bookings', label: 'Bookings' },
            { to: '/admin/users', label: 'Users' },
            { to: '/admin/config', label: 'System Config' },
            { to: '/admin/ledger', label: 'Financial Ledger' },
            { to: '/admin/audit', label: 'Audit Log' },
          ].map(({ to, label, badge }) => (
            <Link key={to} to={to} className="flex items-center justify-between px-4 py-2 rounded text-sm hover:bg-surface-alt font-medium">
              <span>{label}</span>
              {badge > 0 && (
                <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>
              )}
            </Link>
          ))}
        </div>

        {/* Urgent Action Feed */}
        <div className="md:col-span-3 bg-surface p-6 rounded-card border border-border shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Attention Required</h3>
          
          {stats.recentDisputes?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 font-medium">Booking</th>
                    <th className="pb-3 font-medium">Raised By</th>
                    <th className="pb-3 font-medium">Claim</th>
                    <th className="pb-3 font-medium">Age</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentDisputes.map(d => (
                    <tr key={d.id} className="hover:bg-surface-alt">
                      <td className="py-3 font-mono text-xs">{d.bookingId}</td>
                      <td className="py-3">{d.raisedBy}</td>
                      <td className="py-3">{formatPrice(d.claim)}</td>
                      <td className="py-3 text-danger">{d.sla} day{d.sla !== 1 ? 's' : ''} ago</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          d.status === 'OPEN' ? 'bg-red-100 text-danger' :
                          d.status === 'AWAITING_RENTER' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{d.status}</span>
                      </td>
                      <td className="py-3">
                        <Link to={`/dispute/${d.id}`} className="text-primary hover:underline text-sm">Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
              <p className="text-text-muted">All caught up! No open disputes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
