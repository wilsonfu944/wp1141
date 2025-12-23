import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserRating extends Document {
  user: mongoose.Types.ObjectId;
  anime: mongoose.Types.ObjectId;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserRatingSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    anime: {
      type: Schema.Types.ObjectId,
      ref: 'Anime',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// 確保每個用戶對每個動漫只能評分一次
UserRatingSchema.index({ user: 1, anime: 1 }, { unique: true });

const UserRating: Model<IUserRating> =
  mongoose.models.UserRating || mongoose.model<IUserRating>('UserRating', UserRatingSchema);

export default UserRating;

