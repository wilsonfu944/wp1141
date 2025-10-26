import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import PlaceCard from './PlaceCard';
import PlaceDialog from './PlaceDialog';
import { getPlaces, createPlace, updatePlace, deletePlace } from '../../services/places';
import type { Place } from '../../types';

interface PlacesListProps {
  onPlaceSelect?: (place: Place) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const PlacesList = ({ onPlaceSelect, onRefresh, refreshTrigger }: PlacesListProps) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    loadPlaces();
  }, [refreshTrigger]);

  const handleSubmit = async (data: Partial<Place>) => {
    try {
      setSubmitting(true);
      if (editingPlace) {
        await updatePlace(editingPlace.id, data);
      } else {
        await createPlace(data);
      }
      await loadPlaces();
      setDialogOpen(false);
      setEditingPlace(null);
    } catch (err: any) {
      setError('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個景點嗎？')) return;
    try {
      await deletePlace(id);
      await loadPlaces();
    } catch (err: any) {
      setError('刪除失敗');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          我的景點
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          新增景點
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>載入中...</Typography>
      ) : places.length === 0 ? (
        <Typography color="text.secondary">還沒有收藏任何景點</Typography>
      ) : (
        places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            onEdit={(place) => {
              setEditingPlace(place);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            onSelect={onPlaceSelect || (() => {})}
          />
        ))
      )}

      <PlaceDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingPlace(null);
        }}
        onSubmit={handleSubmit}
        place={editingPlace}
        loading={submitting}
      />
    </Container>
  );
};

export default PlacesList;

