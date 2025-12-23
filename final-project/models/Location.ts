import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  nameJP?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  anime: mongoose.Types.ObjectId;
  userPhotos: mongoose.Types.ObjectId[];
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nameJP: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    anime: {
      type: Schema.Types.ObjectId,
      ref: 'Anime',
      required: true,
    },
    userPhotos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'UserPhoto',
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

const Location: Model<ILocation> = mongoose.models.Location || mongoose.model<ILocation>('Location', LocationSchema);

export default Location;

