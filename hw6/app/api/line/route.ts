import { NextRequest, NextResponse } from 'next/server';
import { Client, WebhookEvent, TextMessage } from '@line/bot-sdk';
import * as crypto from 'crypto';
import connectDB from '@/lib/db';
import Conversation from '@/lib/db/models/Conversation';
import { handleGameMessage } from '@/lib/services/gameService';
import { log } from '@/lib/logger';

function getLineClient() {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelSecret || !channelAccessToken) {
    throw new Error('LINE_CHANNEL_SECRET and LINE_CHANNEL_ACCESS_TOKEN must be set');
  }

  return new Client({
    channelSecret,
    channelAccessToken,
  });
}

function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  if (!channelSecret) {
    return false;
  }
  const hash = crypto
    .createHmac('sha256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!signature) {
      log.warn('Missing LINE signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify signature
    if (!verifySignature(body, signature)) {
      log.warn('Invalid LINE signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events;

    // Process each event
    const promises = events.map(async (event: WebhookEvent) => {
      if (event.type !== 'message' || event.message.type !== 'text') {
        return;
      }

      const userId = event.source.userId;
      if (!userId) {
        log.warn('Missing user ID in event', { event });
        return;
      }

      const messageText = event.message.text;
      const replyToken = event.replyToken;

      try {
        // Get user profile
        let userName: string | undefined;
        try {
          const client = getLineClient();
          const profile = await client.getProfile(userId);
          userName = profile.displayName;
        } catch (error) {
          log.warn('Failed to get user profile', { error, userId });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({ userId }).sort({ lastMessageAt: -1 });

        // Handle game message
        const { reply, quickReplies } = await handleGameMessage(userId, userName, messageText, conversation);

        // Update conversation
        if (!conversation) {
          conversation = new Conversation({
            userId,
            userName,
            platform: 'line',
            lastMessageAt: new Date(),
            messageCount: 1,
          });
          await conversation.save();
        } else {
          conversation.lastMessageAt = new Date();
          conversation.messageCount = (conversation.messageCount || 0) + 1;
          if (userName) {
            conversation.userName = userName;
          }
          await conversation.save();
        }

        // Prepare reply message
        const replyMessage: TextMessage = {
          type: 'text',
          text: reply,
        };

        // Add quick replies if available
        if (quickReplies && quickReplies.length > 0) {
          replyMessage.quickReply = {
            items: quickReplies.map((qr) => ({
              type: 'action',
              action: {
                type: 'message',
                label: qr.label,
                text: qr.text,
              },
            })),
          };
        }

        // Reply to user
        const client = getLineClient();
        await client.replyMessage(replyToken, replyMessage);

        log.info('Message processed successfully', { userId, messageLength: messageText.length });
      } catch (error) {
        log.error('Error processing message', { error, userId, messageText });

        // Send error message to user
        try {
          const client = getLineClient();
          await client.replyMessage(replyToken, {
            type: 'text',
            text: '抱歉，處理你的訊息時發生錯誤。請稍後再試，或輸入「重新開始」來開始新遊戲。',
          });
        } catch (replyError) {
          log.error('Failed to send error reply', { replyError });
        }
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Webhook error', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Health check for webhook
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'LINE Webhook',
    timestamp: new Date().toISOString(),
  });
}

