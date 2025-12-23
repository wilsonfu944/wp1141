import connectDB from '../lib/mongodb';
import Itinerary from '../models/Itinerary';

async function clearPopularItineraries() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    const result = await Itinerary.deleteMany({ isPublic: true });
    console.log(`Deleted ${result.deletedCount} popular itineraries`);

    process.exit(0);
  } catch (error) {
    console.error('Error clearing popular itineraries:', error);
    process.exit(1);
  }
}

clearPopularItineraries();

