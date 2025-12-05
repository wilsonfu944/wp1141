'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itinerariesAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ItineraryCard from '@/components/Itinerary/ItineraryCard';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function MyItinerariesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.getMe(),
    enabled: isAuthenticated,
  });

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['itineraries', 'user', userData?.user.id],
    queryFn: () => userData?.user.id 
      ? itinerariesAPI.getByUser(userData.user.id)
      : Promise.resolve([]),
    enabled: !!userData?.user.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itinerariesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });
    },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

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
          <h1 className="text-4xl font-bold text-white">我的行程</h1>
          <Link
            href="/plan"
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            創建新行程
          </Link>
        </div>

        {itineraries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">還沒有任何行程</p>
            <Link
              href="/plan"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              創建第一個行程
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                showActions={true}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

