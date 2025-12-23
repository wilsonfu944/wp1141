import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import UserPhoto from '@/models/UserPhoto';
import Anime from '@/models/Anime';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Location ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // 確保所有模型已註冊
    if (!mongoose.models.Location) {
      require('@/models/Location');
    }
    if (!mongoose.models.Anime) {
      require('@/models/Anime');
    }
    if (!mongoose.models.UserPhoto) {
      require('@/models/UserPhoto');
    }
    if (!mongoose.models.User) {
      require('@/models/User');
    }

    // 不使用 populate，手動查詢
    const locationQuery = Location.findById(id);
    const location = await locationQuery.lean().exec();

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // 手動查詢關聯的動漫
    let anime: any = null;
    if (location.anime) {
      try {
        const animeId = location.anime instanceof mongoose.Types.ObjectId 
          ? location.anime 
          : new mongoose.Types.ObjectId(String(location.anime));
        const animeQuery = Anime.findById(animeId);
        anime = await animeQuery.lean().exec();
      } catch (err) {
        console.warn('Failed to fetch anime for location:', err);
      }
    }

    // 手動查詢用戶照片
    let userPhotos: any[] = [];
    try {
      const photoQuery = UserPhoto.find({ location: id });
      const photos = await photoQuery.lean().exec();
      
      // 手動查詢作者信息
      const authorIds = new Set<string>();
      photos.forEach((photo: any) => {
        if (photo.author) {
          const authorId = photo.author instanceof mongoose.Types.ObjectId 
            ? photo.author.toString() 
            : String(photo.author);
          if (mongoose.Types.ObjectId.isValid(authorId)) {
            authorIds.add(authorId);
          }
        }
      });

      let authorMap = new Map<string, any>();
      if (authorIds.size > 0) {
        const userQuery = User.find({
          _id: { $in: Array.from(authorIds).map(id => new mongoose.Types.ObjectId(id)) }
        }).select('name image');
        const users = await userQuery.lean().exec();
        users.forEach((user: any) => {
          authorMap.set(user._id.toString(), {
            _id: String(user._id),
            name: String(user.name || ''),
            image: user.image ? String(user.image) : undefined,
          });
        });
      }

      // 組裝用戶照片數據
      userPhotos = photos.map((photo: any) => {
        const photoObj: any = {
          _id: String(photo._id),
          image: String(photo.image || ''),
          description: photo.description ? String(photo.description) : undefined,
          createdAt: photo.createdAt 
            ? (photo.createdAt instanceof Date 
              ? photo.createdAt.toISOString() 
              : String(photo.createdAt))
            : new Date().toISOString(),
        };

        // 手動添加作者信息
        if (photo.author) {
          const authorId = photo.author instanceof mongoose.Types.ObjectId 
            ? photo.author.toString() 
            : String(photo.author);
          const author = authorMap.get(authorId);
          if (author) {
            photoObj.author = author;
          }
        }

        return photoObj;
      });
    } catch (photoError: any) {
      console.warn('Failed to fetch user photos:', photoError?.message || photoError);
      userPhotos = [];
    }

    // 組裝返回數據
    const result: any = {
      _id: String(location._id),
      name: String(location.name || ''),
      nameJP: location.nameJP ? String(location.nameJP) : undefined,
      description: String(location.description || ''),
      address: String(location.address || ''),
      latitude: typeof location.latitude === 'number' ? location.latitude : (Number(location.latitude) || 0),
      longitude: typeof location.longitude === 'number' ? location.longitude : (Number(location.longitude) || 0),
      images: Array.isArray(location.images) ? location.images.map((img: any) => String(img)) : [],
      rating: typeof location.rating === 'number' ? location.rating : 0,
      userPhotos: userPhotos,
    };

    // 手動添加動漫數據
    if (anime) {
      result.anime = {
        _id: String(anime._id),
        title: String(anime.title || ''),
        coverImage: String(anime.coverImage || ''),
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch location',
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
