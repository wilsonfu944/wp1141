'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Anime {
  _id: string;
  title: string;
  coverImage: string;
  rating: number;
  releaseDate: string;
  description: string;
  genres: string[];
}

export default function AnimeListPage() {
  const searchParams = useSearchParams();
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  
  // 年份范围（用于显示和输入）
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState<[number, number]>([1990, currentYear]);
  const [yearMinInput, setYearMinInput] = useState<string>('');
  const [yearMaxInput, setYearMaxInput] = useState<string>('');
  const [yearMin, setYearMin] = useState<number | null>(null);
  const [yearMax, setYearMax] = useState<number | null>(null);
  
  // 评分范围（用于显示和输入）
  const [ratingMinInput, setRatingMinInput] = useState<string>('');
  const [ratingMaxInput, setRatingMaxInput] = useState<string>('');
  const [ratingMin, setRatingMin] = useState<number | null>(null);
  const [ratingMax, setRatingMax] = useState<number | null>(null);
  
  // 获取年份范围（仅用于显示默认值）
  useEffect(() => {
    if (allAnime.length > 0) {
      const years = allAnime
        .map(anime => anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : null)
        .filter((year): year is number => year !== null);
      
      if (years.length > 0) {
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        setYearRange([minYear, maxYear]);
      }
    }
  }, [allAnime]);

  // 搜索函数（包含所有筛选条件）
  const performSearch = useCallback(async (
    search: string,
    genre: string,
    yearMinVal: number | null,
    yearMaxVal: number | null,
    ratingMinVal: number | null,
    ratingMaxVal: number | null
  ) => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }
      if (yearMinVal !== null) {
        params.append('yearMin', yearMinVal.toString());
      }
      if (yearMaxVal !== null) {
        params.append('yearMax', yearMaxVal.toString());
      }
      if (ratingMinVal !== null) {
        params.append('ratingMin', ratingMinVal.toString());
      }
      if (ratingMaxVal !== null) {
        params.append('ratingMax', ratingMaxVal.toString());
      }
      
      const url = params.toString() 
        ? `/api/anime?${params.toString()}`
        : '/api/anime';
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const animeData = Array.isArray(data) ? data : [];
        setAllAnime(animeData);
        
        // 如果有選擇類型，進行過濾
        if (genre) {
          setAnimeList(animeData.filter((anime: Anime) => 
            anime.genres && anime.genres.some((g: string) => 
              g.toLowerCase().includes(genre.toLowerCase())
            )
          ));
        } else {
          setAnimeList(animeData);
        }
      } else {
        console.error('Failed to fetch anime:', res.statusText);
        setAnimeList([]);
        setAllAnime([]);
      }
    } catch (error) {
      console.error('Failed to fetch anime:', error);
      setAnimeList([]);
      setAllAnime([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 关键词搜索和类型筛选仍然实时更新（不包含年份和评分）
  useEffect(() => {
    // 防抖處理
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery, selectedGenre, yearMin, yearMax, ratingMin, ratingMax);
    }, searchQuery ? 300 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenre, performSearch]);

  // 初始加载
  useEffect(() => {
    performSearch(searchQuery, selectedGenre, yearMin, yearMax, ratingMin, ratingMax);
  }, []);

  // 獲取所有類型
  const allGenres = Array.from(
    new Set(allAnime.flatMap((anime) => anime.genres || []))
  ).sort();

  const handleGenreClick = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(''); // 取消選擇
    } else {
      setSelectedGenre(genre);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <div className="text-center text-pink-400">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-pink-400">所有動漫</h1>
      
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋動漫名稱、描述或類型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-dark-surface border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* 筛选选项 */}
        <div className="mt-6 space-y-6 bg-dark-card p-6 rounded-lg border border-pink-500/20">
          {/* 年份范围 */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">年份範圍</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min={yearRange[0]}
                max={yearRange[1]}
                value={yearMinInput}
                onChange={(e) => setYearMinInput(e.target.value)}
                placeholder={`最小 (${yearRange[0]})`}
                className="w-32 px-3 py-2 bg-dark-surface border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500"
              />
              <span className="text-gray-400">至</span>
              <input
                type="number"
                min={yearRange[0]}
                max={yearRange[1]}
                value={yearMaxInput}
                onChange={(e) => setYearMaxInput(e.target.value)}
                placeholder={`最大 (${yearRange[1]})`}
                className="w-32 px-3 py-2 bg-dark-surface border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500"
              />
              {(yearMinInput || yearMaxInput) && (
                <button
                  onClick={() => {
                    setYearMinInput('');
                    setYearMaxInput('');
                    setYearMin(null);
                    setYearMax(null);
                    performSearch(searchQuery, selectedGenre, null, null, ratingMin, ratingMax);
                  }}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* 评分范围 */}
          <div>
            <label className="text-sm font-semibold text-white mb-3 block">評分範圍</label>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={ratingMinInput}
                onChange={(e) => setRatingMinInput(e.target.value)}
                placeholder="最低 (0.0)"
                className="w-32 px-3 py-2 bg-dark-surface border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500"
              />
              <span className="text-gray-400">至</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={ratingMaxInput}
                onChange={(e) => setRatingMaxInput(e.target.value)}
                placeholder="最高 (5.0)"
                className="w-32 px-3 py-2 bg-dark-surface border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:border-pink-500"
              />
              {(ratingMinInput || ratingMaxInput) && (
                <button
                  onClick={() => {
                    setRatingMinInput('');
                    setRatingMaxInput('');
                    setRatingMin(null);
                    setRatingMax(null);
                    performSearch(searchQuery, selectedGenre, yearMin, yearMax, null, null);
                  }}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* 搜索按钮 */}
          <div className="pt-2">
            <button
              onClick={() => {
                // 解析输入值
                const newYearMin = yearMinInput ? parseInt(yearMinInput) : null;
                const newYearMax = yearMaxInput ? parseInt(yearMaxInput) : null;
                const newRatingMin = ratingMinInput ? parseFloat(ratingMinInput) : null;
                const newRatingMax = ratingMaxInput ? parseFloat(ratingMaxInput) : null;
                
                // 验证范围
                if (newYearMin !== null && newYearMax !== null && newYearMin > newYearMax) {
                  alert('最小年份不能大于最大年份');
                  return;
                }
                if (newRatingMin !== null && newRatingMax !== null && newRatingMin > newRatingMax) {
                  alert('最低评分不能大于最高评分');
                  return;
                }
                
                // 设置筛选值并搜索
                setYearMin(newYearMin);
                setYearMax(newYearMax);
                setRatingMin(newRatingMin);
                setRatingMax(newRatingMax);
                performSearch(searchQuery, selectedGenre, newYearMin, newYearMax, newRatingMin, newRatingMax);
              }}
              className="w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 font-semibold transition-colors"
            >
              搜尋
            </button>
          </div>

          {/* 類型快捷按鈕 */}
          {allGenres.length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-2">快速篩選類型：</p>
              <div className="flex flex-wrap gap-2">
                {allGenres.slice(0, 12).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreClick(genre)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedGenre === genre
                        ? 'bg-pink-500 text-white'
                        : 'bg-dark-surface text-gray-300 hover:bg-pink-500/20 border border-pink-500/30'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
                {selectedGenre && (
                  <button
                    onClick={() => setSelectedGenre('')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-600 text-white hover:bg-gray-500"
                  >
                    清除類型
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {(searchQuery || selectedGenre || yearMin !== null || yearMax !== null || ratingMin !== null || ratingMax !== null) && (
          <p className="mt-4 text-sm text-gray-400">
            找到 {animeList.length} 個結果
          </p>
        )}
      </div>

      {!loading && animeList.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => (
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
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="ml-1 text-pink-300">{anime.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.slice(0, 2).map((genre, index) => (
                      <span
                        key={index}
                        className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded border border-pink-500/30"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
