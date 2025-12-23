// 創建20個靜態動漫頁面的腳本
// 運行: node scripts/createStaticAnimePages.js

const fs = require('fs');
const path = require('path');

// 20部動漫的標題和 slug 映射
const animeList = [
  { title: '鈴芽之旅', slug: 'suzume' },
  { title: '我想吃掉你的胰臟', slug: 'pancreas' },
  { title: '輝夜姬想讓人告白', slug: 'kaguya' },
  { title: '86-不存在的戰區-', slug: 'eighty-six' },
  { title: '奇巧計程車', slug: 'odd-taxi' },
  { title: '賽馬娘', slug: 'uma-musume' },
  { title: 'Re:從零開始的異世界生活', slug: 're-zero' },
  { title: '約定的夢幻島', slug: 'promised-neverland' },
  { title: 'Dr.STONE 新石紀', slug: 'dr-stone' },
  { title: '輝夜姬物語', slug: 'tale-of-princess' },
  { title: '風起', slug: 'wind-rises' },
  { title: '借物少女艾莉緹', slug: 'arrietty' },
  { title: '魔法少女小圓', slug: 'madoka' },
  { title: '命運石之門', slug: 'steins-gate' },
  { title: 'CLANNAD', slug: 'clannad' },
  { title: 'Angel Beats!', slug: 'angel-beats' },
  { title: '未聞花名', slug: 'anohana' },
  { title: '四月是你的謊言', slug: 'your-lie' },
  { title: '3月的獅子', slug: 'march-lion' },
  { title: '比宇宙更遠的地方', slug: 'a-place-further' },
];

const template = (title, slug) => `'use client';

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

export default function AnimeDetail() {
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimeByTitle = async () => {
      try {
        const res = await fetch('/api/anime', {
          cache: 'no-store',
        });

        if (res.ok) {
          const allAnime = await res.json();
          // 根據標題找到對應的動漫
          const matchedAnime = allAnime.find((a: any) => a.title === '${title}');

          if (matchedAnime) {
            setAnime(matchedAnime);
            setError(null);
          } else {
            setError('動漫不存在');
          }
        } else {
          setError('載入失敗');
        }
      } catch (err: any) {
        setError(\`載入失敗：\${err?.message || 'Unknown error'}\`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeByTitle();
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

// 創建目錄
const animeDir = path.join(__dirname, '../app/anime');
if (!fs.existsSync(animeDir)) {
  fs.mkdirSync(animeDir, { recursive: true });
}

// 為每個動漫創建一個目錄和 page.tsx
animeList.forEach(({ title, slug }) => {
  const slugDir = path.join(animeDir, slug);
  if (!fs.existsSync(slugDir)) {
    fs.mkdirSync(slugDir, { recursive: true });
  }
  
  const pageContent = template(title, slug);
  const pagePath = path.join(slugDir, 'page.tsx');
  fs.writeFileSync(pagePath, pageContent, 'utf8');
  console.log(`Created: app/anime/${slug}/page.tsx (${title})`);
});

console.log(`\n✅ Created ${animeList.length} static anime pages!`);
console.log(`\nNow update AnimeListPage to link to /anime/{slug} instead of /anime/{id}`);
