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

    // 获取所有已接受的朋友关系
    const friends = await Friend.find({
      $or: [
        { requester: session.user.id, status: 'accepted' },
        { recipient: session.user.id, status: 'accepted' },
      ],
    })
      .populate('requester', 'name image email')
      .populate('recipient', 'name image email')
      .sort({ updatedAt: -1 })
      .exec();

    // 将朋友信息转换为统一格式
    const friendsList = friends.map((friend) => {
      const isRequester = friend.requester._id.toString() === session.user.id;
      return {
        _id: friend._id,
        friend: isRequester ? friend.recipient : friend.requester,
        createdAt: friend.createdAt,
        updatedAt: friend.updatedAt,
      };
    });

    return NextResponse.json(friendsList);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

