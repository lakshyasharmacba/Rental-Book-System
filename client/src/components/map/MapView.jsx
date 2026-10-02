import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

// Component to handle map movement events
const MapEvents = ({ onBoundsChange }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        center: map.getCenter()
      });
    };
    
    map.on('moveend', handleMoveEnd);
    return () => map.off('moveend', handleMoveEnd);
  }, [map, onBoundsChange]);
  
  return null;
};

export const MapView = ({ items, center = [20.5937, 78.9629], zoom = 5, onBoundsChange }) => {
  const navigate = useNavigate();

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      className="w-full h-full z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {onBoundsChange && <MapEvents onBoundsChange={onBoundsChange} />}

      {items?.map((item) => (
        item.lat && item.lng && (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]}
          >
            <Popup className="custom-popup">
              <div 
                className="flex flex-col gap-2 cursor-pointer w-48"
                onClick={() => navigate(`/items/${item.id}`)}
              >
                <div className="aspect-[4/3] w-full bg-gray-200 rounded overflow-hidden">
                  {item.defaultImage && (
                    <img src={item.defaultImage} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="font-semibold text-sm line-clamp-1">{item.title}</div>
                <div className="font-bold text-primary">{formatPrice(item.pricePerDay)}/day</div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};
