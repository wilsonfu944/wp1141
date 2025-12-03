import React, { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';

// 定義座標介面
interface Position {
  x: number;
  y: number;
}

// 定義移動障礙物介面
interface MovingObstacle {
  x: number;
  y: number;
  dx: number; // x 方向移動速度
  dy: number; // y 方向移動速度
}

// 定義方向介面
interface Direction {
  x: number;
  y: number;
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  // 遊戲常數
  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;
  const GRID_WIDTH = CANVAS_SIZE / GRID_SIZE;
  const GRID_HEIGHT = CANVAS_SIZE / GRID_SIZE;
  
  // 遊戲狀態
  const [snake, setSnake] = useState<Position[]>([
    { x: 2, y: 2 }, // 蛇頭 - 使用安全位置
    { x: 1, y: 2 }, // 蛇身
    { x: 0, y: 2 }  // 蛇尾
  ]);
  const [foods, setFoods] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });
  const [gameRunning, setGameRunning] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [foodEaten, setFoodEaten] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [showLevelClear, setShowLevelClear] = useState(false);
  const [showYouWin, setShowYouWin] = useState(false);
  const [movingObstacles, setMovingObstacles] = useState<MovingObstacle[]>([]);

  // 關卡地圖設計
  const getLevelObstacles = useCallback((currentLevel: number): Position[] => {
    switch (currentLevel) {
      case 1:
        // Level 1: 空白場地（無障礙物）
        return [];
      
      case 2:
        // Level 2: 簡化迷宮場地（移除一半障礙物）
        const obstacles: Position[] = [];
        
        // 只保留上邊界和下邊界（移除左右邊界）
        for (let x = 2; x < GRID_WIDTH - 2; x++) {
          // 上邊界：在 x=10 留出口
          if (x !== 10) {
            obstacles.push({ x, y: 2 });
          }
          // 下邊界：在 x=10 留出口
          if (x !== 10) {
            obstacles.push({ x, y: GRID_HEIGHT - 3 });
          }
        }
        
        // 移除左右邊界，讓蛇可以自由進出
        
        return obstacles;
      
      case 3:
        // Level 3: 回字型迷宮場地
        const mazeObstacles: Position[] = [];
        
        // 上下邊界內側（留出口）
        for (let x = 2; x < GRID_WIDTH - 2; x++) {
          // 上邊界：在 x=10 留出口
          if (x !== 10) {
            mazeObstacles.push({ x, y: 2 });
          }
          // 下邊界：在 x=10 留出口
          if (x !== 10) {
            mazeObstacles.push({ x, y: GRID_HEIGHT - 3 });
          }
        }
        
        // 左右邊界內側（留出口）
        for (let y = 2; y < GRID_HEIGHT - 2; y++) {
          // 左邊界：在 y=10 留出口
          if (y !== 10) {
            mazeObstacles.push({ x: 2, y });
          }
          // 右邊界：在 y=10 留出口
          if (y !== 10) {
            mazeObstacles.push({ x: GRID_WIDTH - 3, y });
          }
        }
        
        // 移除中間長方形牆，讓蛇可以在中央自由移動
        
        return mazeObstacles;
      
      default:
        return [];
    }
  }, []);

  // 獲取安全的蛇初始位置
  const getSafeSnakePosition = useCallback((currentLevel: number): Position[] => {
    const obstacles = getLevelObstacles(currentLevel);
    
    // Level 2: 蛇生成在最中間
    if (currentLevel === 2) {
      const centerPosition = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      const isSafe = centerPosition.every(pos => 
        !obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y)
      );
      
      // 檢查蛇頭前方是否安全（向右移動）
      const head = centerPosition[0];
      const frontSafe = !obstacles.some(obstacle => obstacle.x === head.x + 1 && obstacle.y === head.y);
      
      // 檢查是否在邊界內
      const inBounds = centerPosition.every(pos => 
        pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT
      );
      
      // 檢查蛇頭前方是否在邊界內
      const frontInBounds = head.x + 1 >= 0 && head.x + 1 < GRID_WIDTH && head.y >= 0 && head.y < GRID_HEIGHT;
      
      if (isSafe && frontSafe && inBounds && frontInBounds) {
        return centerPosition;
      }
    }
    
    // Level 3: 蛇生成在迷宮的正中間
    if (currentLevel === 3) {
      const centerPosition = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
      const isSafe = centerPosition.every(pos => 
        !obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y)
      );
      
      // 檢查蛇頭前方是否安全（向右移動）
      const head = centerPosition[0];
      const frontSafe = !obstacles.some(obstacle => obstacle.x === head.x + 1 && obstacle.y === head.y);
      
      // 檢查是否在邊界內
      const inBounds = centerPosition.every(pos => 
        pos.x >= 0 && pos.x < GRID_WIDTH && pos.y >= 0 && pos.y < GRID_HEIGHT
      );
      
      // 檢查蛇頭前方是否在邊界內
      const frontInBounds = head.x + 1 >= 0 && head.x + 1 < GRID_WIDTH && head.y >= 0 && head.y < GRID_HEIGHT;
      
      if (isSafe && frontSafe && inBounds && frontInBounds) {
        return centerPosition;
      }
    }
    
    // 其他關卡：嘗試不同的位置，找到沒有障礙物的位置
    const possiblePositions = [
      // 左上角區域 - 向右移動
      [{ x: 2, y: 2 }, { x: 1, y: 2 }, { x: 0, y: 2 }],
      [{ x: 2, y: 3 }, { x: 1, y: 3 }, { x: 0, y: 3 }],
      // 右上角區域 - 向左移動
      [{ x: 17, y: 2 }, { x: 18, y: 2 }, { x: 19, y: 2 }],
      [{ x: 17, y: 3 }, { x: 18, y: 3 }, { x: 19, y: 3 }],
      // 左下角區域 - 向右移動
      [{ x: 2, y: 17 }, { x: 1, y: 17 }, { x: 0, y: 17 }],
      [{ x: 2, y: 16 }, { x: 1, y: 16 }, { x: 0, y: 16 }],
      // 右下角區域 - 向左移動
      [{ x: 17, y: 17 }, { x: 18, y: 17 }, { x: 19, y: 17 }],
      [{ x: 17, y: 16 }, { x: 18, y: 16 }, { x: 19, y: 16 }],
    ];
    
    // 找到第一個沒有障礙物且前方也安全的位置
    for (const position of possiblePositions) {
      const head = position[0];
      const isSafe = position.every(pos => 
        !obstacles.some(obstacle => obstacle.x === pos.x && obstacle.y === pos.y)
      );
      
      // 檢查蛇頭前方是否安全（根據位置決定方向）
      let frontSafe = true;
      if (head.x <= 2) {
        // 左側位置，檢查右前方
        frontSafe = !obstacles.some(obstacle => obstacle.x === head.x + 1 && obstacle.y === head.y);
      } else if (head.x >= 17) {
        // 右側位置，檢查左前方
        frontSafe = !obstacles.some(obstacle => obstacle.x === head.x - 1 && obstacle.y === head.y);
      }
      
      if (isSafe && frontSafe) {
        return position;
      }
    }
    
    // 如果都找不到安全位置，返回預設位置
    return [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ];
  }, [getLevelObstacles]);

  // Level 3 現在是迷宮場地，不需要移動障礙物

  // Level 3 現在是迷宮場地，不需要移動障礙物

  // Level 3 現在是迷宮場地，不需要移動障礙物碰撞檢測

  // 生成隨機食物位置（考慮移動障礙物）
  const generateFood = useCallback((existingFoods: Position[] = [], snakeBody: Position[] = [], obstacles: Position[] = [], movingObstaclesList: MovingObstacle[] = []): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      existingFoods.some(food => food.x === newFood.x && food.y === newFood.y) ||
      obstacles.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y) ||
      movingObstaclesList.some(obstacle => obstacle.x === newFood.x && obstacle.y === newFood.y)
    );
    
    return newFood;
  }, []);

  // 初始化食物（考慮移動障礙物）
  const initializeFoods = useCallback(() => {
    const foodCount = 3; // 固定3個食物
    const newFoods: Position[] = [];
    
    // 使用安全的蛇身位置和當前關卡障礙物來避免衝突
    const safeSnakePosition = getSafeSnakePosition(level);
    const obstacles = getLevelObstacles(level);
    
    // Level 3 時，食物生成不考慮移動障礙物，因為移動障礙物會移動
    // 食物生成後保持固定位置
    for (let i = 0; i < foodCount; i++) {
      newFoods.push(generateFood(newFoods, safeSnakePosition, obstacles, []));
    }
    
    setFoods(newFoods);
  }, [generateFood, getLevelObstacles, getSafeSnakePosition, level]);

  // 繪製遊戲畫面
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 繪製棋盤格背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製格線
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(canvas.width, i * GRID_SIZE);
      ctx.stroke();
    }

    // 繪製蛇
    snake.forEach((segment, index) => {
      const x = segment.x * GRID_SIZE;
      const y = segment.y * GRID_SIZE;
      
      // 創建漸層
      const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
      
      if (index === 0) {
        // 蛇頭用深綠色漸層
        gradient.addColorStop(0, '#2d5a27');
        gradient.addColorStop(1, '#1a3d1a');
      } else {
        // 蛇身用淺綠色漸層
        gradient.addColorStop(0, '#4a7c59');
        gradient.addColorStop(1, '#2d5a27');
      }
      
      ctx.fillStyle = gradient;
      
      // 繪製圓角方塊
      const radius = 4;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, radius);
      ctx.fill();
      
      // 添加陰影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fill();
      ctx.shadowColor = 'transparent';
    });

    // 繪製障礙物
    const obstacles = getLevelObstacles(level);
    obstacles.forEach(obstacle => {
      const obstacleX = obstacle.x * GRID_SIZE;
      const obstacleY = obstacle.y * GRID_SIZE;
      
      // 黑色方塊
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(obstacleX + 1, obstacleY + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      
      // 障礙物陰影
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillRect(obstacleX + 1, obstacleY + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      ctx.shadowColor = 'transparent';
    });

    // Level 3 現在是迷宮場地，不需要繪製移動障礙物

    // 繪製所有食物
    foods.forEach(food => {
      const foodX = food.x * GRID_SIZE;
      const foodY = food.y * GRID_SIZE;
      
      // 食物漸層
      const foodGradient = ctx.createRadialGradient(
        foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, 0,
        foodX + GRID_SIZE/2, foodY + GRID_SIZE/2, GRID_SIZE/2
      );
      foodGradient.addColorStop(0, '#ff6b6b');
      foodGradient.addColorStop(1, '#e74c3c');
      
      ctx.fillStyle = foodGradient;
      
      // 繪製圓角食物
      const foodRadius = 6;
      ctx.beginPath();
      ctx.roundRect(foodX + 2, foodY + 2, GRID_SIZE - 4, GRID_SIZE - 4, foodRadius);
      ctx.fill();
      
      // 食物陰影
      ctx.shadowColor = 'rgba(231, 76, 60, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fill();
      ctx.shadowColor = 'transparent';
    });
  }, [snake, foods, getLevelObstacles, level]);

  // 移動蛇
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      // 移動蛇頭
      head.x += direction.x;
      head.y += direction.y;
      
      // 檢查邊界碰撞
      if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        setGameRunning(false);
        return prevSnake;
      }
      
      // 檢查是否撞到自己
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameRunning(false);
        return prevSnake;
      }
      
      // 檢查是否撞到障礙物
      const obstacles = getLevelObstacles(level);
      if (obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y)) {
        setGameRunning(false);
        return prevSnake;
      }
      
      // Level 3 現在是迷宮場地，不需要移動障礙物碰撞檢測
      
      // 檢查是否吃到食物
      const eatenFoodIndex = foods.findIndex(food => food.x === head.x && food.y === head.y);
      
      if (eatenFoodIndex !== -1) {
        // 吃到食物：新頭加到前面，不移除尾巴
        const newSnake = [head, ...prevSnake];
        
        // 移除被吃掉的食物
        const newFoods = foods.filter((_, index) => index !== eatenFoodIndex);
        
        // 更新分數
        const newScore = score + 1;
        setScore(newScore);
        
        // 檢查是否過關（吃到 5 個食物）
        if (newScore >= 5) {
          if (level >= 3) {
            // 遊戲勝利
            setShowYouWin(true);
            setGameRunning(false);
          } else {
            // 過關
            setShowLevelClear(true);
            setGameRunning(false);
            
            // 2秒後進入下一關
            setTimeout(() => {
              const nextLevel = level + 1;
              setLevel(nextLevel);
              setScore(0);
              setShowLevelClear(false);
              setGameRunning(true);
              
              // 重置蛇的位置（根據關卡選擇安全位置）
              const safeSnakePosition = getSafeSnakePosition(nextLevel);
              setSnake(safeSnakePosition);
              
              // Level 3 現在是迷宮場地，不需要移動障礙物
              
              // 重新生成食物（使用新關卡，不考慮移動障礙物）
              const foodCount = 3;
              const newFoods: Position[] = [];
              const obstacles = getLevelObstacles(nextLevel);
              
              // Level 3 時，食物生成不考慮移動障礙物，因為移動障礙物會移動
              // 食物生成後保持固定位置
              for (let i = 0; i < foodCount; i++) {
                newFoods.push(generateFood(newFoods, safeSnakePosition, obstacles, []));
              }
              
              setFoods(newFoods);
            }, 2000);
          }
        } else {
          // 確保場上一直維持3個食物（不考慮移動障礙物）
          while (newFoods.length < 3) {
            const obstacles = getLevelObstacles(level);
            // Level 3 時，食物生成不考慮移動障礙物，因為移動障礙物會移動
            // 食物生成後保持固定位置
            const newFood = generateFood(newFoods, prevSnake, obstacles, []);
            newFoods.push(newFood);
          }
          
          setFoods(newFoods);
        }
        
        // 更新最高分
        const currentScore = newSnake.length - 3;
        if (currentScore > bestScore) {
          setBestScore(currentScore);
        }
        
        // 觸發食物被吃動畫
        setFoodEaten(true);
        setTimeout(() => setFoodEaten(false), 300);
        
        return newSnake;
      } else {
        // 沒吃到食物：新頭加到前面，移除尾巴
        const newSnake = [head, ...prevSnake.slice(0, -1)];
        return newSnake;
      }
    });
  }, [direction, foods, generateFood, bestScore, score, level, getLevelObstacles, initializeFoods]);

  // 遊戲迴圈 - 使用定時器控制移動速度
  useEffect(() => {
    if (!gameRunning) return;

    const gameTimer = setInterval(() => {
      moveSnake();
    }, 200); // 每 200ms 移動一次

    return () => {
      clearInterval(gameTimer);
    };
  }, [gameRunning, moveSnake]);

  // Level 3 現在是迷宮場地，不需要移動障礙物定時器

  // 繪製遊戲畫面
  useEffect(() => {
    if (!gameRunning) return;

    const drawLoop = () => {
      drawGame();
      gameLoopRef.current = requestAnimationFrame(drawLoop);
    };

    gameLoopRef.current = requestAnimationFrame(drawLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameRunning, drawGame]);

  // 鍵盤控制
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!gameRunning) return;

      // 防止頁面滾動
      event.preventDefault();

      switch (event.key) {
        case 'ArrowUp':
          // 只有在不向下移動時才能向上
          if (direction.y !== 1) {
            setDirection({ x: 0, y: -1 });
          }
          break;
        case 'ArrowDown':
          // 只有在不向上移動時才能向下
          if (direction.y !== -1) {
            setDirection({ x: 0, y: 1 });
          }
          break;
        case 'ArrowLeft':
          // 只有在不向右移動時才能向左
          if (direction.x !== 1) {
            setDirection({ x: -1, y: 0 });
          }
          break;
        case 'ArrowRight':
          // 只有在不向左移動時才能向右
          if (direction.x !== -1) {
            setDirection({ x: 1, y: 0 });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  // 重新開始遊戲
  const restartGame = () => {
    const safeSnakePosition = getSafeSnakePosition(1); // Level 1 的安全位置
    setSnake(safeSnakePosition);
    setLevel(1);
    setScore(0);
    setShowLevelClear(false);
    setShowYouWin(false);
    // Level 3 現在是迷宮場地，不需要移動障礙物
    initializeFoods();
    setDirection({ x: 1, y: 0 });
    setGameRunning(true);
    setFoodEaten(false);
  };

  // 初始化遊戲
  useEffect(() => {
    initializeFoods();
  }, [initializeFoods]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>貪食蛇遊戲</h1>
        <div className="game-container">
          {/* 分數卡片 */}
          <div className="score-card">
            <p>LEVEL: {level}</p>
            <p>SCORE: {score}/5</p>
            <p>BEST: {bestScore}</p>
          </div>
          
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="game-canvas"
          />
          {!gameRunning && !showLevelClear && !showYouWin && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Game Over</h2>
                <p>LEVEL: {level}</p>
                <p>SCORE: {score}/5</p>
                <button onClick={restartGame} className="restart-button">
                  RESTART
                </button>
              </div>
            </div>
          )}
          
          {showLevelClear && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Level Clear!</h2>
                <p>LEVEL {level} COMPLETED</p>
                <p>Moving to Level {level + 1}...</p>
              </div>
            </div>
          )}
          
          {showYouWin && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>You Win!</h2>
                <p>CONGRATULATIONS!</p>
                <p>All levels completed!</p>
                <button onClick={restartGame} className="restart-button">
                  PLAY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="game-info">
          <p>使用方向鍵控制蛇的移動</p>
        </div>
      </header>
    </div>
  );
};

export default App;

