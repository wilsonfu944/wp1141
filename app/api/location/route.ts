import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const search = searchParams.get('search') || '';

    await connectDB();

    let query = Location.find().populate('anime');

    if (ids) {
      const idArray = ids.split(',');
      query = Location.find({ _id: { $in: idArray } }).populate('anime');
    }

    let locations;
    
    // 添加搜索功能：根據動漫名字搜索
    if (search) {
      // 先找到匹配的動漫
      const Anime = (await import('@/models/Anime')).default;
      const matchingAnime = await Anime.find({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      
      const animeIds = matchingAnime.map((a: any) => a._id);
      
      // 搜索地點名稱、地址或相關動漫
      query = Location.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
          ...(animeIds.length > 0 ? [{ anime: { $in: animeIds } }] : []),
        ],
      }).populate('anime');
    } else {
      query = query.populate('anime');
    }

    locations = await query.exec();

    return NextResponse.json(locations || []);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

