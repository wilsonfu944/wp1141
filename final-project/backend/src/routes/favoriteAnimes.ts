import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// 獲取用戶喜歡的動畫列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const favoriteAnimes = await prisma.favoriteAnime.findMany({
      where: { userId },
      include: {
        anime: {
          include: {
            locations: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(favoriteAnimes.map((fa) => fa.anime));
  } catch (error) {
    console.error('Get favorite animes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加喜歡的動畫
router.post('/:animeId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user!.userId;

    const favoriteAnime = await prisma.favoriteAnime.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: {},
      create: {
        userId,
        animeId,
      },
      include: {
        anime: true,
      },
    });

    res.json(favoriteAnime.anime);
  } catch (error) {
    console.error('Add favorite anime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 移除喜歡的動畫
router.delete('/:animeId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user!.userId;

    await prisma.favoriteAnime.delete({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite anime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 檢查是否喜歡
router.get('/:animeId/check', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { animeId } = req.params;
    const userId = req.user!.userId;

    const favoriteAnime = await prisma.favoriteAnime.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });

    res.json({ isFavorited: !!favoriteAnime });
  } catch (error) {
    console.error('Check favorite anime error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

