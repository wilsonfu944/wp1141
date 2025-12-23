import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserRank, { RankLevel } from '@/models/UserRank';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// 獲取用戶排位信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let userRank = await UserRank.findOne({ userId: session.user.id });

    // 如果沒有排位記錄，創建一個
    if (!userRank) {
      userRank = new UserRank({
        userId: session.user.id,
        rank: 'bronze',
        points: 0,
        wins: 0,
        losses: 0,
      });
      await userRank.save();

      // 同步到User模型
      await User.findByIdAndUpdate(session.user.id, {
        rank: 'bronze',
        rankPoints: 0,
      });
    }

    return NextResponse.json({
      rank: userRank.rank,
      points: userRank.points,
      wins: userRank.wins,
      losses: userRank.losses,
    });
  } catch (error) {
    console.error('Error fetching rank:', error);
    return NextResponse.json({ error: 'Failed to fetch rank' }, { status: 500 });
  }
}

// 更新排位（通常由對戰結果API調用）
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { points, isWin } = await request.json();

    await connectDB();

    let userRank = await UserRank.findOne({ userId: session.user.id });

    if (!userRank) {
      userRank = new UserRank({
        userId: session.user.id,
        rank: 'bronze',
        points: 0,
        wins: 0,
        losses: 0,
      });
    }

    // 更新分數和勝負
    userRank.points = Math.max(0, userRank.points + points);
    if (isWin) {
      userRank.wins += 1;
    } else {
      userRank.losses += 1;
    }

    // 根據分數更新等級
    const newRank = calculateRank(userRank.points);
    userRank.rank = newRank;

    await userRank.save();

    // 同步到User模型
    await User.findByIdAndUpdate(session.user.id, {
      rank: newRank,
      rankPoints: userRank.points,
    });

    return NextResponse.json({
      rank: userRank.rank,
      points: userRank.points,
      wins: userRank.wins,
      losses: userRank.losses,
    });
  } catch (error) {
    console.error('Error updating rank:', error);
    return NextResponse.json({ error: 'Failed to update rank' }, { status: 500 });
  }
}

/**
 * 根據分數計算等級
 */
function calculateRank(points: number): RankLevel {
  if (points >= 5000) return 'master';
  if (points >= 3500) return 'diamond';
  if (points >= 2500) return 'platinum';
  if (points >= 1500) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
}

