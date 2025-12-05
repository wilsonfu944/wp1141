import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { userID } = req.body;

  if (!userID || typeof userID !== 'string' || userID.trim() === '') {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // 檢查 userID 是否已被使用
    const existingUser = await db.collection('users').findOne({
      userID: userID.trim(),
      email: { $ne: session.user.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: '此 userID 已被使用' });
    }

    // 更新用戶的 userID
    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          userID: userID.trim(),
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error setting userID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

