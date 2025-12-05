import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Anime } from '../../types';

interface AnimeCarouselProps {
  animes: Anime[];
  autoPlayInterval?: number; // 自动播放间隔（毫秒）
}

export default function AnimeCarousel({ animes, autoPlayInterval = 5000 }: AnimeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 自动播放
  useEffect(() => {
    if (animes.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animes.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [animes.length, autoPlayInterval, isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + animes.length) % animes.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % animes.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (animes.length === 0) {
    return null;
  }

  const currentAnime = animes[currentIndex];

  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 背景图片 - 使用所有图片实现平滑过渡 */}
      <div className="absolute inset-0">
        {animes.map((anime, index) => (
          <div
            key={anime.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {anime.coverImage ? (
              <img
                src={anime.coverImage}
                alt={anime.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <span className="text-9xl text-slate-500">🎬</span>
              </div>
            )}
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-slate-900/50" />
          </div>
        ))}
      </div>

      {/* 内容 - 使用淡入淡出效果 */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
        {animes.map((anime, index) => (
          <div
            key={anime.id}
            className={`absolute bottom-8 md:bottom-12 left-8 md:left-12 right-8 md:right-12 max-w-4xl transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {anime.name}
            </h2>
            {anime.nameEn && (
              <p className="text-xl md:text-2xl text-slate-300 mb-4 drop-shadow-md">
                {anime.nameEn}
              </p>
            )}
            {anime.description ? (
              <p className="text-base md:text-lg text-slate-300 mb-6 line-clamp-3 drop-shadow-md">
                {anime.description}
              </p>
            ) : (
              <p className="text-base md:text-lg text-slate-400 mb-6">
                探索 {anime.name} 的動漫聖地，追隨角色的腳步，體驗真實的動畫世界。
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {anime.year && (
                <span className="px-4 py-2 bg-pink-500/20 text-pink-300 rounded-lg text-sm font-medium backdrop-blur-sm border border-pink-500/30">
                  {anime.year} 年
                </span>
              )}
              {anime.genre && (
                <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium backdrop-blur-sm border border-purple-500/30">
                  {anime.genre}
                </span>
              )}
              <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium backdrop-blur-sm border border-blue-500/30">
                {anime.locations?.length || 0} 個巡禮地點
              </span>
            </div>
            <Link
              to={`/animes/${anime.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors shadow-lg"
            >
              查看詳情
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ))}
      </div>

      {/* 导航按钮 */}
      {animes.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-full transition-colors backdrop-blur-sm"
            aria-label="上一张"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-800/80 hover:bg-slate-700/90 rounded-full transition-colors backdrop-blur-sm"
            aria-label="下一张"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* 指示器 */}
      {animes.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {animes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all ${
                index === currentIndex
                  ? 'w-8 h-2 bg-pink-500 rounded-full'
                  : 'w-2 h-2 bg-slate-500 rounded-full hover:bg-slate-400'
              }`}
              aria-label={`跳转到第 ${index + 1} 张`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

