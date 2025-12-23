'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { getAnimeSlug } from '@/lib/animeSlug';

interface Location {
  _id: string;
  name: string;
  nameJP?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  rating: number;
  anime: {
    _id: string;
    title: string;
    coverImage: string;
  };
  userPhotos: UserPhoto[];
}

interface UserPhoto {
  _id: string;
  imageUrl: string;
  caption?: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  likes: string[];
}

export default function LocationDetailPage({ locationId }: { locationId: string }) {
  const { data: session } = useSession();
  const [location, setLocation] = useState<Location | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationRes, commentsRes] = await Promise.all([
          fetch(`/api/location/${locationId}`),
          fetch(`/api/comments?targetType=location&targetId=${locationId}`),
        ]);

        if (!locationRes.ok) {
          const errorData = await locationRes.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch location:', errorData);
          setLocation(null);
          setLoading(false);
          return;
        }

        const [locationData, commentsData] = await Promise.all([
          locationRes.json(),
          commentsRes.ok ? commentsRes.json() : [],
        ]);

        if (!locationData) {
          setLocation(null);
        } else {
          setLocation(locationData);
        }
        setComments(Array.isArray(commentsData) ? commentsData : []);
        
        // Initialize liked comments
        if (session?.user?.id && Array.isArray(commentsData)) {
          const liked = new Set<string>();
          commentsData.forEach((comment: Comment) => {
            if (comment.likes && Array.isArray(comment.likes)) {
              const isLiked = comment.likes.some((id: any) => {
                const idStr = typeof id === 'string' ? id : (id?.toString ? id.toString() : String(id));
                return idStr === session.user.id;
              });
              if (isLiked) {
                liked.add(comment._id);
              }
            }
          });
          setLikedComments(liked);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [locationId, session?.user?.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          targetType: 'location',
          targetId: locationId,
        }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session || !e.target.files?.[0]) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('locationId', locationId);

    try {
      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const photo = await res.json();
        if (location) {
          setLocation({
            ...location,
            userPhotos: [photo, ...(location.userPhotos || [])],
          });
        }
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/location/${locationId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        const data = await res.json();
        if (location) {
          setLocation({ ...location, rating: data.rating });
        }
        setUserRating(rating);
      }
    } catch (error) {
      console.error('Failed to rate location:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const newLiked = new Set(likedComments);
        if (data.liked) {
          newLiked.add(commentId);
        } else {
          newLiked.delete(commentId);
        }
        setLikedComments(newLiked);
        
        // Update comment likes count
        setComments((prev) =>
          prev.map((comment) => {
            if (comment._id === commentId) {
              const currentLikes = Array.isArray(comment.likes) ? comment.likes : [];
              if (data.liked) {
                return { ...comment, likes: [...currentLikes, session.user.id] };
              } else {
                return { ...comment, likes: currentLikes.filter((id: any) => {
                  const idStr = typeof id === 'string' ? id : (id?.toString ? id.toString() : String(id));
                  return idStr !== session.user.id;
                }) };
              }
            }
            return comment;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleShareComment = async (commentId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#comment-${commentId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('評論連結已複製到剪貼板！');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('評論連結已複製到剪貼板！');
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">載入中...</div>;
  }

  if (!location) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">景点不存在</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="mb-8">
        {location.anime && (
          <Link
            href={`/anime/${getAnimeSlug(location.anime.title)}`}
            className="text-pink-400 hover:underline mb-4 inline-block"
          >
            ← 返回 {location.anime.title || '動漫'}
          </Link>
        )}
        <h1 className="text-4xl font-bold mb-2">{location.name}</h1>
        {location.nameJP && (
          <h2 className="text-2xl text-gray-400 mb-4">{location.nameJP}</h2>
        )}
        <p className="text-gray-300 mb-4">{location.description}</p>
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 text-2xl">⭐</span>
            <span className="ml-2 text-xl font-bold">{location.rating?.toFixed(1) || '0.0'}</span>
          </div>
          {session && (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-400 mr-2">評分：</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-2xl transition-colors"
                >
                  {star <= (hoveredRating || userRating) ? (
                    <span className="text-yellow-400">★</span>
                  ) : (
                    <span className="text-gray-500">☆</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-gray-400">📍 {location.address}</p>
        <p className="text-sm text-gray-400 mt-2">
          座標: {location.latitude}, {location.longitude}
        </p>
      </div>

      {/* 官方图片 */}
      {location.images && location.images.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">官方图片</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {location.images.map((image, index) => (
              <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                <Image 
                  src={image || '/placeholder-image.jpg'} 
                  alt={`${location.name} ${index + 1}`} 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 用戶上傳的照片 */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">用戶照片</h2>
          {session && (
            <label className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 cursor-pointer">
              {uploading ? '上傳中...' : '上傳照片'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {location.userPhotos && location.userPhotos.length > 0 ? (
            location.userPhotos.map((photo) => (
              <div key={photo._id} className="bg-dark-card rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || 'User photo'}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
                <div className="p-3">
                  {photo.caption && (
                    <p className="text-sm text-gray-300 mb-2">{photo.caption}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-400">
                    {photo.author.image ? (
                      <Image
                        src={photo.author.image}
                        alt={photo.author.name}
                        width={20}
                        height={20}
                        className="rounded-full mr-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs mr-2">
                        {photo.author.name.charAt(0)}
                      </div>
                    )}
                    <span>{photo.author.name}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full text-center py-8">暫無用戶照片</p>
          )}
        </div>
      </section>

      {/* 評論区 - Twitter Style */}
      <section>
        <h2 className="text-2xl font-bold mb-4">評論区</h2>
        {session ? (
          <div className="bg-dark-card rounded-lg p-4 mb-6 border border-pink-500/20">
            <form onSubmit={handleSubmitComment} className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="有什麼想法？"
                className="w-full p-3 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  發表
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-dark-card rounded-lg p-6 mb-6 border border-pink-500/20 text-center">
            <p className="text-gray-400 mb-2">請先登入才能發表評論</p>
            <Link href="/auth/signin" className="text-pink-400 hover:text-pink-300">
              立即登入 →
            </Link>
          </div>
        )}
        <div className="space-y-0 border-t border-pink-500/20">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="border-b border-pink-500/20 hover:bg-dark-card/50 transition-colors">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <Link href={`/messages?userId=${comment.author._id}`}>
                      {comment.author.image ? (
                        <Image
                          src={comment.author.image}
                          alt={comment.author.name}
                          width={48}
                          height={48}
                          className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center text-white flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                          {comment.author.name.charAt(0)}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-white">{comment.author.name}</span>
                        <span className="text-gray-500 text-sm">
                          @{comment.author.name.toLowerCase().replace(/\s+/g, '')}
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString('zh-TW', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-white mb-2 whitespace-pre-wrap">{comment.content}</p>
                      <div className="flex items-center space-x-6 text-gray-500">
                        <button 
                          className="flex items-center space-x-1 hover:text-pink-400 transition-colors"
                          title="回覆"
                        >
                          <span>💬</span>
                          <span className="text-sm">回覆</span>
                        </button>
                        <button 
                          onClick={() => handleLikeComment(comment._id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            likedComments.has(comment._id)
                              ? 'text-pink-400'
                              : 'hover:text-pink-400'
                          }`}
                          title="按讚"
                        >
                          <span>{likedComments.has(comment._id) ? '❤️' : '🤍'}</span>
                          <span className="text-sm">{comment.likes?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>還沒有評論，成為第一個留言的人吧！</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
