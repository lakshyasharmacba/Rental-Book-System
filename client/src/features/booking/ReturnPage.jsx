import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PhotoUpload } from '@/components/forms/PhotoUpload';
import { useToast } from '@/components/ui/Toast';

export const ReturnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: booking, isLoading } = useBooking(id);
  const { mutateAsync: updateStatus, isPending } = useUpdateBookingStatus();

  const [photos, setPhotos] = useState([]);

  if (isLoading || !booking) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const photoUrls = photos.map(p => p.preview || p.url);
      
      await updateStatus({ 
        id, 
        status: 'returned',
        returnPhotos: photoUrls 
      });
      
      addToast({ title: 'Success', message: 'Return initiated successfully!', type: 'success' });
      navigate(`/bookings/${id}`);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to initiate return', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-text-main">Return Item</h1>
      
      <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
        <p className="text-text-muted mb-6">
          Ready to hand the item back? We recommend taking a few photos of the item's condition before you hand it over. This protects you in case of any disputes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">
              Return Photos (Optional but recommended)
            </label>
            <PhotoUpload 
              photos={photos} 
              onChange={setPhotos} 
              minPhotos={0} 
              maxPhotos={6} 
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-card mb-6 text-sm text-amber-800">
            <strong>Important:</strong> Clicking the button below notifies the owner that you have handed the item back. Only click this when you are physically returning the gear.
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            isLoading={isPending}
          >
            I have returned the item
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ReturnPage;
