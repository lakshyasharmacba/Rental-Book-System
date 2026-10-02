import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';

export const AdminLedger = () => {
  const { data: entries, isLoading } = useQuery({
    queryKey: ['admin-ledger'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ledger');
      return data;
    },
    initialData: [
      { id: 'l1', date: new Date().toISOString(), type: 'PAYMENT', amount: 500000, direction: 'IN', bookingCode: 'RL-1234' },
      { id: 'l2', date: new Date().toISOString(), type: 'PAYOUT', amount: 450000, direction: 'OUT', bookingCode: 'RL-1234' }
    ]
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Financial Ledger</h1>
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-alt border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Ref Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-surface-alt">
                <td className="px-4 py-3 text-text-muted">{new Date(entry.date).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{entry.bookingCode}</td>
                <td className="px-4 py-3"><Badge>{entry.type}</Badge></td>
                <td className={`px-4 py-3 text-right font-medium ${entry.direction === 'IN' ? 'text-success' : 'text-danger'}`}>
                  {entry.direction === 'IN' ? '+' : '-'}{formatPrice(entry.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLedger;
