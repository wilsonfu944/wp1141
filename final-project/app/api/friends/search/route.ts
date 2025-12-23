import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Friend from '@/models/Friend';

export const dynamic = 'force-dynamic';

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
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json([]);
    }

    await connectDB();

    // 搜索用户（排除自己）
    const users = await User.find({
      _id: { $ne: session.user.id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('name image email')
      .limit(20)
      .exec();

    // 获取当前用户的所有朋友关系
    const friendships = await Friend.find({
      $or: [
        { requester: session.user.id },
        { recipient: session.user.id },
      ],
    }).exec();

    const friendshipMap = new Map();
    friendships.forEach((friendship) => {
      const otherUserId =
        friendship.requester.toString() === session.user.id
          ? friendship.recipient.toString()
          : friendship.requester.toString();
      friendshipMap.set(otherUserId, {
        status: friendship.status,
        isRequester: friendship.requester.toString() === session.user.id,
      });
    });

    // 为每个用户添加朋友关系状态
    const usersWithStatus = users.map((user) => {
      const friendship = friendships.find(
        (f) =>
          (f.requester.toString() === session.user.id &&
            f.recipient.toString() === user._id.toString()) ||
          (f.recipient.toString() === session.user.id &&
            f.requester.toString() === user._id.toString())
      );
      return {
        _id: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        friendshipStatus: friendship
          ? {
              status: friendship.status,
              isRequester: friendship.requester.toString() === session.user.id,
              requestId: friendship._id.toString(),
            }
          : null,
      };
    });

    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}

