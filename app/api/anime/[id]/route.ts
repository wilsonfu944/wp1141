import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import Location from '@/models/Location'; // 需要导入以确保模型注册

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const anime = await Anime.findById(params.id)
      .populate('locations')
      .exec();

    if (!anime) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(anime);
  } catch (error) {
    console.error('Error fetching anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anime' },
      { status: 500 }
    );
  }
}

