import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import GameRoom from '@/models/GameRoom';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const room = await GameRoom.findOne({ roomId: params.roomId });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.player2) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    if (room.player1.toString() === session.user.id) {
      return NextResponse.json({ error: 'Cannot join your own room' }, { status: 400 });
    }

    room.player2 = session.user.id;
    room.status = 'matching';
    await room.save();

    return NextResponse.json({
      roomId: room.roomId,
      status: 'joined',
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}

