import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Star, Calendar as CalendarIcon, Info } from 'lucide-react';
import { useItem } from '@/hooks/useItems';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PriceBreakdown } from '@/components/forms/PriceBreakdown';
import { ItemMap } from '@/components/map/ItemMap';
import { ReviewCard } from '@/components/cards/ReviewCard';
import { formatPrice, diffDays } from '@/lib/utils';
import { useAuthContext } from '@/app/providers';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: item, isLoading, error } = useItem(id);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [acceptDistance, setAcceptDistance] = useState(false);

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error || !item) return <div className="p-8 text-center text-danger">Item not found</div>;

  const days = diffDays(startDate, endDate) || 1;
  const isDistant = item.distanceKm >= 100;
  const isOwner   = user?.id === item.ownerId || user?._id === item.ownerId;
  const canBook   = startDate && endDate && (!isDistant || acceptDistance) && !isOwner;

  const handleReserve = () => {
    // ✅ Not logged in → redirect to login
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
      return;
    }
    navigate(`/booking/new?itemId=${id}&start=${startDate}&end=${endDate}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Title & Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-main mb-2">{item.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-medium text-text-main">{item.rating || 'New'}</span>
            <span>({item.reviewCount || 0} reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{item.city}</span>
            {item.distanceKm != null && <span className="ml-1 bg-surface-alt px-2 py-0.5 rounded-chip">{item.distanceKm} km away</span>}
          </div>
        </div>
      </div>

      {/* Photo Gallery (Simplified grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-10 h-[400px] md:h-[500px] rounded-xl overflow-hidden">
        <div className="md:col-span-2 h-full bg-surface-alt">
          {item.photos?.[0] && <img src={item.photos[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />}
        </div>
        <div className="hidden md:grid grid-cols-2 col-span-2 gap-2 h-full">
          {item.photos?.slice(1, 5).map((photo, i) => (
            <div key={i} className="h-full bg-surface-alt overflow-hidden">
              <img src={photo} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Owner Block */}
          <div className="flex items-center gap-4 pb-8 border-b border-border">
            <div className="w-14 h-14 rounded-full bg-primary/10 overflow-hidden">
              {item.owner?.avatar ? (
                <img src={item.owner.avatar} alt={item.owner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-primary text-xl">
                  {item.owner?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">Hosted by {item.owner?.name}</h3>
              <div className="flex items-center gap-2 text-sm text-text-muted mt-1">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Identity verified</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">About this gear</h2>
            <p className="text-text-muted whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Map */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <p className="text-sm text-text-muted mb-4">Exact location provided after booking is confirmed.</p>
            <div className="h-[300px] w-full rounded-2xl overflow-hidden">
              <ItemMap lat={item.lat} lng={item.lng} location={item.location} />
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-accent text-accent" />
              {item.rating || 'No'} Ratings
            </h2>
            <div className="space-y-4">
              {item.reviews?.length > 0 ? (
                item.reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-text-muted">No reviews yet for this item.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="relative">
          <div className="sticky top-24 bg-surface rounded-card border border-border shadow-lg p-6">
            <div className="mb-6">
              <span className="text-2xl font-bold">{formatPrice(item.pricePerDay)}</span>
              <span className="text-text-muted"> / day</span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-2 border border-border rounded-card p-1">
                <div className="p-2">
                  <label className="block text-xs font-bold uppercase mb-1">Check-in</label>
                  <input 
                    type="date" 
                    className="w-full text-sm outline-none bg-transparent"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="p-2 border-l border-border">
                  <label className="block text-xs font-bold uppercase mb-1">Check-out</label>
                  <input 
                    type="date" 
                    className="w-full text-sm outline-none bg-transparent"
                    value={endDate}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isDistant && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-card flex gap-3 items-start">
                <Info className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium mb-2">
                    This item is {item.distanceKm}km away.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-danger focus:ring-danger"
                      checked={acceptDistance}
                      onChange={(e) => setAcceptDistance(e.target.checked)}
                    />
                    <span className="text-sm text-red-700">I understand I have to travel to pick this up</span>
                  </label>
                </div>
              </div>
            )}

            {startDate && endDate && (
              <PriceBreakdown 
                pricePerDay={item.pricePerDay} 
                days={days} 
                deposit={item.depositAmount}
              />
            )}

            <Button
              className="w-full mt-6"
              size="lg"
              disabled={!canBook && !!user}
              onClick={handleReserve}
            >
              {isOwner
                ? 'This is your item'
                : !user
                ? '🔒 Login to Reserve'
                : 'Reserve'}
            </Button>

            {/* Login/Signup prompt for guests */}
            {!user && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-100 rounded-xl text-center">
                <p className="text-sm text-teal-700 font-medium mb-2">
                  Sign in to book this gear
                </p>
                <div className="flex gap-2">
                  <a
                    href="/signup"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-lg transition text-center"
                  >
                    Sign Up Free
                  </a>
                  <a
                    href="/login"
                    className="flex-1 border border-teal-300 text-teal-700 text-sm font-semibold py-2 rounded-lg hover:bg-teal-50 transition text-center"
                  >
                    Log In
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
