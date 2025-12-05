'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Send } from 'lucide-react';

export default function MessagesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesAPI.getConversations(),
    enabled: isAuthenticated,
    retry: 1,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedUserId],
    queryFn: () => selectedUserId ? messagesAPI.getConversation(selectedUserId) : Promise.resolve([]),
    enabled: !!selectedUserId && isAuthenticated,
    retry: 1,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => {
      if (!selectedUserId || !messageContent.trim()) {
        throw new Error('Invalid message');
      }
      return messagesAPI.sendMessage({
        receiverId: selectedUserId,
        content: messageContent.trim(),
      });
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-8">私訊</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">對話列表</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  還沒有任何對話
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedUserId(conv.userId)}
                      className={`w-full p-4 text-left hover:bg-slate-700/50 transition-colors ${
                        selectedUserId === conv.userId ? 'bg-slate-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">
                          {conv.user.name || conv.user.email}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm truncate">
                        {conv.lastMessage.content}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="md:col-span-2 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col">
            {selectedUserId ? (
              <>
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-xl font-bold text-white">
                    {selectedConversation?.user.name || selectedConversation?.user.email}
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === selectedUserId ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.senderId === selectedUserId
                            ? 'bg-slate-700 text-white'
                            : 'bg-pink-500 text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <span className="text-xs opacity-75 mt-1 block">
                          {new Date(msg.createdAt).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && messageContent.trim() && selectedUserId) {
                          sendMutation.mutate();
                        }
                      }}
                      placeholder="輸入訊息..."
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      onClick={() => sendMutation.mutate()}
                      disabled={!messageContent.trim() || sendMutation.isPending}
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>選擇一個對話開始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

