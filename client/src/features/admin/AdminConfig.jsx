import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export const AdminConfig = () => {
  const { addToast } = useToast();
  
  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: async () => {
      const { data } = await api.get('/admin/config');
      return data;
    },
    initialData: {
      feePercent: 10,
      pickupWindowHours: 24,
      inspectionWindowHours: 48,
      gracePeriodDays: 2,
    }
  });

  const [formData, setFormData] = useState(config);
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      await api.patch('/admin/config', payload);
    },
    onSuccess: () => {
      addToast({ title: 'Success', message: 'Configuration saved successfully', type: 'success' });
    }
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>
      <div className="bg-surface border border-border rounded-card p-6 md:p-8">
        <form onSubmit={(e) => { e.preventDefault(); mutate(formData); }} className="space-y-6">
          <Input 
            label="Platform Fee Percent (%)" 
            type="number" 
            value={formData.feePercent} 
            onChange={(e) => setFormData({...formData, feePercent: Number(e.target.value)})}
          />
          <Input 
            label="Pickup Window (hours)" 
            type="number" 
            value={formData.pickupWindowHours} 
            onChange={(e) => setFormData({...formData, pickupWindowHours: Number(e.target.value)})}
          />
          <Input 
            label="Inspection Window (hours)" 
            type="number" 
            value={formData.inspectionWindowHours} 
            onChange={(e) => setFormData({...formData, inspectionWindowHours: Number(e.target.value)})}
            description="How long the owner has to inspect the item before auto-release"
          />
          <div className="pt-4 border-t border-border flex justify-end">
            <Button type="submit" isLoading={isPending}>Save Configuration</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfig;
