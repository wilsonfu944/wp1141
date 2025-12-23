'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:33',message:'fetchAnime started',data:{sessionId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        // 分別獲取數據，增加重試機制
        const fetchWithRetry = async (url: string, retries = 3): Promise<any[]> => {
          for (let i = 0; i < retries; i++) {
            try {
              const res = await fetch(url);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:40',message:'fetch response',data:{url,status:res.status,ok:res.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              if (res.ok) {
                const data = await res.json();
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:44',message:'fetch data received',data:{url,isArray:Array.isArray(data),length:Array.isArray(data)?data.length:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
                // #endregion
                return Array.isArray(data) ? data : [];
              }
            } catch (error) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:48',message:'fetch error',data:{url,error:String(error),retry:i+1},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              if (i === retries - 1) {
                console.error(`Failed to fetch ${url} after ${retries} retries:`, error);
              }
            }
            // 等待後重試
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          return [];
        };

        const [featured, popular, recent, topRated] = await Promise.all([
          fetchWithRetry('/api/anime?limit=5&sort=rating'),
          fetchWithRetry('/api/anime?limit=6&sort=rating'),
          fetchWithRetry('/api/anime?limit=6&sort=releaseDate'),
          fetchWithRetry('/api/anime?limit=10&sort=rating'),
        ]);

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:65',message:'all fetches completed',data:{featured:featured.length,popular:popular.length,recent:recent.length,topRated:topRated.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // 只在組件仍然掛載時更新狀態
        if (isMounted) {
          // 確保數據是數組
          setFeaturedAnime(Array.isArray(featured) ? featured : []);
          setPopularAnime(Array.isArray(popular) ? popular : []);
          setRecentAnime(Array.isArray(recent) ? recent : []);
          setTopRatedAnime(Array.isArray(topRated) ? topRated : []);

          if (session?.user?.id) {
            try {
              const favoriteRes = await fetch(`/api/anime/favorites?userId=${session.user.id}`);
              if (favoriteRes.ok) {
                const favorite = await favoriteRes.json();
                setYourFavoriteAnime(Array.isArray(favorite) ? favorite : []);
              }
            } catch (error) {
              console.error('Failed to fetch favorites:', error);
            }
          }
        }
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/e5728c66-3cf1-4da1-9bb5-2edbbba77c29',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'HomePage.tsx:85',message:'fetchAnime error',data:{error:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
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
  }, [session]);

  // Reset currentSlide when featuredAnime changes
  useEffect(() => {
    if (featuredAnime.length > 0 && currentSlide >= featuredAnime.length) {
      setCurrentSlide(0);
    }
  }, [featuredAnime.length, currentSlide]);

  // Auto slide carousel
  useEffect(() => {
    if (featuredAnime.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredAnime.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredAnime.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredAnime.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredAnime.length) % featuredAnime.length);
  };

  const goToSlide = (index: number) => {
    if (featuredAnime.length > 0) {
      setCurrentSlide(index);
    }
  };

  const currentAnime = featuredAnime.length > 0 ? featuredAnime[currentSlide] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-pink-400 text-2xl mb-4">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Carousel */}
      {currentAnime && featuredAnime.length > 0 && currentSlide < featuredAnime.length && (
        <div className="relative h-[600px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={currentAnime.coverImage}
              alt={currentAnime.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl text-white">
              {/* Navigation Arrows */}
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
                  href={`/anime/${currentAnime._id}`}
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
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
            {featuredAnime.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-pink-500 w-8'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Recommended Anime Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌟</span>
                  <h2 className="text-3xl font-bold text-pink-400">推薦動畫</h2>
                </div>
                <Link
                  href="/anime"
                  className="text-pink-400 hover:text-pink-300 font-medium flex items-center space-x-1"
                >
                  <span>查看全部</span>
                  <span>→</span>
                </Link>
              </div>

              {popularAnime.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {popularAnime.map((anime) => (
                    <Link
                      key={anime._id}
                      href={`/anime/${anime._id}`}
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
              )}
            </div>

            {/* Your Favorite Anime */}
            {session && yourFavoriteAnime.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-pink-400">你的喜歡動漫</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {yourFavoriteAnime.map((anime) => (
                    <Link key={anime._id} href={`/anime/${anime._id}`}>
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
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-pink-400">近期動漫</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {recentAnime.map((anime) => (
                    <Link key={anime._id} href={`/anime/${anime._id}`}>
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
                    <Link key={anime._id} href={`/anime/${anime._id}`}>
                      <div className="flex items-center space-x-3 hover:bg-dark-surface p-2 rounded transition-colors">
                        <div className="text-xl font-bold text-pink-400 w-6">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{anime.title}</div>
                          <div className="text-sm text-pink-300">
                            ⭐ {anime.rating.toFixed(1)}
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
