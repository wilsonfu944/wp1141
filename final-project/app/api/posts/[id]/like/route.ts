import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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

    await connectDB();

    const post = await Post.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const likes = post.likes.map((id: any) => id.toString());
    const isLiked = likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id: any) => id.toString() !== userId
      );
    } else {
      // Like
      post.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save();

    return NextResponse.json({
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

