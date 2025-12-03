import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { LatLngExpression, Icon, Marker as LeafletMarker } from 'leaflet';
import L from 'leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Import and extend Leaflet with markercluster
import 'leaflet.markercluster';

// Extend Leaflet types
declare module 'leaflet' {
  namespace markerClusterGroup {
    function markerClusterGroup(options?: any): L.MarkerClusterGroup;
  }
}

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
const createAnimeIcon = (isSelected: boolean = false) => {
  const svgString = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${isSelected ? '#f472b6' : '#ec4899'}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="6" fill="white" opacity="0.9"/>
    </svg>
  `.trim();
  
  // Use encodeURIComponent instead of btoa to handle Unicode characters
  const encodedSvg = encodeURIComponent(svgString);
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodedSvg}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function FlyToLocation({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, 14, {
      duration: 1.5,
    });
  }, [map, center]);

  return null;
}

export default function LocationMarkers({ locations, onLocationClick, selectedAnimeId }: LocationMarkersProps) {
  const map = useMap();
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  // Calculate center for selected anime locations
  const selectedLocations = useMemo(() => {
    return selectedAnimeId
      ? locations.filter((loc) => loc.animeId === selectedAnimeId)
      : [];
  }, [locations, selectedAnimeId]);

  const centerLocation = useMemo(() => {
    if (selectedLocations.length === 0) return null;
    return {
      lat: selectedLocations.reduce((sum, loc) => sum + loc.latitude, 0) / selectedLocations.length,
      lng: selectedLocations.reduce((sum, loc) => sum + loc.longitude, 0) / selectedLocations.length,
    };
  }, [selectedLocations]);

  // Setup marker cluster group
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Remove existing markers
    if (markersRef.current) {
      map.removeLayer(markersRef.current);
      markersRef.current = null;
    }

    // Create marker cluster group
    // leaflet.markercluster extends L with markerClusterGroup
    const markers = (L as any).markerClusterGroup({
      chunkedLoading: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    }) as L.MarkerClusterGroup;

    locations.forEach((location) => {
      const isSelected = selectedAnimeId && location.animeId === selectedAnimeId;
      const marker = new LeafletMarker([location.latitude, location.longitude], {
        icon: createAnimeIcon(isSelected),
      });

      marker.on('click', () => {
        onLocationClick(location.id);
      });

      marker.bindPopup(`<div style="text-align: center;"><p style="font-weight: 600;">${location.name}</p></div>`);
      markers.addLayer(marker);
    });

    map.addLayer(markers);
    markersRef.current = markers;

    return () => {
      if (markersRef.current) {
        map.removeLayer(markersRef.current);
        markersRef.current = null;
      }
    };
  }, [map, locations, selectedAnimeId, onLocationClick]);

  return (
    <>
      {centerLocation && (
        <FlyToLocation center={[centerLocation.lat, centerLocation.lng]} />
      )}
    </>
  );
}
