import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItineraryItem {
  location: mongoose.Types.ObjectId;
  stayDuration: number; // in minutes
  arrivalTime?: string; // HH:mm format
  order: number;
}

export interface IItinerary extends Document {
  title: string;
  description?: string;
  author: mongoose.Types.ObjectId;
  items: IItineraryItem[];
  startDate: Date;
  endDate?: Date;
  isPublic: boolean;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        location: {
          type: Schema.Types.ObjectId,
          ref: 'Location',
          required: true,
        },
        stayDuration: {
          type: Number,
          default: 60, // 60 minutes
        },
        arrivalTime: {
          type: String,
          // Format: HH:mm
        },
        order: {
          type: Number,
          required: true,
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Itinerary: Model<IItinerary> = mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);

export default Itinerary;

