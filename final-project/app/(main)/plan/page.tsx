'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useItineraryCart } from '@/context/ItineraryCartContext';
import { useAuth } from '@/context/AuthContext';
import PlanSettings from '@/components/Itinerary/PlanSettings';
import LocationListEditor from '@/components/Itinerary/LocationListEditor';
import { itinerariesAPI } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

export default function PlanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { items, clearCart, reorderItems, removeItem, updateItem } = useItineraryCart();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [transport, setTransport] = useState('walking');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      alert('請至少選擇一個地點');
      return;
    }

    if (!name.trim()) {
      alert('請輸入行程名稱');
      return;
    }

    if (!startDate) {
      alert('請選擇開始日期時間');
      return;
    }

    setIsSubmitting(true);

    try {
      const locations = items.map((item) => ({
        locationId: item.location.id,
        duration: item.duration || 30,
        notes: item.notes || undefined,
      }));
      const itinerary = await itinerariesAPI.create({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        transport,
        isPublic,
        locations,
      });

      // 清除購物車
      clearCart();

      // 刷新行程列表
      queryClient.invalidateQueries({ queryKey: ['itineraries'] });

      // 跳轉到行程詳情頁
      router.push(`/itineraries/${itinerary.id}`);
    } catch (error: any) {
      console.error('Failed to create itinerary:', error);
      alert(error.response?.data?.error || '創建行程失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">需要登入</h1>
          <p className="text-slate-300 mb-6">請先登入以規劃行程</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-2">規劃行程</h1>
        <p className="text-slate-300 mb-8">創建你的動漫聖地巡禮路線</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">行程設定</h2>
            <PlanSettings
              name={name}
              description={description}
              startDate={startDate}
              transport={transport}
              isPublic={isPublic}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onStartDateChange={setStartDate}
              onTransportChange={setTransport}
              onIsPublicChange={setIsPublic}
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">地點列表</h2>
              <Link
                href="/map"
                className="text-pink-500 hover:text-pink-400 text-sm font-medium"
              >
                前往地圖選擇地點 →
              </Link>
            </div>
            <LocationListEditor
              items={items}
              onReorder={reorderItems}
              onRemove={removeItem}
              onUpdate={updateItem}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="flex-1 px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? '創建中...' : '創建行程'}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('確定要清除所有地點嗎？')) {
                  clearCart();
                }
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              清除全部
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

