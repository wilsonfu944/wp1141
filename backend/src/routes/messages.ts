import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

const createMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1).max(2000),
  itineraryId: z.string().optional(),
});

// 取得使用者的所有對話列表
router.get('/conversations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // 取得所有與使用者相關的訊息
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        itinerary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 組織成對話列表（每個對話對象一個）
    const conversationsMap = new Map<string, any>();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
          itinerary: message.itinerary,
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      if (!conversation.lastMessage || message.createdAt > conversation.lastMessage.createdAt) {
        conversation.lastMessage = message;
      }
      if (message.receiverId === userId && !message.isRead) {
        conversation.unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得與特定使用者的對話
router.get('/conversations/:userId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const currentUserId = req.user!.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        itinerary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 標記為已讀
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 發送私訊
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const data = createMessageSchema.parse(req.body);
    const senderId = req.user!.userId;

    if (senderId === data.receiverId) {
      res.status(400).json({ error: 'Cannot send message to yourself' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        content: data.content,
        itineraryId: data.itineraryId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        itinerary: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 標記訊息為已讀
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    if (message.receiverId !== userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 取得未讀訊息數量
router.get('/unread/count', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



