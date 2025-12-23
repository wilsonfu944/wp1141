import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  image?: string;
  userID: string; // 自訂 userID
  provider: string; // 'google' | 'github'
  providerId: string;
  bio?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  _id?: ObjectId;
  authorId: ObjectId;
  content: string;
  hashtags?: string[];
  mentions?: string[];
  repostOf?: ObjectId; // 如果是轉發，指向原文章
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id?: ObjectId;
  postId: ObjectId;
  authorId: ObjectId;
  content: string;
  parentId?: ObjectId; // 支援嵌套留言
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  _id?: ObjectId;
  postId: ObjectId;
  userId: ObjectId;
  createdAt: Date;
}

export interface Follow {
  _id?: ObjectId;
  followerId: ObjectId; // 關注者
  followingId: ObjectId; // 被關注者
  createdAt: Date;
}

