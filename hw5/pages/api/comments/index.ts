import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'POST') {
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { postId, content, parentId } = req.body;

      if (!postId || !content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'PostId and content are required' });
      }

      const client = await clientPromise;
      const db = client.db();

      const author = await db.collection('users').findOne({
        email: session.user.email,
      });

      if (!author) {
        return res.status(404).json({ error: 'User not found' });
      }

      const post = await db.collection('posts').findOne({
        _id: new ObjectId(postId),
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = {
        postId: new ObjectId(postId),
        authorId: author._id,
        content: content.trim(),
        parentId: parentId ? new ObjectId(parentId) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('comments').insertOne(comment);

      // 獲取完整的 comment 資訊
      const commentWithAuthor = {
        ...comment,
        _id: result.insertedId,
        author: {
          name: author.name,
          userID: author.userID,
          image: author.image,
        },
      };

      // 觸發 Pusher 事件
      try {
        const { pusherServer } = await import('@/lib/pusher');
        if (pusherServer) {
          pusherServer.trigger('posts', 'new-comment', {
            postId: post._id.toString(),
            comment: commentWithAuthor,
          });
        }
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }

      return res.status(201).json({ comment: commentWithAuthor });
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

