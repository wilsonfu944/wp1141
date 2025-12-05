'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import LocationDetailPanel from '@/components/LocationDetail/LocationDetailPanel';
import CommentList from '@/components/Comment/CommentList';
import CommentForm from '@/components/Comment/CommentForm';
import RatingDisplay from '@/components/Rating/RatingDisplay';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', id],
    queryFn: () => locationsAPI.getById(id),
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

  if (error || !location) {
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
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{location.name}</h1>
          
          {location.anime && (
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium">
                {location.anime.name}
              </span>
            </div>
          )}

          <div className="mb-6">
            <RatingDisplay type="location" id={location.id} size="lg" />
          </div>

          {location.description && (
            <p className="text-slate-300 leading-relaxed mb-6">{location.description}</p>
          )}

          <p className="text-slate-400 text-sm mb-6">{location.address}</p>

          <div className="flex gap-4">
            <button
              onClick={() => setShowDetailPanel(true)}
              className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              查看完整詳情
            </button>
          </div>
        </div>

        {isAuthenticated && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">發表評論</h2>
            <CommentForm locationId={location.id} />
          </div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">評論</h2>
          <CommentList locationId={location.id} />
        </div>
      </div>

      {showDetailPanel && (
        <LocationDetailPanel
          location={location}
          onClose={() => setShowDetailPanel(false)}
        />
      )}
    </div>
  );
}

