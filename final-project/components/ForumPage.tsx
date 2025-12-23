'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getUserAvatarUrl } from '@/lib/avatar';

interface Post {
  _id: string;
  content: string;
  category: 'anime-discussion' | 'travel-companion';
  author: {
    _id: string;
    name: string;
    image?: string;
    avatarColor?: string;
  };
  likes: string[];
  comments: string[];
  retweets: string[];
  createdAt: string;
}

interface PostComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    avatarColor?: string;
  };
  likes: string[];
  replies: PostComment[];
  createdAt: string;
}

export default function ForumPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<'all' | 'anime-discussion' | 'travel-companion'>('all');
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState<'anime-discussion' | 'travel-companion'>('anime-discussion');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [retweetedPosts, setRetweetedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [showMessageDialog, setShowMessageDialog] = useState<{ userId: string; userName: string } | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState<{ userId: string; userName: string; x: number; y: number } | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [category]);

  useEffect(() => {
    if (expandedPost) {
      fetchComments(expandedPost);
    }
  }, [expandedPost]);

  async function fetchPosts() {
    try {
      const url = category === 'all' ? '/api/posts' : `/api/posts?category=${category}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        // Initialize liked and retweeted posts
        if (session?.user?.id) {
          const liked = new Set<string>();
          const retweeted = new Set<string>();
          data.forEach((post: Post) => {
            if (post.likes?.some((id: any) => id.toString() === session.user.id)) {
              liked.add(post._id);
            }
            if (post.retweets?.some((id: any) => id.toString() === session.user.id)) {
              retweeted.add(post._id);
            }
          });
          setLikedPosts(liked);
          setRetweetedPosts(retweeted);
        }
      } else {
        console.error('Failed to fetch posts:', res.statusText);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    }
  }

  async function fetchComments(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => ({ ...prev, [postId]: data }));
        // Initialize liked comments
        if (session?.user?.id) {
          const liked = new Set<string>();
          data.forEach((comment: PostComment) => {
            if (comment.likes?.some((id: any) => id.toString() === session.user.id)) {
              liked.add(comment._id);
            }
            comment.replies?.forEach((reply: PostComment) => {
              if (reply.likes?.some((id: any) => id.toString() === session.user.id)) {
                liked.add(reply._id);
              }
            });
          });
          setLikedComments((prev) => {
            const newSet = new Set(prev);
            liked.forEach((id) => newSet.add(id));
            return newSet;
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !content.trim()) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category: postCategory }),
      });

      if (res.ok) {
        const post = await res.json();
        setPosts([post, ...posts]);
        setContent('');
        setShowForm(false);
        // Refresh posts to get updated list
        await fetchPosts();
      } else {
        let errorMessage = '未知錯誤';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
        console.error('Post creation failed:', errorMessage);
        alert('發布失敗：' + errorMessage);
      }
    } catch (error: any) {
      console.error('Failed to submit post:', error);
      alert('發布失敗：' + (error.message || '請檢查網路連線並稍後再試'));
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const newLiked = new Set(likedPosts);
        if (data.liked) {
          newLiked.add(postId);
        } else {
          newLiked.delete(postId);
        }
        setLikedPosts(newLiked);

        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              return { ...post, likes: data.liked ? [...post.likes, session.user.id] : post.likes.filter((id: any) => id.toString() !== session.user.id) };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleRetweet = async (postId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/posts/${postId}/retweet`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const newRetweeted = new Set(retweetedPosts);
        if (data.retweeted) {
          newRetweeted.add(postId);
        } else {
          newRetweeted.delete(postId);
        }
        setRetweetedPosts(newRetweeted);

        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              return { ...post, retweets: data.retweeted ? [...post.retweets, session.user.id] : post.retweets.filter((id: any) => id.toString() !== session.user.id) };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle retweet:', error);
    }
  };

  const handleSubmitComment = async (postId: string) => {
    if (!session || !commentContent[postId]?.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent[postId] }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => ({
          ...prev,
          [postId]: [comment, ...(prev[postId] || [])],
        }));
        setCommentContent((prev) => ({ ...prev, [postId]: '' }));
        setPosts((prev) =>
          prev.map((post) => {
            if (post._id === postId) {
              return { ...post, comments: [...post.comments, comment._id] };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  const handleSubmitReply = async (postId: string, parentCommentId: string) => {
    if (!session || !replyContent[parentCommentId]?.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent[parentCommentId],
          parentCommentId,
        }),
      });

      if (res.ok) {
        // Refresh comments to get properly populated replies
        await fetchComments(postId);
        setReplyContent((prev) => ({ ...prev, [parentCommentId]: '' }));
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/posts/comments/${commentId}/like`, {
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

        // Update comment in all posts
        setComments((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((postId) => {
            updated[postId] = updated[postId].map((comment) => {
              if (comment._id === commentId) {
                return {
                  ...comment,
                  likes: data.liked ? [...comment.likes, session.user.id] : comment.likes.filter((id: any) => id.toString() !== session.user.id),
                };
              }
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply._id === commentId) {
                    return {
                      ...reply,
                      likes: data.liked ? [...reply.likes, session.user.id] : reply.likes.filter((id: any) => id.toString() !== session.user.id),
                    };
                  }
                  return reply;
                }),
              };
            });
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAvatarClick = (userId: string, userName: string, event: React.MouseEvent) => {
    if (!session) return;
    if (userId === session.user.id) {
      router.push('/profile');
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setShowAvatarMenu({ userId, userName, x: event.clientX, y: event.clientY });
  };

  const handleSendMessage = () => {
    if (showAvatarMenu) {
      router.push(`/messages?userId=${showAvatarMenu.userId}`);
      setShowAvatarMenu(null);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!showAvatarMenu || !session) return;
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: showAvatarMenu.userId }),
      });
      if (res.ok) {
        alert('好友請求已發送');
        setShowAvatarMenu(null);
      } else {
        const data = await res.json();
        alert(data.error || '發送好友請求失敗');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('發送好友請求失敗');
    }
  };

  const handleConfirmMessage = () => {
    if (showMessageDialog) {
      router.push(`/messages?userId=${showMessageDialog.userId}`);
      setShowMessageDialog(null);
    }
  };


  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    } else if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小時前`;
    } else if (minutes > 0) {
      return `${minutes}分鐘前`;
    } else {
      return '剛剛';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 bg-black min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-pink-500/20 pb-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-white">留言板</h1>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors font-semibold"
            >
              {showForm ? '取消' : '發文'}
            </button>
          )}
        </div>

        {/* Usage Instructions */}
        <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
          <p className="text-sm text-pink-300">
            💡 <strong>提示：</strong>點擊用戶頭像可以與志同道合的朋友私訊聊天，或是找旅伴深入討論行程細節！
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === 'all' ? 'bg-pink-500 text-white' : 'bg-dark-surface text-gray-400 hover:bg-dark-card'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setCategory('anime-discussion')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === 'anime-discussion' ? 'bg-pink-500 text-white' : 'bg-dark-surface text-gray-400 hover:bg-dark-card'
            }`}
          >
            動漫討論
          </button>
          <button
            onClick={() => setCategory('travel-companion')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              category === 'travel-companion' ? 'bg-pink-500 text-white' : 'bg-dark-surface text-gray-400 hover:bg-dark-card'
            }`}
          >
            找旅伴
          </button>
        </div>
      </div>

      {/* Post Form */}
      {showForm && session && (
        <div className="bg-dark-card rounded-2xl p-4 mb-4 border border-pink-500/20">
          <div className="flex space-x-3">
            <img
              src={getUserAvatarUrl(session.user)}
              alt={session.user?.name || 'User'}
              width={48}
              height={48}
              className="rounded-full flex-shrink-0"
            />
            <form onSubmit={handleSubmitPost} className="flex-1">
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as 'anime-discussion' | 'travel-companion')}
                className="mb-2 px-3 py-1 bg-dark-surface border border-pink-500/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              >
                <option value="anime-discussion">動漫討論</option>
                <option value="travel-companion">找旅伴</option>
              </select>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none"
                rows={4}
                placeholder="有什麼新鮮事？"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  發佈
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => {
            const author = post.author || { _id: '', name: '未知用戶', image: undefined, avatarColor: undefined };
            const authorName = author?.name || '未知用戶';
            const authorAvatarUrl = getUserAvatarUrl(author);
            const isLiked = likedPosts.has(post._id);
            const isRetweeted = retweetedPosts.has(post._id);
            const postComments = comments[post._id] || [];

            return (
              <div key={post._id} className="bg-dark-card rounded-2xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-colors">
                <div className="flex space-x-3">
                  {/* Avatar - Clickable to message */}
                  <button
                    onClick={(e) => handleAvatarClick(author._id, authorName, e)}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={authorAvatarUrl}
                      alt={authorName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </button>

                  <div className="flex-1 min-w-0">
                    {/* Author Info */}
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-white">{authorName}</span>
                      <span className="text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 text-sm">{formatTime(post.createdAt)}</span>
                      <span className="text-gray-500 text-sm">·</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.category === 'anime-discussion' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-pink-500/20 text-pink-300'
                      }`}>
                        {post.category === 'anime-discussion' ? '動漫討論' : '找旅伴'}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-white mb-3 whitespace-pre-wrap break-words">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center space-x-6 text-gray-500">
                      {/* Comments */}
                      <button
                        onClick={() => setExpandedPost(expandedPost === post._id ? null : post._id)}
                        className="flex items-center space-x-2 hover:text-pink-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments?.length || 0}</span>
                      </button>

                      {/* Retweet */}
                      <button
                        onClick={() => handleRetweet(post._id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          isRetweeted ? 'text-green-500' : 'hover:text-green-400'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isRetweeted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>{post.retweets?.length || 0}</span>
                      </button>

                      {/* Like */}
                      <button
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          isLiked ? 'text-pink-500' : 'hover:text-pink-400'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes?.length || 0}</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {expandedPost === post._id && (
                      <div className="mt-4 pt-4 border-t border-pink-500/20">
                        {/* Comment Form */}
                        {session && (
                          <div className="mb-4">
                            <div className="flex space-x-3">
                              <img
                                src={getUserAvatarUrl(session.user)}
                                alt={session.user?.name || 'User'}
                                width={36}
                                height={36}
                                className="rounded-full flex-shrink-0"
                              />
                              <div className="flex-1">
                                <textarea
                                  value={commentContent[post._id] || ''}
                                  onChange={(e) =>
                                    setCommentContent((prev) => ({ ...prev, [post._id]: e.target.value }))
                                  }
                                  className="w-full p-2 bg-dark-surface rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                                  rows={2}
                                  placeholder="寫下你的回覆..."
                                />
                                <button
                                  onClick={() => handleSubmitComment(post._id)}
                                  disabled={!commentContent[post._id]?.trim()}
                                  className="mt-2 bg-pink-500 text-white px-4 py-1 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                >
                                  回覆
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-4">
                          {postComments.map((comment) => {
                            const isCommentLiked = likedComments.has(comment._id);
                            return (
                              <div key={comment._id} className="space-y-2">
                                <div className="flex space-x-3">
                                  <button
                                    onClick={(e) => handleAvatarClick(comment.author._id, comment.author.name, e)}
                                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                  >
                                    <img
                                      src={getUserAvatarUrl(comment.author)}
                                      alt={comment.author.name}
                                      width={36}
                                      height={36}
                                      className="rounded-full"
                                    />
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-semibold text-white text-sm">{comment.author.name}</span>
                                      <span className="text-gray-500 text-xs">{formatTime(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-white text-sm mb-2 whitespace-pre-wrap break-words">{comment.content}</p>
                                    <div className="flex items-center space-x-4">
                                      <button
                                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                        className="text-gray-500 hover:text-pink-400 transition-colors text-sm"
                                      >
                                        回覆
                                      </button>
                                      <button
                                        onClick={() => handleLikeComment(comment._id)}
                                        className={`flex items-center space-x-1 transition-colors text-sm ${
                                          isCommentLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
                                        }`}
                                      >
                                        <svg className="w-4 h-4" fill={isCommentLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        <span>{comment.likes?.length || 0}</span>
                                      </button>
                                    </div>

                                    {/* Reply Form */}
                                    {replyingTo === comment._id && session && (
                                      <div className="mt-3 ml-4 pl-4 border-l-2 border-pink-500/30">
                                        <div className="flex space-x-2">
                                          <img
                                            src={getUserAvatarUrl(session.user)}
                                            alt={session.user?.name || 'User'}
                                            width={32}
                                            height={32}
                                            className="rounded-full flex-shrink-0"
                                          />
                                          <div className="flex-1">
                                            <textarea
                                              value={replyContent[comment._id] || ''}
                                              onChange={(e) =>
                                                setReplyContent((prev) => ({ ...prev, [comment._id]: e.target.value }))
                                              }
                                              className="w-full p-2 bg-dark-surface rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm"
                                              rows={2}
                                              placeholder="寫下你的回覆..."
                                            />
                                            <div className="flex space-x-2 mt-1">
                                              <button
                                                onClick={() => handleSubmitReply(post._id, comment._id)}
                                                disabled={!replyContent[comment._id]?.trim()}
                                                className="bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
                                              >
                                                回覆
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setReplyingTo(null);
                                                  setReplyContent((prev) => ({ ...prev, [comment._id]: '' }));
                                                }}
                                                className="text-gray-500 hover:text-white transition-colors text-xs"
                                              >
                                                取消
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                      <div className="mt-2 ml-4 pl-4 border-l-2 border-pink-500/30 space-y-2">
                                        {comment.replies.map((reply) => {
                                          const isReplyLiked = likedComments.has(reply._id);
                                          return (
                                            <div key={reply._id} className="flex space-x-2">
                                              <button
                                                onClick={(e) => handleAvatarClick(reply.author._id, reply.author.name, e)}
                                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                                              >
                                                <img
                                                  src={getUserAvatarUrl(reply.author)}
                                                  alt={reply.author.name}
                                                  width={32}
                                                  height={32}
                                                  className="rounded-full"
                                                />
                                              </button>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                  <span className="font-semibold text-white text-xs">{reply.author.name}</span>
                                                  <span className="text-gray-500 text-xs">{formatTime(reply.createdAt)}</span>
                                                </div>
                                                <p className="text-white text-xs mb-1 whitespace-pre-wrap break-words">{reply.content}</p>
                                                <button
                                                  onClick={() => handleLikeComment(reply._id)}
                                                  className={`flex items-center space-x-1 transition-colors text-xs ${
                                                    isReplyLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
                                                  }`}
                                                >
                                                  <svg className="w-3 h-3" fill={isReplyLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                  </svg>
                                                  <span>{reply.likes?.length || 0}</span>
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg mb-2">還沒有任何貼文</p>
            <p className="text-sm">成為第一個發文的人吧！</p>
          </div>
        )}
      </div>

      {/* Avatar Menu */}
      {showAvatarMenu && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowAvatarMenu(null)}
          />
          <div 
            className="fixed z-50 bg-dark-card rounded-lg shadow-lg border border-pink-500/20 p-2 min-w-[200px]"
            style={{ left: `${showAvatarMenu.x}px`, top: `${showAvatarMenu.y}px` }}
          >
            <button
              onClick={handleSendMessage}
              className="w-full text-left px-4 py-2 text-white hover:bg-pink-500/20 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>💌</span>
              <span>發送私訊</span>
            </button>
            <button
              onClick={handleSendFriendRequest}
              className="w-full text-left px-4 py-2 text-white hover:bg-pink-500/20 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>👥</span>
              <span>發送好友請求</span>
            </button>
          </div>
        </>
      )}

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full mx-4 border border-pink-500/20">
            <h3 className="text-xl font-bold text-white mb-4">私訊 {showMessageDialog.userName}</h3>
            <p className="text-gray-400 mb-6">確定要與 {showMessageDialog.userName} 開始對話嗎？</p>
            <div className="flex space-x-3">
              <button
                onClick={handleConfirmMessage}
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors font-semibold"
              >
                確定
              </button>
              <button
                onClick={() => setShowMessageDialog(null)}
                className="flex-1 bg-dark-surface text-white px-4 py-2 rounded-full hover:bg-dark-card transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
