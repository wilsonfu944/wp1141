// 關鍵：必須在最頂部 import Anime，因為 User Schema 有 ref: 'Anime'
import Anime from '@/models/Anime';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // 確保模型已註冊
    if (!mongoose.models.User) {
      require('@/models/User');
    }
    if (!mongoose.models.Anime) {
      require('@/models/Anime');
    }

    // 不使用 populate，手動查詢
    const userQuery = User.findById(session.user.id);
    const user = await userQuery.lean().exec();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 手動查詢 favoriteAnime
    let favoriteAnime: any[] = [];
    if (user.favoriteAnime && Array.isArray(user.favoriteAnime) && user.favoriteAnime.length > 0) {
      try {
        const animeIds = user.favoriteAnime
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

        if (animeIds.length > 0) {
          const animeQuery = Anime.find({
            _id: { $in: animeIds }
          }).select('title coverImage');
          favoriteAnime = await animeQuery.lean().exec();
        }
      } catch (err) {
        console.warn('Failed to fetch favorite anime:', err);
        favoriteAnime = [];
      }
    }

    // 組裝返回數據
    const result: any = {
      _id: String(user._id),
      name: String(user.name || ''),
      email: String(user.email || ''),
      image: user.image ? String(user.image) : undefined,
      favoriteAnime: favoriteAnime.map((anime: any) => ({
        _id: String(anime._id),
        title: String(anime.title || ''),
        coverImage: String(anime.coverImage || ''),
      })),
      createdAt: user.createdAt 
        ? (user.createdAt instanceof Date 
          ? user.createdAt.toISOString() 
          : String(user.createdAt))
        : new Date().toISOString(),
      updatedAt: user.updatedAt 
        ? (user.updatedAt instanceof Date 
          ? user.updatedAt.toISOString() 
          : String(user.updatedAt))
        : new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, favoriteAnime } = body;

    await connectDB();

    // 確保模型已註冊
    if (!mongoose.models.User) {
      require('@/models/User');
    }
    if (!mongoose.models.Anime) {
      require('@/models/Anime');
    }

    // 構建更新對象
    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = String(name);
    }
    if (favoriteAnime !== undefined && Array.isArray(favoriteAnime)) {
      updateData.favoriteAnime = favoriteAnime
        .map((id: any) => {
          if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
            return new mongoose.Types.ObjectId(id);
          }
          return null;
        })
        .filter((id): id is mongoose.Types.ObjectId => id !== null);
    }

    // 更新用戶
    const userQuery = User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );
    const user = await userQuery.lean().exec();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 手動查詢 favoriteAnime
    let favoriteAnimeData: any[] = [];
    if (user.favoriteAnime && Array.isArray(user.favoriteAnime) && user.favoriteAnime.length > 0) {
      try {
        const animeIds = user.favoriteAnime
          .map((id: any) => {
            if (id instanceof mongoose.Types.ObjectId) {
              return id;
            }
            if (typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)) {
              return new mongoose.Types.ObjectId(id);
            }
            return null;
          })
          .filter((id): id is mongoose.Types.ObjectId => id !== null);

        if (animeIds.length > 0) {
          const animeQuery = Anime.find({
            _id: { $in: animeIds }
          }).select('title coverImage');
          favoriteAnimeData = await animeQuery.lean().exec();
        }
      } catch (err) {
        console.warn('Failed to fetch favorite anime:', err);
        favoriteAnimeData = [];
      }
    }

    // 組裝返回數據
    const result: any = {
      _id: String(user._id),
      name: String(user.name || ''),
      email: String(user.email || ''),
      image: user.image ? String(user.image) : undefined,
      favoriteAnime: favoriteAnimeData.map((anime: any) => ({
        _id: String(anime._id),
        title: String(anime.title || ''),
        coverImage: String(anime.coverImage || ''),
      })),
      createdAt: user.createdAt 
        ? (user.createdAt instanceof Date 
          ? user.createdAt.toISOString() 
          : String(user.createdAt))
        : new Date().toISOString(),
      updatedAt: user.updatedAt 
        ? (user.updatedAt instanceof Date 
          ? user.updatedAt.toISOString() 
          : String(user.updatedAt))
        : new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
