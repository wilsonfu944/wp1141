import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Download,
  Eye,
  Calendar,
  Clock,
  MapPin as MapPinIcon,
  MessageSquare,
  Send,
  Car,
  Footprints,
  Train,
} from 'lucide-react';
import { itinerariesAPI, messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Itinerary } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import Timeline from '../components/Itinerary/Timeline';
import ItineraryCommentForm from '../components/Itinerary/ItineraryCommentForm';

export default function ItineraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [liking, setLiking] = useState(false);

  const { data: itinerary, isLoading, refetch } = useQuery<Itinerary>({
    queryKey: ['itinerary', id],
    queryFn: () => itinerariesAPI.getById(id!),
    enabled: !!id,
  });

  const isOwner = user && itinerary && user.id === itinerary.userId;
  const isLiked = itinerary?.likes?.some((like) => like.userId === user?.id) || false;

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!itinerary) return;

    setLiking(true);
    try {
      if (isLiked) {
        await itinerariesAPI.unlike(itinerary.id);
      } else {
        await itinerariesAPI.like(itinerary.id);
      }
      refetch();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleCopy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!itinerary) return;

    try {
      await itinerariesAPI.copy(itinerary.id);
      alert('行程已複製到您的帳號！');
      navigate('/profile/itineraries');
    } catch (error) {
      console.error('Failed to copy itinerary:', error);
      alert('複製失敗，請稍後再試');
    }
  };

  const handleShare = () => {
    if (!itinerary) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('連結已複製到剪貼簿！');
  };

  const handleSendMessage = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!itinerary || !itinerary.user) return;
    
    // 導航到私訊頁面，並帶上用戶ID和行程ID
    navigate(`/messages?userId=${itinerary.userId}&itineraryId=${itinerary.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400">找不到此行程</p>
            <Link to="/explore/itineraries" className="text-pink-500 hover:text-pink-400 mt-4 inline-block">
              探索其他行程
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalDistance = itinerary.items
    ? itinerary.items.reduce((sum, item, index) => {
        if (index === 0) return 0;
        // 這裡應該從 segments 計算，暫時簡化
        return sum;
      }, 0)
    : 0;

  const totalDuration = itinerary.items
    ? itinerary.items.reduce((sum, item) => sum + (item.duration || 30), 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 py-12 px-4">
          <div className="container mx-auto">
            <Link
              to="/explore/itineraries"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回探索
            </Link>

            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {itinerary.name}
                </h1>
                {itinerary.description && (
                  <p className="text-slate-300 text-lg mb-4">{itinerary.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-slate-300">
                  {itinerary.user && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                        {itinerary.user.avatar ? (
                          <img src={itinerary.user.avatar} alt="" className="w-full h-full rounded-full" />
                        ) : (
                          <span>{itinerary.user.name?.[0] || itinerary.user.email[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span>{itinerary.user.name || itinerary.user.email}</span>
                    </div>
                  )}
                  {itinerary.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(itinerary.startDate).toLocaleDateString('zh-TW')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    {itinerary.viewCount} 次瀏覽
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isLiked
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  {itinerary.likeCount || 0}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  分享
                </button>
              <a
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/export/itineraries/${id}/ical`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                匯出
              </a>
                {!isOwner && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Copy className="w-5 h-5" />
                      複製行程
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      聯絡作者
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 px-4 bg-slate-800/30">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-500">{itinerary.items?.length || 0}</div>
                <div className="text-slate-400 text-sm">地點數量</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-500">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
                <div className="text-slate-400 text-sm">總停留時間</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-pink-500">{totalDistance.toFixed(1)} km</div>
                <div className="text-slate-400 text-sm">總距離</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-pink-500 text-xl flex items-center justify-center gap-2">
                  {itinerary.transport === 'walking' ? (
                    <Footprints className="w-6 h-6" />
                  ) : itinerary.transport === 'driving' ? (
                    <Car className="w-6 h-6" />
                  ) : (
                    <Train className="w-6 h-6" />
                  )}
                  <span className="font-bold">
                    {itinerary.transport === 'walking'
                      ? '步行'
                      : itinerary.transport === 'driving'
                      ? '自駕'
                      : '大眾運輸'}
                  </span>
                </div>
                <div className="text-slate-400 text-sm">交通方式</div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-white mb-8">行程時間表</h2>
            {itinerary.items && (
              <Timeline
                items={itinerary.items}
                transport={itinerary.transport}
                startDate={itinerary.startDate}
              />
            )}
          </div>
        </section>

        {/* Comments */}
        <section className="py-12 px-4 bg-slate-800/30">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-pink-500" />
              評論 ({itinerary.comments?.length || 0})
            </h3>
            
            {/* 評論表單 */}
            {isAuthenticated ? (
              <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700">
                <ItineraryCommentForm itineraryId={itinerary.id} onSuccess={refetch} />
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-lg p-6 mb-6 border border-slate-700 text-center">
                <p className="text-slate-400 mb-4">請先登入才能發表評論</p>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                >
                  登入
                </button>
              </div>
            )}

            {/* 評論列表 */}
            {itinerary.comments && itinerary.comments.length > 0 ? (
              <div className="space-y-4">
                {itinerary.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name || 'User'}`}
                        alt={comment.user?.name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-white">
                            {comment.user?.name || comment.user?.email || '匿名'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleString('zh-TW')}
                          </span>
                          {comment.user?.id === user?.id && (
                            <span className="text-xs text-pink-400">(你)</span>
                          )}
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">
                還沒有評論，成為第一個評論的人吧！
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

