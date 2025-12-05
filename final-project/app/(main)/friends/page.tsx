'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, UserPlus, Check, X } from 'lucide-react';

// 假设有这些 API，需要根据实际情况调整
const friendsAPI = {
  getFriends: async () => {
    const response = await fetch('/api/friends');
    return response.json();
  },
  getRequests: async () => {
    const response = await fetch('/api/friends/requests');
    return response.json();
  },
  sendRequest: async (receiverId: string) => {
    const response = await fetch(`/api/friends/request/${receiverId}`, { method: 'POST' });
    return response.json();
  },
  acceptRequest: async (requestId: string) => {
    const response = await fetch(`/api/friends/requests/${requestId}/accept`, { method: 'POST' });
    return response.json();
  },
  rejectRequest: async (requestId: string) => {
    const response = await fetch(`/api/friends/requests/${requestId}/reject`, { method: 'POST' });
    return response.json();
  },
};

export default function FriendsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends'],
    queryFn: () => friendsAPI.getFriends(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: () => friendsAPI.getRequests(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => friendsAPI.acceptRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => friendsAPI.rejectRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">好友</h1>

        {requests.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">好友請求</h2>
            <div className="space-y-3">
              {requests.map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">
                      {request.sender?.name || request.sender?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(request.id)}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(request.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">我的好友 ({friends.length})</h2>
          {friends.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>還沒有好友</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend: any) => (
                <Link
                  key={friend.id}
                  href={`/profile/${friend.id}`}
                  className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(friend.name || friend.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {friend.name || friend.email}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

