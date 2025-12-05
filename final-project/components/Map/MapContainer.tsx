'use client';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
// Google Maps types are available globally
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

const DEFAULT_CENTER = { lat: 35.6762, lng: 139.6503 }; // Tokyo
const DEFAULT_ZOOM = 13;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export default function MapContainer({ locations, onLocationClick, selectedAnimeId }: MapContainerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Use useLoadScript hook instead of LoadScript component for better remount handling
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    id: 'google-map-script',
  });

  // Calculate center for selected anime locations
  const mapCenter = useMemo(() => {
    if (selectedAnimeId) {
      const selectedLocations = locations.filter((loc) => loc.animeId === selectedAnimeId);
      if (selectedLocations.length > 0) {
        return {
          lat: selectedLocations.reduce((sum, loc) => sum + loc.latitude, 0) / selectedLocations.length,
          lng: selectedLocations.reduce((sum, loc) => sum + loc.longitude, 0) / selectedLocations.length,
        };
      }
    }
    return DEFAULT_CENTER;
  }, [locations, selectedAnimeId]);

  // Fly to center when selected anime changes
  useEffect(() => {
    if (map && selectedAnimeId) {
      const selectedLocations = locations.filter((loc) => loc.animeId === selectedAnimeId);
      if (selectedLocations.length > 0) {
        const center = {
          lat: selectedLocations.reduce((sum, loc) => sum + loc.latitude, 0) / selectedLocations.length,
          lng: selectedLocations.reduce((sum, loc) => sum + loc.longitude, 0) / selectedLocations.length,
        };
        setTimeout(() => {
          if (map) {
            map.panTo(center);
            map.setZoom(14);
          }
        }, 100);
      }
    }
  }, [map, selectedAnimeId, locations]);

  // Handle map load
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    // Trigger resize to ensure map renders correctly
    setTimeout(() => {
      if (mapInstance) {
        google.maps.event.trigger(mapInstance, 'resize');
      }
    }, 100);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        setMap(null);
      }
    };
  }, [map]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <p className="text-slate-400">請設定 Google Maps API Key</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <p className="text-slate-400">載入地圖時發生錯誤</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <p className="text-slate-400">載入地圖中...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        <LocationMarkers
          locations={locations}
          onLocationClick={onLocationClick}
          selectedAnimeId={selectedAnimeId}
        />
      </GoogleMap>
    </div>
  );
}
