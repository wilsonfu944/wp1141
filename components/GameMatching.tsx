'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface GameMatchingProps {
  onMatched: (roomId: string, isAI: boolean) => void;
  onCancel?: () => void;
}

export default function GameMatching({ onMatched, onCancel }: GameMatchingProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<'idle' | 'matching' | 'matched'>('idle');
  const [countdown, setCountdown] = useState(10);

  // 随机匹配倒计时
  useEffect(() => {
    if (status === 'matching' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (status === 'matching' && countdown === 0) {
      // 10秒后开始游戏
      const generatedRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[GameMatching] Creating game after 10s delay with roomId:', generatedRoomId);
      setStatus('matched');
      onMatched(generatedRoomId, true);
    }
  }, [status, countdown, onMatched]);

  const handleRandomMatch = () => {
    if (!session?.user?.id) {
      alert('請先登入');
      return;
    }
    
    // 开始10秒匹配动画
    setStatus('matching');
    setCountdown(10);
  };

  const handleCancel = () => {
    setStatus('idle');
    setCountdown(10);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="bg-dark-card rounded-lg shadow-md p-8 border border-pink-500/20">
        <h2 className="text-3xl font-bold mb-6 text-pink-400 text-center">1v1 實時對戰</h2>

        {status === 'idle' && (
          <div className="space-y-4">
            <button
              onClick={handleRandomMatch}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg"
            >
              隨機配對
            </button>
          </div>
        )}

        {status === 'matching' && (
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <div className="text-4xl font-bold text-pink-400 mb-4">尋找對手中...</div>
              <div className="text-2xl text-gray-300 mb-2">
                {countdown > 0 ? `${countdown} 秒後將匹配對手` : '正在匹配對手...'}
              </div>
              <div className="w-full bg-dark-surface rounded-full h-4 mb-4">
                <div
                  className="bg-pink-500 h-4 rounded-full transition-all"
                  style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                />
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="bg-dark-surface hover:bg-dark-card text-white px-6 py-2 rounded-lg border border-pink-500/30"
            >
              取消配對
            </button>
          </div>
        )}

        {status === 'matched' && (
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-green-400">已找到對手</div>
            <div className="text-gray-300">準備開始遊戲...</div>
          </div>
        )}
      </div>
    </div>
  );
}
