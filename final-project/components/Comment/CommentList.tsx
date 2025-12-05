'use client';
import { useState } from 'react';
import { MessageSquare, TrendingUp, Star, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { commentsAPI } from '@/lib/api';
import type { Comment } from '@/types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentListProps {
  locationId: string;
}

export default function CommentList({ locationId }: CommentListProps) {
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');

  const { data: comments = [], isLoading, refetch } = useQuery<Comment[]>({
    queryKey: ['comments', locationId, sortBy],
    queryFn: () => commentsAPI.getByLocation(locationId, sortBy),
  });

  const handleCommentSuccess = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-pink-500" />
          評論 ({comments.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('latest')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'latest'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            最新
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'popular'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            最熱門
          </button>
          <button
            onClick={() => setSortBy('rating')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              sortBy === 'rating'
                ? 'bg-pink-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Star className="w-4 h-4" />
            評分最高
          </button>
        </div>
      </div>

      <CommentForm locationId={locationId} onSuccess={handleCommentSuccess} />

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-slate-400">載入評論中...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-slate-800/50 rounded-lg">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">還沒有評論，成為第一個留言的人吧！</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}


