import React, { useState } from 'react';
import './App.css';
import MainMenu from './components/MainMenu';
import GameIntroduction from './components/GameIntroduction';
import CharacterSelect from './components/CharacterSelect';
import Game from './components/Game';
import GameOver from './components/GameOver';

export type Page = 'main' | 'introduction' | 'character' | 'game' | 'gameover';

export interface Character {
  id: number;
  name: string;
  description: string;
  color: string;
  fullDescription: string;
}

export interface GameState {
  score: number;
  selectedCharacter: Character | null;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    selectedCharacter: null
  });

  const characters: Character[] = [
    { 
      id: 1, 
      name: 'Doodle', 
      description: 'The classic green character', 
      color: '#4CAF50',
      fullDescription: 'Doodle 是遊戲的經典角色，擁有平衡的跳躍能力和穩定的移動速度。適合新手玩家，是開始冒險的最佳選擇。'
    },
    { 
      id: 2, 
      name: 'Sonic', 
      description: 'The blue speedster', 
      color: '#0066CC',
      fullDescription: 'Sonic 是藍色的速度之星，擁有超快的移動速度和靈活的跳躍能力。他的特殊技能是可以在高速移動時進行連續跳躍，適合喜歡快節奏的玩家。'
    },
    { 
      id: 3, 
      name: 'Faker', 
      description: 'The mysterious challenger', 
      color: '#8B0000',
      fullDescription: 'Faker 是神秘的挑戰者，擁有不可預測的移動模式。他的特殊能力是可以在空中改變方向，讓敵人難以捉摸，適合技巧型玩家。'
    },
    { 
      id: 4, 
      name: 'Cat', 
      description: 'The agile feline', 
      color: '#FFA500',
      fullDescription: 'Cat 是敏捷的貓咪，擁有優雅的跳躍和完美的落地控制。她的特殊技能是可以在空中進行多次調整，讓跳躍更加精準，適合追求完美的玩家。'
    },
    { 
      id: 5, 
      name: 'Mario', 
      description: 'The legendary plumber', 
      color: '#FF0000',
      fullDescription: 'Mario 是傳奇的管道工，擁有經典的跳躍技巧和穩定的表現。他的特殊能力是可以在跳躍時獲得額外的動力，讓跳躍更加有力，適合所有玩家。'
    }
  ];

  const handleStartGame = () => {
    if (gameState.selectedCharacter) {
      setCurrentPage('game');
    } else {
      setCurrentPage('character');
    }
  };

  const handleGameOver = (finalScore: number) => {
    setGameState(prev => ({ ...prev, score: finalScore }));
    setCurrentPage('gameover');
  };

  const handleCharacterSelect = (character: Character) => {
    setGameState(prev => ({ ...prev, selectedCharacter: character }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return (
          <MainMenu
            onStartGame={handleStartGame}
            onCharacterSelect={() => setCurrentPage('character')}
            onIntroduction={() => setCurrentPage('introduction')}
          />
        );
      case 'introduction':
        return (
          <GameIntroduction
            onBackToMain={() => setCurrentPage('main')}
          />
        );
      case 'character':
        return (
          <CharacterSelect
            characters={characters}
            selectedCharacter={gameState.selectedCharacter}
            onCharacterSelect={handleCharacterSelect}
            onBackToMain={() => setCurrentPage('main')}
          />
        );
      case 'game':
        return (
          <Game
            selectedCharacter={gameState.selectedCharacter!}
            onGameOver={handleGameOver}
            onBackToMain={() => setCurrentPage('main')}
          />
        );
      case 'gameover':
        return (
          <GameOver
            score={gameState.score}
            onRestart={() => setCurrentPage('game')}
            onBackToMain={() => setCurrentPage('main')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;