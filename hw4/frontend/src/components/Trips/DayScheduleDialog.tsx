import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Chip
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { TripDay, Place } from '../../types';

interface DayScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  date: Date;
  tripDays: TripDay[];
  onAddPlace: (date: Date) => void;
  onRemovePlace: (dayId: number) => void;
  onUpdateTime: (dayId: number, startTime?: string, endTime?: string) => void;
}

const DayScheduleDialog = ({
  open,
  onClose,
  date,
  tripDays,
  onAddPlace,
  onRemovePlace,
  onUpdateTime
}: DayScheduleDialogProps) => {
  const dayPlaces = tripDays.filter((day) => {
    const dayDate = new Date(day.date);
    return dayDate.toDateString() === date.toDateString();
  });

  const [editingDayId, setEditingDayId] = useState<number | null>(null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {format(date, 'yyyy年MM月dd日 EEEE', { locale: zhTW })}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {dayPlaces.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              這天還沒有安排行程
            </Typography>
          ) : (
            dayPlaces.map((day) => (
              <Box
                key={day.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Box flex={1}>
                    <Typography variant="h6">{day.place.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {day.place.address}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => onRemovePlace(day.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {editingDayId === day.id ? (
                  <Box display="flex" gap={2} alignItems="center">
                    <TextField
                      size="small"
                      label="開始時間"
                      type="time"
                      value={day.startTime || ''}
                      onChange={(e) => onUpdateTime(day.id, e.target.value, day.endTime)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Typography>〜</Typography>
                    <TextField
                      size="small"
                      label="結束時間"
                      type="time"
                      value={day.endTime || ''}
                      onChange={(e) => onUpdateTime(day.id, day.startTime, e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditingDayId(null)}
                    >
                      完成
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={
                        day.startTime && day.endTime
                          ? `${day.startTime} - ${day.endTime}`
                          : '點擊設定時間'
                      }
                      variant={day.startTime && day.endTime ? 'filled' : 'outlined'}
                      color="primary"
                      onClick={() => setEditingDayId(day.id)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                )}

                {day.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    備註：{day.notes}
                  </Typography>
                )}
              </Box>
            ))
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              onAddPlace(date);
              onClose();
            }}
            sx={{ mt: 2 }}
          >
            ➕ 新增景點
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>關閉</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DayScheduleDialog;

