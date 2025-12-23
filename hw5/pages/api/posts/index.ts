import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const { following, limit = 50 } = req.query;
      let client;
      try {
        client = await Promise.race([
          clientPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 10000)
          )
        ]) as any;
      } catch (dbError: any) {
        console.error('Database connection failed:', dbError);
        return res.status(503).json({ 
          error: 'Database connection failed',
          message: '無法連接到資料庫，請檢查 MongoDB 連接設定',
          posts: [] // 返回空陣列，讓前端可以正常顯示
        });
      }
      const db = client.db();

      let query: any = {};

      // 如果只顯示關注的用戶的文章
      if (following === 'true' && session?.user) {
        const currentUser = await db.collection('users').findOne({
          email: session.user.email,
        });

        if (currentUser) {
          const followingUsers = await db
            .collection('follows')
            .find({ followerId: currentUser._id })
            .toArray();

          const followingIds = followingUsers.map((f: any) => f.followingId);
          followingIds.push(currentUser._id); // 包含自己的文章

          query.authorId = { $in: followingIds };
        }
      }

      const posts = await db
        .collection('posts')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .toArray();

      // 獲取作者資訊和互動統計
      const postsWithDetails = await Promise.all(
        posts.map(async (post: any) => {
          const author = await db.collection('users').findOne({
            _id: post.authorId,
          });

          const likesCount = await db.collection('likes').countDocuments({
            postId: post._id,
          });

          const commentsCount = await db.collection('comments').countDocuments({
            postId: post._id,
          });

          const repostsCount = await db.collection('posts').countDocuments({
            repostOf: post._id,
          });

          let isLiked = false;
          let isReposted = false;
          if (session?.user) {
            const currentUser = await db.collection('users').findOne({
              email: session.user.email,
            });
            if (currentUser) {
              const like = await db.collection('likes').findOne({
                postId: post._id,
                userId: currentUser._id,
              });
              isLiked = !!like;

              const repost = await db.collection('posts').findOne({
                repostOf: post._id,
                authorId: currentUser._id,
              });
              isReposted = !!repost;
            }
          }

          let originalPost = null;
          if (post.repostOf) {
            const original = await db.collection('posts').findOne({
              _id: post.repostOf,
            });
            if (original) {
              const originalAuthor = await db.collection('users').findOne({
                _id: original.authorId,
              });
              originalPost = {
                ...original,
                author: originalAuthor
                  ? {
                      name: originalAuthor.name,
                      userID: originalAuthor.userID,
                      image: originalAuthor.image,
                    }
                  : null,
              };
            }
          }

          return {
            ...post,
            author: author
              ? {
                  _id: author._id,
                  name: author.name,
                  userID: author.userID,
                  image: author.image,
                }
              : null,
            likesCount,
            commentsCount,
            repostsCount,
            isLiked,
            isReposted,
            originalPost,
            isOwnPost:
              session?.user && author?.email === session.user.email,
          };
        })
      );

      return res.status(200).json({ posts: postsWithDetails });
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      // 如果是資料庫連接錯誤，返回空陣列而不是錯誤
      if (error.message?.includes('connection') || error.message?.includes('timeout')) {
        return res.status(200).json({ posts: [] });
      }
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || '無法載入文章',
        posts: [] // 返回空陣列，讓前端可以正常顯示
      });
    }
  }

  if (req.method === 'POST') {
    if (!session || !session.user || !session.user.email) {
      return res.status(401).json({ error: 'Unauthorized - Please login first' });
    }

    try {
      const { content, repostOf } = req.body;

      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'Content is required' });
      }

      let client;
      try {
        client = await Promise.race([
          clientPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 10000)
          )
        ]) as any;
      } catch (dbError: any) {
        console.error('Database connection failed:', dbError);
        return res.status(503).json({ 
          error: 'Database connection failed',
          message: '無法連接到資料庫，請檢查 MongoDB 連接設定'
        });
      }
      const db = client.db();

      const author = await db.collection('users').findOne({
        email: session.user.email,
      });

      if (!author) {
        console.error('User not found in database:', session.user.email);
        return res.status(404).json({ error: 'User not found in database. Please try logging in again.' });
      }

      if (!author._id) {
        console.error('User missing _id:', author);
        return res.status(500).json({ error: 'User data is invalid' });
      }

      // 提取 hashtags 和 mentions
      const hashtags = (content.match(/#\w+/g) || []).map((tag) =>
        tag.substring(1)
      );
      const mentions = (content.match(/@\w+/g) || []).map((mention) =>
        mention.substring(1)
      );

      const post = {
        authorId: author._id,
        content: content.trim(),
        hashtags,
        mentions,
        repostOf: repostOf ? new ObjectId(repostOf) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.collection('posts').insertOne(post);

      // 觸發 Pusher 事件
      try {
        const { pusherServer } = await import('@/lib/pusher');
        if (pusherServer) {
          pusherServer.trigger('posts', 'new-post', {
            postId: result.insertedId.toString(),
            author: {
              name: author.name,
              userID: author.userID,
              image: author.image,
            },
            content: post.content,
            createdAt: post.createdAt,
          });
        }
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
        // 不影響文章創建
      }

      return res.status(201).json({ post: { ...post, _id: result.insertedId } });
    } catch (error: any) {
      console.error('Error creating post:', error);
      return res.status(500).json({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

