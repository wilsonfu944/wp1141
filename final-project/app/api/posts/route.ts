import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    await connectDB();

    let query = Post.find().populate('author', 'name image avatarColor').sort({ createdAt: -1 });

    if (category && category !== 'all') {
      query = query.where('category').equals(category);
    }

    const posts = await query.exec();

    // 确保所有帖子都有 author 字段
    const postsWithAuthor = posts.map((post: any) => ({
      ...post.toObject(),
      author: post.author || { name: '未知用戶', image: undefined, avatarColor: undefined },
      likes: post.likes || [],
      comments: post.comments || [],
      retweets: post.retweets || [],
    }));

    return NextResponse.json(postsWithAuthor);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, category } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.create({
      content,
      category: category || 'anime-discussion',
      author: session.user.id,
    });

    await post.populate('author', 'name image avatarColor');

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}

