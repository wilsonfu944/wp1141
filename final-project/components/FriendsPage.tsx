'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  image?: string;
  email?: string;
}

interface Friend {
  _id: string;
  friend: User;
  createdAt: string;
  updatedAt: string;
}

interface FriendRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      if (activeTab === 'friends') {
        fetchFriends();
      } else if (activeTab === 'requests') {
        fetchRequests();
      }
    }
  }, [session, activeTab]);

  async function fetchFriends() {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  }

  async function fetchRequests() {
    try {
      const res = await fetch('/api/friends/requests');
      if (res.ok) {
        const data = await res.json();
        setReceivedRequests(data.received || []);
        setSentRequests(data.sent || []);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(userId: string) {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId }),
      });

      if (res.ok) {
        // 重新搜索以获取最新的请求ID
        handleSearch();
        fetchRequests();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    }
  }

  async function handleRequestAction(requestId: string, action: 'accept' | 'reject') {
    try {
      const res = await fetch(`/api/friends/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        fetchRequests();
        if (action === 'accept') {
          fetchFriends();
        }
      }
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  }

  async function cancelRequest(requestId: string) {
    try {
      const res = await fetch(`/api/friends/request/${requestId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchRequests();
        // 如果在搜索标签页，刷新搜索结果
        if (activeTab === 'search') {
          handleSearch();
        }
      }
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  }

  async function removeFriend(userId: string) {
    if (!confirm('確定要移除這位朋友嗎？')) {
      return;
    }

    try {
      const res = await fetch(`/api/friends/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchFriends();
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <p className="text-center text-gray-400">請先登入才能使用朋友功能</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-pink-400">朋友</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-pink-500/20">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'friends'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-pink-300'
          }`}
        >
          朋友列表 ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'requests'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-pink-300'
          }`}
        >
          朋友請求 ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'search'
              ? 'text-pink-400 border-b-2 border-pink-400'
              : 'text-gray-400 hover:text-pink-300'
          }`}
        >
          搜尋用戶
        </button>
      </div>

      {/* Friends List */}
      {activeTab === 'friends' && (
        <div>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="bg-dark-card rounded-lg p-4 border border-pink-500/20 hover:border-pink-500/40 transition-colors"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {friend.friend.image ? (
                      <Image
                        src={friend.friend.image}
                        alt={friend.friend.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                        {friend.friend.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/profile?userId=${friend.friend._id}`}
                        className="font-semibold text-white hover:text-pink-400 transition-colors"
                      >
                        {friend.friend.name}
                      </Link>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/messages?userId=${friend.friend._id}`}
                      className="flex-1 bg-pink-500/20 text-pink-400 px-3 py-2 rounded-lg hover:bg-pink-500/30 transition-colors text-center text-sm"
                    >
                      發送訊息
                    </Link>
                    <button
                      onClick={() => removeFriend(friend.friend._id)}
                      className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <p className="text-lg mb-2">還沒有朋友</p>
              <p className="text-sm">搜尋用戶並添加朋友吧！</p>
            </div>
          )}
        </div>
      )}

      {/* Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Received Requests */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">收到的請求</h2>
            {receivedRequests.length > 0 ? (
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-dark-card rounded-lg p-4 border border-pink-500/20"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {request.requester.image ? (
                        <Image
                          src={request.requester.image}
                          alt={request.requester.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                          {request.requester.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/profile?userId=${request.requester._id}`}
                          className="font-semibold text-white hover:text-pink-400 transition-colors"
                        >
                          {request.requester.name}
                        </Link>
                        <p className="text-sm text-gray-400">
                          {new Date(request.createdAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRequestAction(request._id, 'accept')}
                        className="flex-1 bg-green-500/20 text-green-400 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        className="flex-1 bg-red-500/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        拒絕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">沒有待處理的請求</p>
            )}
          </div>

          {/* Sent Requests */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">已發送的請求</h2>
            {sentRequests.length > 0 ? (
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-dark-card rounded-lg p-4 border border-pink-500/20"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      {request.recipient.image ? (
                        <Image
                          src={request.recipient.image}
                          alt={request.recipient.name}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                          {request.recipient.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <Link
                          href={`/profile?userId=${request.recipient._id}`}
                          className="font-semibold text-white hover:text-pink-400 transition-colors"
                        >
                          {request.recipient.name}
                        </Link>
                        <p className="text-sm text-gray-400">
                          等待回應 • {new Date(request.createdAt).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelRequest(request._id)}
                      className="w-full bg-gray-500/20 text-gray-400 px-3 py-2 rounded-lg hover:bg-gray-500/30 transition-colors"
                    >
                      取消請求
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">沒有已發送的請求</p>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      {activeTab === 'search' && (
        <div>
          <div className="mb-6">
            <div className="flex space-x-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜尋用戶名稱或電子郵件..."
                className="flex-1 bg-dark-surface border border-pink-500/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
              >
                {loading ? '搜尋中...' : '搜尋'}
              </button>
            </div>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="bg-dark-card rounded-lg p-4 border border-pink-500/20"
                >
                  <div className="flex items-center space-x-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/profile?userId=${user._id}`}
                        className="font-semibold text-white hover:text-pink-400 transition-colors"
                      >
                        {user.name}
                      </Link>
                      {user.email && (
                        <p className="text-sm text-gray-400">{user.email}</p>
                      )}
                    </div>
                    <div>
                      {!user.friendshipStatus ? (
                        <button
                          onClick={() => sendFriendRequest(user._id)}
                          className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                        >
                          加為朋友
                        </button>
                      ) : user.friendshipStatus.status === 'pending' ? (
                        user.friendshipStatus.isRequester ? (
                          <button
                            onClick={() => {
                              if (user.friendshipStatus?.requestId) {
                                cancelRequest(user.friendshipStatus.requestId);
                              }
                            }}
                            className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition-colors"
                          >
                            取消請求
                          </button>
                        ) : (
                          <button
                            className="bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed"
                            disabled
                          >
                            待處理
                          </button>
                        )
                      ) : user.friendshipStatus.status === 'accepted' ? (
                        <Link
                          href={`/messages?userId=${user._id}`}
                          className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-colors inline-block"
                        >
                          發送訊息
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-gray-400 text-center py-8">沒有找到用戶</p>
          ) : (
            <p className="text-gray-400 text-center py-8">輸入關鍵字搜尋用戶</p>
          )}
        </div>
      )}
    </div>
  );
}

