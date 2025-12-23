import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    await connectDB();

    const user = await User.findById(userId).populate('favoriteAnime').exec();

    if (!user || !user.favoriteAnime) {
      return NextResponse.json([]);
    }

    return NextResponse.json(user.favoriteAnime);
  } catch (error) {
    console.error('Error fetching favorite anime:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorite anime' },
      { status: 500 }
    );
  }
}

