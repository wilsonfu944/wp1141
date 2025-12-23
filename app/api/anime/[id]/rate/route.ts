import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import UserRating from '@/models/UserRating';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    const anime = await Anime.findById(params.id);

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    // 檢查用戶是否已經評分過
    const existingRating = await UserRating.findOne({
      user: session.user.id,
      anime: params.id,
    });

    if (existingRating) {
      // 更新現有評分
      existingRating.rating = rating;
      await existingRating.save();
    } else {
      // 創建新評分
      await UserRating.create({
        user: session.user.id,
        anime: params.id,
        rating,
      });
    }

    // 計算平均評分
    const allRatings = await UserRating.find({ anime: params.id });
    const averageRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    // 更新動漫的平均評分
    anime.rating = Math.round(averageRating * 10) / 10; // 保留一位小數
    await anime.save();

    return NextResponse.json({
      rating: anime.rating,
      userRating: rating,
      totalRatings: allRatings.length,
    });
  } catch (error) {
    console.error('Error rating anime:', error);
    return NextResponse.json(
      { error: 'Failed to rate anime' },
      { status: 500 }
    );
  }
}

// 獲取用戶的評分
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const userRating = await UserRating.findOne({
      user: session.user.id,
      anime: params.id,
    });

    const anime = await Anime.findById(params.id);

    return NextResponse.json({
      userRating: userRating?.rating || null,
      averageRating: anime?.rating || 0,
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}

