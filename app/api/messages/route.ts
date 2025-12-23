import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

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

    const messages = await Message.find({
      $or: [
        { sender: session.user.id, recipient: userId },
        { sender: userId, recipient: session.user.id },
      ],
    })
      .populate('sender', 'name image')
      .populate('recipient', 'name image')
      .sort({ createdAt: 1 })
      .exec();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: session.user.id,
        read: false,
      },
      { read: true }
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { recipient, content } = await request.json();

    if (!recipient || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await Message.create({
      sender: session.user.id,
      recipient,
      content,
    });

    await message.populate('sender', 'name image');
    await message.populate('recipient', 'name image');

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

