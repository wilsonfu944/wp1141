import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import PostComment from '@/models/PostComment';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Delete all comments first
    await PostComment.deleteMany({});
    
    // Delete all posts
    await Post.deleteMany({});

    return NextResponse.json({ 
      message: 'All posts and comments cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing posts:', error);
    return NextResponse.json(
      { error: 'Failed to clear posts' },
      { status: 500 }
    );
  }
}

