// 關鍵：必須在最頂部 import Location，即使不使用也要 import
// 這樣 Mongoose 才會在處理 Anime Schema 的 ref: 'Location' 時知道 Location 是什麼
import Location from '@/models/Location';
import Anime from '@/models/Anime';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '0');
    const sort = searchParams.get('sort') || 'createdAt';

    await connectDB();

    // 雙重保險：確保模型已註冊
    if (!mongoose.models.Location) {
      require('@/models/Location');
    }
    if (!mongoose.models.Anime) {
      require('@/models/Anime');
    }

    // 構建排序選項
    let sortOption: any = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'releaseDate') {
      sortOption = { releaseDate: -1 };
    }

    // 每次都創建全新的查詢對象，避免重用
    const animeList = await Anime.find({})
      .sort(sortOption)
      .limit(limit > 0 ? limit : 1000) // 如果沒有 limit，設一個大的上限
      .lean()
      .exec();

    if (!animeList || animeList.length === 0) {
      return NextResponse.json([]);
    }

    // 收集所有 location IDs
    const locationIdSet = new Set<string>();
    
    animeList.forEach((anime: any) => {
      if (anime.locations && Array.isArray(anime.locations)) {
        anime.locations.forEach((locId: any) => {
          try {
            let idStr: string;
            
            if (locId instanceof mongoose.Types.ObjectId) {
              idStr = locId.toString();
            } else if (typeof locId === 'string' && mongoose.Types.ObjectId.isValid(locId)) {
              idStr = locId;
            } else if (locId && typeof locId === 'object' && locId._id) {
              const id = locId._id;
              idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
            } else {
              return;
            }
            
            if (idStr && mongoose.Types.ObjectId.isValid(idStr)) {
              locationIdSet.add(idStr);
            }
          } catch (e) {
            // 跳過無效的 ID
          }
        });
      }
    });

    // 一次性查詢所有 locations
    let locationsMap = new Map<string, any>();
    if (locationIdSet.size > 0) {
      try {
        // 再次確保 Location 模型已註冊（三重保險）
        if (!mongoose.models.Location) {
          require('@/models/Location');
        }
        
        const locationIds = Array.from(locationIdSet).map(id => new mongoose.Types.ObjectId(id));
        // 每次都創建全新的查詢對象
        const locations = await Location.find({
          _id: { $in: locationIds }
        }).lean().exec();
        
        locations.forEach((loc: any) => {
          locationsMap.set(loc._id.toString(), loc);
        });
      } catch (err) {
        console.warn('Failed to fetch locations:', err);
      }
    }

    // 為每個動漫填充 locations
    const result = animeList.map((anime: any) => {
      const populatedLocations: any[] = [];
      
      if (anime.locations && Array.isArray(anime.locations)) {
        anime.locations.forEach((locId: any) => {
          try {
            let idStr: string;
            
            if (locId instanceof mongoose.Types.ObjectId) {
              idStr = locId.toString();
            } else if (typeof locId === 'string') {
              idStr = locId;
            } else if (locId && typeof locId === 'object' && locId._id) {
              const id = locId._id;
              idStr = id instanceof mongoose.Types.ObjectId ? id.toString() : String(id);
            } else {
              return;
            }
            
            const location = locationsMap.get(idStr);
            if (location) {
              populatedLocations.push(location);
            }
          } catch (e) {
            // 跳過無效的 ID
          }
        });
      }

      return {
        ...anime,
        _id: String(anime._id), // 確保 _id 是字符串
        locations: populatedLocations,
      };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching anime list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch anime list',
        message: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}
