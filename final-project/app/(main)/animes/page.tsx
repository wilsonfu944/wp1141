'use client';

import { useQuery } from '@tanstack/react-query';
import { animesAPI } from '@/lib/api';
import AnimeCard from '@/components/Anime/AnimeCard';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AnimesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: animes = [], isLoading, error } = useQuery({
    queryKey: ['animes'],
    queryFn: async () => {
      try {
        return await animesAPI.getAll();
      } catch (err: any) {
        // 如果是超时或网络错误，返回空数组而不是抛出错误
        if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
          console.warn('API timeout, returning empty array');
          return [];
        }
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      // 超时或网络错误不重试
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        return false;
      }
      // 4xx 错误不重试
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    // 即使失败也显示空状态，而不是一直转圈
    throwOnError: false,
  });

  const filteredAnimes = animes.filter((anime) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      anime.name.toLowerCase().includes(query) ||
      anime.nameEn?.toLowerCase().includes(query) ||
      anime.description?.toLowerCase().includes(query)
    );
  });

  // 如果加载超过 10 秒，显示超时提示
  const [showTimeout, setShowTimeout] = useState(false);
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        if (isLoading) {
          setShowTimeout(true);
        }
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading]);

  if (isLoading && !showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">載入失敗</p>
          <p className="text-slate-400 text-sm">
            {error instanceof Error ? error.message : '無法載入動畫列表，請稍後再試'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">動畫作品</h1>
          <p className="text-slate-300 mb-6">探索動漫聖地，發現你的下一站巡禮目的地</p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋動畫名稱..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 backdrop-blur-lg text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {showTimeout && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-400 text-sm">
              載入時間較長，請稍候... 如果持續無法載入，請檢查網路連線。
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm mb-2">載入失敗</p>
            <button
              onClick={() => window.location.reload()}
              className="text-red-300 hover:text-red-200 text-sm underline"
            >
              點擊重新載入
            </button>
          </div>
        )}

        {filteredAnimes.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">
              {searchQuery ? '找不到符合搜尋條件的動畫' : '目前沒有動畫作品'}
            </p>
            {error && (
              <p className="text-slate-500 text-sm mt-2">
                如果這不是預期的結果，請重新整理頁面
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredAnimes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

