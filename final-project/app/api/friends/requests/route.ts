import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Friend from '@/models/Friend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // 获取发送给我的待处理请求
    const receivedRequests = await Friend.find({
      recipient: session.user.id,
      status: 'pending',
    })
      .populate('requester', 'name image email')
      .sort({ createdAt: -1 })
      .exec();

    // 获取我发送的待处理请求
    const sentRequests = await Friend.find({
      requester: session.user.id,
      status: 'pending',
    })
      .populate('recipient', 'name image email')
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      received: receivedRequests,
      sent: sentRequests,
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}

