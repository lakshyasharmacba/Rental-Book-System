import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const InspectionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: booking, isLoading } = useBooking(id);
  const { mutateAsync: updateStatus, isPending } = useUpdateBookingStatus();

  if (isLoading || !booking) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const handleApprove = async () => {
    try {
      await updateStatus({ id, status: 'completed' });
      addToast({ title: 'Success', message: 'Item marked as returned in good condition. Deposit released.', type: 'success' });
      navigate(`/bookings/${id}`);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to complete booking', type: 'error' });
    }
  };

  const handleDispute = () => {
    navigate(`/dispute/new?bookingId=${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6 text-text-main">Inspect Returned Item</h1>
      
      <p className="text-text-muted mb-8">
        The renter has returned <strong>{booking.item.title}</strong>. Please inspect the gear carefully. Compare the current condition against your pickup photos below.
      </p>

      <div className="mb-8">
        <h3 className="font-semibold mb-4 text-lg">Your Pickup Photos</h3>
        {booking.pickupPhotos?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {booking.pickupPhotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-card overflow-hidden border border-border">
                <img src={url} alt="Pickup" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">No pickup photos were provided.</p>
        )}
      </div>

      <div className="mb-10">
        <h3 className="font-semibold mb-4 text-lg">Renter's Return Photos</h3>
        {booking.returnPhotos?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {booking.returnPhotos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block aspect-square rounded-card overflow-hidden border border-border">
                <img src={url} alt="Return" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">Renter did not upload return photos.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border">
        <div className="bg-surface border border-green-200 rounded-card p-6 flex flex-col justify-between items-start h-full">
          <div>
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2 text-lg">
              <CheckCircle className="w-6 h-6" />
              Item is OK
            </div>
            <p className="text-sm text-text-muted mb-6">
              The item is in the same condition as when you handed it over. The renter's security deposit will be fully refunded to them.
            </p>
          </div>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={handleApprove}
            isLoading={isPending}
          >
            Release Deposit & Complete
          </Button>
        </div>

        <div className="bg-surface border border-red-200 rounded-card p-6 flex flex-col justify-between items-start h-full">
          <div>
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2 text-lg">
              <AlertTriangle className="w-6 h-6" />
              Report Damage
            </div>
            <p className="text-sm text-text-muted mb-6">
              The item is damaged, missing accessories, or returned extremely late. Open a dispute to hold the deposit while we resolve the issue.
            </p>
          </div>
          <Button 
            variant="danger" 
            className="w-full" 
            onClick={handleDispute}
            disabled={isPending}
          >
            Open Dispute
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InspectionPage;
