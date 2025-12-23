import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  bio?: string; // 自我介绍
  avatarColor?: string; // 头像颜色（hex color）
  favoriteAnime?: mongoose.Types.ObjectId[];
  rank?: string;
  rankPoints?: number;
  blockedUsers?: mongoose.Types.ObjectId[]; // 封鎖的用户列表
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatarColor: {
      type: String,
      default: '#ec4899', // 默认粉色
    },
    favoriteAnime: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Anime',
      },
    ],
    rank: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'],
    },
    rankPoints: {
      type: Number,
      default: 0,
    },
    blockedUsers: [
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

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

