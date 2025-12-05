'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Heart, Eye, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState('');
  const [parentId, setParentId] = useState<string | undefined>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: () => forumAPI.getPostById(id),
    retry: 1,
  });

  const likeMutation = useMutation({
    mutationFn: () => forumAPI.likePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: () => forumAPI.createReply(id, {
      content: replyContent.trim(),
      parentId,
    }),
    onSuccess: () => {
      setReplyContent('');
      setParentId(undefined);
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">載入失敗</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const handleReply = (parentReplyId?: string) => {
    setParentId(parentReplyId);
    setReplyContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </button>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
            <span>{post.user?.name || post.user?.email}</span>
            {post.category && (
              <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">
                {post.category}
              </span>
            )}
            <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => likeMutation.mutate()}
              className="flex items-center gap-1 hover:text-pink-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{post.likeCount}</span>
            </button>
            <div className="flex items-center gap-1">
              <Eye className="w-5 h-5" />
              <span>{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-5 h-5" />
              <span>{post.replies?.length || 0}</span>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {parentId ? '回覆評論' : '發表評論'}
            </h2>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none mb-4"
              placeholder="輸入評論..."
            />
            <div className="flex gap-4">
              <button
                onClick={() => replyMutation.mutate()}
                disabled={!replyContent.trim() || replyMutation.isPending}
                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {replyMutation.isPending ? '發布中...' : '發布'}
              </button>
              {parentId && (
                <button
                  onClick={() => {
                    setParentId(undefined);
                    setReplyContent('');
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  取消
                </button>
              )}
            </div>
          </div>
        )}

        {post.replies && post.replies.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">評論 ({post.replies.length})</h2>
            <div className="space-y-4">
              {post.replies.map((reply) => (
                <div key={reply.id} className="border-b border-slate-700 pb-4 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-white">
                      {reply.user?.name || reply.user?.email}
                    </span>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleReply(reply.id)}
                        className="text-pink-500 hover:text-pink-400 text-sm"
                      >
                        回覆
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 mb-2">{reply.content}</p>
                  <span className="text-slate-500 text-sm">
                    {new Date(reply.createdAt).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

