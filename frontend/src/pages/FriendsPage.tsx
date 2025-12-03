import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users, UserCheck, UserX, Heart, Sparkles } from 'lucide-react';
import { friendsAPI, type FriendRecommendation, type FriendRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types';

export default function FriendsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'recommendations'>('friends');

  const { data: friends = [] } = useQuery<User[]>({
    queryKey: ['friends'],
    queryFn: () => friendsAPI.getAll(),
    enabled: isAuthenticated,
  });

  const { data: friendRequests = [] } = useQuery<FriendRequest[]>({
    queryKey: ['friend-requests'],
    queryFn: () => friendsAPI.getRequests(),
    enabled: isAuthenticated,
  });

  const { data: recommendations = [] } = useQuery<FriendRecommendation[]>({
    queryKey: ['friend-recommendations'],
    queryFn: () => friendsAPI.getRecommendations(),
    enabled: isAuthenticated,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: string) => friendsAPI.sendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-recommendations'] });
      alert('好友請求已發送！');
    },
  });

  const handleRequestMutation = useMutation({
    mutationFn: ({ requestId, action }: { requestId: string; action: 'accept' | 'reject' }) =>
      friendsAPI.handleRequest(requestId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-recommendations'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-slate-400 mb-4">請先登入才能使用好友功能</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            登入
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-pink-500" />
            好友
          </h1>
          <p className="text-slate-400">管理您的好友關係和尋找新朋友</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 inline mr-2" />
            我的好友 ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-5 h-5 inline mr-2" />
            好友請求 ({friendRequests.length})
            {friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {friendRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            推薦好友 ({recommendations.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg border border-slate-700 p-6">
          {activeTab === 'friends' && (
            <div>
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400 mb-4">還沒有好友</p>
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                  >
                    查看推薦好友
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-4 hover:bg-slate-700 transition-colors"
                    >
                      <img
                        src={friend.avatar || `https://ui-avatars.com/api/?name=${friend.name || 'User'}`}
                        alt={friend.name || 'User'}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {friend.name || friend.email}
                        </h3>
                        {friend.bio && (
                          <p className="text-sm text-slate-400 truncate">{friend.bio}</p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/messages?userId=${friend.id}`)}
                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        私訊
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              {friendRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">沒有待處理的好友請求</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-slate-700/50 rounded-lg p-4 flex items-center gap-4"
                    >
                      <img
                        src={request.sender?.avatar || `https://ui-avatars.com/api/?name=${request.sender?.name || 'User'}`}
                        alt={request.sender?.name || 'User'}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white">
                          {request.sender?.name || request.sender?.email}
                        </h3>
                        <p className="text-sm text-slate-400">想要加您為好友</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleRequestMutation.mutate({ requestId: request.id, action: 'accept' })
                          }
                          disabled={handleRequestMutation.isPending}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4 inline mr-1" />
                          接受
                        </button>
                        <button
                          onClick={() =>
                            handleRequestMutation.mutate({ requestId: request.id, action: 'reject' })
                          }
                          disabled={handleRequestMutation.isPending}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-4 h-4 inline mr-1" />
                          拒絕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div>
              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">目前沒有推薦的好友</p>
                  <p className="text-sm text-slate-500 mt-2">添加更多喜歡的動畫來發現新朋友！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.user.id}
                      className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={rec.user.avatar || `https://ui-avatars.com/api/?name=${rec.user.name || 'User'}`}
                          alt={rec.user.name || 'User'}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h3 className="font-medium text-white text-lg">
                                {rec.user.name || rec.user.email}
                              </h3>
                              {rec.user.bio && (
                                <p className="text-sm text-slate-400">{rec.user.bio}</p>
                              )}
                            </div>
                            <button
                              onClick={() => sendRequestMutation.mutate(rec.user.id)}
                              disabled={sendRequestMutation.isPending}
                              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              <UserPlus className="w-4 h-4" />
                              加好友
                            </button>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-600">
                            <div className="flex items-center gap-2 mb-2">
                              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                              <span className="text-sm text-slate-300">
                                共同喜歡 {rec.commonAnimeCount} 部動畫
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {rec.commonAnimes.slice(0, 5).map((anime) => (
                                <span
                                  key={anime.id}
                                  className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs"
                                >
                                  {anime.name}
                                </span>
                              ))}
                              {rec.commonAnimes.length > 5 && (
                                <span className="px-2 py-1 text-slate-400 text-xs">
                                  +{rec.commonAnimes.length - 5} 更多
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

