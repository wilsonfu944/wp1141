// 更新所有靜態頁面，把重試次數改成100次
const fs = require('fs');
const path = require('path');

// Slug 到 ID 的映射
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

// 睡覺工具函式：把控制權還給瀏覽器，避免卡死
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function AnimeDetail() {
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 重試最多100次，每次間隔1秒（總共最多100秒）
    // 如果頁面卡死（一直載入中），至少證明代碼有在執行
    const fetchAnimeWithRetry = async () => {
      let retryCount = 0;
      const maxRetries = 100; // 🔥 改成100次，讓用戶看到頁面至少會卡死

      while (retryCount < maxRetries) {
        try {
          console.log(\`嘗試獲取動漫資料 (第 \${retryCount + 1} 次 / 最多100次)...\`);
          
          const res = await fetch(\`/api/anime/\${ANIME_ID}\`, {
            cache: 'no-store',
          });

          if (res.ok) {
            const data = await res.json();
            console.log('✅ 成功獲取動漫資料！');
            setAnime(data);
            setError(null);
            setLoading(false);
            return; // 成功就退出
          } else if (res.status === 404) {
            // 404 不需要重試
            console.log('❌ 動漫不存在 (404)');
            setError('動漫不存在');
            setLoading(false);
            return;
          } else {
            // 其他錯誤，繼續重試
            console.log(\`❌ 請求失敗 (狀態碼: \${res.status})，準備重試... (第 \${retryCount + 1} 次)\`);
            retryCount++;
            if (retryCount < maxRetries) {
              await sleep(1000); // 等待1秒再重試
            }
          }
        } catch (err: any) {
          console.error(\`發生錯誤 (第 \${retryCount + 1} 次): \${err?.message || 'Unknown error'}\`);
          retryCount++;
          if (retryCount < maxRetries) {
            await sleep(1000); // 等待1秒再重試
          }
        }
      }

      // 如果所有重試都失敗
      if (retryCount >= maxRetries) {
        console.log('❌ 重試次數已達上限 (100次)');
        setError('載入失敗，請稍後再試');
        setLoading(false);
      }
    };

    fetchAnimeWithRetry();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
        <div className="text-center">
          <div className="animate-pulse text-pink-400 text-xl">載入中...</div>
          <div className="mt-4 text-gray-400 text-sm">正在重試獲取動漫資料（最多100次）</div>
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

console.log(`\n✅ Updated all ${Object.keys(slugToId).length} static pages with 100 retries!`);
console.log(`\n現在每個頁面會：`);
console.log(`- 重試最多100次（每次間隔1秒，總共最多100秒）`);
console.log(`- 如果代碼有執行，頁面應該會卡死（一直載入中）`);
console.log(`- 如果還是立即顯示「不存在」，可能是代碼根本沒執行`);

