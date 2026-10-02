import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, CheckCircle } from 'lucide-react';
import { useBooking } from '@/hooks/useBookings';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ItemMap } from '@/components/map/ItemMap';
import { formatDate } from '@/lib/utils';

export const BookingConfirmedPage = () => {
  const { id } = useParams();
  const { data: booking, isLoading } = useBooking(id);

  if (isLoading || !booking) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-main mb-2">Booking Confirmed!</h1>
        <p className="text-text-muted">Your payment was successful and the owner has been notified.</p>
        <p className="text-sm font-medium mt-2 bg-surface-alt inline-block px-3 py-1 rounded-chip border border-border">
          Booking ID: #{booking.id.slice(0,8).toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pickup Code Card */}
        <div className="bg-primary text-white p-6 rounded-card flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <p className="text-primary-100 font-medium mb-2">Your Secret Pickup Code</p>
          <div className="text-5xl font-mono font-bold tracking-widest">{booking.pickupCode}</div>
          <p className="text-xs text-primary-100 mt-4 max-w-xs">
            Show this code to the owner when you meet them to receive the gear. Do not share it beforehand.
          </p>
        </div>

        {/* Meetup Details */}
        <div className="bg-surface border border-border rounded-card p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Meetup Details</h3>
          
          <div className="flex gap-3 mb-4">
            <MapPin className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-main">{booking.item.exactAddress || booking.item.city}</p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${booking.item.lat},${booking.item.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary text-sm font-medium hover:underline inline-block mt-1"
              >
                Get Directions
              </a>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Phone className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-text-muted mb-1">Owner Contact</p>
              <p className="font-medium text-text-main">{booking.owner.name}</p>
              <p className="text-text-main">{booking.owner.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-64 w-full rounded-card overflow-hidden border border-border mb-8 shadow-sm">
        <ItemMap lat={booking.item.lat} lng={booking.item.lng} radius={100} />
      </div>

      <div className="flex gap-4 justify-center">
        <Link to={`/bookings/${id}`}>
          <Button variant="secondary">View Details</Button>
        </Link>
        <Link to="/search">
          <Button>Keep Browsing</Button>
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmedPage;
