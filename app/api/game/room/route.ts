import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import GameRoom from '@/models/GameRoom';

export const dynamic = 'force-dynamic';

// 創建房間
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = new GameRoom({
      roomId,
      player1: session.user.id,
      player2: null,
      isAI: false,
      status: 'waiting',
      questions: [],
      currentQuestion: 0,
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      matchStartTime: new Date(),
    });

    await room.save();

    return NextResponse.json({
      roomId,
      status: 'created',
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}

// 獲取房間信息
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    await connectDB();

    const room = await GameRoom.findOne({
      roomId,
      $or: [{ player1: session.user.id }, { player2: session.user.id }],
    }).populate('player1', 'name image').populate('player2', 'name image');

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

