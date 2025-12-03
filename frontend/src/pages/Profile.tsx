import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI, itinerariesAPI } from '../services/api';
import type { Favorite, Location, Itinerary } from '../types';
import { Heart, MapPin, ExternalLink, Route as RouteIcon } from 'lucide-react';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';

export default function Profile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'itineraries'>('favorites');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      Promise.all([
        favoritesAPI.getAll().catch(() => []),
        itinerariesAPI.getByUser(user.id).catch(() => []),
      ])
        .then(([favoritesData, itinerariesData]) => {
          setFavorites(favoritesData);
          setItineraries(itinerariesData);
        })
        .catch((error) => {
          console.error('Failed to load data:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleRemoveFavorite = async (locationId: string) => {
    try {
      await favoritesAPI.remove(locationId);
      setFavorites(favorites.filter((fav) => fav.locationId !== locationId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleGoogleMaps = (location: Location) => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">請先登入</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-slate-800/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">個人頁面</h1>
              <p className="text-slate-400">
                {user?.name || user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              登出
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              我的收藏 ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('itineraries')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'itineraries'
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RouteIcon className="w-5 h-5 inline mr-2" />
              我的行程 ({itineraries.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">載入中...</p>
            </div>
          ) : activeTab === 'favorites' ? (
            favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-4">還沒有收藏任何地點</p>
                <Link
                  to="/map"
                  className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                >
                  開始探索
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favorite) => {
                  const location = favorite.location;
                  return (
                    <div
                      key={favorite.id}
                      className="bg-slate-700/50 rounded-lg overflow-hidden border border-slate-600 hover:border-pink-500 transition-colors"
                    >
                      <Link to={`/locations/${location.id}`}>
                        <div className="relative h-48 bg-slate-600">
                          <img
                            src={location.realImage}
                            alt={location.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/locations/${location.id}`}>
                          <h3 className="font-bold text-lg mb-2 hover:text-pink-500 transition-colors">
                            {location.name}
                          </h3>
                        </Link>
                        {location.anime && (
                          <Link
                            to={`/animes/${location.anime.id}`}
                            className="text-pink-400 text-sm mb-2 hover:text-pink-300 transition-colors block"
                          >
                            {location.anime.name}
                          </Link>
                        )}
                        <div className="flex items-start gap-2 text-slate-400 text-sm mb-4">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p className="line-clamp-2">{location.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemoveFavorite(location.id)}
                            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                          >
                            移除收藏
                          </button>
                          <button
                            onClick={() => handleGoogleMaps(location)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            地圖
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'itineraries' ? (
            itineraries.length === 0 ? (
              <div className="text-center py-12">
                <RouteIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-4">還沒有建立任何行程</p>
                <Link
                  to="/map"
                  className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                >
                  開始規劃
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <Link
                  to="/profile/itineraries"
                  className="inline-block px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
                >
                  查看所有行程
                </Link>
                <div className="text-slate-400 text-sm">
                  您有 {itineraries.length} 個行程
                </div>
              </div>
            )
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

