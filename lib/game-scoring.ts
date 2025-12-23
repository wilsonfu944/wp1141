/**
 * 速度加權評分系統
 * 第1秒答對: 1000分
 * 第9秒答對: 200分
 * 答錯: 0分
 */

export interface ScoreResult {
  score: number;
  isCorrect: boolean;
  answerTime: number;
}

/**
 * 計算答題分數
 * @param answerTime 答題時間（秒）
 * @param totalTime 總時間（秒，通常為10-15秒）
 * @param isCorrect 是否答對
 * @returns 分數
 */
export function calculateScore(
  answerTime: number,
  totalTime: number,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0;

  const timeRatio = answerTime / totalTime; // 0-1
  // 線性插值：第1秒(0.1) = 1000分, 第9秒(0.9) = 200分
  const baseScore = 100;
  const speedBonus = 900 * (1 - timeRatio);
  return Math.round(baseScore + speedBonus);
}

/**
 * 計算雙殺額外分數
 * 當雙方都答對時，速度快的一方獲得額外分數
 * @param player1Time 玩家1答題時間
 * @param player2Time 玩家2答題時間
 * @param player1Correct 玩家1是否答對
 * @param player2Correct 玩家2是否答對
 * @returns 額外分數（給速度快的玩家）
 */
export function calculateDoubleKillBonus(
  player1Time: number,
  player2Time: number,
  player1Correct: boolean,
  player2Correct: boolean
): { player1Bonus: number; player2Bonus: number } {
  if (!player1Correct || !player2Correct) {
    return { player1Bonus: 0, player2Bonus: 0 };
  }

  // 雙方都答對，速度快的一方獲得50分額外獎勵
  if (player1Time < player2Time) {
    return { player1Bonus: 50, player2Bonus: 0 };
  } else if (player2Time < player1Time) {
    return { player1Bonus: 0, player2Bonus: 50 };
  } else {
    // 同時答對，平分獎勵
    return { player1Bonus: 25, player2Bonus: 25 };
  }
}

/**
 * 計算完整答題結果（包含基礎分數和雙殺獎勵）
 */
export function calculateFullScore(
  answerTime: number,
  totalTime: number,
  isCorrect: boolean,
  opponentAnswerTime: number | null,
  opponentCorrect: boolean | null
): ScoreResult {
  const baseScore = calculateScore(answerTime, totalTime, isCorrect);

  let bonus = 0;
  if (
    isCorrect &&
    opponentCorrect !== null &&
    opponentCorrect &&
    opponentAnswerTime !== null
  ) {
    const doubleKill = calculateDoubleKillBonus(
      answerTime,
      opponentAnswerTime,
      isCorrect,
      opponentCorrect
    );
    bonus = answerTime < opponentAnswerTime ? doubleKill.player1Bonus : doubleKill.player2Bonus;
  }

  return {
    score: baseScore + bonus,
    isCorrect,
    answerTime,
  };
}

