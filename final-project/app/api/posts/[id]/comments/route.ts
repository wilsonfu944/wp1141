import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import PostComment from '@/models/PostComment';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const comments = await PostComment.find({
      post: params.id,
      parentComment: { $exists: false },
    })
      .populate('author', '_id name image avatarColor')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: '_id name image avatarColor',
        },
        options: { sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, parentCommentId } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = await PostComment.create({
      content,
      post: params.id,
      author: session.user.id,
      parentComment: parentCommentId || undefined,
    });

    // If it's a reply, add to parent comment
    if (parentCommentId) {
      const parentComment = await PostComment.findById(parentCommentId);
      if (parentComment) {
        parentComment.replies.push(comment._id);
        await parentComment.save();
      }
    } else {
      // Only add top-level comments to post
      post.comments.push(comment._id);
      await post.save();
    }

    await comment.populate('author', '_id name image avatarColor');

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

