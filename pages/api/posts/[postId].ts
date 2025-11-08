import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'DELETE') {
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

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

      // 檢查是否為自己的文章，且不是轉發
      if (
        post.authorId.toString() !== currentUser._id.toString() ||
        post.repostOf
      ) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // 刪除相關的 likes 和 comments
      await db.collection('likes').deleteMany({
        postId: post._id,
      });

      await db.collection('comments').deleteMany({
        postId: post._id,
      });

      // 刪除文章
      await db.collection('posts').deleteOne({ _id: post._id });

      // 觸發 Pusher 事件
      try {
        const { pusherServer } = await import('@/lib/pusher');
        if (pusherServer) {
          pusherServer.trigger('posts', 'delete-post', {
            postId: post._id.toString(),
          });
        }
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

