'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAnimeSlug } from '@/lib/animeSlug';

interface Anime {
  _id: string;
  title: string;
  coverImage: string;
  rating: number;
  description: string;
  genres: string[];
}

export default function AnimeListPage() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnime() {
      try {
        const res = await fetch('/api/anime');
        if (res.ok) {
          const data = await res.json();
          setAnimeList(Array.isArray(data) ? data : []);
        } else {
          console.error('Failed to fetch anime:', res.statusText);
          setAnimeList([]);
        }
      } catch (error) {
        console.error('Failed to fetch anime:', error);
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAnime();
  }, []);

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
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => {
            const slug = getAnimeSlug(anime.title);
            return (
              <Link key={anime._id} href={`/anime/${slug}`}>
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
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">暫無資料</p>
      )}
    </div>
  );
}
