import React from 'react';

interface GameIntroductionProps {
  onBackToMain: () => void;
}

const GameIntroduction: React.FC<GameIntroductionProps> = ({ onBackToMain }) => {
  return (
    <div className="game-introduction">
      <h2>How to Play Doodle Jump</h2>
      
      <h3>遊戲目標：</h3>
      <p>
        控制角色不斷往上跳，並透過踏上隨機生成的平台來持續上升。
        若角色掉出下邊界，遊戲結束。
      </p>

      <h3>操作方式：</h3>
      <ul>
        <li>使用鍵盤 ← → 控制角色左右移動</li>
        <li>角色可穿越邊界，例如超過左邊界會從右邊出現</li>
        <li>踏上平台時會彈跳</li>
        <li>持續上升並累積分數</li>
      </ul>

      <h3>遊戲特色：</h3>
      <ul>
        <li>隨機生成的平台，每次遊戲都不同</li>
        <li>多種角色可選擇</li>
        <li>分數系統記錄最高位置</li>
        <li>流暢的物理引擎</li>
      </ul>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={onBackToMain}>
          Back to Main Menu
        </button>
      </div>
    </div>
  );
};

export default GameIntroduction;