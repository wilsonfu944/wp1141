'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/auth/signin');
      } else {
        const data = await res.json();
        setError(data.error || '註冊失敗');
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
        <h1 className="text-3xl font-bold text-center mb-6 text-pink-400">註冊</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-300">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              placeholder="您的姓名"
            />
          </div>
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
              minLength={6}
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
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          已有帳號？{' '}
          <Link href="/auth/signin" className="text-pink-400 hover:underline">
            登入
          </Link>
        </p>
      </div>
    </div>
  );
}
