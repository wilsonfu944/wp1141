import { Server as SocketIOServer } from 'socket.io';
import connectDB from './mongodb';
import GameRoom from '@/models/GameRoom';
import Quiz from '@/models/Quiz';
import { matchQueue } from './match-queue';
import { calculateFullScore, calculateScore } from './game-scoring';

interface SocketUser {
  userId: string;
  socketId: string;
  currentRoomId?: string;
}

const connectedUsers = new Map<string, SocketUser>();
const matchTimeouts = new Map<string, NodeJS.Timeout>(); // 保存匹配超时引用

export default function setupSocketHandler(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // 用戶認證（從query或auth中獲取userId）
    socket.on('authenticate', async (data: { userId: string }) => {
      const { userId } = data;
      connectedUsers.set(socket.id, {
        userId,
        socketId: socket.id,
      });
      socket.emit('authenticated', { success: true });
    });

    // 請求配對
    socket.on('match-request', async () => {
      console.log(`[Match] Received match-request from socket ${socket.id}`);
      const user = connectedUsers.get(socket.id);
      if (!user) {
        console.error(`[Match] User not found for socket ${socket.id}`);
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      console.log(`[Match] Processing match request for user ${user.userId}`);
      await connectDB();

      // 檢查是否已在房間中
      const existingRoom = await GameRoom.findOne({
        $or: [{ player1: user.userId }, { player2: user.userId }],
        status: { $in: ['matching', 'playing'] },
      });

      if (existingRoom) {
        socket.emit('matched', {
          roomId: existingRoom.roomId,
          isAI: existingRoom.isAI,
        });
        return;
      }

      // 檢查是否已在隊列中
      const existingPlayer = matchQueue.getPlayer(user.userId);
      if (existingPlayer) {
        // 已在隊列中，只更新 socketId
      matchQueue.addPlayer(user.userId, socket.id);
        socket.emit('matching', { message: '尋找對手中...' });
        return;
      }

      // 直接創建AI對手房間，不等待匹配
      console.log(`[Match] Creating AI opponent room immediately for user ${user.userId}`);
      
      // 從隊列中移除並清除超時（如果存在）
      matchQueue.removePlayer(user.userId);
      const existingTimeout = matchTimeouts.get(user.userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        matchTimeouts.delete(user.userId);
      }

      await connectDB();

      // 創建隨機對手房間
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const room = new GameRoom({
          roomId,
        player1: user.userId,
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

      // 更新用戶的房間ID
      user.currentRoomId = roomId;
      
      console.log(`[Match] Room created: ${roomId}, emitting matched event to socket ${socket.id}`);
      // 立即發送匹配成功事件
      socket.emit('matched', { roomId, isAI: true });
      console.log(`[Match] Matched event emitted to socket ${socket.id}`);
    });

    // 創建房間
    socket.on('create-room', async () => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      await connectDB();

      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = new GameRoom({
        roomId,
        player1: user.userId,
        player2: null,
        isAI: false,
        status: 'waiting',
        questions: [],
        currentQuestion: 0,
        player1Score: 0,
        player2Score: 0,
        player1Answers: [],
        player2Answers: [],
        matchStartTime: new Date(),
      });

      await room.save();
      user.currentRoomId = roomId;

      socket.emit('room-created', { roomId });
    });

    // 加入房間
    socket.on('join-room', async (data: { roomId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      await connectDB();

      const room = await GameRoom.findOne({ roomId: data.roomId });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.player2) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      room.player2 = user.userId;
      room.status = 'matching';
      await room.save();
      user.currentRoomId = data.roomId;

      // 通知兩個玩家
      const player1Socket = Array.from(connectedUsers.entries()).find(
        ([_, u]) => u.userId === room.player1.toString()
      )?.[0];

      if (player1Socket) {
        io.to(player1Socket).emit('player-joined', { roomId: data.roomId });
      }
      socket.emit('room-joined', { roomId: data.roomId });
    });

    // 準備開始遊戲
    socket.on('ready', async (data: { roomId: string }) => {
      console.log(`[Ready] Received ready event for room ${data.roomId} from socket ${socket.id}`);
      const user = connectedUsers.get(socket.id);
      if (!user) {
        console.log(`[Ready] User not authenticated for socket ${socket.id}`);
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      await connectDB();

      const room = await GameRoom.findOne({ roomId: data.roomId });

      if (!room) {
        console.log(`[Ready] Room ${data.roomId} not found`);
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // 檢查是否兩個玩家都準備好了（或AI對戰）
      const isPlayer1 = room.player1.toString() === user.userId;
      const isPlayer2 = room.player2 && room.player2.toString() === user.userId;

      console.log(`[Ready] Room ${data.roomId}, isAI: ${room.isAI}, isPlayer1: ${isPlayer1}, isPlayer2: ${isPlayer2}, questions: ${room.questions.length}`);

      if (!isPlayer1 && !isPlayer2) {
        console.log(`[Ready] User ${user.userId} not in room ${data.roomId}`);
        socket.emit('error', { message: 'Not in this room' });
        return;
      }

      // 獲取題目（從Quiz中隨機選擇5-10題）
      if (room.questions.length === 0) {
        const quizzes = await Quiz.find().limit(10);
        const allQuestions: any[] = [];
        quizzes.forEach((quiz) => {
          quiz.questions.forEach((q: any) => {
            allQuestions.push(q);
          });
        });

        // 隨機選擇5-10題
        const questionCount = Math.min(10, Math.max(5, allQuestions.length));
        const selectedQuestions = allQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);

        room.questions = selectedQuestions;
        room.status = 'playing';
        await room.save();
      }

      // 如果題目已準備好，開始遊戲
      if (room.questions.length > 0) {
        const firstQuestion = room.questions[0];
        const questionData = {
          questionIndex: 0,
          question: firstQuestion.question,
          options: firstQuestion.options,
          totalQuestions: room.questions.length,
          timeLimit: 15, // 15秒
        };

        // 如果是隨機對手，立即開始遊戲（只需要 player1 ready）
        if (room.isAI && isPlayer1) {
          console.log(`[Ready] AI room ready, starting game for player1 ${user.userId}, sending question`);
          socket.emit('question', questionData);
          console.log(`[Ready] Question sent to player1 ${user.userId}`);

          // 隨機對手自動答題（簡單隨機邏輯）
          // 簡單隨機邏輯：70%機率答對，答題時間2-6秒
          const isCorrect = Math.random() < 0.7;
          const answerTime = 2 + Math.random() * 4; // 2-6秒
          
          let answer: number;
          if (isCorrect) {
            answer = firstQuestion.correctAnswer;
          } else {
            // 隨機選擇錯誤答案
            const wrongAnswers = firstQuestion.options
              .map((_, index) => index)
              .filter((index) => index !== firstQuestion.correctAnswer);
            answer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
          }

          const delay = answerTime * 1000; // 轉換為毫秒

          setTimeout(async () => {
            const score = calculateScore(answerTime, 15, isCorrect);
            room.player2Answers.push({
              questionIndex: 0,
              answer: answer,
              isCorrect: isCorrect,
              answerTime: answerTime,
              score: score,
            });
            room.player2Score += score;
            await room.save();

            const player1Socket = Array.from(connectedUsers.entries()).find(
              ([_, u]) => u.userId === room.player1.toString()
            )?.[0];

            if (player1Socket) {
              io.to(player1Socket).emit('opponent-answered', {
                questionIndex: 0,
                score: score,
              });
            }
          }, delay);
        } 
        // 如果是真人對戰，需要兩個玩家都準備好
        else if (room.player2 && room.player2 !== 'AI' && room.player2 !== 'RANDOM') {
          const player1Socket = Array.from(connectedUsers.entries()).find(
            ([_, u]) => u.userId === room.player1.toString()
          )?.[0];
          const player2Socket = Array.from(connectedUsers.entries()).find(
            ([_, u]) => u.userId === room.player2?.toString()
          )?.[0];

          if (player1Socket && player2Socket) {
            io.to(player1Socket).emit('question', questionData);
            io.to(player2Socket).emit('question', questionData);
          }
        }
      }
    });

    // 提交答案
    socket.on('answer', async (data: { roomId: string; questionIndex: number; answer: number; answerTime: number }) => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      await connectDB();

      const room = await GameRoom.findOne({ roomId: data.roomId });

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const isPlayer1 = room.player1.toString() === user.userId;
      const isPlayer2 = room.player2 && room.player2.toString() === user.userId;

      if (!isPlayer1 && !isPlayer2) {
        socket.emit('error', { message: 'Not in this room' });
        return;
      }

      const question = room.questions[data.questionIndex];
      if (!question) {
        socket.emit('error', { message: 'Question not found' });
        return;
      }

      const isCorrect = data.answer === question.correctAnswer;
      const totalTime = 15; // 總時間15秒

      // 獲取對手答案（如果已答）
      const opponentAnswers = isPlayer1 ? room.player2Answers : room.player1Answers;
      const opponentAnswer = opponentAnswers.find((a) => a.questionIndex === data.questionIndex);

      // 計算分數
      const scoreResult = calculateFullScore(
        data.answerTime,
        totalTime,
        isCorrect,
        opponentAnswer?.answerTime || null,
        opponentAnswer?.isCorrect || null
      );

      // 保存答案
      const answerRecord = {
        questionIndex: data.questionIndex,
        answer: data.answer,
        isCorrect,
        answerTime: data.answerTime,
        score: scoreResult.score,
      };

      if (isPlayer1) {
        room.player1Answers.push(answerRecord);
        room.player1Score += scoreResult.score;
      } else {
        room.player2Answers.push(answerRecord);
        room.player2Score += scoreResult.score;
      }

      await room.save();

      // 通知對手
      const opponentSocket = isPlayer1
        ? room.isAI
          ? null
          : Array.from(connectedUsers.entries()).find(
              ([_, u]) => u.userId === room.player2?.toString()
            )?.[0]
        : Array.from(connectedUsers.entries()).find(
            ([_, u]) => u.userId === room.player1.toString()
          )?.[0];

      socket.emit('answer-result', {
        questionIndex: data.questionIndex,
        isCorrect,
        score: scoreResult.score,
        totalScore: isPlayer1 ? room.player1Score : room.player2Score,
        hasDoubleKill: opponentAnswer && opponentAnswer.isCorrect && isCorrect,
      });

      if (opponentSocket) {
        io.to(opponentSocket).emit('opponent-answered', {
          questionIndex: data.questionIndex,
          score: scoreResult.score,
        });
      }

      // 檢查是否所有題目都答完了
      const totalQuestions = room.questions.length;
      const player1Answered = room.player1Answers.length;
      const player2Answered = room.player2Answers.length;

      if (player1Answered >= totalQuestions && (room.isAI || player2Answered >= totalQuestions)) {
        // 遊戲結束
        room.status = 'finished';
        await room.save();

        const result = {
          roomId: data.roomId,
          player1Score: room.player1Score,
          player2Score: room.player2Score,
          isWin: isPlayer1 ? room.player1Score > room.player2Score : room.player2Score > room.player1Score,
          isDraw: room.player1Score === room.player2Score,
        };

        socket.emit('game-finished', result);
        if (opponentSocket) {
          io.to(opponentSocket).emit('game-finished', {
            ...result,
            isWin: !result.isWin && !result.isDraw,
          });
        }
      } else {
        // 發送下一題
        const nextQuestionIndex = Math.max(player1Answered, player2Answered);
        if (nextQuestionIndex < totalQuestions) {
          const nextQuestion = room.questions[nextQuestionIndex];
          const questionData = {
            questionIndex: nextQuestionIndex,
            question: nextQuestion.question,
            options: nextQuestion.options,
            totalQuestions,
            timeLimit: 15,
          };

          socket.emit('question', questionData);
          if (opponentSocket) {
            io.to(opponentSocket).emit('question', questionData);
          }

          // 隨機對手自動答題（簡單隨機邏輯）
          if (room.isAI && isPlayer1) {
            // 簡單隨機邏輯：70%機率答對，答題時間2-6秒
            const isCorrect = Math.random() < 0.7;
            const answerTime = 2 + Math.random() * 4; // 2-6秒
            
            let answer: number;
            if (isCorrect) {
              answer = nextQuestion.correctAnswer;
            } else {
              // 隨機選擇錯誤答案
              const wrongAnswers = nextQuestion.options
                .map((_, index) => index)
                .filter((index) => index !== nextQuestion.correctAnswer);
              answer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
            }

            const delay = answerTime * 1000; // 轉換為毫秒

            setTimeout(async () => {
              const score = calculateScore(answerTime, 15, isCorrect);
              room.player2Answers.push({
                questionIndex: nextQuestionIndex,
                answer: answer,
                isCorrect: isCorrect,
                answerTime: answerTime,
                score: score,
              });
              room.player2Score += score;
              await room.save();

              socket.emit('opponent-answered', {
                questionIndex: nextQuestionIndex,
                score: score,
              });
            }, delay);
          }
        }
      }
    });

    // 取消匹配
    socket.on('cancel-match', () => {
      const user = connectedUsers.get(socket.id);
      if (!user) {
        return;
      }

      // 從隊列中移除
      matchQueue.removePlayer(user.userId);

      // 清除超時
      const timeoutId = matchTimeouts.get(user.userId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        matchTimeouts.delete(user.userId);
      }
    });

    // 斷線處理
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        // 從隊列中移除
        matchQueue.removePlayer(user.userId);

        // 清除超時
        const timeoutId = matchTimeouts.get(user.userId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          matchTimeouts.delete(user.userId);
        }

        connectedUsers.delete(socket.id);
      }
      console.log('Client disconnected:', socket.id);
    });
  });
}

