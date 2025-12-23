import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db();

      const currentUser = await db.collection('users').findOne({
        email: session.user.email,
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = await db.collection('posts').findOne({
        _id: new ObjectId(postId as string),
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 檢查是否已經按讚
      const existingLike = await db.collection('likes').findOne({
        postId: post._id,
        userId: currentUser._id,
      });

      if (existingLike) {
        // 取消按讚
        await db.collection('likes').deleteOne({ _id: existingLike._id });

        const likesCount = await db.collection('likes').countDocuments({
          postId: post._id,
        });

        // 觸發 Pusher 事件
        try {
          const { pusherServer } = await import('@/lib/pusher');
          if (pusherServer) {
            pusherServer.trigger('posts', 'update-like', {
              postId: post._id.toString(),
              likesCount,
              isLiked: false,
            });
          }
        } catch (pusherError) {
          console.error('Pusher error:', pusherError);
        }

        return res.status(200).json({ isLiked: false, likesCount });
      } else {
        // 按讚
        await db.collection('likes').insertOne({
          postId: post._id,
          userId: currentUser._id,
          createdAt: new Date(),
        });

        const likesCount = await db.collection('likes').countDocuments({
          postId: post._id,
        });

        // 觸發 Pusher 事件
        try {
          const { pusherServer } = await import('@/lib/pusher');
          if (pusherServer) {
            pusherServer.trigger('posts', 'update-like', {
              postId: post._id.toString(),
              likesCount,
              isLiked: true,
            });
          }
        } catch (pusherError) {
          console.error('Pusher error:', pusherError);
        }

        return res.status(200).json({ isLiked: true, likesCount });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

