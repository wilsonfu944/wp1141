import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';
import Location from '@/models/Location'; // 需要导入以确保模型注册

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const itinerary = await Itinerary.findById(params.id)
      .populate('author', 'name image')
      .populate('items.location')
      .populate('likes', 'name')
      .exec();

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch itinerary' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is the author
    if (itinerary.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Itinerary.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to delete itinerary' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { title, description, items, startDate, endDate, isPublic } = await request.json();

    await connectDB();

    const itinerary = await Itinerary.findById(params.id);

    if (!itinerary) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    // Check if user is the author
    if (itinerary.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    itinerary.title = title || itinerary.title;
    itinerary.description = description !== undefined ? description : itinerary.description;
    itinerary.startDate = startDate || itinerary.startDate;
    itinerary.endDate = endDate !== undefined ? endDate : itinerary.endDate;
    itinerary.isPublic = isPublic !== undefined ? isPublic : itinerary.isPublic;

    if (items) {
      itinerary.items = items.map((item: any, index: number) => ({
        location: item.location,
        stayDuration: item.stayDuration || 60,
        arrivalTime: item.arrivalTime || undefined,
        order: item.order || index + 1,
      }));
    }

    await itinerary.save();
    await itinerary.populate('items.location');

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}

