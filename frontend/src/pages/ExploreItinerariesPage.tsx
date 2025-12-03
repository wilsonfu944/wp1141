import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Clock } from 'lucide-react';
import { itinerariesAPI } from '../services/api';
import type { Itinerary } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ItineraryCard from '../components/Itinerary/ItineraryCard';

export default function ExploreItinerariesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('popular');

  const { data: itineraries = [], isLoading } = useQuery<Itinerary[]>({
    queryKey: ['publicItineraries', sortBy],
    queryFn: () => itinerariesAPI.getPublic(sortBy),
  });

  const filteredItineraries = itineraries.filter((itinerary) =>
    itinerary.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">探索行程</h1>
          <p className="text-slate-400">發現其他人分享的精彩聖地巡禮路線</p>
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
                placeholder="搜尋行程名稱..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                最熱門
              </button>
              <button
                onClick={() => setSortBy('latest')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === 'latest'
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Clock className="w-4 h-4" />
                最新
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">沒有找到符合條件的行程</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-slate-400">
              共找到 {filteredItineraries.length} 個行程
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItineraries.map((itinerary) => (
                <ItineraryCard key={itinerary.id} itinerary={itinerary} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}


