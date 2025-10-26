import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import { Delete, Edit, LocationOn } from '@mui/icons-material';
import type { Place } from '../../types';

interface PlaceCardProps {
  place: Place;
  onEdit: (place: Place) => void;
  onDelete: (id: number) => void;
  onSelect: (place: Place) => void;
}

const PlaceCard = ({ place, onEdit, onDelete, onSelect }: PlaceCardProps) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {place.name}
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {place.address}
              </Typography>
            </Box>
            {place.category && (
              <Chip label={place.category} size="small" sx={{ mb: 1 }} />
            )}
            {place.notes && (
              <Typography variant="body2" color="text.secondary">
                {place.notes}
              </Typography>
            )}
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onSelect(place)}>
              <LocationOn />
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(place)}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(place.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;

