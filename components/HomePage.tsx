'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getAnimeSlug } from '@/lib/animeSlug';

interface Anime {
  _id: string;
  title: string;
  titleJP?: string;
  description: string;
  coverImage: string;
  rating: number;
  releaseDate: string;
  locations?: any[];
}

export default function HomePage() {
  const { data: session } = useSession();
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [yourFavoriteAnime, setYourFavoriteAnime] = useState<Anime[]>([]);
  const [recentAnime, setRecentAnime] = useState<Anime[]>([]);
  const [topRatedAnime, setTopRatedAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let isMounted = true;
    
    async function fetchAnime() {
      try {
        // 分別獲取數據
        const [featuredRes, popularRes, recentRes, topRatedRes] = await Promise.all([
          fetch('/api/anime?limit=5&sort=rating'),
          fetch('/api/anime?limit=6&sort=rating'),
          fetch('/api/anime?limit=6&sort=releaseDate'),
          fetch('/api/anime?limit=10&sort=rating'),
        ]);

        if (!isMounted) return;

        const [featuredData, popularData, recentData, topRatedData] = await Promise.all([
          featuredRes.ok ? featuredRes.json() : [],
          popularRes.ok ? popularRes.json() : [],
          recentRes.ok ? recentRes.json() : [],
          topRatedRes.ok ? topRatedRes.json() : [],
        ]);

        if (!isMounted) return;

        setFeaturedAnime(Array.isArray(featuredData) ? featuredData : []);
        setPopularAnime(Array.isArray(popularData) ? popularData : []);
        setRecentAnime(Array.isArray(recentData) ? recentData : []);
        setTopRatedAnime(Array.isArray(topRatedData) ? topRatedData : []);

        // 獲取用戶喜歡的動漫
        if (session?.user?.id) {
          try {
            const favoriteRes = await fetch(`/api/anime/favorites?userId=${session.user.id}`);
            if (favoriteRes.ok) {
              const favoriteData = await favoriteRes.json();
              setYourFavoriteAnime(Array.isArray(favoriteData) ? favoriteData : []);
            }
          } catch (err) {
            console.error('Failed to fetch favorites:', err);
          }
        }
      } catch (error) {
        console.error('Failed to fetch anime:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchAnime();
    
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredAnime.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredAnime.length) % featuredAnime.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-pink-400 text-xl animate-pulse">載入中...</div>
      </div>
    );
  }

  const currentAnime = featuredAnime[currentSlide] || featuredAnime[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Carousel */}
      {currentAnime && (
        <div className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={currentAnime.coverImage}
              alt={currentAnime.title}
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
              >
                <span className="text-2xl">←</span>
              </button>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  {currentAnime.title}
                </h1>
                {currentAnime.titleJP && (
                  <h2 className="text-2xl md:text-3xl text-gray-300">
                    {currentAnime.titleJP}
                  </h2>
                )}
                <p className="text-lg text-gray-200 leading-relaxed max-w-xl">
                  {currentAnime.description}
                </p>
                <div className="flex flex-wrap gap-3 mt-6">
                  {currentAnime.releaseDate && (
                    <span className="px-4 py-2 bg-pink-500/20 border border-pink-400 rounded-lg text-pink-200">
                      {new Date(currentAnime.releaseDate).getFullYear()} 年
                    </span>
                  )}
                  <span className="px-4 py-2 bg-pink-500/20 border border-pink-400 rounded-lg text-pink-200">
                    {currentAnime.locations?.length || 0} 個巡禮地點
                  </span>
                </div>
                <Link
                  href={`/anime/${getAnimeSlug(currentAnime.title)}`}
                  className="inline-flex items-center space-x-2 mt-6 px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 rounded-lg text-white font-semibold transition-all shadow-lg"
                >
                  <span>查看詳情</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {featuredAnime.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-pink-400 w-8' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Popular Anime */}
            {popularAnime.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-pink-400">熱門動漫</h2>
                  <Link
                    href="/anime"
                    className="text-pink-300 hover:text-pink-400 transition-colors flex items-center"
                  >
                    查看全部
                    <span className="ml-1">→</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {popularAnime.map((anime) => (
                    <Link
                      key={anime._id}
                      href={`/anime/${getAnimeSlug(anime.title)}`}
                      className="group"
                    >
                      <div className="bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-pink-500/20">
                        <div className="relative h-64">
                          <Image
                            src={anime.coverImage}
                            alt={anime.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 text-white">{anime.title}</h3>
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1 text-pink-300">{anime.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Your Favorite Anime */}
            {session && yourFavoriteAnime.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-pink-400">你的喜歡動漫</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {yourFavoriteAnime.map((anime) => (
                    <Link key={anime._id} href={`/anime/${getAnimeSlug(anime.title)}`}>
                      <div className="bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-pink-500/20">
                        <div className="relative h-64">
                          <Image
                            src={anime.coverImage}
                            alt={anime.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 text-white">{anime.title}</h3>
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1 text-pink-300">{anime.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Anime */}
            {recentAnime.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-pink-400">近期動漫</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {recentAnime.map((anime) => (
                    <Link key={anime._id} href={`/anime/${getAnimeSlug(anime.title)}`}>
                      <div className="bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-pink-500/20">
                        <div className="relative h-64">
                          <Image
                            src={anime.coverImage}
                            alt={anime.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 text-white">{anime.title}</h3>
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="ml-1 text-pink-300">{anime.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Top Rated Sidebar - Right Side */}
          {topRatedAnime.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-dark-card rounded-lg shadow-md p-6 sticky top-20 border border-pink-500/20">
                <h2 className="text-2xl font-bold mb-4 text-pink-400">排行榜 TOP 10</h2>
                <div className="space-y-3">
                  {topRatedAnime.map((anime, index) => (
                    <Link key={anime._id} href={`/anime/${getAnimeSlug(anime.title)}`}>
                      <div className="flex items-center space-x-3 hover:bg-dark-surface p-2 rounded transition-colors">
                        <div className="text-xl font-bold text-pink-400 w-6">
                          {index + 1}
                        </div>
                        <div className="relative w-16 h-24 flex-shrink-0">
                          <Image
                            src={anime.coverImage}
                            alt={anime.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-white truncate">
                            {anime.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 text-xs">⭐</span>
                            <span className="ml-1 text-pink-300 text-xs">
                              {anime.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
