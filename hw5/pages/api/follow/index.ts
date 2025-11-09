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

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { followingId } = req.body;

      if (!followingId) {
        return res.status(400).json({ error: 'followingId is required' });
      }

      const client = await clientPromise;
      const db = client.db();

      const currentUser = await db.collection('users').findOne({
        email: session.user.email,
      });

      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const followingUser = await db.collection('users').findOne({
        _id: new ObjectId(followingId),
      });

      if (!followingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (currentUser._id.toString() === followingId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // 檢查是否已經關注
      const existingFollow = await db.collection('follows').findOne({
        followerId: currentUser._id,
        followingId: new ObjectId(followingId),
      });

      if (existingFollow) {
        // 取消關注
        await db.collection('follows').deleteOne({ _id: existingFollow._id });

        const followingCount = await db.collection('follows').countDocuments({
          followerId: currentUser._id,
        });

        const followersCount = await db.collection('follows').countDocuments({
          followingId: new ObjectId(followingId),
        });

        return res.status(200).json({
          isFollowing: false,
          followingCount,
          followersCount,
        });
      } else {
        // 關注
        await db.collection('follows').insertOne({
          followerId: currentUser._id,
          followingId: new ObjectId(followingId),
          createdAt: new Date(),
        });

        const followingCount = await db.collection('follows').countDocuments({
          followerId: currentUser._id,
        });

        const followersCount = await db.collection('follows').countDocuments({
          followingId: new ObjectId(followingId),
        });

        return res.status(201).json({
          isFollowing: true,
          followingCount,
          followersCount,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

