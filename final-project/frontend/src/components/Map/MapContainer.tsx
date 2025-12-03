import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationMarkers from './LocationMarkers';

interface MapContainerProps {
  locations: Array<{
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    animeId?: string;
  }>;
  onLocationClick: (locationId: string) => void;
  selectedAnimeId?: string;
}

const DEFAULT_CENTER: LatLngExpression = [35.6762, 139.6503]; // Tokyo
const DEFAULT_ZOOM = 13;

export default function MapContainer({ locations, onLocationClick, selectedAnimeId }: MapContainerProps) {
  return (
    <div className="w-full h-full relative z-0">
      <LeafletMap
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarkers
          locations={locations}
          onLocationClick={onLocationClick}
          selectedAnimeId={selectedAnimeId}
        />
      </LeafletMap>
    </div>
  );
}

