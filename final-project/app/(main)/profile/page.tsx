'use client';

import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState('');

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => authAPI.getMe(),
    enabled: !!user,
  });

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8">個人資料</h1>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {(userData?.user.name || userData?.user.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
                {userData?.user.name || userData?.user.email}
              </h2>
              <p className="text-slate-400 mb-4">{userData?.user.email}</p>
              {userData?.user.bio && (
                <p className="text-slate-300">{userData.user.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link
            href="/profile/itineraries"
            className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-pink-500 transition-colors"
          >
            <h3 className="text-xl font-bold text-white mb-2">我的行程</h3>
            <p className="text-slate-400">查看和管理你的巡禮行程</p>
          </Link>

          <Link
            href="/friends"
            className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-pink-500 transition-colors"
          >
            <h3 className="text-xl font-bold text-white mb-2">好友</h3>
            <p className="text-slate-400">管理你的好友列表</p>
          </Link>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            登出
          </button>
        </div>
      </div>
    </div>
  );
}

