import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography } from '@mui/material';
import type { Place } from '../../types';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503
};

const defaultZoom = 12;

interface GoogleMapProps {
  places?: Place[];
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  onMapClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (place: Place) => void;
  markers?: google.maps.LatLngLiteral[];
  selectedPlace?: Place | null;
}

const Map = ({
  places = [],
  center,
  zoom,
  onMapClick,
  onMarkerClick,
  markers,
  selectedPlace
}: GoogleMapProps) => {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState(center || defaultCenter);
  const [mapZoom, setMapZoom] = useState(zoom || defaultZoom);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true
    }),
    []
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded');
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
  }, []);

  const handleMarkerClick = (place: Place) => {
    setSelectedMarker(place.id);
    if (onMarkerClick) {
      onMarkerClick(place);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e);
    }
  };

  const displayCenter = center || mapCenter;
  const displayZoom = zoom || mapZoom;

  return (
    <Box sx={{ width: '100%', height: '600px' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={displayCenter}
        zoom={displayZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* User saved places */}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={{ lat: place.latitude, lng: place.longitude }}
            onClick={() => handleMarkerClick(place)}
            label={place.name}
          >
            {selectedMarker === place.id && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {place.name}
                  </Typography>
                  <Typography variant="caption">{place.address}</Typography>
                </Box>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Custom markers */}
        {markers?.map((marker, index) => (
          <Marker key={`custom-${index}`} position={marker} />
        ))}
      </GoogleMap>
    </Box>
  );
};

export default Map;

