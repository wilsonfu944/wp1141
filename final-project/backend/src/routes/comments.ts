import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { verifyToken } from '../utils/jwt';
import { z } from 'zod';

const router = Router();

const createCommentSchema = z.object({
  locationId: z.string(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).optional(),
  parentId: z.string().optional(),
});

// 取得地點的所有評論
router.get('/location/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { sort = 'latest' } = req.query;

    let comments = await prisma.comment.findMany({
      where: {
        locationId,
        parentId: null, // 只取得頂層評論
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            likes: true,
            photos: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: true,
        photos: true,
      },
      orderBy:
        sort === 'rating'
          ? {
              rating: 'desc',
            }
          : {
              createdAt: 'desc',
            },
    });

    // 計算每個評論的點讚數並排序
    let commentsWithLikeCount = comments.map((comment) => ({
      ...comment,
      likeCount: comment.likes.length,
      isLiked: false, // 未登入時為 false
    }));

    // 如果是按熱門排序，需要手動排序
    if (sort === 'popular') {
      commentsWithLikeCount = commentsWithLikeCount.sort((a, b) => b.likeCount - a.likeCount);
    }

    // 如果使用者已登入，檢查是否已點讚
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      try {
        const payload = verifyToken(token);
        const userId = payload.userId;

        const userLikedCommentIds = await prisma.commentLike.findMany({
          where: {
            userId,
            commentId: {
              in: commentsWithLikeCount.map((c) => c.id),
            },
          },
          select: {
            commentId: true,
          },
        });

        const likedIds = new Set(userLikedCommentIds.map((l) => l.commentId));
        commentsWithLikeCount = commentsWithLikeCount.map((comment) => ({
          ...comment,
          isLiked: likedIds.has(comment.id),
        }));
      } catch (error) {
        // Token 無效，忽略
      }
    }

    res.json(commentsWithLikeCount);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 發表評論
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createCommentSchema.parse(req.body);
    const userId = req.user!.userId;

    const comment = await prisma.comment.create({
      data: {
        locationId: data.locationId,
        userId,
        content: data.content,
        rating: data.rating,
        parentId: data.parentId,
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
        likes: true,
        photos: true,
      },
    });

    res.status(201).json({
      ...comment,
      likeCount: 0,
      isLiked: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 編輯評論
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content, rating } = req.body;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content,
        rating,
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
        likes: true,
        photos: true,
      },
    });

    res.json({
      ...updated,
      likeCount: updated.likes.length,
      isLiked: false,
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 刪除評論
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 點讚評論
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId,
        },
      },
    });

    if (existingLike) {
      res.status(400).json({ error: 'Already liked' });
      return;
    }

    await prisma.commentLike.create({
      data: {
        commentId: id,
        userId,
      },
    });

    res.json({ message: 'Liked' });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取消點讚
router.delete('/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    await prisma.commentLike.deleteMany({
      where: {
        commentId: id,
        userId,
      },
    });

    res.json({ message: 'Unliked' });
  } catch (error) {
    console.error('Unlike comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

