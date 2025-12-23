import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Itinerary from '@/models/Itinerary';

export async function DELETE() {
  try {
    await connectDB();

    // Delete all public itineraries
    const result = await Itinerary.deleteMany({ isPublic: true });

    return NextResponse.json({ 
      message: `Deleted ${result.deletedCount} popular itineraries successfully` 
    });
  } catch (error) {
    console.error('Error clearing popular itineraries:', error);
    return NextResponse.json(
      { error: 'Failed to clear popular itineraries' },
      { status: 500 }
    );
  }
}

