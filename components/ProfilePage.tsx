'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { getAnimeSlug } from '@/lib/animeSlug';

interface Profile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  favoriteAnime?: Array<{
    _id: string;
    title: string;
    coverImage: string;
  }>;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
        <div className="text-center text-pink-400">載入中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">請先登入</p>
          <Link href="/auth/signin" className="text-pink-400 hover:underline">
            前往登入
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen text-white">
      <div className="bg-dark-card rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image
              src={profile?.image || '/default-avatar.png'}
              alt={profile?.name || 'User'}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
                e.currentTarget.srcset = '/default-avatar.png';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile?.name || 'User'}</h1>
            <p className="text-gray-400">{profile?.email || ''}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-card rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">我最喜歡的動漫</h2>
        {profile?.favoriteAnime && profile.favoriteAnime.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.favoriteAnime.map((anime) => {
              const slug = getAnimeSlug(anime.title);
              return (
                <Link key={anime._id} href={`/anime/${slug}`}>
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
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">还没有添加喜歡的動漫</p>
        )}
      </div>
    </div>
  );
}
