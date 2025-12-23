import mongoose, { Schema, Document, Model } from 'mongoose';
// 👇👇👇 強制綁定：當 Anime 被載入時，Location 也會被強制註冊
// 這確保了在 Vercel serverless 環境中，Location 模型總是可用
import './Location';

export interface IAnime extends Document {
  title: string;
  titleJP?: string;
  description: string;
  coverImage: string;
  rating: number;
  releaseDate: Date;
  genres: string[];
  studio?: string;
  episodes?: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  locations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AnimeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    titleJP: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    genres: [
      {
        type: String,
      },
    ],
    studio: {
      type: String,
    },
    episodes: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'upcoming'],
      default: 'completed',
    },
    locations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Location',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Anime: Model<IAnime> = mongoose.models.Anime || mongoose.model<IAnime>('Anime', AnimeSchema);

export default Anime;

