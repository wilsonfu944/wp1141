// 更新所有靜態頁面，硬編碼動漫 ID
const fs = require('fs');
const path = require('path');

// Slug 到 ID 的映射（從數據庫獲取的真實 ID）
const slugToId = {
  'suzume': '69495fbabb6f0ac1d1c1e42b',
  'pancreas': '69495fbabb6f0ac1d1c1e42c',
  'kaguya': '69495fbabb6f0ac1d1c1e42d',
  'eighty-six': '69495fbabb6f0ac1d1c1e42e',
  'odd-taxi': '69495fbabb6f0ac1d1c1e42f',
  'uma-musume': '69495fbabb6f0ac1d1c1e430',
  're-zero': '69495fbabb6f0ac1d1c1e431',
  'promised-neverland': '69495fbabb6f0ac1d1c1e432',
  'dr-stone': '69495fbabb6f0ac1d1c1e433',
  'tale-of-princess': '69495fbabb6f0ac1d1c1e434',
  'wind-rises': '69495fbabb6f0ac1d1c1e435',
  'arrietty': '69495fbabb6f0ac1d1c1e436',
  'madoka': '69495fbabb6f0ac1d1c1e437',
  'steins-gate': '69495fbabb6f0ac1d1c1e438',
  'clannad': '69495fbabb6f0ac1d1c1e439',
  'angel-beats': '69495fbabb6f0ac1d1c1e43a',
  'anohana': '69495fbabb6f0ac1d1c1e43b',
  'your-lie': '69495fbabb6f0ac1d1c1e43c',
  'march-lion': '69495fbabb6f0ac1d1c1e43d',
  'a-place-further': '69495fbabb6f0ac1d1c1e43e',
};

const template = (slug, animeId) => `'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AnimeDetailPage from '@/components/AnimeDetailPage';

interface Anime {
  _id: string;
  title: string;
  titleJP?: string;
  description: string;
  coverImage: string;
  rating: number;
  releaseDate: string;
  genres: string[];
  studio?: string;
  episodes?: number;
  status: string;
  locations: any[];
  createdAt: string;
  updatedAt: string;
}

// 硬編碼的動漫 ID（像按鈕一樣固定）
const ANIME_ID = '${animeId}';

export default function AnimeDetail() {
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 最暴力方法：直接用硬編碼的 ID 調用 API
    const fetchAnimeById = async () => {
      try {
        const res = await fetch(\`/api/anime/\${ANIME_ID}\`, {
          cache: 'no-store',
        });

        if (res.ok) {
          const data = await res.json();
          setAnime(data);
          setError(null);
        } else {
          setError('動漫不存在');
        }
      } catch (err: any) {
        setError(\`載入失敗：\${err?.message || 'Unknown error'}\`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeById();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
        <div className="text-center">
          <div className="animate-pulse text-pink-400 text-xl">載入中...</div>
        </div>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error || '動漫不存在'}</div>
          <button
            onClick={() => router.back()}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return <AnimeDetailPage animeId={anime._id} initialAnime={anime} />;
}
`;

// 更新所有頁面
const animeDir = path.join(__dirname, '../app/anime');

Object.entries(slugToId).forEach(([slug, id]) => {
  const pagePath = path.join(animeDir, slug, 'page.tsx');
  if (fs.existsSync(pagePath)) {
    const pageContent = template(slug, id);
    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log(`✅ Updated: app/anime/${slug}/page.tsx (ID: ${id})`);
  } else {
    console.log(`❌ Not found: app/anime/${slug}/page.tsx`);
  }
});

console.log(`\n✅ Updated all ${Object.keys(slugToId).length} static pages with hardcoded IDs!`);

