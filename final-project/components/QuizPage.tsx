'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import GameMatching from './GameMatching';
import PvPQuizPage from './PvPQuizPage';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  difficulty: string;
}

type GameMode = 'select' | 'single' | 'pvp' | 'matching';

export default function QuizPage() {
  const { data: session } = useSession();
  const [gameMode, setGameMode] = useState<GameMode>('select');
  const [pvpRoomId, setPvpRoomId] = useState<string | null>(null);
  const [pvpIsAI, setPvpIsAI] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      const res = await fetch('/api/quiz');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch quizzes:', res.statusText);
        setQuizzes([]);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setQuizzes([]);
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer(null);
  };

  const handleAnswer = (answerIndex: number) => {
    if (answered || !selectedQuiz) return;
    setSelectedAnswer(answerIndex);
    setAnswered(true);

    if (answerIndex === selectedQuiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    setSelectedAnswer(null);
    setGameMode('single');
  };

  // 對戰模式
  if (gameMode === 'matching') {
    return (
      <GameMatching
        onMatched={(roomId, isAI) => {
          setPvpRoomId(roomId);
          setPvpIsAI(isAI);
          setGameMode('pvp');
        }}
        onCancel={() => setGameMode('select')}
      />
    );
  }

  if (gameMode === 'pvp' && pvpRoomId) {
    return (
      <PvPQuizPage
        roomId={pvpRoomId}
        isAI={pvpIsAI}
        onRestart={() => {
          setPvpRoomId(null);
          setPvpIsAI(false);
          setGameMode('matching');
        }}
        onBackToMenu={() => {
          setPvpRoomId(null);
          setPvpIsAI(false);
          setGameMode('select');
        }}
      />
    );
  }

  // 模式選擇頁面
  if (gameMode === 'select') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <h1 className="text-3xl font-bold mb-2 text-pink-400 text-center">小遊戲</h1>
        <p className="text-gray-400 text-center mb-6 text-lg">知識王遊戲</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-card rounded-lg shadow-md p-8 border border-pink-500/20 hover:border-pink-500 transition-all hover:shadow-xl">
            <div className="text-4xl mb-4 text-center">📚</div>
            <h2 className="text-2xl font-bold mb-4 text-white text-center">單人練習模式</h2>
            <p className="text-gray-400 text-center mb-4">獨自練習，提升動漫知識</p>
            <div className="text-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[QuizPage] Starting single player mode');
                  setGameMode('single');
                }}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 w-full"
              >
                開始練習
              </button>
            </div>
          </div>
          <div className="bg-dark-card rounded-lg shadow-md p-8 border border-pink-500/20 hover:border-pink-500 transition-all hover:shadow-xl">
            <div className="text-4xl mb-4 text-center">⚔️</div>
            <h2 className="text-2xl font-bold mb-4 text-white text-center">1v1 實時對戰</h2>
            <p className="text-gray-400 text-center mb-4">與其他玩家或AI對戰，比拼速度與準確</p>
            <div className="text-center">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('[QuizPage] Starting matching mode');
                  setGameMode('matching');
                }}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 w-full"
              >
                開始對戰
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 單人模式：題目列表
  if (gameMode === 'single' && !selectedQuiz) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="flex items-center mb-6">
          <button
            onClick={() => {
              setGameMode('select');
              setSelectedQuiz(null);
            }}
            className="mr-4 text-pink-400 hover:text-pink-300"
          >
            ← 返回
          </button>
          <h1 className="text-3xl font-bold text-pink-400">單人練習模式</h1>
        </div>
        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-dark-card rounded-lg shadow-md p-6 border border-pink-500/20">
                <h2 className="text-xl font-bold mb-2 text-white">{quiz.title}</h2>
                <p className="text-gray-400 mb-4">{quiz.description}</p>
                <div className="mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      quiz.difficulty === 'easy'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : quiz.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {quiz.difficulty === 'easy'
                      ? '簡單'
                      : quiz.difficulty === 'medium'
                      ? '中等'
                      : '困難'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {quiz.questions.length} 道題目
                </p>
                <button
                  onClick={() => startQuiz(quiz)}
                  className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                >
                  開始挑戰
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>暫無題目，請稍後再試</p>
          </div>
        )}
      </div>
    );
  }

  if (showResult && selectedQuiz) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="bg-dark-card rounded-lg shadow-md p-8 text-center border border-pink-500/20">
          <h2 className="text-3xl font-bold mb-4 text-pink-400">挑戰完成！</h2>
          <div className="text-6xl font-bold text-pink-400 mb-4">
            {score}/{selectedQuiz.questions.length}
          </div>
          <div className="text-2xl mb-4 text-white">正確率: {percentage}%</div>
          <div className="mb-6">
            {percentage >= 80 ? (
              <p className="text-green-400 text-xl">🎉 太棒了！你是動漫知識王！</p>
            ) : percentage >= 60 ? (
              <p className="text-yellow-400 text-xl">👍 不錯的表現！繼續加油！</p>
            ) : (
              <p className="text-red-400 text-xl">💪 再試一次，你會做得更好！</p>
            )}
          </div>
          <button
            onClick={resetQuiz}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!selectedQuiz) {
    return null;
  }

  const question = selectedQuiz.questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="bg-dark-card rounded-lg shadow-md p-6 mb-4 border border-pink-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{selectedQuiz.title}</h2>
          <div className="text-sm text-gray-400">
            題目 {currentQuestion + 1} / {selectedQuiz.questions.length}
          </div>
        </div>
        <div className="w-full bg-dark-surface rounded-full h-2 mb-6">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%`,
            }}
          />
        </div>
        <h3 className="text-2xl font-bold mb-6 text-white">{question.question}</h3>
        <div className="space-y-3">
          {question.options.map((option, index) => {
            let buttonClass = 'w-full text-left p-4 rounded-lg border-2 transition-all text-white';
            if (answered) {
              if (index === question.correctAnswer) {
                buttonClass += ' bg-green-500/20 border-green-500 text-green-300';
              } else if (index === selectedAnswer && index !== question.correctAnswer) {
                buttonClass += ' bg-red-500/20 border-red-500 text-red-300';
              } else {
                buttonClass += ' bg-dark-surface border-pink-500/30';
              }
            } else {
              buttonClass +=
                selectedAnswer === index
                  ? ' bg-pink-500/20 border-pink-500'
                  : ' bg-dark-surface border-pink-500/30 hover:border-pink-400';
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={buttonClass}
                disabled={answered}
              >
                {option}
              </button>
            );
          })}
        </div>
        {answered && question.explanation && (
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <p className="text-blue-300">{question.explanation}</p>
          </div>
        )}
        {answered && (
          <button
            onClick={nextQuestion}
            className="mt-6 w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
          >
            {currentQuestion < selectedQuiz.questions.length - 1 ? '下一題' : '查看結果'}
          </button>
        )}
      </div>
    </div>
  );
}
