import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Anime from '@/models/Anime';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json([], { status: 200 });
    }

    await connectDB();

    // 獲取用戶，不使用 populate（避免問題）
    const user = await User.findById(userId).lean();

    if (!user || !user.favoriteAnime || !Array.isArray(user.favoriteAnime)) {
      return NextResponse.json([], { status: 200 });
    }

    // 手動查詢動漫數據
    const favoriteIds = user.favoriteAnime
      .map((id: any) => {
        if (id instanceof mongoose.Types.ObjectId) {
          return id;
        }
        if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        if (id && typeof id === 'object' && id._id) {
          const objId = id._id;
          if (objId instanceof mongoose.Types.ObjectId) {
            return objId;
          }
          if (typeof objId === 'string' && mongoose.Types.ObjectId.isValid(objId)) {
            return new mongoose.Types.ObjectId(objId);
          }
        }
        return null;
      })
      .filter((id): id is mongoose.Types.ObjectId => id !== null);

    if (favoriteIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 查詢動漫
    const favorites = await Anime.find({
      _id: { $in: favoriteIds }
    }).lean();

    return NextResponse.json(favorites || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching favorite anime:', error);
    // 返回空數組而不是錯誤，避免前端崩潰
    return NextResponse.json([], { status: 200 });
  }
}
