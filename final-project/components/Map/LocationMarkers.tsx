'use client';
import { useMemo, useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
// // Google Maps types are available globally

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  animeId?: string;
}

interface LocationMarkersProps {
  locations: Location[];
  onLocationClick: (locationId: string) => void;
  selectedAnimeId?: string;
}

// Custom anime-style icon
const createAnimeIcon = (isSelected: boolean = false): google.maps.Icon => {
  const svgString = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${isSelected ? '#f472b6' : '#ec4899'}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>
  `.trim();
  
  const encodedSvg = encodeURIComponent(svgString);
  
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodedSvg}`,
    scaledSize: new google.maps.Size(32, 32),
    anchor: new google.maps.Point(16, 32),
  };
};

export default function LocationMarkers({ locations, onLocationClick, selectedAnimeId }: LocationMarkersProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Filter selected locations
  const selectedLocations = useMemo(() => {
    return selectedAnimeId
      ? locations.filter((loc) => loc.animeId === selectedAnimeId)
      : locations;
  }, [locations, selectedAnimeId]);

  const handleMarkerClick = (locationId: string) => {
    setSelectedMarker(locationId);
    onLocationClick(locationId);
  };

  return (
    <>
      {selectedLocations.map((location) => {
        const isSelected = !!(selectedAnimeId && location.animeId === selectedAnimeId);
        return (
          <Marker
            key={location.id}
            position={{ lat: location.latitude, lng: location.longitude }}
            icon={createAnimeIcon(isSelected)}
            onClick={() => handleMarkerClick(location.id)}
          >
            {selectedMarker === location.id && (
              <InfoWindow
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{location.name}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </>
  );
}
