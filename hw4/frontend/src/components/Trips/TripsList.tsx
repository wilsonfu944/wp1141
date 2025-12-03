import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Alert } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import TripCard from './TripCard';
import TripDialog from './TripDialog';
import { getTrips, createTrip, updateTrip, deleteTrip } from '../../services/trips';
import type { Trip } from '../../types';

const TripsList = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await getTrips();
      setTrips(data);
    } catch (err: any) {
      setError('載入行程失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleSubmit = async (data: Partial<Trip>) => {
    try {
      setSubmitting(true);
      if (editingTrip) {
        await updateTrip(editingTrip.id, data);
      } else {
        await createTrip(data);
      }
      await loadTrips();
      setDialogOpen(false);
      setEditingTrip(null);
    } catch (err: any) {
      setError('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這個行程嗎？')) return;
    try {
      await deleteTrip(id);
      await loadTrips();
    } catch (err: any) {
      setError('刪除失敗');
    }
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          我的行程
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          新增行程
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>載入中...</Typography>
      ) : trips.length === 0 ? (
        <Typography color="text.secondary">還沒有建立任何行程</Typography>
      ) : (
        trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onEdit={(trip) => {
              setEditingTrip(trip);
              setDialogOpen(true);
            }}
            onDelete={handleDelete}
            onView={(id) => navigate(`/trips/${id}`)}
          />
        ))
      )}

      <TripDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTrip(null);
        }}
        onSubmit={handleSubmit}
        trip={editingTrip}
        loading={submitting}
      />
    </Container>
  );
};

export default TripsList;

