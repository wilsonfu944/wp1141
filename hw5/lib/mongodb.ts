import { MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri: string = process.env.MONGODB_URI;

// 添加連接選項，設置超時時間
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 5000, // 5秒超時
  connectTimeoutMS: 10000, // 10秒連接超時
  socketTimeoutMS: 45000, // 45秒 socket 超時
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection error:', error);
      // 清除 promise，以便下次重試
      globalWithMongo._mongoClientPromise = undefined;
      throw error;
    });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((error) => {
    console.error('MongoDB connection error:', error);
    throw error;
  });
}

export default clientPromise;

