import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import Location from '@/models/Location'; // 雖然我們不用 populate，但引入這個是好習慣
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // 1. 先抓動漫本體
    // 這裡我們不用 .populate('locations')，避免報錯
    const animeRaw = await Anime.findById(id).lean().exec();

    if (!animeRaw) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    const anime = animeRaw as any; // 用 any 繞過 TS 檢查方便處理

    // 2. 手動去抓關聯的地點資料
    let locationData: any[] = [];
    
    // 檢查 anime.locations 是否存在且有內容
    if (anime.locations && Array.isArray(anime.locations) && anime.locations.length > 0) {
      // 確保 ID 格式正確
      const locationIds = anime.locations
        .filter((locId: any) => {
          const idStr = locId instanceof mongoose.Types.ObjectId 
            ? locId.toString() 
            : String(locId);
          return mongoose.Types.ObjectId.isValid(idStr);
        })
        .map((locId: any) => {
          const idStr = locId instanceof mongoose.Types.ObjectId 
            ? locId.toString() 
            : String(locId);
          return new mongoose.Types.ObjectId(idStr);
        });

      if (locationIds.length > 0) {
        // 去 Location 表裡面把這些 ID 的資料抓出來
        const locationQuery = Location.find({
          _id: { $in: locationIds }
        });
        locationData = await locationQuery.lean().exec();
      }
    }

    // 3. 組裝資料 (回傳給前端)
    const result = {
      _id: String(anime._id),
      title: String(anime.title || ''),
      titleJP: anime.titleJP ? String(anime.titleJP) : undefined,
      description: String(anime.description || ''),
      coverImage: String(anime.coverImage || ''),
      rating: typeof anime.rating === 'number' ? anime.rating : 0,
      releaseDate: anime.releaseDate 
        ? (anime.releaseDate instanceof Date 
          ? anime.releaseDate.toISOString() 
          : new Date(anime.releaseDate).toISOString())
        : new Date().toISOString(),
      genres: Array.isArray(anime.genres) ? anime.genres.map(String) : [],
      studio: anime.studio ? String(anime.studio) : undefined,
      episodes: anime.episodes ? Number(anime.episodes) : undefined,
      status: String(anime.status || 'completed'),
      // 把剛剛手動抓到的地點資料放進去
      locations: locationData.map((loc: any) => ({
        _id: String(loc._id),
        name: String(loc.name || ''),
        nameJP: loc.nameJP ? String(loc.nameJP) : undefined,
        description: String(loc.description || ''),
        address: String(loc.address || ''),
        latitude: typeof loc.latitude === 'number' ? loc.latitude : (Number(loc.latitude) || 0),
        longitude: typeof loc.longitude === 'number' ? loc.longitude : (Number(loc.longitude) || 0),
        images: Array.isArray(loc.images) ? loc.images.map((img: any) => String(img)) : [],
      })),
      createdAt: anime.createdAt 
        ? (anime.createdAt instanceof Date 
          ? anime.createdAt.toISOString() 
          : new Date(anime.createdAt).toISOString())
        : new Date().toISOString(),
      updatedAt: anime.updatedAt 
        ? (anime.updatedAt instanceof Date 
          ? anime.updatedAt.toISOString() 
          : new Date(anime.updatedAt).toISOString())
        : new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error fetching anime details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime details', message: error?.message },
      { status: 500 }
    );
  }
}
