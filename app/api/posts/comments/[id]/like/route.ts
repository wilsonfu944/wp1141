import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import PostComment from '@/models/PostComment';
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

    const comment = await PostComment.findById(params.id);

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const likes = comment.likes.map((id: any) => id.toString());
    const isLiked = likes.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (id: any) => id.toString() !== userId
      );
    } else {
      // Like
      comment.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await comment.save();

    return NextResponse.json({
      liked: !isLiked,
      likesCount: comment.likes.length,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

