import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, MessageSquare, Send, User, Eye } from 'lucide-react';
import { forumAPI, messagesAPI } from '../services/api';
import type { ForumPost, ForumReply } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function ForumPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { data: post, isLoading } = useQuery<ForumPost>({
    queryKey: ['forum-post', id],
    queryFn: () => forumAPI.getPostById(id!),
    enabled: !!id,
  });

  const likeMutation = useMutation({
    mutationFn: () => forumAPI.likePost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      forumAPI.createReply(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
      setReplyContent('');
      setReplyingTo(null);
    },
  });

  const handleReply = () => {
    if (!replyContent.trim()) return;
    replyMutation.mutate({
      content: replyContent,
      parentId: replyingTo || undefined,
    });
  };

  const renderReplies = (replies: ForumReply[] = [], parentId: string | null = null, depth = 0) => {
    if (!replies || replies.length === 0) return null;
    
    // 過濾出當前層級的回覆
    const currentLevelReplies = replies.filter((r) => 
      parentId ? r.parentId === parentId : !r.parentId
    );
    
    if (currentLevelReplies.length === 0) return null;
    
    return (
      <>
        {currentLevelReplies.map((reply) => (
          <div
            key={reply.id}
            className={`${depth > 0 ? 'mt-2' : ''} border-l-2 border-slate-700 pl-4 py-3`}
            style={{ marginLeft: depth > 0 ? `${depth * 24}px` : '0' }}
          >
            <div className="flex items-start gap-3">
              <img
                src={reply.user?.avatar || `https://ui-avatars.com/api/?name=${reply.user?.name || 'User'}`}
                alt={reply.user?.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{reply.user?.name || '匿名'}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(reply.createdAt).toLocaleString('zh-TW')}
                  </span>
                </div>
                {reply.parent && (
                  <div className="text-sm text-slate-500 mb-2">
                    回覆 @{reply.parent.user?.name || '匿名'}
                  </div>
                )}
                <p className="text-slate-300 mb-2 whitespace-pre-wrap">{reply.content}</p>
                <div className="flex items-center gap-3">
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setReplyingTo(reply.id);
                        setReplyContent(`@${reply.user?.name || '匿名'} `);
                      }}
                      className="text-sm text-pink-400 hover:text-pink-300"
                    >
                      回覆
                    </button>
                  )}
                  {isAuthenticated && reply.user && reply.userId !== user?.id && (
                    <button
                      onClick={() => navigate(`/messages?userId=${reply.userId}`)}
                      className="text-sm text-green-400 hover:text-green-300"
                    >
                      私訊
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* 遞迴渲染子回覆 */}
            {renderReplies(replies, reply.id, depth + 1)}
          </div>
        ))}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-slate-400">載入中...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <p className="text-slate-400">留言不存在</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Link
          to="/forum"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回留言板
        </Link>

        {/* 主留言 */}
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}`}
              alt={post.user?.name || 'User'}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                {post.category && (
                  <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">
                    {post.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <span>{post.user?.name || '匿名'}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleString('zh-TW')}</span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-slate-700">
            <button
              onClick={() => likeMutation.mutate()}
              className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{post.likeCount}</span>
            </button>
            <div className="flex items-center gap-2 text-slate-400">
              <MessageSquare className="w-5 h-5" />
              <span>{post.replies?.length || 0} 則回覆</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Eye className="w-5 h-5" />
              <span>{post.viewCount} 次瀏覽</span>
            </div>
            {isAuthenticated && post.user && post.userId !== user?.id && (
              <button
                onClick={() => navigate(`/messages?userId=${post.userId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                私訊版主
              </button>
            )}
          </div>
        </div>

        {/* 回覆列表 */}
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">回覆 ({post.replies?.length || 0})</h2>
          {post.replies && post.replies.length > 0 ? (
            <div className="space-y-4">{renderReplies(post.replies, null, 0)}</div>
          ) : (
            <p className="text-slate-400 text-center py-8">還沒有回覆</p>
          )}
        </div>

        {/* 回覆表單 */}
        {isAuthenticated ? (
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">發表回覆</h3>
            {replyingTo && (
              <div className="mb-3 p-2 bg-slate-700/50 rounded text-sm text-slate-300">
                回覆中... 點擊取消可回覆主留言
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="ml-2 text-pink-400 hover:text-pink-300"
                >
                  取消
                </button>
              </div>
            )}
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="輸入你的回覆..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-4"
            />
            <button
              onClick={handleReply}
              disabled={!replyContent.trim() || replyMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {replyMutation.isPending ? '發送中...' : '發送回覆'}
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700 text-center">
            <p className="text-slate-400 mb-4">請先登入才能回覆</p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              登入
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

