'use client';

import { useQuery } from '@tanstack/react-query';
import { itinerariesAPI } from '@/lib/api';
import ItineraryCard from '@/components/Itinerary/ItineraryCard';
import { useState } from 'react';

export default function ExploreItinerariesPage() {
  const [sort, setSort] = useState<string>('popular');

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['itineraries', 'public', sort],
    queryFn: () => itinerariesAPI.getPublic(sort),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">探索行程</h1>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="popular">最受歡迎</option>
            <option value="recent">最新發布</option>
            <option value="views">最多瀏覽</option>
          </select>
        </div>

        {itineraries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">目前沒有公開行程</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <ItineraryCard key={itinerary.id} itinerary={itinerary} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

