'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { forumAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function NewForumPostPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('請填寫標題和內容');
      return;
    }

    setIsSubmitting(true);
    try {
      const post = await forumAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        category: category || undefined,
      });
      router.push(`/forum/${post.id}`);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      alert(error.response?.data?.error || '發布失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-6">發表新帖</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                標題 *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="輸入標題..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                分類
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">選擇分類</option>
                <option value="general">一般討論</option>
                <option value="travel">旅行分享</option>
                <option value="question">問題求助</option>
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                內容 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                placeholder="輸入內容..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {isSubmitting ? '發布中...' : '發布'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

