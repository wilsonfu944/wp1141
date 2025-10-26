import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { Delete, Edit, Launch } from '@mui/icons-material';
import { format } from 'date-fns';
import type { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const TripCard = ({ trip, onEdit, onDelete, onView }: TripCardProps) => {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {trip.name}
            </Typography>
            <Box display="flex" gap={2} mb={1}>
              <Typography variant="body2" color="text.secondary">
                📅 {format(startDate, 'yyyy/MM/dd')} - {format(endDate, 'yyyy/MM/dd')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⏱️ {days} 天
              </Typography>
            </Box>
            {trip.description && (
              <Typography variant="body2" color="text.secondary">
                {trip.description}
              </Typography>
            )}
            {trip.days && trip.days.length > 0 && (
              <Chip label={`${trip.days.length} 個景點`} size="small" sx={{ mt: 1 }} />
            )}
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onView(trip.id)}>
              <Launch />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(trip)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(trip.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TripCard;

