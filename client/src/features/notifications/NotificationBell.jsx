import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    initialData: { notifications: [], unreadCount: 0 }
  });
};

export const NotificationBell = () => {
  const { data } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-muted hover:text-primary transition-colors relative focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-card shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-border flex justify-between items-center bg-surface-alt">
            <span className="font-semibold text-sm">Notifications</span>
            <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {data?.notifications?.length > 0 ? (
              data.notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`p-3 border-b border-border last:border-0 hover:bg-surface-alt transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                  <p className="text-sm text-text-main mb-1">{n.message}</p>
                  <span className="text-xs text-text-muted">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-text-muted">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
