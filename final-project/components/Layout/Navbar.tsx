'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { Map, List, Home, User, LogIn, Heart, Route as RouteIcon, MessageSquare, ChevronDown, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { messagesAPI } from '@/lib/api';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [isItineraryMenuOpen, setIsItineraryMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => messagesAPI.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const isActive = (path: string) => pathname === path;

  // 關閉下拉菜單當點擊外部
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsItineraryMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pink-500">AniMap</span>
            <span className="text-sm text-slate-400 hidden sm:inline">動漫聖地巡禮</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 md:gap-4">
            <Link
              href="/home"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/home')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">首頁</span>
            </Link>

            <Link
              href="/animes"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/animes')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
              <span className="hidden md:inline">動畫列表</span>
            </Link>

            <Link
              href="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/map')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="hidden md:inline">地圖探索</span>
            </Link>

            {/* 行程下拉菜單 */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsItineraryMenuOpen(!isItineraryMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  pathname.includes('/explore/itineraries') || 
                  pathname.includes('/itineraries/') ||
                  pathname.includes('/profile/itineraries')
                    ? 'bg-pink-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <RouteIcon className="w-5 h-5" />
                <span className="hidden md:inline">行程</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isItineraryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isItineraryMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    href="/profile/itineraries"
                    onClick={() => setIsItineraryMenuOpen(false)}
                    className={`block px-4 py-3 text-sm transition-colors ${
                      pathname.includes('/profile/itineraries')
                        ? 'bg-pink-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    我的行程
                  </Link>
                  <Link
                    href="/explore/itineraries"
                    onClick={() => setIsItineraryMenuOpen(false)}
                    className={`block px-4 py-3 text-sm transition-colors ${
                      pathname.includes('/explore/itineraries') || 
                      (pathname.includes('/itineraries/') && !pathname.includes('/profile/'))
                        ? 'bg-pink-500 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    查看熱門行程
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/forum"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                pathname.includes('/forum')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden md:inline">留言板</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/friends"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    pathname.includes('/friends')
                      ? 'bg-pink-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="hidden md:inline">好友</span>
                </Link>
                <Link
                  href="/messages"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative ${
                    pathname.includes('/messages')
                      ? 'bg-pink-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden md:inline">私訊</span>
                  {unreadData && unreadData.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadData.count > 9 ? '9+' : unreadData.count}
                    </span>
                  )}
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-pink-500 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">個人</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden md:inline">登入</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

