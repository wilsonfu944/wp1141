import mongoose, { Schema, Document, Model } from 'mongoose';
// 👇👇👇 強制綁定：當 User 被載入時，Anime 也會被強制註冊
// 這確保了在 Vercel serverless 環境中，Anime 模型總是可用
import './Anime';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  favoriteAnime?: mongoose.Types.ObjectId[];
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
    favoriteAnime: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Anime',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

