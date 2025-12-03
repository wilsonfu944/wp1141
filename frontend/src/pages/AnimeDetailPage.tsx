import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Map, Calendar, Film, Heart } from 'lucide-react';
import { animesAPI, favoriteAnimesAPI } from '../services/api';
import type { Anime } from '../types';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import LocationCard from '../components/Location/LocationCard';
import RatingDisplay from '../components/Rating/RatingDisplay';
import { useAuth } from '../context/AuthContext';

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: anime, isLoading } = useQuery<Anime>({
    queryKey: ['anime', id],
    queryFn: () => animesAPI.getById(id!),
    enabled: !!id,
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite-anime-check', id],
    queryFn: () => favoriteAnimesAPI.check(id!),
    enabled: !!id && isAuthenticated,
  });

  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  const favoriteMutation = useMutation({
    mutationFn: () => (isFavorited ? favoriteAnimesAPI.remove(id!) : favoriteAnimesAPI.add(id!)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-anime-check', id] });
      queryClient.invalidateQueries({ queryKey: ['favorite-animes'] });
      setIsFavorited(!isFavorited);
    },
  });

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    favoriteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400">載入中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400">找不到此動畫</p>
            <Link to="/animes" className="text-pink-500 hover:text-pink-400 mt-4 inline-block">
              返回動畫列表
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 py-12 px-4">
          <div className="container mx-auto">
            <Link
              to="/animes"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回動畫列表
            </Link>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-64 flex-shrink-0">
                <div className="aspect-[2/3] bg-slate-700 rounded-lg overflow-hidden">
                  {anime.coverImage ? (
                    <img
                      src={anime.coverImage}
                      alt={anime.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <span className="text-8xl">🎬</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {anime.name}
                </h1>
                {anime.nameEn && (
                  <p className="text-xl text-slate-300 mb-4">{anime.nameEn}</p>
                )}

                {/* 評分顯示 */}
                <div className="mb-6">
                  <RatingDisplay type="anime" id={anime.id} size="lg" />
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  {anime.year && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-5 h-5" />
                      <span>{anime.year} 年</span>
                    </div>
                  )}
                  {anime.genre && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Film className="w-5 h-5" />
                      <span>{anime.genre}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-300">
                    <Map className="w-5 h-5" />
                    <span>{anime.locations?.length || 0} 個巡禮地點</span>
                  </div>
                </div>

                {anime.description && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-white mb-2">簡介</h2>
                    <p className="text-slate-300 leading-relaxed">{anime.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/map?anime=${anime.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Map className="w-5 h-5" />
                    在地圖上查看所有地點
                  </Link>
                  {isAuthenticated && (
                    <button
                      onClick={handleToggleFavorite}
                      disabled={favoriteMutation.isPending}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                        isFavorited
                          ? 'bg-pink-500 hover:bg-pink-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                      {isFavorited ? '已加入最愛' : '加入最愛'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Locations Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">
              取景地點 ({anime.locations?.length || 0})
            </h2>

            {anime.locations && anime.locations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {anime.locations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">目前還沒有地點資料</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


