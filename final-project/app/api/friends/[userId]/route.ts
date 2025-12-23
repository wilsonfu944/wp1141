import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Friend from '@/models/Friend';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    await connectDB();

    // 查找朋友关系
    const friendship = await Friend.findOne({
      $or: [
        { requester: session.user.id, recipient: userId },
        { requester: userId, recipient: session.user.id },
      ],
      status: 'accepted',
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Friendship not found' },
        { status: 404 }
      );
    }

    await Friend.findByIdAndDelete(friendship._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    await connectDB();

    // 检查朋友关系状态
    const friendship = await Friend.findOne({
      $or: [
        { requester: session.user.id, recipient: userId },
        { requester: userId, recipient: session.user.id },
      ],
    });

    if (!friendship) {
      return NextResponse.json({
        status: 'none',
        isFriend: false,
        isPending: false,
        isRequester: false,
      });
    }

    return NextResponse.json({
      status: friendship.status,
      isFriend: friendship.status === 'accepted',
      isPending: friendship.status === 'pending',
      isRequester: friendship.requester.toString() === session.user.id,
    });
  } catch (error) {
    console.error('Error checking friendship:', error);
    return NextResponse.json(
      { error: 'Failed to check friendship' },
      { status: 500 }
    );
  }
}

