import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '@/lib/mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ObjectId } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { postId } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db();

      const comments = await db
        .collection('comments')
        .find({ postId: new ObjectId(postId as string) })
        .sort({ createdAt: 1 })
        .toArray();

      // 獲取作者資訊並建立嵌套結構
      const commentsWithAuthors = await Promise.all(
        comments.map(async (comment) => {
          const author = await db.collection('users').findOne({
            _id: comment.authorId,
          });

          return {
            ...comment,
            author: author
              ? {
                  name: author.name,
                  userID: author.userID,
                  image: author.image,
                }
              : null,
          };
        })
      );

      // 建立嵌套結構
      interface CommentWithReplies {
        _id: ObjectId;
        postId: ObjectId;
        authorId: ObjectId;
        content: string;
        parentId?: ObjectId;
        createdAt: Date;
        author: {
          name: string;
          userID: string;
          image?: string;
        } | null;
        replies: CommentWithReplies[];
      }

      const buildCommentTree = (comments: any[], parentId: string | null = null): CommentWithReplies[] => {
        return comments
          .filter((comment) => {
            if (parentId === null) {
              return !comment.parentId;
            }
            return comment.parentId?.toString() === parentId;
          })
          .map((comment) => ({
            ...comment,
            replies: buildCommentTree(comments, comment._id.toString()),
          }));
      };

      const commentTree = buildCommentTree(commentsWithAuthors);

      return res.status(200).json({ comments: commentTree });
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

