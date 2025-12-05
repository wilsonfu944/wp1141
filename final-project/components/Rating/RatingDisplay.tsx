'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { ratingsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface RatingDisplayProps {
  type: 'anime' | 'location';
  id: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function RatingDisplay({
  type,
  id,
  size = 'md',
  showText = true,
}: RatingDisplayProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const { data: ratingData, isLoading } = useQuery({
    queryKey: [`rating-${type}`, id],
    queryFn: () =>
      type === 'anime'
        ? ratingsAPI.getAnimeRating(id)
        : ratingsAPI.getLocationRating(id),
    enabled: !!id,
  });

  const rateMutation = useMutation({
    mutationFn: (rating: number) =>
      type === 'anime'
        ? ratingsAPI.rateAnime(id, rating)
        : ratingsAPI.rateLocation(id, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`rating-${type}`, id] });
    },
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleStarClick = (value: number) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    rateMutation.mutate(value);
  };

  const displayRating = hoveredRating || ratingData?.userRating || ratingData?.averageRating || 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`${sizeClasses[size]} fill-slate-600 text-slate-600`} />
          ))}
        </div>
        {showText && <span className="text-slate-400 text-sm">載入中...</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleStarClick(value)}
            onMouseEnter={() => isAuthenticated && setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
            disabled={!isAuthenticated || rateMutation.isPending}
            className={isAuthenticated ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
            title={isAuthenticated ? `點擊評分 ${value} 星` : '請先登入才能評分'}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                value <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-slate-600 text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
      {showText && ratingData && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white font-medium">
            {ratingData.averageRating > 0 ? ratingData.averageRating.toFixed(1) : '0.0'}
          </span>
          <span className="text-slate-400">
            ({ratingData.totalRatings} {ratingData.totalRatings === 1 ? '評分' : '評分'})
          </span>
          {ratingData.userRating && (
            <span className="text-pink-400 text-xs">你的評分: {ratingData.userRating} 星</span>
          )}
        </div>
      )}
    </div>
  );
}

