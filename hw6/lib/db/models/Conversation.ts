import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  userId: string;
  userName?: string;
  platform: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  gameState?: {
    currentPuzzleId?: string;
    puzzleTitle?: string;
    isSolved?: boolean;
    hintsUsed?: number;
    startTime?: Date;
  };
  metadata?: {
    userProfile?: {
      displayName?: string;
      pictureUrl?: string;
    };
  };
}

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
    },
    platform: {
      type: String,
      default: 'line',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    gameState: {
      type: Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);




