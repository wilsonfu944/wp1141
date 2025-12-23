import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AnswerRecord {
  questionIndex: number;
  answer: number;
  isCorrect: boolean;
  answerTime: number; // 答题时间（秒）
  score: number;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export type GameRoomStatus = 'waiting' | 'matching' | 'playing' | 'finished';

export interface IGameRoom extends Document {
  roomId: string;
  player1: mongoose.Types.ObjectId;
  player2: mongoose.Types.ObjectId | string | null; // null = 配对中, "AI" = AI对手
  isAI: boolean;
  status: GameRoomStatus;
  questions: Question[]; // 存储完整的题目对象
  currentQuestion: number;
  player1Score: number;
  player2Score: number;
  player1Answers: AnswerRecord[];
  player2Answers: AnswerRecord[];
  matchStartTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerRecordSchema: Schema = new Schema(
  {
    questionIndex: {
      type: Number,
      required: true,
    },
    answer: {
      type: Number,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    answerTime: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const GameRoomSchema: Schema = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    player1: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    player2: {
      type: Schema.Types.Mixed, // 可以是ObjectId或"AI"字符串
      default: null,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['waiting', 'matching', 'playing', 'finished'],
      default: 'matching',
    },
    questions: [
      {
        type: Schema.Types.Mixed, // 存储完整的题目对象
      },
    ],
    currentQuestion: {
      type: Number,
      default: 0,
    },
    player1Score: {
      type: Number,
      default: 0,
    },
    player2Score: {
      type: Number,
      default: 0,
    },
    player1Answers: [AnswerRecordSchema],
    player2Answers: [AnswerRecordSchema],
    matchStartTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
GameRoomSchema.index({ roomId: 1 });
GameRoomSchema.index({ player1: 1, status: 1 });
GameRoomSchema.index({ status: 1, matchStartTime: 1 });

const GameRoom: Model<IGameRoom> =
  mongoose.models.GameRoom || mongoose.model<IGameRoom>('GameRoom', GameRoomSchema);

export default GameRoom;

