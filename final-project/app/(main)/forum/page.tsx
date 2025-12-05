'use client';

import { useQuery } from '@tanstack/react-query';
import { forumAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Heart, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ForumPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<string>('recent');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', category, sort],
    queryFn: () => forumAPI.getPosts(category || undefined, sort),
    retry: 1,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">留言板</h1>
          <Link
            href="/forum/new"
            className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            發表新帖
          </Link>
        </div>

        <div className="flex gap-4 mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">全部分類</option>
            <option value="general">一般討論</option>
            <option value="travel">旅行分享</option>
            <option value="question">問題求助</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="recent">最新發布</option>
            <option value="popular">最受歡迎</option>
            <option value="views">最多瀏覽</option>
          </select>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">目前沒有帖子</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="block bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-pink-500 transition-colors"
              >
                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-slate-300 mb-4 line-clamp-2">{post.content}</p>
                <div className="flex items-center justify-between text-slate-400 text-sm">
                  <div className="flex items-center gap-4">
                    <span>{post.user?.name || post.user?.email}</span>
                    {post.category && (
                      <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">
                        {post.category}
                      </span>
                    )}
                    <span>{new Date(post.createdAt).toLocaleDateString('zh-TW')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

