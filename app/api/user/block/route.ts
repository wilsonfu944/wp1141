import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// 封鎖或解封用戶
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action !== 'block' && action !== 'unblock') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot block yourself' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const blockedUsers = user.blockedUsers || [];

    if (action === 'block') {
      if (!blockedUsers.includes(userId)) {
        user.blockedUsers = [...blockedUsers, userId];
        await user.save();
      }
    } else {
      user.blockedUsers = blockedUsers.filter((id: any) => id.toString() !== userId);
      await user.save();
    }

    return NextResponse.json({ success: true, blocked: action === 'block' });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    return NextResponse.json(
      { error: 'Failed to block/unblock user' },
      { status: 500 }
    );
  }
}

// 检查用户是否被封鎖
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const blockedUsers = user.blockedUsers || [];
    const isBlocked = blockedUsers.some((id: any) => id.toString() === userId);

    return NextResponse.json({ blocked: isBlocked });
  } catch (error) {
    console.error('Error checking block status:', error);
    return NextResponse.json(
      { error: 'Failed to check block status' },
      { status: 500 }
    );
  }
}

