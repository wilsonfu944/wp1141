import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus, Eye, Heart, Filter, Search } from 'lucide-react';
import { forumAPI } from '../services/api';
import type { ForumPost } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<string>('');
  const [sort, setSort] = useState<'latest' | 'popular' | 'views'>('latest');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: posts = [], isLoading } = useQuery<ForumPost[]>({
    queryKey: ['forum-posts', category, sort],
    queryFn: () => forumAPI.getPosts(category || undefined, sort),
  });

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['找旅伴', '討論', '分享', '問題', '其他'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-pink-500" />
              留言板
            </h1>
            <p className="text-slate-400">與其他動漫愛好者交流，尋找旅伴</p>
          </div>
          {isAuthenticated && (
            <Link
              to="/forum/new"
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              發表新留言
            </Link>
          )}
        </div>

        {/* 搜尋和篩選 */}
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋留言..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">全部分類</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="latest">最新</option>
                <option value="popular">最熱門</option>
                <option value="views">最多瀏覽</option>
              </select>
            </div>
          </div>
        </div>

        {/* 留言列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">還沒有留言</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/forum/${post.id}`}
                className="block bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700 hover:border-pink-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{post.title}</h3>
                      {post.category && (
                        <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 line-clamp-2">{post.content}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <img
                        src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name || 'User'}`}
                        alt={post.user?.name || 'User'}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{post.user?.name || '匿名'}</span>
                    </div>
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
      </main>

      <Footer />
    </div>
  );
}

