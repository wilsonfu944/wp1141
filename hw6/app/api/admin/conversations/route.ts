import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Conversation from '@/lib/db/models/Conversation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const keyword = searchParams.get('keyword');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (keyword) {
      query.$or = [
        { userName: { $regex: keyword, $options: 'i' } },
        { userId: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.lastMessageAt = {};
      if (startDate) {
        query.lastMessageAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.lastMessageAt.$lte = new Date(endDate);
      }
    }

    // Get conversations
    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Conversation.countDocuments(query);

    // Get statistics
    const stats = {
      totalConversations: await Conversation.countDocuments(),
      activeUsers: await Conversation.distinct('userId').then((ids) => ids.length),
      totalMessages: await Conversation.aggregate([
        { $group: { _id: null, total: { $sum: '$messageCount' } } },
      ]).then((result) => result[0]?.total || 0),
    };

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('Error fetching conversations', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




