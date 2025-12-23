import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import UserPhoto from '@/models/UserPhoto';
import Location from '@/models/Location';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const locationId = formData.get('locationId') as string;

    if (!file || !locationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, you should upload to a cloud storage service like Cloudinary
    // For now, we'll use a placeholder URL
    const imageUrl = URL.createObjectURL(file);

    await connectDB();

    const photo = await UserPhoto.create({
      imageUrl,
      location: locationId,
      author: session.user.id,
    });

    await Location.findByIdAndUpdate(locationId, {
      $push: { userPhotos: photo._id },
    });

    await photo.populate('author', 'name image');

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

