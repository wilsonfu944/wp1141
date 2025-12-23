import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const itinerary = await Itinerary.findById(params.id);

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const likes = itinerary.likes.map((id) => id.toString());
    const isLiked = likes.includes(userId);

    if (isLiked) {
      // Unlike
      itinerary.likes = itinerary.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      itinerary.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await itinerary.save();

    return NextResponse.json({
      liked: !isLiked,
      likesCount: itinerary.likes.length,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

