import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      userID?: string;
    };
  }
}

export const authOptions: NextAuthOptions = {
  // 改用 JWT session 策略，避免 state missing 錯誤
  // adapter: MongoDBAdapter(clientPromise), // 暫時移除，改用 JWT
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // 首次登入時，將用戶資訊存入 token
      if (account && user) {
        token.id = user.id || user.email || '';
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        
        // 從資料庫獲取 userID（如果資料庫連接失敗，使用空字串）
        try {
          const client = await Promise.race([
            clientPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 2000)
            )
          ]) as any;
          const db = client.db();
          const userDoc = await db.collection('users').findOne({ 
            email: user.email 
          });
          if (userDoc) {
            token.userID = userDoc.userID || '';
          } else {
            token.userID = '';
          }
        } catch (error) {
          console.error('Error fetching userID in jwt callback:', error);
          token.userID = '';
        }
      }
      
      // 每次請求時更新 userID（以防資料庫中的 userID 被更新）
      // 優化：只在沒有 userID 或需要更新時才查詢資料庫
      if (token.email && !token.userID) {
        try {
          const client = await Promise.race([
            clientPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 2000)
            )
          ]) as any;
          const db = client.db();
          const userDoc = await db.collection('users').findOne({ 
            email: token.email 
          });
          if (userDoc) {
            token.userID = userDoc.userID || '';
          }
        } catch (error) {
          console.error('Error updating userID in jwt callback:', error);
          // 保持現有的 userID，不更新
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).userID = token.userID as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account && user && user.email) {
        try {
          const client = await Promise.race([
            clientPromise,
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Database connection timeout')), 5000)
            )
          ]) as any;
          const db = client.db();
          
          // 檢查用戶是否已存在
          const existingUser = await db.collection('users').findOne({
            email: user.email,
          });

          // 如果用戶不存在，需要註冊（會在註冊頁面處理 userID）
          if (!existingUser) {
            // 暫時創建用戶，但 userID 會在註冊頁面設置
            const result = await db.collection('users').insertOne({
              email: user.email,
              name: user.name || '',
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
              userID: '', // 將在註冊頁面設置
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log('New user created:', result.insertedId);
          } else {
            console.log('Existing user found:', existingUser._id);
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // 不阻止登入，但記錄錯誤
          // 即使資料庫連接失敗，也允許用戶登入（使用 JWT）
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // 改用 JWT 策略
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

export default NextAuth(authOptions);

