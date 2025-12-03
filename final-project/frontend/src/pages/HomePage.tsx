import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Star } from 'lucide-react';
import { animesAPI, locationsAPI } from '../services/api';
import type { Anime, Location } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function HomePage() {
  const { data: animes = [] } = useQuery<Anime[]>({
    queryKey: ['animes'],
    queryFn: () => animesAPI.getAll(),
  });

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: () => locationsAPI.getAll(),
  });

  // 取得前 6 個動畫作為推薦
  const featuredAnimes = animes.slice(0, 6);
  // 取得前 6 個地點作為熱門地點
  const popularLocations = locations.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Featured Animes */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Star className="w-8 h-8 text-pink-500" />
                推薦動畫
              </h2>
              <Link
                to="/animes"
                className="text-pink-500 hover:text-pink-400 transition-colors"
              >
                查看全部 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredAnimes.map((anime) => (
                <Link
                  key={anime.id}
                  to={`/animes/${anime.id}`}
                  className="group bg-slate-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                >
                  <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden">
                    {anime.coverImage ? (
                      <img
                        src={anime.coverImage}
                        alt={anime.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-pink-500 transition-colors">
                      {anime.name}
                    </h3>
                    {anime.nameEn && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {anime.nameEn}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {anime.locations?.length || 0} 個地點
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Locations */}
        <section className="py-16 px-4 bg-slate-800/30">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-pink-500" />
                熱門地點
              </h2>
              <Link
                to="/map"
                className="text-pink-500 hover:text-pink-400 transition-colors"
              >
                查看地圖 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularLocations.map((location) => (
                <Link
                  key={location.id}
                  to={`/locations/${location.id}`}
                  className="group bg-slate-800 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform"
                >
                  <div className="aspect-video bg-slate-700 relative overflow-hidden">
                    <img
                      src={location.realImage}
                      alt={location.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-white text-lg mb-1 group-hover:text-pink-500 transition-colors">
                        {location.name}
                      </h3>
                      {location.anime && (
                        <p className="text-pink-400 text-sm">{location.anime.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-400 text-sm line-clamp-2">{location.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

