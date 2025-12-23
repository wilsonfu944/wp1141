'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [stats, setStats] = useState({
    animeCount: 0,
    locationCount: 0,
    userCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-8 animate-pulse text-pink-400">動漫巡禮</h1>
        <p className="text-2xl mb-12 text-pink-300">探索動漫中的真實場景</p>
        
        {loading ? (
          <div className="flex justify-center space-x-8">
            <div className="animate-pulse text-pink-400">載入中...</div>
          </div>
        ) : (
          <div className="flex justify-center space-x-12 mb-12">
            <div className="bg-dark-card backdrop-blur-lg rounded-lg p-6 border border-pink-500/30">
              <div className="text-4xl font-bold text-pink-400">{stats.animeCount}</div>
              <div className="text-lg mt-2 text-pink-300">動漫作品</div>
            </div>
            <div className="bg-dark-card backdrop-blur-lg rounded-lg p-6 border border-pink-500/30">
              <div className="text-4xl font-bold text-pink-400">{stats.locationCount}</div>
              <div className="text-lg mt-2 text-pink-300">巡禮地點</div>
            </div>
            <div className="bg-dark-card backdrop-blur-lg rounded-lg p-6 border border-pink-500/30">
              <div className="text-4xl font-bold text-pink-400">{stats.userCount}</div>
              <div className="text-lg mt-2 text-pink-300">使用者</div>
            </div>
          </div>
        )}
        
        <Link
          href="/home"
          className="bg-pink-500 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-pink-600 transition-colors inline-block"
        >
          進入網站
        </Link>
      </div>
    </div>
  );
}

