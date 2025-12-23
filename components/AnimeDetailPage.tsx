'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Location {
  _id: string;
  name: string;
  address: string;
  images: string[];
  latitude: number;
  longitude: number;
}

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
  locations: Location[];
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

export default function AnimeDetailPage({ 
  animeId, 
  initialAnime 
}: { 
  animeId: string;
  initialAnime: Anime;
}) {
  const { data: session } = useSession();
  const [anime, setAnime] = useState<Anime | null>(initialAnime || null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false); // 初始為 false，因為動漫數據已經有了
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    // 使用 ref 來追蹤是否已經載入過，避免重複載入
    let isMounted = true;
    
    async function fetchAdditionalData() {
      try {
        setLoading(true);
        
        // 只獲取評論、評分和用戶資料（動漫數據已經從 Server Component 傳入）
        const [commentsRes, ratingRes, profileRes] = await Promise.all([
          fetch(`/api/comments?targetType=anime&targetId=${animeId}`),
          session?.user?.id ? fetch(`/api/anime/${animeId}/rate`) : Promise.resolve(null),
          session?.user?.id ? fetch('/api/user/profile') : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        const [commentsData, ratingData, profileData] = await Promise.all([
          commentsRes.ok ? commentsRes.json() : [],
          ratingRes && ratingRes.ok ? ratingRes.json() : null,
          profileRes && profileRes.ok ? profileRes.json() : null,
        ]);

        if (!isMounted) return;

        setComments(Array.isArray(commentsData) ? commentsData : []);
        
        // 設置用戶評分
        if (ratingData && ratingData.userRating) {
          setUserRating(ratingData.userRating);
        }
        
        // 檢查是否已加入最喜歡的動漫
        if (profileData && profileData.favoriteAnime && Array.isArray(profileData.favoriteAnime)) {
          const favoriteIds = profileData.favoriteAnime.map((a: any) => a._id || a.toString());
          setIsFavorite(favoriteIds.includes(animeId));
        }
        
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
      } catch (error: any) {
        console.error('Failed to fetch additional data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchAdditionalData();
    
    return () => {
      isMounted = false;
    };
  }, [animeId, session?.user?.id]); // 只在 animeId 或 session 改變時重新載入

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          targetType: 'anime',
          targetId: animeId,
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

  const handleRating = async (rating: number) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/anime/${animeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        const data = await res.json();
        if (anime) {
          setAnime({ ...anime, rating: data.rating });
        }
        setUserRating(rating);
      }
    } catch (error) {
      console.error('Failed to rate anime:', error);
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

  const handleToggleFavorite = async () => {
    if (!session) {
      alert('請先登入才能添加到最喜歡的動漫');
      return;
    }

    setLoadingFavorite(true);
    try {
      // 先獲取當前的最喜歡動漫列表
      const profileRes = await fetch('/api/user/profile');
      if (!profileRes.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profileData = await profileRes.json();
      const currentFavorites = profileData.favoriteAnime?.map((a: any) => a._id || a.toString()) || [];
      
      let newFavorites: string[];
      if (isFavorite) {
        // 移除
        newFavorites = currentFavorites.filter((id: string) => id !== animeId);
      } else {
        // 添加
        newFavorites = [...currentFavorites, animeId];
      }

      const updateRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favoriteAnime: newFavorites }),
      });

      if (updateRes.ok) {
        setIsFavorite(!isFavorite);
        alert(isFavorite ? '已從最喜歡的動漫中移除' : '已添加到最喜歡的動漫');
      } else {
        throw new Error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('操作失敗，請稍後再試');
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">載入中...</div>;
  }

  if (!anime) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">動漫不存在</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-1">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src={anime.coverImage || '/placeholder-image.jpg'}
              alt={anime.title}
              fill
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
              {anime.titleJP && (
                <h2 className="text-2xl text-gray-400 mb-4">{anime.titleJP}</h2>
              )}
            </div>
            {session && (
              <button
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className={`ml-4 px-4 py-2 rounded-lg transition-colors flex-shrink-0 ${
                  isFavorite
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-dark-surface text-gray-300 hover:bg-pink-500/20 border border-pink-500/30'
                }`}
                title={isFavorite ? '從最喜歡的動漫中移除' : '添加到最喜歡的動漫'}
              >
                {loadingFavorite ? (
                  '處理中...'
                ) : isFavorite ? (
                  '❤️ 已收藏'
                ) : (
                  '🤍 收藏'
                )}
              </button>
            )}
          </div>
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 text-2xl">⭐</span>
              <span className="ml-2 text-xl font-bold">{anime.rating?.toFixed(1) || '0.0'}</span>
              <span className="ml-2 text-sm text-gray-400">（大眾評分）</span>
            </div>
            {session && (
              <div className="space-y-2">
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-400 mr-2">我的評分：</span>
                  {userRating > 0 ? (
                    <span className="text-yellow-400 text-lg font-bold">{userRating}</span>
                  ) : (
                    <span className="text-gray-500 text-sm">尚未評分</span>
                  )}
                </div>
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
              </div>
            )}
          </div>
          <div className="mb-4">
            <p className="text-gray-300 mb-4">{anime.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {anime.genres?.map((genre, index) => (
                <span
                  key={index}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              {anime.studio && <p>制作公司: {anime.studio}</p>}
              {anime.episodes && <p>集数: {anime.episodes}</p>}
              <p>状态: {anime.status}</p>
              <p>发布日期: {new Date(anime.releaseDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 巡礼景点 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">巡礼景点</h2>
        {anime.locations && anime.locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anime.locations.map((location) => (
              <Link key={location._id} href={`/location/${location._id}`}>
                <div className="bg-dark-card rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  {location.images && location.images.length > 0 && (
                    <div className="relative h-48">
                      <Image
                        src={location.images[0] || '/placeholder-image.jpg'}
                        alt={location.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{location.name}</h3>
                    <p className="text-sm text-gray-400">{location.address}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">暫無地點</p>
        )}
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
