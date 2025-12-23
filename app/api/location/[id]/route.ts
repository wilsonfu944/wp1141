import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import UserPhoto from '@/models/UserPhoto';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const location = await Location.findById(params.id)
      .populate('anime')
      .exec();

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    const userPhotos = await UserPhoto.find({ location: params.id })
      .populate('author', 'name image')
      .exec();

    return NextResponse.json({
      ...location.toObject(),
      userPhotos,
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

