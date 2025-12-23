import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';

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

    // 获取被封鎖的用户列表
    const user = await User.findById(session.user.id);
    const blockedUsers = user?.blockedUsers || [];
    const blockedUserIds = blockedUsers.map((id: any) => id.toString());

    const messages = await Message.find({
      $or: [{ sender: session.user.id }, { recipient: session.user.id }],
    })
      .populate('sender', 'name image')
      .populate('recipient', 'name image')
      .sort({ createdAt: -1 })
      .exec();

    const conversationsMap = new Map();

    // 使用 for...of 循环替代 forEach，以便使用 await
    for (const message of messages) {
      const otherUser =
        message.sender._id.toString() === session.user?.id
          ? message.recipient
          : message.sender;

      // 跳过被封鎖的用户
      if (blockedUserIds.includes(otherUser._id.toString())) {
        continue;
      }

      if (!conversationsMap.has(otherUser._id.toString())) {
        const unreadCount = await Message.countDocuments({
          sender: otherUser._id,
          recipient: session.user.id,
          read: false,
        });

        conversationsMap.set(otherUser._id.toString(), {
          user: otherUser,
          lastMessage: message,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
