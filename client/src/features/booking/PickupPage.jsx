import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PhotoUpload } from '@/components/forms/PhotoUpload';
import { useToast } from '@/components/ui/Toast';

export const PickupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: booking, isLoading } = useBooking(id);
  const { mutateAsync: updateStatus, isPending } = useUpdateBookingStatus();

  const [pin, setPin] = useState('');
  const [photos, setPhotos] = useState([]);

  if (isLoading || !booking) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      addToast({ title: 'Error', message: 'PIN must be 6 digits', type: 'error' });
      return;
    }
    if (photos.length < 2) {
      addToast({ title: 'Error', message: 'Please upload at least 2 condition photos', type: 'error' });
      return;
    }

    try {
      // Convert preview URLs to simple mock strings for now (real app would upload them)
      const photoUrls = photos.map(p => p.preview || p.url);
      
      await updateStatus({ 
        id, 
        status: 'active',
        pickupCode: pin,
        pickupPhotos: photoUrls 
      });
      
      addToast({ title: 'Success', message: 'Item handed over successfully!', type: 'success' });
      navigate(`/bookings/${id}`);
    } catch (err) {
      addToast({ title: 'Error', message: err.response?.data?.message || 'Failed to verify PIN', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-text-main">Handover Item</h1>
      
      <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
        <p className="text-text-muted mb-6">
          To start the rental period and protect yourself against damage claims, please verify the renter's PIN and take clear photos of the item's current condition.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Renter's 6-Digit PIN
            </label>
            <input 
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl font-mono tracking-widest p-4 rounded-card border border-border outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              placeholder="------"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Condition Photos (Before Handover)
            </label>
            <PhotoUpload 
              photos={photos} 
              onChange={setPhotos} 
              minPhotos={2} 
              maxPhotos={6} 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            isLoading={isPending}
            disabled={pin.length !== 6 || photos.length < 2}
          >
            Verify & Start Rental
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PickupPage;
