import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPhoto extends Document {
  imageUrl: string;
  location: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  caption?: string;
  createdAt: Date;
}

const UserPhotoSchema: Schema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    caption: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const UserPhoto: Model<IUserPhoto> = mongoose.models.UserPhoto || mongoose.model<IUserPhoto>('UserPhoto', UserPhotoSchema);

export default UserPhoto;

