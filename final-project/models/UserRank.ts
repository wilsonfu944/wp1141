import mongoose, { Schema, Document, Model } from 'mongoose';

export type RankLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export interface IUserRank extends Document {
  userId: mongoose.Types.ObjectId;
  rank: RankLevel;
  points: number;
  wins: number;
  losses: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserRankSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rank: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'],
      default: 'bronze',
    },
    points: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserRank: Model<IUserRank> =
  mongoose.models.UserRank || mongoose.model<IUserRank>('UserRank', UserRankSchema);

export default UserRank;

