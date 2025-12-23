import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import Location from '@/models/Location'; // 需要导入以确保模型注册

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular') === 'true';
    const session = await getServerSession(authOptions);

    await connectDB();

    let itineraries: any[] = [];

    if (popular) {
      // 对于热门行程，先获取所有公开行程，然后在内存中排序
      try {
        let query = Itinerary.find({ isPublic: true });
        
        // 尝试 populate
        try {
          const result = await query
            .populate('author', 'name image _id')
            .populate('items.location')
            .lean()
            .exec();
          itineraries = Array.isArray(result) ? result : [];
        } catch (populateError) {
          // 如果 populate 失败，尝试不 populate
          const result = await query.lean().exec();
          itineraries = Array.isArray(result) ? result : [];
        }

        // 在内存中按 likes 数量排序
        itineraries.sort((a: any, b: any) => {
          const aLikes = Array.isArray(a.likes) ? a.likes.length : 0;
          const bLikes = Array.isArray(b.likes) ? b.likes.length : 0;
          if (bLikes !== aLikes) {
            return bLikes - aLikes;
          }
          // 如果 likes 数量相同，按创建时间排序
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });

        // 限制数量
        itineraries = itineraries.slice(0, 10);

        // 如果还没有 populate，现在尝试 populate
        if (itineraries.length > 0 && !itineraries[0].author) {
          try {
            const populated = await Itinerary.find({
              _id: { $in: itineraries.map((it: any) => it._id) },
              isPublic: true
            })
              .populate('author', 'name image _id')
              .populate('items.location')
              .lean()
              .exec();
            
            if (Array.isArray(populated)) {
              // 保持排序顺序
              const populatedMap = new Map(populated.map((it: any) => [it._id.toString(), it]));
              itineraries = itineraries.map((it: any) => populatedMap.get(it._id.toString()) || it);
            }
          } catch (populateError2) {
            console.error('Second populate attempt failed:', populateError2);
            // 继续使用未 populate 的数据
          }
        }
      } catch (error) {
        console.error('Error fetching popular itineraries:', error);
        // 返回空数组而不是错误
        itineraries = [];
      }
    } else if (session?.user?.id) {
      try {
        let query = Itinerary.find({ author: session.user.id });
        
        try {
          const result = await query.populate('items.location').lean().exec();
          itineraries = Array.isArray(result) ? result : [];
        } catch (populateError) {
          const result = await query.lean().exec();
          itineraries = Array.isArray(result) ? result : [];
        }

        // 按创建时间排序
        itineraries.sort((a: any, b: any) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      } catch (error) {
        console.error('Error fetching user itineraries:', error);
        itineraries = [];
      }
    } else {
      return NextResponse.json([]);
    }

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Error fetching itineraries:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // 尝试返回空数组而不是错误
    try {
      return NextResponse.json([]);
    } catch (fallbackError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch itineraries',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, description, items, startDate, endDate, isPublic } = await request.json();

    if (!title || !items || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const itinerary = await Itinerary.create({
      title,
      description,
      items: items.map((item: any, index: number) => ({
        location: item.location,
        stayDuration: item.stayDuration || 60,
        arrivalTime: item.arrivalTime || undefined,
        order: item.order || index + 1,
      })),
      startDate,
      endDate: endDate || undefined,
      isPublic: isPublic || false,
      author: session.user.id,
    });

    await itinerary.populate('items.location');

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to create itinerary' },
      { status: 500 }
    );
  }
}

