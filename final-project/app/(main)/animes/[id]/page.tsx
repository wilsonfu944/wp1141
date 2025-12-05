'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { animesAPI, locationsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnimeCard from '@/components/Anime/AnimeCard';
import LocationCard from '@/components/Location/LocationCard';
import RatingDisplay from '@/components/Rating/RatingDisplay';
import { ArrowLeft, MapPin } from 'lucide-react';

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: anime, isLoading, error } = useQuery({
    queryKey: ['anime', id],
    queryFn: () => animesAPI.getById(id),
    retry: 1,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations', id],
    queryFn: () => locationsAPI.getAll(id),
    enabled: !!anime,
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

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">載入失敗</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            {anime.coverImage ? (
              <img
                src={anime.coverImage}
                alt={anime.name}
                className="w-full rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-800 rounded-lg flex items-center justify-center">
                <span className="text-6xl">🎬</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-2">{anime.name}</h1>
            {anime.nameEn && (
              <p className="text-xl text-slate-400 mb-4">{anime.nameEn}</p>
            )}
            
            <div className="mb-6">
              <RatingDisplay type="anime" id={anime.id} size="lg" />
            </div>

            {anime.year && (
              <p className="text-slate-300 mb-2">年份：{anime.year}</p>
            )}
            {anime.genre && (
              <p className="text-slate-300 mb-4">類型：{anime.genre}</p>
            )}

            {anime.description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">簡介</h2>
                <p className="text-slate-300 leading-relaxed">{anime.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-5 h-5" />
              <span>{locations.length} 個巡禮地點</span>
            </div>
          </div>
        </div>

        {locations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">巡禮地點</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

