import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import GameRoom from '@/models/GameRoom';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, player1Score, player2Score } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
    }

    await connectDB();

    const room = await GameRoom.findOne({ roomId });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // 更新房間狀態和分數
    room.status = 'finished';
    room.player1Score = player1Score;
    room.player2Score = player2Score;
    await room.save();

    // 判斷勝負
    const isPlayer1 = room.player1.toString() === session.user.id;
    const isWin = isPlayer1 ? player1Score > player2Score : player2Score > player1Score;
    const isDraw = player1Score === player2Score;

    // 計算排位分數變化（AI對戰不影響排位，或影響較小）
    let pointsChange = 0;
    if (!room.isAI) {
      if (isWin) {
        pointsChange = 50; // 勝利+50分
      } else if (!isDraw) {
        pointsChange = -20; // 失敗-20分
      }
    } else {
      // AI對戰：勝利+10分，失敗不扣分
      if (isWin) {
        pointsChange = 10;
      }
    }

    // 更新排位（如果非AI對戰或AI對戰也影響排位）
    if (pointsChange !== 0) {
      const rankRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/rank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          points: pointsChange,
          isWin,
        }),
      });

      if (!rankRes.ok) {
        console.error('Failed to update rank');
      }
    }

    return NextResponse.json({
      isWin,
      isDraw,
      pointsChange,
      finalScore: {
        player1: player1Score,
        player2: player2Score,
      },
    });
  } catch (error) {
    console.error('Error submitting result:', error);
    return NextResponse.json({ error: 'Failed to submit result' }, { status: 500 });
  }
}

