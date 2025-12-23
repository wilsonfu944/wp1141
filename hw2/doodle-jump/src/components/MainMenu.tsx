import React from 'react';

interface MainMenuProps {
  onStartGame: () => void;
  onCharacterSelect: () => void;
  onIntroduction: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onCharacterSelect,
  onIntroduction
}) => {
  return (
    <div className="main-menu">
      <h1>Doodle Jump</h1>
      <div className="menu-buttons">
        <button className="btn btn-primary" onClick={onStartGame}>
          Start Game
        </button>
        <button className="btn btn-secondary" onClick={onCharacterSelect}>
          Character Select
        </button>
        <button className="btn btn-warning" onClick={onIntroduction}>
          How to Play
        </button>
      </div>
    </div>
  );
};

export default MainMenu;