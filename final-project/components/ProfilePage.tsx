'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { AVATAR_COLORS, generateAvatarSVG } from '@/lib/avatar';

interface UserProfile {
  name: string;
  email: string;
  image?: string;
  bio?: string;
  avatarColor?: string;
  favoriteAnime: {
    _id: string;
    title: string;
    coverImage: string;
  }[];
}

interface Anime {
  _id: string;
  title: string;
  coverImage: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#ec4899');
  const [favoriteAnime, setFavoriteAnime] = useState<string[]>([]);
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [animeSearchResults, setAnimeSearchResults] = useState<Anime[]>([]);
  const [showAnimeSearch, setShowAnimeSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setProfile(data);
      setName(data.name || '');
      setBio(data.bio || '');
      setAvatarColor(data.avatarColor || '#ec4899');
      setFavoriteAnime(data.favoriteAnime?.map((a: any) => a._id) || []);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function searchAnime(query: string) {
    if (!query.trim()) {
      setAnimeSearchResults([]);
      return;
    }
    
    try {
      const res = await fetch(`/api/anime?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setAnimeSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to search anime:', error);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (animeSearchQuery) {
        searchAnime(animeSearchQuery);
      } else {
        setAnimeSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [animeSearchQuery]);

  const handleAddFavoriteAnime = (animeId: string) => {
    if (!favoriteAnime.includes(animeId)) {
      setFavoriteAnime([...favoriteAnime, animeId]);
    }
    setAnimeSearchQuery('');
    setAnimeSearchResults([]);
    setShowAnimeSearch(false);
  };

  const handleRemoveFavoriteAnime = (animeId: string) => {
    setFavoriteAnime(favoriteAnime.filter(id => id !== animeId));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          bio, 
          avatarColor,
          favoriteAnime 
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        // 更新 favoriteAnime 陣列
        setFavoriteAnime(updated.favoriteAnime?.map((a: any) => a._id) || []);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <p className="text-center text-gray-400">請先登入</p>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">載入中...</div>;
  }

  const avatarSVG = generateAvatarSVG(profile?.name || name || 'U', avatarColor);
  const currentFavoriteAnime = profile?.favoriteAnime || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-dark-card rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={avatarSVG}
                alt={profile?.name || name || 'User'}
                className="w-20 h-20 rounded-full"
              />
              {editing && (
                <div className="absolute -bottom-2 -right-2 bg-pink-500 rounded-full p-1">
                  <span className="text-xs text-white">編輯</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold border border-pink-500/30 rounded px-2 py-1 bg-dark-surface text-white w-full"
                />
              ) : (
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
              )}
              <p className="text-gray-400">{profile?.email}</p>
            </div>
          </div>
          {editing ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(profile?.name || '');
                  setBio(profile?.bio || '');
                  setAvatarColor(profile?.avatarColor || '#ec4899');
                  setFavoriteAnime(profile?.favoriteAnime?.map((a: any) => a._id) || []);
                }}
                className="bg-dark-surface text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
            >
              編輯資料
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-300">自我介紹</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full p-3 border border-pink-500/30 rounded-lg bg-dark-surface text-white resize-none"
                placeholder="寫一些關於自己的介紹..."
              />
              <p className="text-sm text-gray-400 mt-1">{bio.length}/500</p>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-300">頭像顏色</label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      avatarColor === color
                        ? 'border-white scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2">
                <img
                  src={generateAvatarSVG(name || 'U', avatarColor)}
                  alt="Preview"
                  className="w-16 h-16 rounded-full inline-block"
                />
                <span className="ml-2 text-gray-400 text-sm">預覽</span>
              </div>
            </div>
          </div>
        ) : (
          profile?.bio && (
            <div className="mb-4">
              <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )
        )}
      </div>

      <div className="bg-dark-card rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">我最喜歡的動漫</h2>
          {editing && (
            <button
              onClick={() => setShowAnimeSearch(!showAnimeSearch)}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 text-sm"
            >
              {showAnimeSearch ? '取消' : '+ 添加動漫'}
            </button>
          )}
        </div>

        {editing && showAnimeSearch && (
          <div className="mb-4">
            <input
              type="text"
              value={animeSearchQuery}
              onChange={(e) => setAnimeSearchQuery(e.target.value)}
              placeholder="搜尋動漫..."
              className="w-full p-3 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
            />
            {animeSearchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border border-pink-500/30 rounded-lg bg-dark-surface">
                {animeSearchResults
                  .filter(anime => !favoriteAnime.includes(anime._id))
                  .map((anime) => (
                    <button
                      key={anime._id}
                      onClick={() => handleAddFavoriteAnime(anime._id)}
                      className="w-full text-left p-3 hover:bg-dark-card flex items-center space-x-3"
                    >
                      <img
                        src={anime.coverImage}
                        alt={anime.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <span className="text-white">{anime.title}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {editing ? (
          <div className="space-y-2">
            {favoriteAnime.map((animeId) => {
              const anime = currentFavoriteAnime.find((a: any) => a._id === animeId);
              if (!anime) return null;
              return (
                <div
                  key={animeId}
                  className="flex items-center justify-between p-3 bg-dark-surface rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <span className="text-white">{anime.title}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFavoriteAnime(animeId)}
                    className="text-red-400 hover:text-red-500"
                  >
                    移除
                  </button>
                </div>
              );
            })}
            {favoriteAnime.length === 0 && (
              <p className="text-gray-400">還沒有添加喜歡的動漫</p>
            )}
          </div>
        ) : (
          <>
            {currentFavoriteAnime.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentFavoriteAnime.map((anime: any) => (
                  <Link key={anime._id} href={`/anime/${anime._id}`}>
                    <div className="bg-dark-surface rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48">
                        <Image
                          src={anime.coverImage}
                          alt={anime.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm">{anime.title}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">還沒有添加喜歡的動漫</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
