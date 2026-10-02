import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBooking } from '@/hooks/useBookings';
import { useAuthContext } from '@/app/providers';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { getStatusColor, getStatusLabel, formatPrice, formatDate } from '@/lib/utils';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';

export const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading || !booking) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const isOwner = user?.id === booking.ownerId;
  const status = booking.status.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Booking #{booking.id.slice(0,8)}</h1>
          <p className="text-text-muted text-sm">Placed on {formatDate(booking.createdAt)}</p>
        </div>
        <Badge className={`px-3 py-1 text-sm ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </Badge>
      </div>

      {/* Action Banner */}
      <div className="bg-surface rounded-card border border-border shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-lg mb-2">Next Steps</h2>
        {status === 'CONFIRMED' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">
              {isOwner 
                ? "Prepare the item. You'll need the renter's 6-digit PIN at pickup." 
                : "Meet the owner to pick up the item. Your PIN is below."}
            </p>
            {isOwner ? (
              <Button onClick={() => navigate(`/booking/${id}/pickup`)}>Enter Pickup PIN</Button>
            ) : (
              <div className="bg-surface-alt px-4 py-2 rounded-card border border-border text-center">
                <span className="text-xs text-text-muted uppercase font-bold block mb-1">Your PIN</span>
                <span className="text-xl font-mono font-bold tracking-widest">{booking.pickupCode}</span>
              </div>
            )}
          </div>
        )}
        
        {status === 'ACTIVE' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">
              {isOwner 
                ? "The renter currently has your item." 
                : "Enjoy your rental! Return it by the due date."}
            </p>
            {!isOwner && (
              <Button onClick={() => navigate(`/booking/${id}/return`)}>Initiate Return</Button>
            )}
          </div>
        )}

        {status === 'RETURNED' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-text-muted">
              {isOwner 
                ? "The renter has returned the item. Please inspect it to release their deposit." 
                : "You returned the item. Waiting for the owner's inspection."}
            </p>
            {isOwner && (
              <Button onClick={() => navigate(`/booking/${id}/inspection`)}>Inspect Item</Button>
            )}
          </div>
        )}

        {status === 'DISPUTED' && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-red-50 border border-red-200 rounded-card">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">This booking is in dispute.</p>
                <p className="text-xs text-red-700">Please check the dispute resolution center.</p>
              </div>
            </div>
            <Button variant="danger" onClick={() => navigate(`/dispute/${booking.disputeId}`)}>View Dispute</Button>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-surface p-5 rounded-card border border-border">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">Item Summary</h3>
            <div className="flex gap-4">
              <img src={booking.item.defaultImage} className="w-20 h-20 rounded object-cover" alt="" />
              <div>
                <Link to={`/items/${booking.item.id}`} className="font-medium hover:text-primary">{booking.item.title}</Link>
                <p className="text-sm text-text-muted mt-1">{formatPrice(booking.item.pricePerDay)}/day</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface p-5 rounded-card border border-border">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">Dates & Location</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-text-muted shrink-0" />
                <div className="text-sm">
                  <p><span className="text-text-muted">Out:</span> {formatDate(booking.startDate)}</p>
                  <p><span className="text-text-muted">In:</span> {formatDate(booking.endDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-text-muted shrink-0" />
                <div className="text-sm text-text-muted">
                  <p className="text-text-main font-medium">{booking.item.city}</p>
                  <p>{booking.item.exactAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface p-5 rounded-card border border-border">
            <h3 className="font-semibold mb-4 border-b border-border pb-2">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Paid</span>
                <span className="font-medium">{formatPrice(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Security Deposit</span>
                <span>{formatPrice(booking.depositAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
