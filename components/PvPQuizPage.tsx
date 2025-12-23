'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface GameState {
  questions: Question[];
  currentQuestionIndex: number;
  player1Score: number;
  player2Score: number;
  player1Answers: number[];
  player2Answers: number[];
  timeLeft: number;
  answered: boolean;
  selectedAnswer: number | null;
  gameFinished: boolean;
  aiAnswerTime: number | null; // AI答题时间
  player2Answered: boolean; // 对手是否已回答
  player2Answer: number | null; // 对手的答案
  player2IsCorrect: boolean | null; // 对手是否正确
}

interface PvPQuizPageProps {
  roomId: string;
  isAI: boolean;
  onRestart?: () => void;
  onBackToMenu?: () => void;
}

export default function PvPQuizPage({ roomId, isAI, onRestart, onBackToMenu }: PvPQuizPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    player1Score: 0,
    player2Score: 0,
    player1Answers: [],
    player2Answers: [],
    timeLeft: 10,
    answered: false,
    selectedAnswer: null,
    gameFinished: false,
    aiAnswerTime: null,
    player2Answered: false,
    player2Answer: null,
    player2IsCorrect: null,
  });
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(Date.now());
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取题目
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch('/api/quiz');
        if (res.ok) {
          const quizzes = await res.json();
          if (Array.isArray(quizzes) && quizzes.length > 0) {
            // 收集所有题目
            const allQuestions: Question[] = [];
            quizzes.forEach((quiz: any) => {
              if (quiz.questions && Array.isArray(quiz.questions)) {
                quiz.questions.forEach((q: any) => {
                  allQuestions.push({
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                  });
                });
              }
            });

            // 随机选择5-10题
            const questionCount = Math.min(10, Math.max(5, allQuestions.length));
            const selectedQuestions = allQuestions
              .sort(() => Math.random() - 0.5)
              .slice(0, questionCount);

            setGameState((prev) => ({
              ...prev,
              questions: selectedQuestions,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // 同步房间状态（非AI模式）
  useEffect(() => {
    if (isAI || !roomId) return;

    const syncInterval = setInterval(() => {
      const roomKey = `room_game_${roomId}`;
      const stored = localStorage.getItem(roomKey);
      if (stored) {
        try {
          const roomData = JSON.parse(stored);
          if (roomData.currentQuestion === gameState.currentQuestionIndex) {
            // 检查对手是否已回答
            if (roomData.player2Answer !== undefined && roomData.player2Answer !== null) {
              const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
              const isCorrect = roomData.player2Answer === currentQuestion.correctAnswer;
              
              setGameState((prev) => ({
                ...prev,
                player2Answered: true,
                player2Answer: roomData.player2Answer,
                player2IsCorrect: isCorrect,
                player2Score: roomData.player2Score || prev.player2Score,
              }));
            }
          }
        } catch (error) {
          console.error('Failed to parse room data:', error);
        }
      }
    }, 500);

    return () => clearInterval(syncInterval);
  }, [roomId, isAI, gameState.currentQuestionIndex, gameState.questions]);

  // 开始新题目
  useEffect(() => {
    if (gameState.questions.length === 0 || gameState.gameFinished) return;
    if (gameState.currentQuestionIndex >= gameState.questions.length) {
      // 游戏结束
      setGameState((prev) => ({
        ...prev,
        gameFinished: true,
      }));
      return;
    }

    // 重置状态
    setGameState((prev) => ({
      ...prev,
      timeLeft: 10,
      answered: false,
      selectedAnswer: null,
      aiAnswerTime: null,
      player2Answered: false,
      player2Answer: null,
      player2IsCorrect: null,
    }));
    questionStartTime.current = Date.now();
    
    // 如果是非AI模式，初始化房间数据
    if (!isAI && roomId) {
      const roomKey = `room_game_${roomId}`;
      const roomData = {
        currentQuestion: gameState.currentQuestionIndex,
        player1Answer: null,
        player2Answer: null,
        player1Score: gameState.player1Score,
        player2Score: gameState.player2Score,
      };
      localStorage.setItem(roomKey, JSON.stringify(roomData));
    }

    // 开始倒计时
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          // 时间到，自动提交
          if (!prev.answered) {
            handleAnswer(-1, true);
          }
          // 如果AI还没答题，强制让AI答题
          if (isAI && !prev.player2Answered) {
            const currentQuestion = gameState.questions[prev.currentQuestionIndex];
            if (currentQuestion) {
              const aiIsCorrect = Math.random() < 0.5;
              const aiAnswer = aiIsCorrect 
                ? currentQuestion.correctAnswer 
                : Math.floor(Math.random() * currentQuestion.options.length);
              const score = calculateScore(10, 10, aiIsCorrect);
              
              const newState = {
                ...prev,
                timeLeft: 0,
                player2Score: prev.player2Score + score,
                player2Answers: [...prev.player2Answers, aiAnswer],
                aiAnswerTime: 10,
                player2Answered: true,
                player2Answer: aiAnswer,
                player2IsCorrect: aiIsCorrect,
              };
              
              // 双方都答完了，自动进入下一题（延迟1.5秒显示答案）
              if (newState.answered && newState.player2Answered) {
                if (autoNextTimerRef.current) {
                  clearTimeout(autoNextTimerRef.current);
                }
                autoNextTimerRef.current = setTimeout(() => {
                  nextQuestion();
                }, 1500);
              }
              
              return newState;
            }
          }
          
          // 如果双方都答完了，自动进入下一题（延迟1.5秒显示答案）
          if (prev.answered && (isAI ? prev.player2Answered : prev.player2Answered)) {
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current);
            }
            autoNextTimerRef.current = setTimeout(() => {
              nextQuestion();
            }, 1500);
          }
          
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    // 對手答題（如果是AI模式）
    if (isAI) {
      // AI在1-5秒后答题（更快），60-80%正确率
      const aiAnswerTime = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
      const aiCorrectRate = Math.random() * 0.2 + 0.6; // 60-80%之间随机
      const aiIsCorrect = Math.random() < aiCorrectRate;
      
      aiTimerRef.current = setTimeout(() => {
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) return;
        
        const aiAnswer = aiIsCorrect 
          ? currentQuestion.correctAnswer 
          : Math.floor(Math.random() * currentQuestion.options.length);
        
        const answerTime = aiAnswerTime / 1000; // 转换为秒
        const score = calculateScore(answerTime, 10, aiIsCorrect);
        
        setGameState((prev) => {
          // 确保还在同一题
          if (prev.currentQuestionIndex !== gameState.currentQuestionIndex) {
            return prev;
          }
          const newState = {
            ...prev,
            player2Score: prev.player2Score + score,
            player2Answers: [...prev.player2Answers, aiAnswer],
            aiAnswerTime: answerTime,
            player2Answered: true,
            player2Answer: aiAnswer,
            player2IsCorrect: aiIsCorrect,
          };
          
          // 如果双方都答完了，自动进入下一题（延迟1.5秒显示答案）
          if (newState.answered && newState.player2Answered) {
            if (autoNextTimerRef.current) {
              clearTimeout(autoNextTimerRef.current);
            }
            autoNextTimerRef.current = setTimeout(() => {
              nextQuestion();
            }, 1500);
          }
          
          return newState;
        });
      }, aiAnswerTime);
      
      // 10秒倒计时结束时，如果AI还没答题，强制让AI答题
      const forceAITimer = setTimeout(() => {
        const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
        if (!currentQuestion) return;
        
        setGameState((prev) => {
          // 如果AI已经答题了，就不需要再答
          if (prev.player2Answered) {
            return prev;
          }
          // 确保还在同一题
          if (prev.currentQuestionIndex !== gameState.currentQuestionIndex) {
            return prev;
          }
          
          // 强制答题，随机选择（50%正确率）
          const aiIsCorrect = Math.random() < 0.5;
          const aiAnswer = aiIsCorrect 
            ? currentQuestion.correctAnswer 
            : Math.floor(Math.random() * currentQuestion.options.length);
          
          const answerTime = 10; // 10秒
          const score = calculateScore(answerTime, 10, aiIsCorrect);
          
          return {
            ...prev,
            player2Score: prev.player2Score + score,
            player2Answers: [...prev.player2Answers, aiAnswer],
            aiAnswerTime: answerTime,
            player2Answered: true,
            player2Answer: aiAnswer,
            player2IsCorrect: aiIsCorrect,
          };
        });
      }, 10000); // 10秒后
      
      // 清理强制答题定时器
      return () => {
        if (aiTimerRef.current) {
          clearTimeout(aiTimerRef.current);
        }
        clearTimeout(forceAITimer);
      };
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, [gameState.currentQuestionIndex, gameState.questions.length, isAI, gameState.questions]);

  const calculateScore = (answerTime: number, timeLimit: number, isCorrect: boolean): number => {
    if (!isCorrect) return 0;
    const timeBonus = Math.max(0, timeLimit - answerTime);
    return Math.floor(100 + timeBonus * 10);
  };

  const handleAnswer = (answerIndex: number, isTimeout: boolean = false) => {
    if (gameState.answered || gameState.gameFinished) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const answerTime = (Date.now() - questionStartTime.current) / 1000;
    const score = calculateScore(answerTime, 10, isCorrect);

    setGameState((prev) => {
      const newState = {
        ...prev,
        answered: true,
        selectedAnswer: answerIndex,
        player1Score: prev.player1Score + score,
        player1Answers: [...prev.player1Answers, answerIndex],
      };

      // 如果是非AI模式，保存到localStorage
      if (!isAI && roomId) {
        const roomKey = `room_game_${roomId}`;
        const roomData = {
          currentQuestion: prev.currentQuestionIndex,
          player1Answer: answerIndex,
          player2Answer: prev.player2Answer,
          player1Score: newState.player1Score,
          player2Score: prev.player2Score,
        };
        localStorage.setItem(roomKey, JSON.stringify(roomData));
      }

      // 如果双方都答完了（AI模式），自动进入下一题（延迟1.5秒显示答案）
      if (isAI && newState.answered && prev.player2Answered) {
        if (autoNextTimerRef.current) {
          clearTimeout(autoNextTimerRef.current);
        }
        autoNextTimerRef.current = setTimeout(() => {
          nextQuestion();
        }, 1500);
      }

      return newState;
    });
  };

  const nextQuestion = () => {
    // 检查双方是否都答完了（AI模式或非AI模式都需要）
    const bothAnswered = gameState.answered && (isAI ? gameState.player2Answered : gameState.player2Answered);
    
    if (!bothAnswered) {
      return; // 双方还没答完，不能下一题
    }

    // 清除自动进入下一题的定时器
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      setGameState((prev) => ({
        ...prev,
        gameFinished: true,
      }));
    }
  };

  // 监听双方答题状态，自动进入下一题
  useEffect(() => {
    if (gameState.gameFinished || gameState.questions.length === 0) return;
    
    const bothAnswered = gameState.answered && (isAI ? gameState.player2Answered : gameState.player2Answered);
    
    if (bothAnswered && !gameState.gameFinished) {
      // 清除之前的定时器
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
        autoNextTimerRef.current = null;
      }
      
      // 延迟1.5秒后自动进入下一题
      autoNextTimerRef.current = setTimeout(() => {
        setGameState((prev) => {
          const bothAnsweredNow = prev.answered && (isAI ? prev.player2Answered : prev.player2Answered);
          if (!bothAnsweredNow || prev.gameFinished) {
            return prev;
          }
          
          if (prev.currentQuestionIndex < prev.questions.length - 1) {
            return {
              ...prev,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
            };
          } else {
            return {
              ...prev,
              gameFinished: true,
            };
          }
        });
      }, 1500);
      
      // 备用机制：如果3秒后还没进入下一题，强制进入
      const forceNextTimer = setTimeout(() => {
        setGameState((prev) => {
          if (prev.gameFinished) return prev;
          
          if (prev.currentQuestionIndex < prev.questions.length - 1) {
            return {
              ...prev,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
            };
          } else {
            return {
              ...prev,
              gameFinished: true,
            };
          }
        });
      }, 3000);
      
      return () => {
        if (autoNextTimerRef.current) {
          clearTimeout(autoNextTimerRef.current);
          autoNextTimerRef.current = null;
        }
        clearTimeout(forceNextTimer);
      };
    }
  }, [gameState.answered, gameState.player2Answered, gameState.currentQuestionIndex, gameState.gameFinished, gameState.questions.length, isAI]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="text-center text-pink-400">載入題目中...</div>
      </div>
    );
  }

  if (gameState.questions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="text-center text-gray-400">沒有可用的題目</div>
        <button
          onClick={() => router.push('/quiz')}
          className="text-pink-400 hover:underline"
        >
          返回
        </button>
      </div>
    );
  }

  if (gameState.gameFinished) {
    const isWin = gameState.player1Score > gameState.player2Score;
    const isDraw = gameState.player1Score === gameState.player2Score;

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="bg-dark-card rounded-lg shadow-md p-8 text-center border border-pink-500/20">
          <h2 className="text-3xl font-bold mb-6 text-pink-400">遊戲結束</h2>
          <div className="space-y-4 mb-6">
            <div className="text-2xl">
              <span className="text-white">你的分數：</span>
              <span className="text-pink-400 font-bold ml-2">{gameState.player1Score}</span>
            </div>
            <div className="text-2xl">
              <span className="text-white">對手分數：</span>
              <span className="text-pink-400 font-bold ml-2">{gameState.player2Score}</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-6">
            {isWin ? (
              <span className="text-green-400">🎉 你贏了！</span>
            ) : isDraw ? (
              <span className="text-yellow-400">🤝 平手！</span>
            ) : (
              <span className="text-red-400">😢 你輸了</span>
            )}
          </div>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 重置游戏状态
                setGameState({
                  questions: [],
                  currentQuestionIndex: 0,
                  player1Score: 0,
                  player2Score: 0,
                  player1Answers: [],
                  player2Answers: [],
                  timeLeft: 10,
                  answered: false,
                  selectedAnswer: null,
                  gameFinished: false,
                  aiAnswerTime: null,
                  player2Answered: false,
                  player2Answer: null,
                  player2IsCorrect: null,
                });
                // 调用回调函数重新开始匹配
                if (onRestart) {
                  onRestart();
                } else {
                  // 如果没有回调，使用 router
                  router.push('/quiz');
                }
              }}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer font-semibold"
            >
              再玩一場
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // 调用回调函数回到菜单
                if (onBackToMenu) {
                  onBackToMenu();
                } else {
                  // 如果没有回调，使用 router
                  router.push('/quiz');
                }
              }}
              className="bg-dark-surface text-white px-6 py-2 rounded-lg hover:bg-dark-card border border-pink-500/30 transition-colors cursor-pointer font-semibold"
            >
              回到小遊戲
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const showAnswer = gameState.answered || gameState.timeLeft === 0;
  const bothAnswered = gameState.answered && (isAI ? gameState.player2Answered : gameState.player2Answered);
  
  // 获取对手答题状态显示
  const getOpponentStatus = () => {
    if (!gameState.player2Answered) {
      return { text: '等待答題中...', color: 'text-gray-400', icon: '⏳' };
    }
    if (gameState.player2IsCorrect) {
      return { text: '答題正確 ✓', color: 'text-green-400', icon: '✓' };
    }
    return { text: '答題錯誤 ✗', color: 'text-red-400', icon: '✗' };
  };
  
  const opponentStatus = getOpponentStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="bg-dark-card rounded-lg shadow-md p-8 border border-pink-500/20">
        {/* 分数显示 */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">你的分數</div>
            <div className="text-3xl font-bold text-pink-400">{gameState.player1Score}</div>
          </div>
          <div className="text-gray-400">
            第 {gameState.currentQuestionIndex + 1} / {gameState.questions.length} 題
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">{isAI ? '對手' : '對手'}分數</div>
            <div className="text-3xl font-bold text-pink-400">{gameState.player2Score}</div>
            {/* 对手答题状态 */}
            {showAnswer && (
              <div className={`text-xs mt-1 ${opponentStatus.color}`}>
                {opponentStatus.icon} {opponentStatus.text}
              </div>
            )}
          </div>
        </div>

        {/* 题目 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">{currentQuestion.question}</h3>
            <div className="text-xl font-bold text-pink-400">{gameState.timeLeft}秒</div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = gameState.selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrect = showAnswer && isCorrect;
              const showWrong = showAnswer && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={gameState.answered || gameState.timeLeft === 0}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : showWrong
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : isSelected
                      ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                      : 'bg-dark-surface border-pink-500/30 text-white hover:border-pink-500'
                  } ${gameState.answered || gameState.timeLeft === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* 对手答题状态提示 */}
          {!gameState.player2Answered && (
            <div className="mt-4 text-center text-gray-400 text-sm">
              {isAI ? '對手' : '對手'}正在答題中...
            </div>
          )}
          {gameState.player2Answered && (
            <div className={`mt-4 text-center text-sm ${opponentStatus.color}`}>
              {opponentStatus.icon} {opponentStatus.text}
            </div>
          )}
        </div>

        {/* 显示答案和解释 */}
        {showAnswer && (
          <div className="text-center">
            {currentQuestion.explanation && (
              <div className="mb-4 p-4 bg-dark-surface rounded-lg text-gray-300">
                <strong>解釋：</strong> {currentQuestion.explanation}
              </div>
            )}
            {bothAnswered && (
              <div className="mb-4 text-gray-400 text-sm animate-pulse">
                準備進入下一題...
              </div>
            )}
            {!bothAnswered && (
              <div className="mb-4 text-gray-400 text-sm">
                等待{isAI ? '對手' : '對手'}答題...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
