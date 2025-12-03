import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { isSameDay } from 'date-fns';
import { useLoadScript } from '@react-google-maps/api';
import GoogleMap from '../Map/GoogleMap';
import CalendarView from './CalendarView';
import DayScheduleDialog from './DayScheduleDialog';
import PlaceSelector from './PlaceSelector';
import { getTrip, addPlaceToTrip, removePlaceFromTrip, updateTripDay, type AddPlaceToTripData } from '../../services/trips';
import { getPlaces } from '../../services/places';
import type { Trip, Place, TripDay } from '../../types';

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'map'>('calendar');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || ''
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripData, placesData] = await Promise.all([
        getTrip(parseInt(id!)),
        getPlaces()
      ]);
      setTrip(tripData);
      setPlaces(placesData);
      
      if (tripData.startDate) {
        setSelectedDate(new Date(tripData.startDate));
      }
    } catch (err: any) {
      setError('載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlaceToDate = async (place: Place, date: Date) => {
    if (!trip) return;

    const existingDay = trip.days?.find(
      (day) =>
        day.placeId === place.id &&
        isSameDay(new Date(day.date), date)
    );

    if (existingDay) {
      setError('該景點已在當天行程中');
      return;
    }

    try {
      const order = trip.days?.filter((day) =>
        isSameDay(new Date(day.date), date)
      ).length || 0;
      
      await addPlaceToTrip(trip.id, {
        placeId: place.id,
        date: date.toISOString(),
        order,
        notes: ''
      });
      await loadData();
      setError('');
    } catch (err: any) {
      console.error('Error adding place to trip:', err);
      setError('新增失敗：' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveFromTrip = async (dayId: number) => {
    if (!trip || !confirm('確定要從行程中移除這個景點嗎？')) return;

    try {
      await removePlaceFromTrip(trip.id, dayId);
      await loadData();
    } catch (err: any) {
      setError('移除失敗');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>載入中...</Typography>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container>
        <Typography>找不到行程</Typography>
      </Container>
    );
  }


  const getMapCenter = () => {
    if (trip.days && trip.days.length > 0) {
      const firstPlace = trip.days[0];
      return {
        lat: firstPlace.place.latitude,
        lng: firstPlace.place.longitude
      };
    }
    return { lat: 35.6762, lng: 139.6503 };
  };

  const markerPositions = trip.days?.map((day) => ({
    lat: day.place.latitude,
    lng: day.place.longitude
  })) || [];

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">{trip.name}</Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/trips')}>
            返回
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" gap={2} mb={3}>
          <Button
            variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('calendar')}
          >
            行事曆
          </Button>
          <Button
            variant={viewMode === 'map' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('map')}
          >
            地圖
          </Button>
        </Box>

        {viewMode === 'calendar' ? (
          <CalendarView
            trip={trip}
            onAddPlace={(date) => {
              setSelectedDate(date);
              setSelectorOpen(true);
            }}
            onRemovePlace={(dayId) => handleRemoveFromTrip(dayId)}
            onDayClick={(date) => {
              setSelectedDayDate(date);
              setScheduleDialogOpen(true);
            }}
          />
        ) : (
          <Box>
            {isLoaded && (
              <GoogleMap
                places={trip.days?.map((day) => day.place) || []}
                markers={markerPositions}
                center={getMapCenter()}
              />
            )}
          </Box>
        )}

        <PlaceSelector
          open={selectorOpen}
          onClose={() => {
            setSelectorOpen(false);
            setSelectedDate(null);
          }}
          places={places}
          onSelect={selectedDate ? (place) => handleAddPlaceToDate(place, selectedDate) : () => {}}
          selectedDate={selectedDate}
        />

        <DayScheduleDialog
          open={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false);
            setSelectedDayDate(null);
          }}
          date={selectedDayDate || new Date()}
          tripDays={trip.days || []}
          onAddPlace={(date) => {
            setScheduleDialogOpen(false);
            setSelectedDate(date);
            setSelectorOpen(true);
          }}
          onRemovePlace={(dayId) => handleRemoveFromTrip(dayId)}
          onUpdateTime={async (dayId, startTime, endTime) => {
            try {
              await updateTripDay(trip!.id, dayId, {
                startTime,
                endTime: endTime || undefined
              });
              await loadData();
            } catch (err: any) {
              setError('更新時間失敗');
            }
          }}
        />
      </Box>
    </Container>
  );
};

export default TripDetail;

