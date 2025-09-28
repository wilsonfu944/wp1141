import React, { useRef, useEffect, useState, useCallback } from 'react';
import './App.css';

// 定義座標介面
interface Position {
  x: number;
  y: number;
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
    { x: 10, y: 10 }, // 蛇頭
    { x: 9, y: 10 },  // 蛇身
    { x: 8, y: 10 }   // 蛇尾
  ]);
  const [foods, setFoods] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Direction>({ x: 1, y: 0 });
  const [gameRunning, setGameRunning] = useState(true);
  const [bestScore, setBestScore] = useState(0);
  const [foodEaten, setFoodEaten] = useState(false);

  // 生成隨機食物位置
  const generateFood = useCallback((existingFoods: Position[] = [], snakeBody: Position[] = []): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      existingFoods.some(food => food.x === newFood.x && food.y === newFood.y)
    );
    
    return newFood;
  }, []);

  // 初始化食物
  const initializeFoods = useCallback(() => {
    const foodCount = Math.floor(Math.random() * 3) + 1; // 1-3 個食物
    const newFoods: Position[] = [];
    
    // 使用初始蛇身位置來避免衝突
    const initialSnake = [
      { x: 10, y: 10 }, // 蛇頭
      { x: 9, y: 10 },  // 蛇身
      { x: 8, y: 10 }   // 蛇尾
    ];
    
    for (let i = 0; i < foodCount; i++) {
      newFoods.push(generateFood(newFoods, initialSnake));
    }
    
    setFoods(newFoods);
  }, [generateFood]);

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
  }, [snake, foods]);

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
      
      // 檢查是否吃到食物
      const eatenFoodIndex = foods.findIndex(food => food.x === head.x && food.y === head.y);
      
      if (eatenFoodIndex !== -1) {
        // 吃到食物：新頭加到前面，不移除尾巴
        const newSnake = [head, ...prevSnake];
        
        // 移除被吃掉的食物
        const newFoods = foods.filter((_, index) => index !== eatenFoodIndex);
        
        // 如果食物數量少於 3，則新增一個新食物
        if (newFoods.length < 3) {
          const newFood = generateFood(newFoods, prevSnake);
          newFoods.push(newFood);
        }
        
        setFoods(newFoods);
        
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
  }, [direction, foods, generateFood, bestScore]);

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
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ]);
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
            <p>SCORE: {snake.length - 3}</p>
            <p>BEST: {bestScore}</p>
          </div>
          
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="game-canvas"
          />
          {!gameRunning && (
            <div className="game-over-overlay">
              <div className="game-over-content">
                <h2>Game Over</h2>
                <p>SCORE: {snake.length - 3}</p>
                <button onClick={restartGame} className="restart-button">
                  RESTART
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

