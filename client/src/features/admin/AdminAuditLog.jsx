import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

export const AdminAuditLog = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: async () => {
      const { data } = await api.get('/admin/audit');
      return data;
    },
    initialData: [
      { id: 'a1', timestamp: new Date().toISOString(), actor: 'System', action: 'AUTO_RELEASE_DEPOSIT', entityType: 'Booking', entityId: 'RL-1234' },
      { id: 'a2', timestamp: new Date().toISOString(), actor: 'Admin User', action: 'RESOLVE_DISPUTE', entityType: 'Dispute', entityId: 'd123' },
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Audit Log</h1>
      {isLoading ? <Spinner /> : (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-surface-alt">
                  <td className="px-4 py-3 text-text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium">{log.actor}</td>
                  <td className="px-4 py-3 font-mono">{log.action}</td>
                  <td className="px-4 py-3 text-text-muted">{log.entityType} ({log.entityId})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLog;
