import { useNotifications } from './NotificationBell';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotificationsPage = () => {
  const { data, isLoading } = useNotifications();

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const notifications = data?.notifications || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.length > 0 && <Button variant="secondary" size="sm">Mark all as read</Button>}
      </div>

      <div className="bg-surface border border-border rounded-card overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-border">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 hover:bg-surface-alt transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                <p className="text-text-main mb-1">{n.message}</p>
                <span className="text-xs text-text-muted">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState 
              icon={Bell}
              title="You're all caught up!"
              description="No new notifications to show here."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
