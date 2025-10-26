import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { Add } from '@mui/icons-material';
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import type { Trip, TripDay, Place } from '../../types';

interface CalendarViewProps {
  trip: Trip;
  onAddPlace: (date: Date) => void;
  onRemovePlace: (dayId: number) => void;
  onDayClick: (date: Date) => void;
  onEditPlace?: (day: TripDay) => void;
}

const CalendarView = ({ trip, onAddPlace, onRemovePlace, onDayClick }: CalendarViewProps) => {
  const tripStartDate = new Date(trip.startDate);
  const tripEndDate = new Date(trip.endDate);
  const allDays = eachDayOfInterval({ start: tripStartDate, end: tripEndDate });

  const weekStartDate = startOfWeek(tripStartDate, { locale: zhTW });
  const weekEndDate = endOfWeek(tripEndDate, { locale: zhTW });
  const calendarStart = startOfWeek(tripStartDate, { locale: zhTW });
  const calendarEnd = endOfWeek(tripEndDate, { locale: zhTW });

  // 生成行事曆格子
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isInTrip = (date: Date) => {
    return date >= tripStartDate && date <= tripEndDate;
  };

  const getPlacesForDate = (date: Date) => {
    return trip.days?.filter((day) => isSameDay(new Date(day.date), date)) || [];
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📅 行事曆
      </Typography>

      {/* 星期標題 */}
      <Box display="flex" sx={{ mb: 1 }}>
        {weekDays.map((day) => (
          <Box
            key={day}
            sx={{
              flex: '1 0 14.28%',
              textAlign: 'center',
              fontWeight: 'bold',
              py: 1,
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* 行事曆格子 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {calendarDays.map((date) => {
          const places = getPlacesForDate(date);
          const isInRange = isInTrip(date);
          const isToday = isSameDay(date, new Date());

          return (
            <Paper
              key={date.toISOString()}
              elevation={isInRange ? 2 : 0}
              sx={{
                minHeight: '120px',
                p: 1,
                backgroundColor: isInRange ? 'white' : 'rgba(0,0,0,0.02)',
                border: isToday ? '2px solid #1976d2' : '1px solid #ddd',
                position: 'relative',
                cursor: places.length > 0 ? 'pointer' : 'default',
                '&:hover': places.length > 0 ? {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)'
                } : {}
              }}
              onClick={() => places.length > 0 && isInRange && onDayClick(date)}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday ? 'bold' : 'normal',
                  color: isInRange ? 'text.primary' : 'text.disabled'
                }}
              >
                {format(date, 'd')}
              </Typography>

                  {isInRange && (
                    <Box sx={{ mt: 1 }}>
                      {places.length === 0 ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                          fullWidth
                          onClick={() => onAddPlace(date)}
                          sx={{ mt: 1 }}
                        >
                          新增景點
                        </Button>
                      ) : (
                        <Box>
                          {places.map((day) => (
                            <Chip
                              key={day.id}
                              label={day.startTime && day.endTime 
                                ? `${day.place.name} (${day.startTime}-${day.endTime})` 
                                : day.place.name}
                              size="small"
                              sx={{ mb: 0.5, display: 'block', cursor: 'pointer' }}
                              onClick={() => onDayClick(date)}
                              onDelete={(e) => {
                                e.stopPropagation();
                                onRemovePlace(day.id);
                              }}
                            />
                          ))}
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Add />}
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddPlace(date);
                            }}
                            sx={{ mt: 1 }}
                          >
                            新增
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default CalendarView;

