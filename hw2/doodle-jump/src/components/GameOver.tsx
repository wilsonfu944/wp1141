import React from 'react';

interface GameOverProps {
  score: number;
  onRestart: () => void;
  onBackToMain: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart, onBackToMain }) => {
  return (
    <div className="game-over">
      <h2>Game Over!</h2>
      <h3>Final Score: {score}</h3>
      
      <div className="game-over-buttons">
        <button className="btn btn-primary" onClick={onRestart}>
          Play Again
        </button>
        <button className="btn btn-secondary" onClick={onBackToMain}>
          Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameOver;