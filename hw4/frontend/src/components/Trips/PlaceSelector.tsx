import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import type { Place } from '../../types';

interface PlaceSelectorProps {
  open: boolean;
  onClose: () => void;
  places: Place[];
  onSelect: (place: Place) => void;
  selectedDate: Date | null;
}

const PlaceSelector = ({ open, onClose, places, onSelect, selectedDate }: PlaceSelectorProps) => {
  const handleSelect = (place: Place) => {
    onSelect(place);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        選擇景點 {selectedDate && `- ${selectedDate.toLocaleDateString('zh-TW')}`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
          {places.length === 0 ? (
            <Typography color="text.secondary" align="center">
              還沒有收藏任何景點
            </Typography>
          ) : (
            places.map((place) => (
              <Box
                key={place.id}
                onClick={() => handleSelect(place)}
                sx={{
                  p: 2,
                  mb: 1,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {place.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {place.address}
                </Typography>
                {place.category && (
                  <Typography variant="caption" color="text.secondary">
                    {place.category}
                  </Typography>
                )}
              </Box>
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaceSelector;

