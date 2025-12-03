import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { animesAPI, locationsAPI } from '../services/api';
import type { Anime, Location } from '../types';

export default function LandingPage() {
  const { data: animes = [] } = useQuery<Anime[]>({
    queryKey: ['animes'],
    queryFn: () => animesAPI.getAll(),
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getAll(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-4 animate-fade-in">
              Ani<span className="text-pink-500">Map</span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 font-medium">
              動漫聖地巡禮地圖
            </p>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            探索動畫中的真實場景<br />
            與同好分享聖地巡禮的樂趣
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">{animes.length}</div>
              <div className="text-slate-400 text-sm md:text-base">動畫作品</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">{locations.length}</div>
              <div className="text-slate-400 text-sm md:text-base">巡禮地點</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">0</div>
              <div className="text-slate-400 text-sm md:text-base">使用者評論</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link
              to="/home"
              className="group px-10 py-5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold text-xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-pink-500/50 flex items-center gap-3"
            >
              開始探索
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <Link
            to="/home"
            className="flex flex-col items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors"
          >
            <span className="text-sm">探索更多</span>
            <ArrowRight className="w-6 h-6 rotate-90" />
          </Link>
        </div>
      </section>
    </div>
  );
}
