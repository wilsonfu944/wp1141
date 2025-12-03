import { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, Paper } from '@mui/material';
import { useLoadScript } from '@react-google-maps/api';
import PlacesList from '../components/Places/PlacesList';
import GoogleMap from '../components/Map/GoogleMap';
import PlaceSearch from '../components/Map/PlaceSearch';
import { getPlaces } from '../services/places';
import type { Place } from '../types';
import { GooglePlaceResult } from '../types';
import { createPlace } from '../services/places';

const PlacesPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral>({ lat: 35.6762, lng: 139.6503 });
  const [mapMarkers, setMapMarkers] = useState<google.maps.LatLngLiteral[]>([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || ''
  });

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const data = await getPlaces();
      setPlaces(data);
    } catch (err: any) {
      setError('載入景點失敗');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter({ lat: place.latitude, lng: place.longitude });
  };

  const handleSearchPlace = async (place: GooglePlaceResult) => {
    try {
      setError(''); // 清除錯誤
      const placeData = {
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        placeId: place.place_id
      };
      const newPlace = await createPlace(placeData);
      // 手動更新景點列表
      setPlaces(prev => [...prev, newPlace]);
      setError('');
    } catch (err: any) {
      setError('新增景點失敗：' + (err.response?.data?.message || err.message));
    }
  };

  if (!isLoaded) {
    return (
      <Container>
        <Typography>載入地圖中...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          我的景點
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <PlaceSearch
            onPlaceSelect={(place) => {
              // 搜尋結果被點擊時顯示在地圖上
              setMapCenter({
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              });
              setMapMarkers([{
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              }]);
            }}
            onAddPlace={(place) => {
              handleSearchPlace(place);
            }}
            onResultsChange={(results) => {
              // 搜尋結果改變時，清除之前的地圖標記
              if (results.length > 0) {
                setMapMarkers([]);
              }
            }}
            currentCenter={mapCenter}
            showAddButton={true}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
          <Box sx={{ flex: '1 1 40%' }}>
            <PlacesList 
              onPlaceSelect={handlePlaceSelect}
              refreshTrigger={places.length}
            />
          </Box>

          <Box sx={{ flex: '1 1 60%', position: 'sticky', top: 20, height: 'fit-content' }}>
            <GoogleMap
              places={places}
              selectedPlace={selectedPlace}
              center={mapCenter}
              markers={mapMarkers}
              onMarkerClick={(place) => {
                const found = places.find(p => p.id === place.id);
                if (found) {
                  handlePlaceSelect(found);
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PlacesPage;
