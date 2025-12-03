import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { optimizeRoute } from '../utils/routeOptimizer';
import { z } from 'zod';

const router = Router();

const createItinerarySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().optional(),
  transport: z.enum(['walking', 'public', 'driving']),
  isPublic: z.boolean(),
  locations: z.array(
    z.object({
      locationId: z.string(),
      duration: z.number().int().min(5).max(480).optional(),
      notes: z.string().optional(),
    })
  ),
});

// 優化路線
router.post('/optimize', async (req, res) => {
  try {
    const { locationIds, transport } = req.body;

    if (!Array.isArray(locationIds) || locationIds.length < 2) {
      res.status(400).json({ error: 'At least 2 locations required' });
      return;
    }

    // 取得地點資料
    const locations = await prisma.location.findMany({
      where: {
        id: { in: locationIds },
      },
      select: {
        id: true,
        latitude: true,
        longitude: true,
      },
    });

    // 優化路線
    const result = optimizeRoute(
      locations.map((l) => ({ ...l, duration: 30 })),
      transport || 'public'
    );

    res.json(result);
  } catch (error) {
    console.error('Optimize route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 建立行程
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createItinerarySchema.parse(req.body);
    const userId = req.user!.userId;

    const itinerary = await prisma.itinerary.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        transport: data.transport,
        isPublic: data.isPublic,
        items: {
          create: data.locations.map((loc, index) => ({
            locationId: loc.locationId,
            order: index,
            duration: loc.duration || 30,
            notes: loc.notes,
          })),
        },
      },
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

    res.status(201).json(itinerary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得行程詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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
        likes: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    // 增加瀏覽次數
    await prisma.itinerary.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json({
      ...itinerary,
      likeCount: itinerary.likes.length,
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得使用者的所有行程
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const itineraries = await prisma.itinerary.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            location: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(
      itineraries.map((itinerary) => ({
        ...itinerary,
        likeCount: itinerary.likes.length,
      }))
    );
  } catch (error) {
    console.error('Get user itineraries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得所有公開行程
router.get('/public/all', async (req, res) => {
  try {
    const { sort = 'latest' } = req.query;

    const itineraries = await prisma.itinerary.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
        likes: true,
      },
      orderBy:
        sort === 'popular'
          ? {
              likes: {
                _count: 'desc',
              },
            }
          : {
              createdAt: 'desc',
            },
    });

    res.json(
      itineraries.map((itinerary) => ({
        ...itinerary,
        likeCount: itinerary.likes.length,
      }))
    );
  } catch (error) {
    console.error('Get public itineraries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 點讚行程
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existing = await prisma.itineraryLike.findUnique({
      where: {
        itineraryId_userId: {
          itineraryId: id,
          userId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Already liked' });
      return;
    }

    await prisma.itineraryLike.create({
      data: {
        itineraryId: id,
        userId,
      },
    });

    res.json({ message: 'Liked' });
  } catch (error) {
    console.error('Like itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取消點讚
router.delete('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.itineraryLike.deleteMany({
      where: {
        itineraryId: id,
        userId,
      },
    });

    res.json({ message: 'Unliked' });
  } catch (error) {
    console.error('Unlike itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 新增行程評論
router.post('/:id/comments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    const comment = await prisma.itineraryComment.create({
      data: {
        itineraryId: id,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create itinerary comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 複製行程
router.post('/:id/copy', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const original = await prisma.itinerary.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!original) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    const copied = await prisma.itinerary.create({
      data: {
        userId,
        name: `${original.name} (副本)`,
        description: original.description,
        transport: original.transport,
        isPublic: false,
        items: {
          create: original.items.map((item) => ({
            locationId: item.locationId,
            order: item.order,
            duration: item.duration,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: {
          include: {
            location: {
              include: {
                anime: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(copied);
  } catch (error) {
    console.error('Copy itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 刪除行程
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id },
    });

    if (!itinerary) {
      res.status(404).json({ error: 'Itinerary not found' });
      return;
    }

    if (itinerary.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.itinerary.delete({
      where: { id },
    });

    res.json({ message: 'Itinerary deleted' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


