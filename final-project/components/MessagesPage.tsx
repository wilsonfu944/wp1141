'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    image?: string;
  };
  recipient: {
    _id: string;
    name: string;
    image?: string;
  };
  read: boolean;
  createdAt: string;
}

interface Conversation {
  user: {
    _id: string;
    name: string;
    image?: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ _id: string; name: string; image?: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI 小助手信息
  const AI_ASSISTANT_ID = 'ai-assistant';
  const aiAssistant = {
    _id: AI_ASSISTANT_ID,
    name: 'AI 小助手',
    image: undefined,
  };

  useEffect(() => {
    if (session) {
      fetchConversations();
      // Check if there's a userId in query params to start a conversation
      const userId = searchParams.get('userId');
      if (userId) {
        setSelectedConversation(userId);
        // Fetch user info if not in conversations
        fetchUserInfo(userId);
        // Immediately fetch messages for the new conversation
        fetchMessages(userId);
      }
    }
  }, [session, searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      // 如果是 AI 小助手，不需要轮询和检查封锁状态
      if (selectedConversation === AI_ASSISTANT_ID) {
        setMessages([]);
        setIsBlocked(false);
        return;
      }
      
      fetchMessages(selectedConversation);
      checkBlockStatus(selectedConversation);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  async function checkBlockStatus(userId: string) {
    try {
      const res = await fetch(`/api/user/block?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(data.blocked);
      }
    } catch (error) {
      console.error('Failed to check block status:', error);
    }
  }

  async function fetchConversations() {
    try {
      const res = await fetch('/api/messages/conversations');
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  }

  async function fetchUserInfo(userId: string) {
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (res.ok) {
        const user = await res.json();
        setSelectedUser(user);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }

  async function fetchMessages(userId: string) {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !selectedConversation || !newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // 如果是发送给 AI 小助手
    if (selectedConversation === AI_ASSISTANT_ID) {
      setAiLoading(true);
      
      // 创建用户消息对象（不保存到数据库）
      const userMessage: Message = {
        _id: `temp-${Date.now()}`,
        content: messageContent,
        sender: {
          _id: session.user.id,
          name: session.user.name || 'User',
          image: session.user.image || undefined,
        },
        recipient: aiAssistant,
        read: true,
        createdAt: new Date().toISOString(),
      };

      // 立即显示用户消息
      setMessages([...messages, userMessage]);

      try {
        // 构建对话历史
        const conversationHistory = messages
          .filter(msg => msg.sender._id === session.user.id || msg.sender._id === AI_ASSISTANT_ID)
          .map(msg => ({
            role: msg.sender._id === session.user.id ? 'user' : 'assistant',
            content: msg.content,
          }));

        // 调用 AI API
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageContent,
            conversationHistory,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          
          // 创建 AI 回复消息对象
          const aiMessage: Message = {
            _id: `ai-${Date.now()}`,
            content: data.response,
            sender: aiAssistant,
            recipient: {
              _id: session.user.id,
              name: session.user.name || 'User',
              image: session.user.image || undefined,
            },
            read: true,
            createdAt: new Date().toISOString(),
          };

          setMessages(prev => [...prev, aiMessage]);
        } else {
          const error = await res.json();
          console.error('AI API error:', error);
          const errorMessage = error.details 
            ? `${error.error}\n詳細信息: ${error.details}`
            : error.error || 'AI 回覆失敗，請稍後再試';
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Failed to get AI response:', error);
        alert('AI 回覆失敗，請稍後再試');
      } finally {
        setAiLoading(false);
      }
      return;
    }

    // 普通用户消息
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: selectedConversation,
          content: messageContent,
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages([...messages, message]);
        fetchConversations();
      } else {
        const error = await res.json();
        if (error.error === 'Cannot send message to blocked user') {
          alert('無法發送訊息給被封鎖的用戶');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('確定要刪除此訊息嗎？')) return;

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages(messages.filter((msg) => msg._id !== messageId));
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedConversation) return;

    try {
      const res = await fetch('/api/user/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedConversation,
          action: 'block',
        }),
      });

      if (res.ok) {
        setIsBlocked(true);
        setShowBlockDialog(false);
        setMessages([]);
        setSelectedConversation(null);
        fetchConversations();
        alert('用戶已被封鎖');
      }
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <p className="text-center text-gray-400">請先登入才能使用私訊功能</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Left Sidebar - Conversation List (Line Style) */}
      <div className="w-80 bg-dark-card border-r border-pink-500/20 overflow-y-auto">
        <div className="p-4 border-b border-pink-500/20 bg-dark-surface">
          <h2 className="text-xl font-bold text-pink-400">訊息</h2>
        </div>
        <div className="divide-y divide-pink-500/20">
          {/* AI 小助手 */}
          <button
            onClick={() => setSelectedConversation(AI_ASSISTANT_ID)}
            className={`w-full p-4 text-left hover:bg-dark-surface transition-colors ${
              selectedConversation === AI_ASSISTANT_ID ? 'bg-pink-500/10 border-l-4 border-pink-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-white">AI 小助手</div>
                </div>
                <div className="text-sm text-gray-400">
                  隨時為您解答問題
                </div>
              </div>
            </div>
          </button>
          
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.user._id}
                onClick={() => setSelectedConversation(conv.user._id)}
                className={`w-full p-4 text-left hover:bg-dark-surface transition-colors ${
                  selectedConversation === conv.user._id ? 'bg-pink-500/10 border-l-4 border-pink-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {conv.user.image ? (
                    <Image
                      src={conv.user.image}
                      alt={conv.user.name}
                      width={56}
                      height={56}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {conv.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-white truncate">{conv.user.name}</div>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {new Date(conv.lastMessage.createdAt).toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400 truncate flex-1">
                        {conv.lastMessage?.content || '暫無消息'}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="bg-pink-500 text-white rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center text-xs font-bold ml-2">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>還沒有對話</p>
              <p className="text-sm mt-2">開始與其他用戶聊天吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-black">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-pink-500/20 bg-dark-card">
              {(() => {
                // 如果是 AI 小助手
                if (selectedConversation === AI_ASSISTANT_ID) {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          🤖
                        </div>
                        <div className="font-semibold text-white">
                          AI 小助手
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // 普通用户
                const conversation = conversations.find((c) => c.user._id === selectedConversation);
                const user = conversation?.user || selectedUser;
                if (user) {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="font-semibold text-white">
                          {user.name}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isBlocked && (
                          <span className="text-xs text-red-400">已封鎖</span>
                        )}
                        <button
                          onClick={() => setShowBlockDialog(true)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                          title="封鎖用戶"
                        >
                          封鎖
                        </button>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-black to-dark-card">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const isSender = message.sender._id === session?.user?.id;
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showAvatar = !prevMessage || prevMessage.sender._id !== message.sender._id;
                  const showTime = index === messages.length - 1 || 
                    new Date(message.createdAt).getTime() - new Date(messages[index + 1]?.createdAt || 0).getTime() > 300000; // 5 minutes
                  
                  return (
                    <div key={message._id}>
                      {showTime && (
                        <div className="text-center text-gray-500 text-xs my-4">
                          {new Date(message.createdAt).toLocaleDateString('zh-TW', {
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                      <div className={`flex items-end space-x-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                        {!isSender && showAvatar && (
                          <div className="flex-shrink-0">
                            {message.sender.image ? (
                              <Image
                                src={message.sender.image}
                                alt={message.sender.name}
                                width={36}
                                height={36}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                {message.sender.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                        {!isSender && !showAvatar && <div className="w-9" />}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative group ${
                          isSender
                            ? 'bg-pink-500 text-white rounded-br-sm'
                            : 'bg-dark-card text-white rounded-bl-sm border border-pink-500/20'
                        }`}>
                          <p className="break-words">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isSender ? 'text-pink-100' : 'text-gray-400'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {isSender && (
                            <button
                              onClick={() => handleDeleteMessage(message._id)}
                              className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 text-sm"
                              title="刪除訊息"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        {isSender && showAvatar && (
                          <div className="flex-shrink-0">
                            {message.sender.image ? (
                              <Image
                                src={message.sender.image}
                                alt={message.sender.name}
                                width={36}
                                height={36}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                {message.sender.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                        {isSender && !showAvatar && <div className="w-9" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>還沒有訊息，開始對話吧！</p>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-pink-500/20 bg-dark-card">
              <div className="flex items-end space-x-3">
                <div className="flex-1 bg-dark-surface rounded-full px-4 py-2 border border-pink-500/20">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedConversation === AI_ASSISTANT_ID ? "向 AI 小助手提問..." : "輸入訊息..."}
                    className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
                    disabled={aiLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim() || aiLoading}
                  className="bg-pink-500 text-white w-10 h-10 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {aiLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-xl">➤</span>
                  )}
                </button>
              </div>
              {aiLoading && selectedConversation === AI_ASSISTANT_ID && (
                <p className="text-xs text-gray-400 mt-2 text-center">AI 正在思考中...</p>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-xl mb-2">選擇一個對話開始聊天</p>
              <p className="text-sm">或開始新的對話</p>
            </div>
          </div>
        )}
      </div>

      {/* Block User Dialog */}
      {showBlockDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full mx-4 border border-pink-500/20">
            <h3 className="text-xl font-bold text-white mb-4">封鎖用戶</h3>
            <p className="text-gray-400 mb-6">
              確定要封鎖此用戶嗎？封鎖後將無法接收該用戶的訊息，也無法向該用戶發送訊息。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleBlockUser}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors font-semibold"
              >
                確定封鎖
              </button>
              <button
                onClick={() => setShowBlockDialog(false)}
                className="flex-1 bg-dark-surface text-white px-4 py-2 rounded-full hover:bg-dark-card transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

