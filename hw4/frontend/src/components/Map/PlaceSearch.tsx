import { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { searchPlaces as searchPlacesAPI } from '../../services/places';
import type { GooglePlaceResult } from '../../types';

interface PlaceSearchProps {
  onPlaceSelect: (place: GooglePlaceResult) => void;
  onAddPlace?: (place: GooglePlaceResult) => void;
  onResultsChange?: (results: GooglePlaceResult[]) => void;
  currentCenter?: google.maps.LatLngLiteral;
  showAddButton?: boolean;
}

const PlaceSearch = ({ onPlaceSelect, onAddPlace, onResultsChange, currentCenter, showAddButton = false }: PlaceSearchProps) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<GooglePlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || ''
  });

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setError('');
    try {
      const data = await searchPlacesAPI(
        keyword,
        currentCenter?.lat,
        currentCenter?.lng,
        5000
      );
      setResults(data);
      // 通知父組件搜尋結果改變
      if (onResultsChange) {
        onResultsChange(data);
      }
      // 自動顯示第一個搜尋結果在地圖上
      if (data.length > 0) {
        onPlaceSelect(data[0]);
      }
    } catch (err: any) {
      setError('搜尋失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place: GooglePlaceResult) => {
    onPlaceSelect(place);
  };

  const handleAdd = (place: GooglePlaceResult) => {
    if (onAddPlace) {
      onAddPlace(place);
    }
  };

  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="搜尋景點（例如：東京鐵塔）"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={loading || !keyword.trim()}
        >
          搜尋
        </Button>
      </Box>

      {error && (
        <Typography color="error" variant="caption" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}

      {results.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            搜尋結果：
          </Typography>
          {results.map((place) => (
            <Box
              key={place.place_id}
              sx={{
                p: 1,
                mb: 1,
                border: '1px solid #ddd',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
              onClick={() => handleSelect(place)}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box flex={1} onClick={() => handleSelect(place)}>
                  <Typography variant="body2" fontWeight="bold">
                    {place.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {place.formatted_address}
                  </Typography>
                </Box>
                {onAddPlace && showAddButton && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(place);
                    }}
                  >
                    加入收藏
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default PlaceSearch;

