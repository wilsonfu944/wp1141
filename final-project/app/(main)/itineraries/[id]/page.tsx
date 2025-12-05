'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itinerariesAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Timeline from '@/components/Itinerary/Timeline';
import ItineraryCommentForm from '@/components/Itinerary/ItineraryCommentForm';
import { ArrowLeft, Heart, Eye, Trash2, Copy, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function ItineraryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: itinerary, isLoading, error } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => itinerariesAPI.getById(id),
    retry: 1,
  });

  const likeMutation = useMutation({
    mutationFn: () => itinerary?.isLiked 
      ? itinerariesAPI.unlike(id)
      : itinerariesAPI.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => itinerariesAPI.delete(id),
    onSuccess: () => {
      router.push('/profile/itineraries');
    },
  });

  const copyMutation = useMutation({
    mutationFn: () => itinerariesAPI.copy(id),
    onSuccess: (newItinerary) => {
      router.push(`/itineraries/${newItinerary.id}`);
    },
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

  if (error || !itinerary) {
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

  const isOwner = user?.id === itinerary.userId;

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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{itinerary.name}</h1>
              {itinerary.description && (
                <p className="text-slate-300 mb-4">{itinerary.description}</p>
              )}
              {itinerary.user && (
                <Link
                  href={`/profile/${itinerary.user.id}`}
                  className="text-pink-400 hover:text-pink-300"
                >
                  @{itinerary.user.name || itinerary.user.email}
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => likeMutation.mutate()}
                  className={`p-2 rounded-lg transition-colors ${
                    itinerary.isLiked
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${itinerary.isLiked ? 'fill-current' : ''}`} />
                </button>
              )}
              {isAuthenticated && !isOwner && (
                <button
                  onClick={() => copyMutation.mutate()}
                  className="p-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
              {isOwner && (
                <button
                  onClick={() => {
                    if (confirm('確定要刪除這個行程嗎？')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{itinerary.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{itinerary.viewCount || 0}</span>
            </div>
          </div>
        </div>

        {itinerary.items && itinerary.items.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">行程路線</h2>
            <Timeline
              items={itinerary.items}
              transport={itinerary.transport}
              startDate={itinerary.startDate}
            />
          </div>
        )}

        {isAuthenticated && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">發表評論</h2>
            <ItineraryCommentForm itineraryId={itinerary.id} />
          </div>
        )}

        {itinerary.comments && itinerary.comments.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">評論</h2>
            <div className="space-y-4">
              {itinerary.comments.map((comment) => (
                <div key={comment.id} className="border-b border-slate-700 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-white">
                          {comment.user?.name || comment.user?.email}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                      <p className="text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

