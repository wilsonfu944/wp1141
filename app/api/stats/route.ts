import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import Location from '@/models/Location';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    
    const [animeCount, locationCount, userCount] = await Promise.all([
      Anime.countDocuments(),
      Location.countDocuments(),
      User.countDocuments(),
    ]);

    return NextResponse.json({
      animeCount,
      locationCount,
      userCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

