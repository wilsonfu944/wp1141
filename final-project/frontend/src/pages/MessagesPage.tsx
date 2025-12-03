import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User, Search, Sparkles } from 'lucide-react';
import { messagesAPI, aiAPI } from '../services/api';
import type { Conversation, Message } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAIChat, setIsAIChat] = useState(false);
  const [aiConversationHistory, setAiConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const AI_USER_ID = 'ai-assistant';

  // 從 URL 參數獲取初始用戶ID和行程ID
  useEffect(() => {
    const userId = searchParams.get('userId');
    const itineraryId = searchParams.get('itineraryId');
    
    if (userId) {
      if (userId === AI_USER_ID) {
        setIsAIChat(true);
        setSelectedUserId(null);
      } else {
        setIsAIChat(false);
        setSelectedUserId(userId);
      }
      if (itineraryId) {
        setSelectedItineraryId(itineraryId);
        // 如果有行程ID，可以預設訊息內容
        setMessageContent(`你好！我對你的行程感興趣，想了解更多細節。`);
      }
    }
  }, [searchParams]);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => messagesAPI.getConversations(),
    enabled: isAuthenticated,
    refetchInterval: 5000, // 每5秒刷新一次
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['conversation', selectedUserId],
    queryFn: () => messagesAPI.getConversation(selectedUserId!),
    enabled: !!selectedUserId && isAuthenticated,
    refetchInterval: 3000, // 每3秒刷新一次
  });

  const sendMutation = useMutation({
    mutationFn: (data: { receiverId: string; content: string; itineraryId?: string }) =>
      messagesAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageContent('');
    },
  });

  const aiChatMutation = useMutation({
    mutationFn: (message: string) =>
      aiAPI.chat(message, aiConversationHistory),
    onSuccess: (data) => {
      if (data && data.response) {
        const userMessage = { role: 'user' as const, content: messageContent };
        const aiMessage = { role: 'assistant' as const, content: data.response };
        setAiConversationHistory((prev) => [...prev, userMessage, aiMessage]);
        setMessageContent('');
      } else {
        alert('AI 回應格式錯誤，請稍後再試');
      }
    },
    onError: (error) => {
      console.error('AI chat error:', error);
      alert('AI 服務暫時無法使用，請稍後再試');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSend = () => {
    if (!messageContent.trim()) return;
    
    if (isAIChat) {
      aiChatMutation.mutate(messageContent);
    } else if (selectedUserId) {
      sendMutation.mutate({
        receiverId: selectedUserId,
        content: messageContent,
        itineraryId: selectedItineraryId || undefined,
      });
    }
  };

  const handleSelectAI = () => {
    setIsAIChat(true);
    setSelectedUserId(null);
    setAiConversationHistory([]);
  };

  const handleSelectUser = (userId: string) => {
    setIsAIChat(false);
    setSelectedUserId(userId);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-slate-400 mb-4">請先登入才能使用私訊功能</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            登入
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.userId === selectedUserId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageSquare className="w-10 h-10 text-pink-500" />
            私訊
          </h1>
          <p className="text-slate-400">與其他使用者私訊，尋找旅伴</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-300px)]">
          {/* 對話列表 */}
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋對話..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* AI 客服小精靈 */}
              <button
                onClick={handleSelectAI}
                className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                  isAIChat ? 'bg-pink-500/20 border-pink-500/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">
                        AniMap 小精靈 ✨
                      </span>
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                        AI
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      隨時為您解答問題
                    </p>
                  </div>
                </div>
              </button>

              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-slate-400">
                  <p>還沒有其他對話</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => handleSelectUser(conv.userId)}
                    className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                      selectedUserId === conv.userId && !isAIChat ? 'bg-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conv.user.avatar || `https://ui-avatars.com/api/?name=${conv.user.name || 'User'}`}
                        alt={conv.user.name || 'User'}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white truncate">
                            {conv.user.name || conv.user.email}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-pink-500 text-white text-xs rounded-full px-2 py-1">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">
                          {conv.lastMessage.content}
                        </p>
                        {conv.itinerary && (
                          <p className="text-xs text-pink-400 mt-1">
                            關於：{conv.itinerary.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 訊息區域 */}
          <div className="lg:col-span-2 bg-slate-800/90 backdrop-blur-lg rounded-lg border border-slate-700 flex flex-col">
            {isAIChat || selectedUserId ? (
              <>
                {/* 對話標題 */}
                <div className="p-4 border-b border-slate-700">
                  {isAIChat ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                          AniMap 小精靈 ✨
                          <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full">
                            AI
                          </span>
                        </h3>
                        <p className="text-sm text-slate-400">隨時為您解答問題</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedConversation?.user.avatar || `https://ui-avatars.com/api/?name=${selectedConversation?.user.name || 'User'}`}
                        alt={selectedConversation?.user.name || 'User'}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-white">
                          {selectedConversation?.user.name || selectedConversation?.user.email}
                        </h3>
                        {selectedConversation?.itinerary && (
                          <p className="text-sm text-pink-400">
                            關於行程：{selectedConversation.itinerary.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 訊息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isAIChat ? (
                    <>
                      {aiConversationHistory.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-slate-400 mb-2">你好！我是 AniMap 小精靈 ✨</p>
                          <p className="text-slate-500 text-sm">我可以幫你解答關於動漫聖地巡禮的問題</p>
                        </div>
                      )}
                      {aiConversationHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-pink-500 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {msg.role === 'assistant' && (
                              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AniMap 小精靈
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {aiChatMutation.isPending && (
                        <div className="flex justify-start">
                          <div className="bg-slate-700 text-slate-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 animate-pulse" />
                              <span className="text-sm">小精靈正在思考...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? 'bg-pink-500 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            {!isOwn && (
                              <div className="text-xs text-slate-400 mb-1">
                                {message.sender?.name || '匿名'}
                              </div>
                            )}
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 輸入區域 */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="輸入訊息..."
                      rows={2}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageContent.trim() || (isAIChat ? aiChatMutation.isPending : sendMutation.isPending)}
                      className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      {isAIChat && aiChatMutation.isPending ? '發送中...' : '發送'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p>選擇一個對話開始聊天</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

