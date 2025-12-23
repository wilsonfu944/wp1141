import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box
} from '@mui/material';
import type { Place } from '../../types';

interface PlaceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Place>) => void;
  place?: Place | null;
  loading?: boolean;
}

const PlaceDialog = ({ open, onClose, onSubmit, place, loading = false }: PlaceDialogProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (place) {
      setName(place.name);
      setAddress(place.address);
      setLatitude(place.latitude.toString());
      setLongitude(place.longitude.toString());
      setCategory(place.category || '');
      setNotes(place.notes || '');
    } else {
      resetForm();
    }
  }, [place, open]);

  const resetForm = () => {
    setName('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setCategory('');
    setNotes('');
  };

  const handleSubmit = () => {
    const data: Partial<Place> = {
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      category: category || undefined,
      notes: notes || undefined
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{place ? '編輯景點' : '新增景點'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="景點名稱"
            margin="normal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            fullWidth
            label="地址"
            margin="normal"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="緯度"
              margin="normal"
              type="number"
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <TextField
              fullWidth
              label="經度"
              margin="normal"
              type="number"
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </Box>
          <TextField
            fullWidth
            label="類別"
            margin="normal"
            select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">無</MenuItem>
            <MenuItem value="景點">景點</MenuItem>
            <MenuItem value="餐廳">餐廳</MenuItem>
            <MenuItem value="住宿">住宿</MenuItem>
            <MenuItem value="購物">購物</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="備註"
            margin="normal"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !name || !address}>
          {loading ? '處理中...' : place ? '更新' : '新增'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaceDialog;

