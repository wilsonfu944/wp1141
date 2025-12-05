import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

const router = Router();

// 獲取好友列表
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    const friends = friendships.map((friendship) => {
      const friend = friendship.user1Id === userId ? friendship.user2 : friendship.user1;
      return friend;
    });

    res.json(friends);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 發送好友請求
router.post('/request/:receiverId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user!.userId;

    if (senderId === receiverId) {
      res.status(400).json({ error: 'Cannot send friend request to yourself' });
      return;
    }

    // 檢查是否已經是好友
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });

    if (existingFriendship) {
      res.status(400).json({ error: 'Already friends' });
      return;
    }

    // 檢查是否已有待處理的請求
    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      res.status(400).json({ error: 'Friend request already sent' });
      return;
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'pending',
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
      },
    });

    res.json(friendRequest);
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 獲取待處理的好友請求
router.get('/requests', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 接受/拒絕好友請求
router.put('/request/:requestId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const userId = req.user!.userId;

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest || friendRequest.receiverId !== userId) {
      res.status(404).json({ error: 'Friend request not found' });
      return;
    }

    if (action === 'accept') {
      // 創建好友關係
      await prisma.friendship.create({
        data: {
          user1Id: friendRequest.senderId,
          user2Id: friendRequest.receiverId,
        },
      });

      // 更新請求狀態
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });

      res.json({ success: true, message: 'Friend request accepted' });
    } else if (action === 'reject') {
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });

      res.json({ success: true, message: 'Friend request rejected' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Handle friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 推薦好友（基於共同喜歡的動畫）
router.get('/recommendations', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // 獲取當前用戶喜歡的動畫
    const userFavoriteAnimes = await prisma.favoriteAnime.findMany({
      where: { userId },
      select: { animeId: true },
    });

    const userAnimeIds = userFavoriteAnimes.map((fa) => fa.animeId);

    if (userAnimeIds.length === 0) {
      res.json([]);
      return;
    }

    // 獲取所有好友ID（排除已成為好友的用戶）
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId },
        ],
      },
    });

    const friendIds = new Set<string>();
    friendships.forEach((f) => {
      if (f.user1Id === userId) friendIds.add(f.user2Id);
      else friendIds.add(f.user1Id);
    });
    friendIds.add(userId); // 排除自己

    // 獲取待處理的請求中的用戶ID
    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId, status: 'pending' },
          { receiverId: userId, status: 'pending' },
        ],
      },
    });

    pendingRequests.forEach((req) => {
      if (req.senderId === userId) friendIds.add(req.receiverId);
      else friendIds.add(req.senderId);
    });

    // 查找有共同喜歡動畫的用戶
    const usersWithCommonAnimes = await prisma.favoriteAnime.groupBy({
      by: ['userId'],
      where: {
        animeId: { in: userAnimeIds },
        userId: { notIn: Array.from(friendIds) },
      },
      _count: {
        animeId: true,
      },
    });

    // 獲取用戶詳細信息並按共同動畫數量排序
    const recommendations = await Promise.all(
      usersWithCommonAnimes.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        });

        // 獲取共同喜歡的動畫
        const commonAnimes = await prisma.favoriteAnime.findMany({
          where: {
            userId: item.userId,
            animeId: { in: userAnimeIds },
          },
          include: {
            anime: {
              select: {
                id: true,
                name: true,
                coverImage: true,
              },
            },
          },
        });

        return {
          user,
          commonAnimeCount: item._count.animeId,
          commonAnimes: commonAnimes.map((ca) => ca.anime),
        };
      })
    );

    // 按共同動畫數量降序排序
    recommendations.sort((a, b) => b.commonAnimeCount - a.commonAnimeCount);

    res.json(recommendations);
  } catch (error) {
    console.error('Get friend recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;



