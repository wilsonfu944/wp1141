import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import Anime from '@/models/Anime';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    await connectDB();

    // 確保模型已註冊
    if (!mongoose.models.Location) {
      require('@/models/Location');
    }
    if (!mongoose.models.Anime) {
      require('@/models/Anime');
    }

    // 不使用 populate，手動查詢
    let locations: any[] = [];
    
    if (ids) {
      const idArray = ids.split(',');
      const locationIds = idArray
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      
      const locationQuery = Location.find({
        _id: { $in: locationIds }
      });
      locations = await locationQuery.lean().exec();
    } else {
      const locationQuery = Location.find({});
      locations = await locationQuery.lean().exec();
    }

    // 手動查詢關聯的動漫
    const animeIds = new Set<string>();
    locations.forEach((loc: any) => {
      if (loc.anime) {
        const animeId = loc.anime instanceof mongoose.Types.ObjectId 
          ? loc.anime.toString() 
          : String(loc.anime);
        if (mongoose.Types.ObjectId.isValid(animeId)) {
          animeIds.add(animeId);
        }
      }
    });

    let animeMap = new Map<string, any>();
    if (animeIds.size > 0) {
      const animeQuery = Anime.find({
        _id: { $in: Array.from(animeIds).map(id => new mongoose.Types.ObjectId(id)) }
      });
      const animeList = await animeQuery.lean().exec();
      animeList.forEach((anime: any) => {
        animeMap.set(anime._id.toString(), anime);
      });
    }

    // 組裝結果
    const result = locations.map((loc: any) => {
      const locationObj: any = {
        _id: String(loc._id),
        name: String(loc.name || ''),
        nameJP: loc.nameJP ? String(loc.nameJP) : undefined,
        description: String(loc.description || ''),
        address: String(loc.address || ''),
        latitude: typeof loc.latitude === 'number' ? loc.latitude : (Number(loc.latitude) || 0),
        longitude: typeof loc.longitude === 'number' ? loc.longitude : (Number(loc.longitude) || 0),
        images: Array.isArray(loc.images) ? loc.images.map((img: any) => String(img)) : [],
        rating: typeof loc.rating === 'number' ? loc.rating : 0,
      };

      // 手動添加動漫數據
      if (loc.anime) {
        const animeId = loc.anime instanceof mongoose.Types.ObjectId 
          ? loc.anime.toString() 
          : String(loc.anime);
        const anime = animeMap.get(animeId);
        if (anime) {
          locationObj.anime = {
            _id: String(anime._id),
            title: String(anime.title || ''),
            coverImage: String(anime.coverImage || ''),
          };
        }
      }

      return locationObj;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations', message: error?.message },
      { status: 500 }
    );
  }
}
