import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { forumAPI } from '../services/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { useAuth } from '../context/AuthContext';

export default function NewForumPostPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string; category?: string }) =>
      forumAPI.createPost(data),
    onSuccess: (post) => {
      navigate(`/forum/${post.id}`);
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('請填寫標題和內容');
      return;
    }
    createMutation.mutate({ title, content, category: category || undefined });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 text-center">
          <p className="text-slate-400 mb-4">請先登入才能發表留言</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            登入
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate('/forum')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回留言板
        </button>

        <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-6 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-6">發表新留言</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">標題</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入標題..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-white mb-2">分類</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">選擇分類（選填）</option>
                <option value="找旅伴">找旅伴</option>
                <option value="討論">討論</option>
                <option value="分享">分享</option>
                <option value="問題">問題</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-white mb-2">內容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="輸入內容..."
                rows={10}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || createMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {createMutation.isPending ? '發送中...' : '發送'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

