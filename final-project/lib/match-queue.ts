import GameRoom from '@/models/GameRoom';
import connectDB from './mongodb';

interface QueuedPlayer {
  userId: string;
  socketId: string;
  joinTime: Date;
  timeoutId?: NodeJS.Timeout;
}

class MatchQueue {
  private queue: QueuedPlayer[] = [];
  private readonly MATCH_TIMEOUT = 10000; // 10秒

  /**
   * 將玩家加入配對隊列
   */
  addPlayer(userId: string, socketId: string): void {
    // 檢查是否已在隊列中
    const existingIndex = this.queue.findIndex((p) => p.userId === userId);
    if (existingIndex !== -1) {
      // 更新socketId
      this.queue[existingIndex].socketId = socketId;
      return;
    }

    const player: QueuedPlayer = {
      userId,
      socketId,
      joinTime: new Date(),
    };

    // 不在此處設置超時，由外部調用者處理
    this.queue.push(player);
  }

  /**
   * 從隊列中移除玩家
   */
  removePlayer(userId: string): void {
    const index = this.queue.findIndex((p) => p.userId === userId);
    if (index !== -1) {
      const player = this.queue[index];
      if (player.timeoutId) {
        clearTimeout(player.timeoutId);
      }
      this.queue.splice(index, 1);
    }
  }

  /**
   * 嘗試配對兩個玩家
   */
  tryMatch(): { player1: QueuedPlayer; player2: QueuedPlayer } | null {
    if (this.queue.length < 2) {
      return null;
    }

    const player1 = this.queue.shift()!;
    const player2 = this.queue.shift()!;

    // 清除超時計時器
    if (player1.timeoutId) clearTimeout(player1.timeoutId);
    if (player2.timeoutId) clearTimeout(player2.timeoutId);

    return { player1, player2 };
  }

  /**
   * 處理10秒超時，創建隨機對手房間
   * 返回房間信息，由調用者處理socket通知
   */
  private async handleTimeout(player: QueuedPlayer): Promise<{ roomId: string; isAI: boolean } | null> {
    // 檢查玩家是否仍在隊列中
    const index = this.queue.findIndex((p) => p.userId === player.userId);
    if (index === -1) {
      return null; // 已經被配對或移除
    }

    // 從隊列中移除
    this.removePlayer(player.userId);

    await connectDB();

    // 創建隨機對手房間（使用 'RANDOM' 標識，不是真實AI）
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const room = new GameRoom({
      roomId,
      player1: player.userId,
      player2: 'RANDOM', // 隨機對手標識
      isAI: true, // 保持 isAI: true 以便使用相同的遊戲邏輯
      status: 'matching',
      questions: [],
      currentQuestion: 0,
      player1Score: 0,
      player2Score: 0,
      player1Answers: [],
      player2Answers: [],
      matchStartTime: new Date(),
    });

    await room.save();

    return { roomId, isAI: true };
  }

  /**
   * 手動觸發超時處理（用於外部調用）
   */
  async triggerTimeout(userId: string): Promise<{ roomId: string; isAI: boolean } | null> {
    const player = this.getPlayer(userId);
    if (!player) {
      return null;
    }
    return this.handleTimeout(player);
  }

  /**
   * 獲取隊列中的玩家
   */
  getPlayer(userId: string): QueuedPlayer | undefined {
    return this.queue.find((p) => p.userId === userId);
  }

  /**
   * 獲取隊列長度
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// 單例模式
export const matchQueue = new MatchQueue();

