import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useItem } from '@/hooks/useItems';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

export const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: item, isLoading: isFetching } = useItem(id);

  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        pricePerDay: (item.pricePerDay / 100).toString(),
        depositAmount: (item.depositAmount / 100).toString(),
      });
    }
  }, [item]);

  if (isFetching || !formData) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay) * 100,
        depositAmount: Number(formData.depositAmount) * 100,
      };
      await api.patch(`/items/${id}`, payload);
      addToast({ title: 'Success', message: 'Item updated successfully', type: 'success' });
      navigate(`/items/${id}`);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update item', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>
      
      <div className="bg-surface p-6 border border-border rounded-card shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Description</label>
            <textarea 
              className="input-field bg-surface min-h-[120px] py-3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per day (₹)"
              type="number"
              value={formData.pricePerDay}
              onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
              required
            />
            <Input
              label="Deposit (₹)"
              type="number"
              value={formData.depositAmount}
              onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
              required
            />
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="submit" isLoading={isSaving} className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(`/items/${id}`)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemPage;
