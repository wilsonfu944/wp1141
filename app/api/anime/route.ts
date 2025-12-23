import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import Location from '@/models/Location'; // 需要导入以确保模型注册

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 在函数作用域声明变量，确保在 catch 块中可用
  let limit = 0;
  let sort = 'createdAt';
  let search = '';
  let yearMin: number | null = null;
  let yearMax: number | null = null;
  let ratingMin: number | null = null;
  let ratingMax: number | null = null;
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:9',message:'GET request started',data:{url:request.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const { searchParams } = new URL(request.url);
    limit = parseInt(searchParams.get('limit') || '0');
    sort = searchParams.get('sort') || 'createdAt';
    search = searchParams.get('search') || '';
    
    // 年份范围
    const yearMinParam = searchParams.get('yearMin');
    const yearMaxParam = searchParams.get('yearMax');
    if (yearMinParam) yearMin = parseInt(yearMinParam);
    if (yearMaxParam) yearMax = parseInt(yearMaxParam);
    
    // 评分范围
    const ratingMinParam = searchParams.get('ratingMin');
    const ratingMaxParam = searchParams.get('ratingMax');
    if (ratingMinParam) ratingMin = parseFloat(ratingMinParam);
    if (ratingMaxParam) ratingMax = parseFloat(ratingMaxParam);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:16',message:'Before connectDB',data:{limit,sort,search},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    await connectDB();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:20',message:'After connectDB',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // 构建查询条件
    const queryConditions: any = {};

    // 添加搜索功能
    if (search) {
      queryConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genres: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // 添加年份范围筛选
    if (yearMin !== null || yearMax !== null) {
      queryConditions.releaseDate = {};
      if (yearMin !== null) {
        queryConditions.releaseDate.$gte = new Date(`${yearMin}-01-01`);
      }
      if (yearMax !== null) {
        queryConditions.releaseDate.$lte = new Date(`${yearMax}-12-31`);
      }
    }

    // 添加评分范围筛选
    if (ratingMin !== null || ratingMax !== null) {
      queryConditions.rating = {};
      if (ratingMin !== null) {
        queryConditions.rating.$gte = ratingMin;
      }
      if (ratingMax !== null) {
        queryConditions.rating.$lte = ratingMax;
      }
    }

    let query = Object.keys(queryConditions).length > 0 
      ? Anime.find(queryConditions)
      : Anime.find();

    // 排序 - 处理 null 值
    if (sort === 'rating') {
      // 对于 rating，null 值排在最后
      query = query.sort({ rating: -1, createdAt: -1 });
    } else if (sort === 'releaseDate') {
      // 对于 releaseDate，null 值排在最后
      query = query.sort({ releaseDate: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:50',message:'Before populate',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // 尝试 populate，如果失败则返回不 populate 的数据
    let anime: any[] = [];
    try {
      const result = await query.populate('locations').lean().exec();
      anime = Array.isArray(result) ? result : [];
    } catch (populateError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:55',message:'Populate failed, trying without',data:{error:String(populateError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // 如果 populate 失败，尝试不 populate
      try {
        const result = await query.lean().exec();
        anime = Array.isArray(result) ? result : [];
      } catch (execError) {
        console.error('Query execution error:', execError);
        // 如果还是失败，尝试最简单的查询
        const result = await Anime.find().limit(limit > 0 ? limit : 100).lean().exec();
        anime = Array.isArray(result) ? result : [];
      }
    }

    // 如果排序失败，在内存中排序
    if (sort === 'rating' && anime.length > 0) {
      anime.sort((a: any, b: any) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        return bRating - aRating;
      });
    } else if (sort === 'releaseDate' && anime.length > 0) {
      anime.sort((a: any, b: any) => {
        const aDate = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        const bDate = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
        return bDate - aDate;
      });
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:54',message:'After populate',data:{count:anime?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    return NextResponse.json(anime || []);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/anime/route.ts:58',message:'Error in GET',data:{error:String(error),stack:error instanceof Error?error.stack:''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Error fetching anime:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      sort,
      limit,
      search
    });
    
    // 尝试返回空数组而不是错误，避免前端崩溃
    try {
      const fallbackAnime = await Anime.find().limit(10).lean().exec();
      return NextResponse.json(Array.isArray(fallbackAnime) ? fallbackAnime : []);
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch anime', 
          details: error instanceof Error ? error.message : String(error) 
        },
        { status: 500 }
      );
    }
  }
}

