import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.string().optional(),
});

const createReplySchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

// 取得所有留言（支援分類篩選）
router.get('/posts', async (req, res) => {
  try {
    const { category, sort = 'latest' } = req.query;

    const where: any = {};
    if (category) {
      where.category = category;
    }

    const orderBy: any =
      sort === 'popular'
        ? { likeCount: 'desc' }
        : sort === 'views'
        ? { viewCount: 'desc' }
        : { createdAt: 'desc' };

    const posts = await prisma.forumPost.findMany({
      where,
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
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy,
    });

    res.json(posts);
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得單一留言詳情
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 增加瀏覽次數
    await prisma.forumPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const post = await prisma.forumPost.findUnique({
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
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            parent: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 建立新留言
router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    const userId = req.user!.userId;

    const post = await prisma.forumPost.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        category: data.category,
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

    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 回覆留言
router.post('/posts/:postId/replies', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { postId } = req.params;
    const data = createReplySchema.parse(req.body);
    const userId = req.user!.userId;

    const reply = await prisma.forumReply.create({
      data: {
        postId,
        userId,
        content: data.content,
        parentId: data.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(reply);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create forum reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 點讚留言
router.post('/posts/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.forumPost.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });

    res.json({ message: 'Liked' });
  } catch (error) {
    console.error('Like forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

