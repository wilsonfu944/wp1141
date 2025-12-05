import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { pusherServer } from '@/lib/pusher';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (!pusherServer) {
      return res.status(500).json({ error: 'Pusher server not configured' });
    }

    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;

    const auth = pusherServer.authorizeChannel(socketId, channel);
    return res.send(auth);
  } catch (error) {
    console.error('Error authenticating Pusher:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

