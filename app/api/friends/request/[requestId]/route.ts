import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Friend from '@/models/Friend';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId } = await params;
    const { action } = await request.json(); // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    await connectDB();

    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // 确保只有接收者可以接受/拒绝请求
    if (friendRequest.recipient.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (friendRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Friend request already processed' },
        { status: 400 }
      );
    }

    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.save();

    await friendRequest.populate('requester', 'name image email');
    await friendRequest.populate('recipient', 'name image email');

    return NextResponse.json(friendRequest);
  } catch (error) {
    console.error('Error updating friend request:', error);
    return NextResponse.json(
      { error: 'Failed to update friend request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId } = await params;

    await connectDB();

    const friendRequest = await Friend.findById(requestId);

    if (!friendRequest) {
      return NextResponse.json(
        { error: 'Friend request not found' },
        { status: 404 }
      );
    }

    // 确保只有请求者或接收者可以删除请求
    if (
      friendRequest.requester.toString() !== session.user.id &&
      friendRequest.recipient.toString() !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Friend.findByIdAndDelete(requestId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting friend request:', error);
    return NextResponse.json(
      { error: 'Failed to delete friend request' },
      { status: 500 }
    );
  }
}

