import { Router } from 'express';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// 動漫評分
router.post('/anime/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating } = ratingSchema.parse(req.body);
    const userId = req.user!.userId;

    // 使用 upsert 來創建或更新評分
    const animeRating = await prisma.animeRating.upsert({
      where: {
        animeId_userId: {
          animeId: id,
          userId,
        },
      },
      update: {
        rating,
      },
      create: {
        animeId: id,
        userId,
        rating,
      },
    });

    res.json(animeRating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid rating', details: error.errors });
      return;
    }
    console.error('Rate anime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 獲取動漫評分（包括平均分和用戶評分）
router.get('/anime/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;

    const ratings = await prisma.animeRating.findMany({
      where: { animeId: id },
      select: { rating: true },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    let userRating = null;
    if (userId) {
      const userRatingRecord = await prisma.animeRating.findUnique({
        where: {
          animeId_userId: {
            animeId: id,
            userId,
          },
        },
      });
      userRating = userRatingRecord?.rating || null;
    }

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // 保留一位小數
      totalRatings: ratings.length,
      userRating,
    });
  } catch (error) {
    console.error('Get anime rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 地點評分
router.post('/location/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating } = ratingSchema.parse(req.body);
    const userId = req.user!.userId;

    const locationRating = await prisma.locationRating.upsert({
      where: {
        locationId_userId: {
          locationId: id,
          userId,
        },
      },
      update: {
        rating,
      },
      create: {
        locationId: id,
        userId,
        rating,
      },
    });

    res.json(locationRating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid rating', details: error.errors });
      return;
    }
    console.error('Rate location error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 獲取地點評分（包括平均分和用戶評分）
router.get('/location/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId || null;

    const ratings = await prisma.locationRating.findMany({
      where: { locationId: id },
      select: { rating: true },
    });

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    let userRating = null;
    if (userId) {
      const userRatingRecord = await prisma.locationRating.findUnique({
        where: {
          locationId_userId: {
            locationId: id,
            userId,
          },
        },
      });
      userRating = userRatingRecord?.rating || null;
    }

    res.json({
      averageRating: Math.round(averageRating * 10) / 10, // 保留一位小數
      totalRatings: ratings.length,
      userRating,
    });
  } catch (error) {
    console.error('Get location rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

