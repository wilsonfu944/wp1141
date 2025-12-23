'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('登入失敗，請檢查您的郵箱和密碼');
      } else {
        router.push('/home');
      }
    } catch (error) {
      setError('發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="bg-dark-card rounded-lg shadow-xl p-8 w-full max-w-md border border-pink-500/30">
        <h1 className="text-3xl font-bold text-center mb-6 text-pink-400">登入</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-300">郵箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-300">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => signIn('google')}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
          >
            使用 Google 登入
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">
          還沒有帳號？{' '}
          <Link href="/auth/signup" className="text-pink-400 hover:underline">
            註冊
          </Link>
        </p>
      </div>
    </div>
  );
}
