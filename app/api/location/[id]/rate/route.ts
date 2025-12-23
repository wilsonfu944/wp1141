import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';

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

    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await connectDB();

    const location = await Location.findById(params.id);

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // For simplicity, we'll update the rating directly
    // In a production app, you might want to store individual user ratings
    // and calculate the average
    const currentRating = location.rating || 0;
    const newRating = (currentRating + rating) / 2;
    location.rating = Math.min(5, Math.max(0, newRating));
    await location.save();

    return NextResponse.json({ rating: location.rating });
  } catch (error) {
    console.error('Error rating location:', error);
    return NextResponse.json(
      { error: 'Failed to rate location' },
      { status: 500 }
    );
  }
}

