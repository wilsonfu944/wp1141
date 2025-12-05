import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, SortAsc } from 'lucide-react';
import { animesAPI } from '../services/api';
import type { Anime } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import AnimeCard from '../components/Anime/AnimeCard';

export default function AnimeListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'locations'>('name');

  const { data: animes = [], isLoading, error } = useQuery<Anime[]>({
    queryKey: ['animes'],
    queryFn: () => animesAPI.getAll(),
  });

  // Debug: 打印数据
  if (animes.length > 0) {
    console.log('✅ 动画数据加载成功:', animes.length, '部');
  }
  if (error) {
    console.error('❌ 加载动画失败:', error);
  }

  // Filter and sort animes
  const filteredAnimes = animes
    .filter((anime) => {
      const matchesSearch =
        anime.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anime.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        case 'locations':
          return (b.locations?.length || 0) - (a.locations?.length || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">動畫列表</h1>
          <p className="text-slate-400">探索所有動畫作品的取景地點</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 mb-8 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋動畫名稱..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <SortAsc className="w-5 h-5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="name">依名稱</option>
                <option value="year">依年份</option>
                <option value="locations">依地點數</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        ) : filteredAnimes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">沒有找到符合條件的動畫</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-400">
              共找到 {filteredAnimes.length} 部動畫
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredAnimes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}


