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
    const retweets = post.retweets.map((id: any) => id.toString());
    const isRetweeted = retweets.includes(userId);

    if (isRetweeted) {
      // Unretweet
      post.retweets = post.retweets.filter(
        (id: any) => id.toString() !== userId
      );
    } else {
      // Retweet
      post.retweets.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save();

    return NextResponse.json({
      retweeted: !isRetweeted,
      retweetsCount: post.retweets.length,
    });
  } catch (error) {
    console.error('Error toggling retweet:', error);
    return NextResponse.json(
      { error: 'Failed to toggle retweet' },
      { status: 500 }
    );
  }
}

