import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { matchQueue } from '@/lib/match-queue';
import GameRoom from '@/models/GameRoom';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // 檢查用戶是否已經在房間中
    const existingRoom = await GameRoom.findOne({
      $or: [{ player1: session.user.id }, { player2: session.user.id }],
      status: { $in: ['matching', 'playing'] },
    });

    if (existingRoom) {
      return NextResponse.json({
        roomId: existingRoom.roomId,
        isAI: existingRoom.isAI,
        status: existingRoom.status,
      });
    }

    // 嘗試配對
    const match = matchQueue.tryMatch();

    if (match) {
      // 找到對手，創建房間
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = new GameRoom({
        roomId,
        player1: match.player1.userId,
        player2: match.player2.userId,
        isAI: false,
        status: 'matching',
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
        isAI: false,
        status: 'matched',
        opponentId: match.player2.userId,
      });
    } else {
      // 沒有對手，加入隊列
      // 注意：這裡需要socketId，但API路由無法直接獲取
      // 實際配對邏輯應該在WebSocket服務器中處理
      return NextResponse.json({
        status: 'queued',
        message: '已加入配對隊列，10秒後如無對手將匹配AI',
      });
    }
  } catch (error) {
    console.error('Error in match request:', error);
    return NextResponse.json({ error: 'Failed to process match request' }, { status: 500 });
  }
}

