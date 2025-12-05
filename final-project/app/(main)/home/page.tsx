'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            AniMap
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            動漫聖地巡禮平台
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link
            href="/animes"
            className="bg-slate-800/50 hover:bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-pink-500 transition-all"
          >
            <h2 className="text-2xl font-bold text-white mb-2">動畫作品</h2>
            <p className="text-slate-400">探索動漫聖地</p>
          </Link>

          <Link
            href="/map"
            className="bg-slate-800/50 hover:bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-pink-500 transition-all"
          >
            <h2 className="text-2xl font-bold text-white mb-2">地圖探索</h2>
            <p className="text-slate-400">在地圖上查看地點</p>
          </Link>

          <Link
            href="/plan"
            className="bg-slate-800/50 hover:bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-pink-500 transition-all"
          >
            <h2 className="text-2xl font-bold text-white mb-2">規劃行程</h2>
            <p className="text-slate-400">創建你的巡禮路線</p>
          </Link>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            開始使用
          </Link>
        </div>
      </div>
    </div>
  );
}

