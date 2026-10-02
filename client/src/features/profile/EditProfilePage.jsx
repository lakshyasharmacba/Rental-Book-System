import { useState } from 'react';
import { useAuthContext } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/Toast';
import api from '@/lib/api';

export const EditProfilePage = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    bio: user?.bio || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.patch('/auth/me', formData);
      addToast({ title: 'Success', message: 'Profile updated', type: 'success' });
      navigate('/profile');
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <div className="bg-surface p-6 md:p-8 rounded-card border border-border shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Full Name"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          <Input 
            label="City"
            value={formData.city}
            onChange={e => setFormData({...formData, city: e.target.value})}
          />
          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-text-main">Bio</label>
            <textarea 
              className="input-field bg-surface min-h-[120px] py-3"
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell others about your photography journey..."
            />
          </div>
          
          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
