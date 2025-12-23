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

      const originalPost = await db.collection('posts').findOne({
        _id: new ObjectId(postId as string),
      });

      if (!originalPost) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // 檢查是否已經轉發
      const existingRepost = await db.collection('posts').findOne({
        repostOf: originalPost._id,
        authorId: currentUser._id,
      });

      if (existingRepost) {
        // 取消轉發
        await db.collection('posts').deleteOne({ _id: existingRepost._id });

        const repostsCount = await db.collection('posts').countDocuments({
          repostOf: originalPost._id,
        });

        // 觸發 Pusher 事件
        try {
          const { pusherServer } = await import('@/lib/pusher');
          if (pusherServer) {
            pusherServer.trigger('posts', 'update-repost', {
              postId: originalPost._id.toString(),
              repostsCount,
              isReposted: false,
            });
          }
        } catch (pusherError) {
          console.error('Pusher error:', pusherError);
        }

        return res.status(200).json({ isReposted: false, repostsCount });
      } else {
        // 轉發
        const repost = {
          authorId: currentUser._id,
          content: '',
          repostOf: originalPost._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await db.collection('posts').insertOne(repost);

        const repostsCount = await db.collection('posts').countDocuments({
          repostOf: originalPost._id,
        });

        // 觸發 Pusher 事件
        try {
          const { pusherServer } = await import('@/lib/pusher');
          if (pusherServer) {
            pusherServer.trigger('posts', 'update-repost', {
              postId: originalPost._id.toString(),
              repostsCount,
              isReposted: true,
            });

            pusherServer.trigger('posts', 'new-post', {
              postId: result.insertedId.toString(),
              author: {
                name: currentUser.name,
                userID: currentUser.userID,
                image: currentUser.image,
              },
              repostOf: originalPost._id.toString(),
              createdAt: repost.createdAt,
            });
          }
        } catch (pusherError) {
          console.error('Pusher error:', pusherError);
        }

        return res.status(201).json({ isReposted: true, repostsCount });
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

