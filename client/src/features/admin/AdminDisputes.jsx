import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDisputes = () => {
  const [status, setStatus] = useState('ALL');
  
  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes', status],
    queryFn: async () => {
      const { data } = await api.get('/admin/disputes', { params: { status } });
      return data;
    },
    initialData: [
      { id: 'd123', bookingCode: 'RL-8989', ownerName: 'Alice', renterName: 'Bob', amount: 500000, status: 'OPEN', sla: 3 }
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Disputes Queue</h1>
      
      <div className="mb-6 flex gap-2">
        {['ALL', 'OPEN', 'AWAITING_RENTER', 'RESOLVED'].map(s => (
          <button 
            key={s} 
            onClick={() => setStatus(s)}
            className={`px-4 py-2 text-sm rounded-chip border transition-colors ${status === s ? 'bg-text-main text-white border-text-main' : 'bg-surface border-border text-text-muted hover:bg-surface-alt'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Dispute ID</th>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Parties</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">SLA Days</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {disputes.map(d => (
                <tr key={d.id} className="hover:bg-surface-alt">
                  <td className="px-4 py-3 font-mono">{d.id}</td>
                  <td className="px-4 py-3 font-mono">{d.bookingCode}</td>
                  <td className="px-4 py-3 text-text-muted">{d.ownerName} vs {d.renterName}</td>
                  <td className="px-4 py-3"><Badge variant={d.status === 'OPEN' ? 'red' : 'gray'}>{d.status}</Badge></td>
                  <td className="px-4 py-3 font-medium text-danger">{d.sla}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/dispute/${d.id}`} className="text-primary hover:underline font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
