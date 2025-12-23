import { calculateScore } from './game-scoring';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

/**
 * 根據玩家排位確定AI難度
 */
export function getAIDifficultyByRank(rank: string): AIDifficulty {
  const rankLevels: Record<string, AIDifficulty> = {
    bronze: 'easy',
    silver: 'easy',
    gold: 'medium',
    platinum: 'medium',
    diamond: 'hard',
    master: 'hard',
  };
  return rankLevels[rank] || 'medium';
}

/**
 * AI答題準確率
 */
const ACCURACY_RATES: Record<AIDifficulty, { min: number; max: number }> = {
  easy: { min: 0.6, max: 0.7 },
  medium: { min: 0.7, max: 0.8 },
  hard: { min: 0.8, max: 0.9 },
};

/**
 * AI答題時間範圍（秒）
 */
const ANSWER_TIME_RANGES: Record<AIDifficulty, { min: number; max: number }> = {
  easy: { min: 3, max: 8 },
  medium: { min: 2, max: 6 },
  hard: { min: 2, max: 5 },
};

/**
 * 模擬AI答題
 * @param question 題目
 * @param difficulty AI難度
 * @param totalTime 總答題時間（秒）
 * @returns 答題結果
 */
export function simulateAIAnswer(
  question: Question,
  difficulty: AIDifficulty,
  totalTime: number
): {
  answer: number;
  answerTime: number;
  isCorrect: boolean;
  score: number;
} {
  const accuracy = ACCURACY_RATES[difficulty];
  const timeRange = ANSWER_TIME_RANGES[difficulty];

  // 隨機決定是否答對（根據準確率）
  const random = Math.random();
  const accuracyRate = accuracy.min + Math.random() * (accuracy.max - accuracy.min);
  const isCorrect = random < accuracyRate;

  // 隨機答題時間
  const answerTime = Math.min(
    timeRange.min + Math.random() * (timeRange.max - timeRange.min),
    totalTime
  );

  let answer: number;
  if (isCorrect) {
    // 答對：選擇正確答案
    answer = question.correctAnswer;
  } else {
    // 答錯：隨機選擇錯誤答案
    const wrongAnswers = question.options
      .map((_, index) => index)
      .filter((index) => index !== question.correctAnswer);
    answer = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
  }

  // 計算分數
  const score = calculateScore(answerTime, totalTime, isCorrect);

  return {
    answer,
    answerTime,
    isCorrect,
    score,
  };
}

/**
 * 獲取AI答題延遲（用於模擬真實答題時間）
 */
export function getAIAnswerDelay(difficulty: AIDifficulty): number {
  const timeRange = ANSWER_TIME_RANGES[difficulty];
  return (timeRange.min + Math.random() * (timeRange.max - timeRange.min)) * 1000; // 轉換為毫秒
}

