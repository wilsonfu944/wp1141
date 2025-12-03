import { Link, useLocation } from 'react-router-dom';
import { Map, List, Home, User, LogIn, Heart, Route as RouteIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pink-500">AniMap</span>
            <span className="text-sm text-slate-400 hidden sm:inline">動漫聖地巡禮</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 md:gap-4">
            <Link
              to="/home"
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
              to="/animes"
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
              to="/map"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/map')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="hidden md:inline">地圖探索</span>
            </Link>

            <Link
              to="/explore/itineraries"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname.includes('/explore/itineraries') || location.pathname.includes('/itineraries/')
                  ? 'bg-pink-500 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <RouteIcon className="w-5 h-5" />
              <span className="hidden md:inline">行程</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/profile"
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
                to="/login"
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

