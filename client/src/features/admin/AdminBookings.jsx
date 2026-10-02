import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Link } from 'react-router-dom';

export const AdminBookings = () => {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/bookings');
      return data;
    },
    initialData: [
      { id: 'b1', code: 'RL-1234', item: 'Sony A7IV', status: 'ACTIVE', renter: 'Alice', owner: 'Bob' }
    ]
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
      {isLoading ? <Spinner /> : (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Booking ID</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Renter</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-surface-alt">
                  <td className="px-4 py-3 font-mono">{b.code}</td>
                  <td className="px-4 py-3 font-medium">{b.item}</td>
                  <td className="px-4 py-3 text-text-muted">{b.renter}</td>
                  <td className="px-4 py-3 text-text-muted">{b.owner}</td>
                  <td className="px-4 py-3"><Badge>{b.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/bookings/${b.id}`} className="text-primary hover:underline font-medium">View</Link>
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

export default AdminBookings;
