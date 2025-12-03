import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';
import type { Trip } from '../../types';

interface TripDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Trip>) => void;
  trip?: Trip | null;
  loading?: boolean;
}

const TripDialog = ({ open, onClose, onSubmit, trip, loading = false }: TripDialogProps) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (trip) {
      setName(trip.name);
      setStartDate(trip.startDate.split('T')[0]);
      setEndDate(trip.endDate.split('T')[0]);
      setDescription(trip.description || '');
    } else {
      resetForm();
    }
  }, [trip, open]);

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setDescription('');
  };

  const handleSubmit = () => {
    const data: Partial<Trip> = {
      name,
      startDate: `${startDate}T00:00:00`,
      endDate: `${endDate}T00:00:00`,
      description: description || undefined
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{trip ? '編輯行程' : '新增行程'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="行程名稱"
            margin="normal"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              label="開始日期"
              margin="normal"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="結束日期"
              margin="normal"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            fullWidth
            label="描述"
            margin="normal"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !name || !startDate || !endDate}>
          {loading ? '處理中...' : trip ? '更新' : '新增'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TripDialog;

