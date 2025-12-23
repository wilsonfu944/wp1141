'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black/95 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
                AniMap
              </span>
              <span className="text-gray-300 font-medium">動漫聖地巡禮</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              href="/home" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>🏠</span>
              <span>首頁</span>
            </Link>
            <Link 
              href="/anime" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>📋</span>
              <span>動畫列表</span>
            </Link>
            <Link 
              href="/map" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>🗺️</span>
              <span>地圖探索</span>
            </Link>
            <Link 
              href="/itinerary" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>📅</span>
              <span>行程</span>
            </Link>
            <Link 
              href="/forum" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>💬</span>
              <span>留言板</span>
            </Link>
            <Link 
              href="/quiz" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>🎮</span>
              <span>小遊戲</span>
            </Link>
            <Link 
              href="/friends" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>👥</span>
              <span>朋友</span>
            </Link>
            <Link 
              href="/messages" 
              className="flex items-center space-x-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-pink-500/20 hover:text-pink-400 transition-colors"
            >
              <span>💌</span>
              <span>私訊</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user?.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="text-gray-300 font-medium hidden sm:inline">{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 transition-all shadow-md"
              >
                <span>→</span>
                <span>登入</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
