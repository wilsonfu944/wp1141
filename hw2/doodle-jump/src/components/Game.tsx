import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character } from '../App';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
}

interface Monster {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
  type: 'flying' | 'walking';
  direction: 'left' | 'right';
  health: number;
}

interface GameProps {
  selectedCharacter: Character;
  onGameOver: (score: number) => void;
  onBackToMain: () => void;
}

const Game: React.FC<GameProps> = ({ selectedCharacter, onGameOver, onBackToMain }) => {
  const [player, setPlayer] = useState<Player>({
    x: window.innerWidth / 2 - 20,
    y: window.innerHeight / 2 + 100,
    velocityX: 0,
    velocityY: 0,
    width: 40,
    height: 40
  });

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(true);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const gameLoopRef = useRef<number>();
  const cameraY = useRef(0);
  const monsterIdCounter = useRef(0);

  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 5;
  const PLATFORM_WIDTH = 100;
  const PLATFORM_HEIGHT = 20;
  const MONSTER_SPAWN_SCORE = 2000;
  const MONSTER_SPAWN_INTERVAL = 3000; // 3秒生成一隻怪物
  const MONSTER_WIDTH = 30;
  const MONSTER_HEIGHT = 30;

  // Initialize platforms
  useEffect(() => {
    const initialPlatforms: Platform[] = [];
    
    // Create initial platforms
    for (let i = 0; i < 10; i++) {
      initialPlatforms.push({
        x: Math.random() * (window.innerWidth - PLATFORM_WIDTH),
        y: window.innerHeight - (i * 80) - 100,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT
      });
    }
    
    setPlatforms(initialPlatforms);
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check collision between player and platform
  const checkCollision = (player: Player, platform: Platform): boolean => {
    return (
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + platform.height + 5 &&
      player.velocityY > 0
    );
  };

  // Check collision between player and monster
  const checkMonsterCollision = (player: Player, monster: Monster): boolean => {
    return (
      player.x < monster.x + monster.width &&
      player.x + player.width > monster.x &&
      player.y < monster.y + monster.height &&
      player.y + player.height > monster.y
    );
  };

  // Update monster AI and movement
  const updateMonsters = useCallback((currentMonsters: Monster[], player: Player, currentPlatforms: Platform[]) => {
    return currentMonsters.map(monster => {
      let newMonster = { ...monster };

      if (monster.type === 'flying') {
        // Flying monsters move horizontally and vertically
        newMonster.x += newMonster.velocityX;
        newMonster.y += Math.sin(Date.now() * 0.003) * 0.5; // 上下浮動
        
        // Reverse direction when hitting screen edges
        if (newMonster.x <= 0 || newMonster.x >= window.innerWidth - newMonster.width) {
          newMonster.velocityX *= -1;
          newMonster.direction = newMonster.velocityX > 0 ? 'right' : 'left';
        }
      } else {
        // Walking monsters move horizontally and fall with gravity
        newMonster.velocityY += GRAVITY * 0.3; // Slower gravity for monsters
        newMonster.x += newMonster.velocityX;
        newMonster.y += newMonster.velocityY;
        
        // Check platform collisions for walking monsters
        currentPlatforms.forEach(platform => {
          if (
            newMonster.x < platform.x + platform.width &&
            newMonster.x + newMonster.width > platform.x &&
            newMonster.y + newMonster.height >= platform.y &&
            newMonster.y + newMonster.height <= platform.y + platform.height + 5 &&
            newMonster.velocityY > 0
          ) {
            newMonster.velocityY = 0;
            newMonster.y = platform.y - newMonster.height;
          }
        });
        
        // Reverse direction when hitting screen edges or falling off platforms
        if (newMonster.x <= 0 || newMonster.x >= window.innerWidth - newMonster.width) {
          newMonster.velocityX *= -1;
          newMonster.direction = newMonster.velocityX > 0 ? 'right' : 'left';
        }
      }

      return newMonster;
    });
  }, []);

  // Generate new platforms
  const generatePlatforms = useCallback((currentPlatforms: Platform[], playerY: number) => {
    const newPlatforms = [...currentPlatforms];
    const highestPlatform = Math.min(...currentPlatforms.map(p => p.y));
    
    // Generate new platforms above the player
    if (playerY < highestPlatform + 200) {
      for (let i = 0; i < 3; i++) {
        newPlatforms.push({
          x: Math.random() * (window.innerWidth - PLATFORM_WIDTH),
          y: highestPlatform - (Math.random() * 100 + 50),
          width: PLATFORM_WIDTH,
          height: PLATFORM_HEIGHT
        });
      }
    }
    
    // Remove platforms that are too far below
    return newPlatforms.filter(platform => platform.y < playerY + 500);
  }, []);

  // Generate new monsters
  const generateMonsters = useCallback((currentMonsters: Monster[], playerY: number, currentScore: number) => {
    if (currentScore < MONSTER_SPAWN_SCORE) return currentMonsters;
    
    const newMonsters = [...currentMonsters];
    
    // Simple spawn logic: spawn a monster if we have less than 2 monsters
    if (newMonsters.length < 2 && Math.random() < 0.005) { // 0.5% chance per frame
      const monsterType = Math.random() > 0.5 ? 'flying' : 'walking';
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      
      const newMonster: Monster = {
        id: monsterIdCounter.current++,
        x: direction === 'left' ? window.innerWidth : -MONSTER_WIDTH,
        y: playerY - Math.random() * 200 - 100, // 在玩家上方生成
        velocityX: direction === 'left' ? -2 : 2,
        velocityY: monsterType === 'flying' ? 0 : 0,
        width: MONSTER_WIDTH,
        height: MONSTER_HEIGHT,
        type: monsterType,
        direction,
        health: 1
      };
      
      newMonsters.push(newMonster);
    }
    
    // Remove monsters that are too far below or off screen
    return newMonsters.filter(monster => 
      monster.y < playerY + 500 && 
      monster.x > -MONSTER_WIDTH - 100 && 
      monster.x < window.innerWidth + MONSTER_WIDTH + 100
    );
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameRunning) return;

    const gameLoop = () => {
      setPlayer(prevPlayer => {
        let newPlayer = { ...prevPlayer };

        // Handle horizontal movement
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
          newPlayer.velocityX = -MOVE_SPEED;
        } else if (keys['ArrowRight'] || keys['d'] || keys['D']) {
          newPlayer.velocityX = MOVE_SPEED;
        } else {
          newPlayer.velocityX *= 0.8; // Friction
        }

        // Apply gravity
        newPlayer.velocityY += GRAVITY;

        // Update position
        newPlayer.x += newPlayer.velocityX;
        newPlayer.y += newPlayer.velocityY;

        // Handle screen wrapping
        if (newPlayer.x < -newPlayer.width) {
          newPlayer.x = window.innerWidth;
        } else if (newPlayer.x > window.innerWidth) {
          newPlayer.x = -newPlayer.width;
        }

        // Check platform collisions
        platforms.forEach(platform => {
          if (checkCollision(newPlayer, platform)) {
            newPlayer.velocityY = JUMP_FORCE;
            newPlayer.y = platform.y - newPlayer.height;
          }
        });

        // Check monster collisions
        monsters.forEach(monster => {
          if (checkMonsterCollision(newPlayer, monster)) {
            setGameRunning(false);
            onGameOver(score);
          }
        });

        // Update camera (move world down as player goes up)
        const playerScreenY = newPlayer.y - cameraY.current;
        if (playerScreenY < window.innerHeight * 0.3) {
          cameraY.current = newPlayer.y - window.innerHeight * 0.3;
        }

        // Update score based on height
        const newScore = Math.max(0, Math.floor((window.innerHeight - newPlayer.y) / 10));
        setScore(newScore);

        // Check game over
        if (newPlayer.y > window.innerHeight + 100) {
          setGameRunning(false);
          onGameOver(score);
        }

        return newPlayer;
      });

      // Generate new platforms
      setPlatforms(prevPlatforms => generatePlatforms(prevPlatforms, player.y));

      // Update monsters
      setMonsters(prevMonsters => updateMonsters(prevMonsters, player, platforms));

      // Generate new monsters
      setMonsters(prevMonsters => generateMonsters(prevMonsters, player.y, score));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [keys, platforms, monsters, gameRunning, score, onGameOver, generatePlatforms, updateMonsters, generateMonsters]);

  // Handle escape key to pause/return to menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGameRunning(false);
        onBackToMain();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onBackToMain]);

  return (
    <div className="game-container">
      <div className="game-ui">
        <div>Score: {score}</div>
        {score >= MONSTER_SPAWN_SCORE - 200 && score < MONSTER_SPAWN_SCORE && (
          <div style={{ color: '#FF6B6B', fontSize: '18px', marginTop: '10px' }}>
            ⚠️ Monsters approaching at 2000 points!
          </div>
        )}
        {score >= MONSTER_SPAWN_SCORE && (
          <div style={{ color: '#FF4444', fontSize: '16px', marginTop: '10px' }}>
            👹 Monsters are active!
          </div>
        )}
      </div>
      
      {/* Player */}
      <div
        className="player"
        style={{
          left: player.x,
          top: player.y - cameraY.current,
          backgroundColor: selectedCharacter.color
        }}
      />

      {/* Platforms */}
      {platforms.map((platform, index) => (
        <div
          key={index}
          className="platform"
          style={{
            left: platform.x,
            top: platform.y - cameraY.current,
            width: platform.width,
            height: platform.height
          }}
        />
      ))}

      {/* Monsters */}
      {monsters.map((monster) => (
        <div
          key={monster.id}
          className={`monster monster-${monster.type}`}
          style={{
            left: monster.x,
            top: monster.y - cameraY.current,
            width: monster.width,
            height: monster.height,
            backgroundColor: monster.type === 'flying' ? '#FF6B6B' : '#8B4513',
            transform: monster.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
          }}
        />
      ))}

      {/* Game Over Overlay */}
      {!gameRunning && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 20
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <div style={{ marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Restart
              </button>
              <button className="btn btn-secondary" onClick={onBackToMain} style={{ marginLeft: '10px' }}>
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;