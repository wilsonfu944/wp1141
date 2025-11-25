'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    messageType?: string;
    isHint?: boolean;
  };
}

interface Conversation {
  _id: string;
  userId: string;
  userName?: string;
  platform: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  gameState?: {
    currentPuzzleId?: string;
    puzzleTitle?: string;
    isSolved?: boolean;
    hintsUsed?: number;
    startTime?: string;
  };
  metadata?: {
    userProfile?: {
      displayName?: string;
      pictureUrl?: string;
    };
  };
}

export default function ConversationDetail() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/conversations/${params.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch conversation');
        }
        const data = await res.json();
        setConversation(data.conversation);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error fetching conversation', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
      // Poll for updates every 3 seconds
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500">載入中...</div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500">找不到對話</div>
          <Link href="/admin" className="text-blue-600 hover:text-blue-900 mt-4 inline-block">
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-blue-600 hover:text-blue-900 mb-4 inline-block"
          >
            ← 返回列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">對話詳情</h1>
        </div>

        {/* Conversation Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">對話資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">使用者名稱</label>
              <p className="text-lg text-gray-900">{conversation.userName || '未知使用者'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">使用者 ID</label>
              <p className="text-lg text-gray-900 font-mono text-sm">{conversation.userId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">開始時間</label>
              <p className="text-lg text-gray-900">
                {new Date(conversation.startedAt).toLocaleString('zh-TW')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">最後訊息時間</label>
              <p className="text-lg text-gray-900">
                {new Date(conversation.lastMessageAt).toLocaleString('zh-TW')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">訊息總數</label>
              <p className="text-lg text-gray-900">{conversation.messageCount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">平台</label>
              <p className="text-lg text-gray-900">{conversation.platform}</p>
            </div>
          </div>

          {conversation.gameState && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-3">遊戲狀態</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">當前謎題</label>
                  <p className="text-lg text-gray-900">
                    {conversation.gameState.puzzleTitle || '無'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">狀態</label>
                  <p className="text-lg text-gray-900">
                    {conversation.gameState.isSolved ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded">已解決</span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">進行中</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">使用提示次數</label>
                  <p className="text-lg text-gray-900">{conversation.gameState.hintsUsed || 0}</p>
                </div>
                {conversation.gameState.startTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">開始時間</label>
                    <p className="text-lg text-gray-900">
                      {new Date(conversation.gameState.startTime).toLocaleString('zh-TW')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">訊息時間軸</h2>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">沒有訊息</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-50 ml-8'
                      : msg.role === 'assistant'
                        ? 'bg-gray-50 mr-8'
                        : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        msg.role === 'user'
                          ? 'text-blue-700'
                          : msg.role === 'assistant'
                            ? 'text-gray-700'
                            : 'text-yellow-700'
                      }`}
                    >
                      {msg.role === 'user'
                        ? '玩家'
                        : msg.role === 'assistant'
                          ? '莊家'
                          : '系統'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleString('zh-TW')}
                    </span>
                  </div>
                  <p className="text-gray-900 whitespace-pre-wrap">{msg.content}</p>
                  {msg.metadata?.isHint && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      提示
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}




