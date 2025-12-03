import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// 取得使用者的所有收藏
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.user!.userId,
      },
      include: {
        location: {
          include: {
            anime: {
              select: {
                id: true,
                name: true,
                nameEn: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 新增收藏
router.post('/:locationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user!.userId;

    // 檢查地點是否存在
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      res.status(404).json({ error: 'Location not found' });
      return;
    }

    // 檢查是否已收藏
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (existingFavorite) {
      res.status(400).json({ error: 'Location already favorited' });
      return;
    }

    // 建立收藏
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        locationId,
      },
      include: {
        location: {
          include: {
            anime: {
              select: {
                id: true,
                name: true,
                nameEn: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.error('Create favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 移除收藏
router.delete('/:locationId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user!.userId;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (!favorite) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 檢查是否已收藏
router.get('/:locationId/check', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { locationId } = req.params;
    const userId = req.user!.userId;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


