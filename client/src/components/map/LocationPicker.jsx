import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={position} /> : null;
};

export const LocationPicker = ({ value, onChange }) => {
  const [position, setPosition] = useState(value);

  useEffect(() => {
    if (position && onChange) {
      onChange(position);
    }
  }, [position, onChange]);

  return (
    <div className="w-full h-[300px] rounded-card overflow-hidden border border-border">
      <MapContainer 
        center={position || [20.5937, 78.9629]} 
        zoom={position ? 13 : 4} 
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <div className="bg-surface-alt p-2 text-sm text-center text-text-muted border-t border-border">
        Click on the map to pin the exact pickup location
      </div>
    </div>
  );
};
