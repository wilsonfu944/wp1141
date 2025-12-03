import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// 匯出 iCal（Google Calendar 格式）
router.get('/itineraries/:id/ical', async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            location: {
              include: {
                anime: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    // 生成 iCal 格式
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AniMap//Itinerary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${itinerary.name}`,
      'X-WR-TIMEZONE:Asia/Taipei',
    ];

    itinerary.items.forEach((item, index) => {
      const startDate = itinerary.startDate ? new Date(itinerary.startDate) : new Date();
      // 這裡應該計算實際到達時間，暫時簡化
      const start = new Date(startDate.getTime() + index * 60 * 60 * 1000); // 每個地點間隔1小時
      const end = new Date(start.getTime() + (item.duration || 30) * 60 * 1000);

      const startStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endStr = end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${item.id}@animap`,
        `DTSTAMP:${now}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${item.location.name} - ${item.location.anime.name}`,
        `DESCRIPTION:${item.location.description || ''}`,
        `LOCATION:${item.location.address}`,
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${itinerary.name}.ics"`);
    res.send(icalContent.join('\r\n'));
  } catch (error) {
    console.error('Export iCal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


