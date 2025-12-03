import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Route } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { itinerariesAPI } from '../services/api';
import type { Itinerary } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ItineraryCard from '../components/Itinerary/ItineraryCard';

export default function MyItinerariesPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: itineraries = [], isLoading, refetch } = useQuery<Itinerary[]>({
    queryKey: ['myItineraries', user?.id],
    queryFn: () => itinerariesAPI.getByUser(user!.id),
    enabled: isAuthenticated && !!user,
  });

  const handleDelete = async (id: string) => {
    try {
      await itinerariesAPI.delete(id);
      refetch();
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">請先登入查看您的行程</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              前往登入
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Route className="w-10 h-10 text-pink-500" />
              我的行程
            </h1>
            <p className="text-slate-400">管理您建立的所有聖地巡禮行程</p>
          </div>
          <Link
            to="/map"
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            建立新行程
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-12">
            <Route className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-4">還沒有建立任何行程</p>
            <Link
              to="/map"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              開始規劃
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((itinerary) => (
              <ItineraryCard
                key={itinerary.id}
                itinerary={itinerary}
                showActions
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


