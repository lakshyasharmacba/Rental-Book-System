import { Link, useNavigate } from 'react-router-dom';
import { Camera, MapPin, Star, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Badge } from '../ui/Badge';
import { useAuthContext } from '@/app/providers';

export const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    _id, id,
    title,
    defaultImage,
    photos,        // server returns photos[]
    city,
    distanceKm,
    pricePerDay,
    ratingAvg, rating,
    ratingCount, reviewCount,
  } = item;

  const itemId   = _id || id;
  // ✅ Fix: use photos[0] if defaultImage not present
  const imgSrc   = defaultImage || (Array.isArray(photos) && photos[0]) || null;
  const stars    = ratingAvg || rating || null;
  const reviews  = ratingCount || reviewCount || 0;

  // Distance colour
  let distanceVariant = 'gray';
  if (distanceKm != null) {
    if (distanceKm <= 50)  distanceVariant = 'green';
    else if (distanceKm <= 100) distanceVariant = 'amber';
    else distanceVariant = 'red';
  }

  const handleCardClick = () => {
    navigate(`/items/${itemId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* ── Image ── */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
            <Camera className="w-10 h-10 mb-1" />
            <span className="text-xs">No photo</span>
          </div>
        )}

        {/* Heart (stop propagation so card click doesn't fire) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) { navigate('/login'); return; }
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm">{title}</h3>
          <div className="flex items-center gap-1 text-sm font-medium flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-gray-800">{stars ? Number(stars).toFixed(1) : 'New'}</span>
            {reviews > 0 && <span className="text-gray-400 font-normal text-xs">({reviews})</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{city}</span>
        </div>

        <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-100">
          <div>
            <span className="text-base font-bold text-gray-900">{formatPrice(pricePerDay)}</span>
            <span className="text-sm text-gray-400">/day</span>
          </div>
          {distanceKm != null && (
            <Badge variant={distanceVariant}>{distanceKm} km</Badge>
          )}
        </div>
      </div>
    </div>
  );
};
