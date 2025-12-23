import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userID } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db();

      const user = await db.collection('users').findOne({
        userID: userID as string,
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // 獲取統計資訊
      const postCount = await db.collection('posts').countDocuments({
        authorId: user._id,
      });

      const followingCount = await db.collection('follows').countDocuments({
        followerId: user._id,
      });

      const followersCount = await db.collection('follows').countDocuments({
        followingId: user._id,
      });

      // 檢查當前用戶是否關注此用戶
      const session = await getServerSession(req, res, authOptions);
      let isFollowing = false;
      if (session?.user) {
        const currentUser = await db.collection('users').findOne({
          email: session.user.email,
        });
        if (currentUser) {
          const follow = await db.collection('follows').findOne({
            followerId: currentUser._id,
            followingId: user._id,
          });
          isFollowing = !!follow;
        }
      }

      return res.status(200).json({
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
          userID: user.userID,
          bio: user.bio || '',
          coverImage: user.coverImage || '',
          createdAt: user.createdAt,
        },
        stats: {
          posts: postCount,
          following: followingCount,
          followers: followersCount,
        },
        isFollowing,
        isOwnProfile: session?.user?.email === user.email,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const client = await clientPromise;
      const db = client.db();

      const currentUser = await db.collection('users').findOne({
        email: session.user.email,
      });

      if (!currentUser || currentUser.userID !== userID) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { name, bio, coverImage } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (coverImage !== undefined) updateData.coverImage = coverImage;

      await db.collection('users').updateOne(
        { _id: currentUser._id },
        { $set: updateData }
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

