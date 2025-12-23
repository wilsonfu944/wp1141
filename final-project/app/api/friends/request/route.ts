import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Friend from '@/models/Friend';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json(
        { error: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (session.user.id === recipientId) {
      return NextResponse.json(
        { error: 'Cannot send friend request to yourself' },
        { status: 400 }
      );
    }

    await connectDB();

    // 检查接收者是否存在
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 检查是否已经存在朋友关系或请求
    const existingFriend = await Friend.findOne({
      $or: [
        { requester: session.user.id, recipient: recipientId },
        { requester: recipientId, recipient: session.user.id },
      ],
    });

    if (existingFriend) {
      if (existingFriend.status === 'accepted') {
        return NextResponse.json(
          { error: 'Already friends' },
          { status: 400 }
        );
      }
      if (existingFriend.status === 'pending') {
        return NextResponse.json(
          { error: 'Friend request already exists' },
          { status: 400 }
        );
      }
    }

    // 创建新的朋友请求
    const friendRequest = await Friend.create({
      requester: session.user.id,
      recipient: recipientId,
      status: 'pending',
    });

    await friendRequest.populate('requester', 'name image');
    await friendRequest.populate('recipient', 'name image');

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}

