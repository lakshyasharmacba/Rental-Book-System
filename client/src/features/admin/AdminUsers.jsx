import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search } from 'lucide-react';

export const AdminUsers = () => {
  const [search, setSearch] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: { search } });
      return data;
    },
    initialData: [
      { id: 'u1', name: 'John Doe', email: 'john@example.com', status: 'ACTIVE', score: 95 }
    ]
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-text-muted" />
          <Input 
            className="pl-10" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="bg-surface border border-border rounded-card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-alt border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Trust Score</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-surface-alt">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === 'ACTIVE' ? 'green' : 'red'}>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{user.score}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="secondary">Manage</Button>
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

export default AdminUsers;
