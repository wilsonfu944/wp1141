import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Save, Trash2 } from 'lucide-react';
import { useItineraryCart } from '../context/ItineraryCartContext';
import { useAuth } from '../context/AuthContext';
import { itinerariesAPI } from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import LocationListEditor from '../components/Itinerary/LocationListEditor';
import PlanSettings from '../components/Itinerary/PlanSettings';

export default function PlanPage() {
  const { items, removeItem, updateItem, clearCart, reorderItems, setItemsOrder } = useItineraryCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [transport, setTransport] = useState('public');
  const [isPublic, setIsPublic] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<{ totalDistance: number; segments: Array<{ from: string; to: string; distance: number; travelTime: number }> } | null>(null);

  const totalDistance = optimizedRoute?.totalDistance || 0;
  const totalTime = items.reduce((sum, item) => sum + (item.duration || 30), 0);

  const handleOptimize = async () => {
    if (items.length < 2) {
      alert('至少需要 2 個地點才能優化路線');
      return;
    }

    setOptimizing(true);
    try {
      const locationIds = items.map((item) => item.location.id);
      const result = await itinerariesAPI.optimize(locationIds, transport);
      
      // 儲存優化結果
      setOptimizedRoute({
        totalDistance: result.totalDistance,
        segments: result.segments,
      });
      
      // 根據優化結果重新排序項目
      const newOrder: typeof items = [];
      result.order.forEach((id) => {
        const item = items.find((i) => i.location.id === id);
        if (item) newOrder.push(item);
      });
      
      // 使用批量重新排序方法
      if (newOrder.length === items.length) {
        setItemsOrder(newOrder);
      }
      
      // 顯示詳細的優化結果
      const transportText = transport === 'walking' ? '步行' : transport === 'public' ? '大眾運輸' : '開車';
      let message = `路線已優化！\n\n總距離：${result.totalDistance.toFixed(1)} km\n總移動時間：${Math.floor(result.totalTravelTime)} 分鐘\n\n路線順序：\n`;
      
      result.segments.forEach((segment, index) => {
        const fromLocation = items.find((item) => item.location.id === segment.from);
        const toLocation = items.find((item) => item.location.id === segment.to);
        message += `${index + 1}. ${fromLocation?.location.name || '起點'} → ${toLocation?.location.name || '終點'}\n`;
        message += `   距離：${segment.distance.toFixed(1)} km，時間：${Math.floor(segment.travelTime)} 分鐘（${transportText}）\n\n`;
      });
      
      alert(message);
    } catch (error) {
      console.error('Optimize error:', error);
      alert('優化失敗，請稍後再試');
    } finally {
      setOptimizing(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      if (confirm('需要登入才能儲存行程，是否前往登入？')) {
        navigate('/login');
      }
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

    if (items.length === 0) {
      alert('請至少選擇一個地點');
      return;
    }

    setSaving(true);
    try {
      const itinerary = await itinerariesAPI.create({
        name,
        description,
        startDate,
        transport,
        isPublic,
        locations: items.map((item) => ({
          locationId: item.location.id,
          duration: item.duration,
          notes: item.notes,
        })),
      });

      // 先清空狀態，再導航，避免狀態衝突
      clearCart();
      setOptimizedRoute(null);
      setName('');
      setDescription('');
      setStartDate('');
      
      // 使用 window.location 確保完全導航，避免 React Router 狀態問題
      window.location.href = `/itineraries/${itinerary.id}`;
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || '儲存失敗，請稍後再試';
      alert(`儲存失敗：${errorMessage}`);
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('確定要清空所有地點嗎？')) {
      clearCart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <Link
          to="/map"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回地圖
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">行程規劃</h1>
          <p className="text-slate-400">
            安排你的聖地巡禮路線，系統將為你優化最佳順序
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 左側：地點列表 */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  地點列表 ({items.length})
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-slate-400 hover:text-red-500 transition-colors text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空
                  </button>
                )}
              </div>

              <LocationListEditor
                items={items}
                onReorder={reorderItems}
                onRemove={removeItem}
                onUpdate={updateItem}
              />

              {items.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-pink-500">{totalDistance.toFixed(1)} km</div>
                      <div className="text-sm text-slate-400">預估總距離</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pink-500">
                        {Math.floor(totalTime / 60)}h {totalTime % 60}m
                      </div>
                      <div className="text-sm text-slate-400">預估總停留時間</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右側：設定 */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl p-6 border border-slate-700 sticky top-24">
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

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleOptimize}
                  disabled={optimizing || items.length < 2}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-5 h-5" />
                  {optimizing ? '優化中...' : '智慧優化路線'}
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '儲存中...' : '儲存行程'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

