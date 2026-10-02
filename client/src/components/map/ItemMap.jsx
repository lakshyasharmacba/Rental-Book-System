import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const ItemMap = ({ lat, lng, location, radius = 600 }) => {
  // Server stores as GeoJSON: { type: 'Point', coordinates: [lng, lat] }
  // Support both direct lat/lng props and location object
  let mapLat = lat;
  let mapLng = lng;

  if (!mapLat && location?.coordinates?.length === 2) {
    mapLng = location.coordinates[0];
    mapLat = location.coordinates[1];
  }

  // Slight offset to protect exact address (~500m)
  const offsetLat = mapLat ? mapLat + (Math.random() - 0.5) * 0.008 : null;
  const offsetLng = mapLng ? mapLng + (Math.random() - 0.5) * 0.008 : null;

  if (!offsetLat || !offsetLng) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
        <span className="text-3xl">📍</span>
        <p className="text-sm font-medium">Location shown after booking</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[offsetLat, offsetLng]}
      zoom={14}
      className="w-full h-full z-0 rounded-2xl"
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Circle
        center={[offsetLat, offsetLng]}
        radius={radius}
        pathOptions={{
          fillColor: '#0F766E',
          color: '#0F766E',
          weight: 2,
          fillOpacity: 0.15,
        }}
      />
    </MapContainer>
  );
};
