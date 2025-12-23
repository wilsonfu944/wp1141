import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  category: 'anime-discussion' | 'travel-companion';
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  retweets: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['anime-discussion', 'travel-companion'],
      default: 'anime-discussion',
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PostComment',
      },
    ],
    retweets: [
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

// Delete existing model if it exists to avoid conflicts
if (mongoose.models.Post) {
  delete mongoose.models.Post;
}

const Post: Model<IPost> = mongoose.model<IPost>('Post', PostSchema);

export default Post;

