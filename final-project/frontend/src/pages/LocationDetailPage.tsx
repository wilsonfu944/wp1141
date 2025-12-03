import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Heart, ExternalLink, Star } from 'lucide-react';
import { locationsAPI, favoritesAPI } from '../services/api';
import type { Location } from '../types';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ImageSlider from '../components/ImageSlider/ImageSlider';
import CommentList from '../components/Comment/CommentList';
import RatingStars from '../components/Rating/RatingStars';
import { useState, useEffect } from 'react';

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: location, isLoading } = useQuery<Location>({
    queryKey: ['location', id],
    queryFn: () => locationsAPI.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (location && isAuthenticated) {
      favoritesAPI
        .check(location.id)
        .then((data) => {
          setIsFavorited(data.isFavorited);
        })
        .catch(() => {
          setIsFavorited(false);
        });
    } else {
      setIsFavorited(false);
    }
  }, [location, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!location || !isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        await favoritesAPI.remove(location.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(location.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
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

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-slate-400">找不到此地點</p>
            <Link to="/map" className="text-pink-500 hover:text-pink-400 mt-4 inline-block">
              返回地圖
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 計算平均評分（從評論 API 獲取，這裡先設為 0）
  const averageRating = 0; // 將從 CommentList 元件中獲取

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 py-8 px-4">
          <div className="container mx-auto">
            <Link
              to={location.anime ? `/animes/${location.anime.id}` : '/map'}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </Link>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Slider */}
              <div className="w-full md:w-1/2">
                <ImageSlider
                  leftImage={location.animeImage}
                  rightImage={location.realImage}
                  leftImageLabel="動畫截圖"
                  rightImageLabel="真實照片"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="mb-4">
                  {location.anime && (
                    <Link
                      to={`/animes/${location.anime.id}`}
                      className="inline-block px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium mb-3 hover:bg-pink-500/30 transition-colors"
                    >
                      {location.anime.name}
                    </Link>
                  )}
                  <h1 className="text-4xl font-bold text-white mb-2">{location.name}</h1>
                  {location.episode && (
                    <p className="text-slate-300 mb-4">第 {location.episode} 話</p>
                  )}
                </div>


                {location.description && (
                  <p className="text-slate-300 mb-6 leading-relaxed">{location.description}</p>
                )}

                <div className="flex items-start gap-2 mb-6">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">{location.address}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={!isAuthenticated || loading}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isFavorited
                        ? 'bg-pink-500 hover:bg-pink-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    {isFavorited ? '已收藏' : '收藏'}
                  </button>

                  <button
                    onClick={handleGoogleMaps}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    在 Google Maps 中開啟
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <CommentList locationId={location.id} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

