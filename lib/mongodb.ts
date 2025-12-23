import mongoose from 'mongoose';

// 確保在連接前檢查環境變數
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined');
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// 在連接前註冊所有模型（避免 serverless 環境中的模型註冊問題）
function registerModels() {
  // 動態導入所有模型，確保它們被註冊
  try {
    require('@/models/Anime');
    require('@/models/Location');
    require('@/models/User');
    require('@/models/UserPhoto');
    require('@/models/Comment');
  } catch (error) {
    // 如果導入失敗，繼續（模型可能已經註冊）
    console.warn('Some models may not be registered:', error);
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // 檢查是否已經連接
  if (cached.conn) {
    return cached.conn;
  }

  // 如果沒有連接 promise，創建一個新的
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      cached.promise = null;
      console.error('MongoDB connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
