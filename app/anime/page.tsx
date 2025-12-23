import connectDB from '@/lib/mongodb';
import Anime from '@/models/Anime';
import Link from 'next/link';
import Image from 'next/image';
import { getAnimeSlug } from '@/lib/animeSlug';

// 改為 Server Component，在服務器端獲取數據
export default async function AnimeList() {
  await connectDB();
  
  const animeList = await Anime.find({})
    .select('_id title coverImage rating genres')
    .lean()
    .exec();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-pink-400">所有動漫</h1>
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime: any) => {
            const slug = getAnimeSlug(anime.title);
            return (
              <Link key={String(anime._id)} href={`/anime/${slug}`}>
                <div className="bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-pink-500/20">
                  <div className="relative h-64">
                    <Image
                      src={anime.coverImage || '/placeholder.png'}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.png';
                        e.currentTarget.srcset = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-white">{anime.title}</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 text-pink-300">
                        {typeof anime.rating === 'number' ? anime.rating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(anime.genres) && anime.genres.slice(0, 2).map((genre: string, index: number) => (
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
