"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatRelativeTime } from "@/lib/utils";
import { FaComment, FaRetweet, FaHeart, FaTrash } from "react-icons/fa";
import { pusherClient } from "@/lib/pusher-client";

interface PostCardProps {
  post: any;
  onDelete?: () => void;
  onReply?: () => void;
  showActions?: boolean;
}

export function PostCard({ post, onDelete, onReply, showActions = true }: PostCardProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [repostCount, setRepostCount] = useState(post._count?.reposts || 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isReposted, setIsReposted] = useState(post.isReposted || false);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOwnPost = session?.user?.id === post.author?.id;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button')
    ) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  useEffect(() => {
    // Subscribe to Pusher for real-time updates
    const channel = pusherClient.subscribe(`post-${post.id}`);

    channel.bind('like-added', (data: { userId: string }) => {
      // Skip if it's the current user (already updated optimistically)
      if (data.userId !== session?.user?.id) {
        setLikeCount((prev: number) => prev + 1);
      }
    });

    channel.bind('like-removed', (data: { userId: string }) => {
      // Skip if it's the current user (already updated optimistically)
      if (data.userId !== session?.user?.id) {
        setLikeCount((prev: number) => Math.max(0, prev - 1));
      }
    });

    channel.bind('comment-added', () => {
      setCommentCount((prev: number) => prev + 1);
    });

    channel.bind('repost-added', (data: { userId: string }) => {
      // Skip if it's the current user (already updated optimistically)
      if (data.userId !== session?.user?.id) {
        setRepostCount((prev: number) => prev + 1);
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`post-${post.id}`);
    };
  }, [post.id, session?.user?.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);

    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev: number) => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: newIsLiked ? "POST" : "DELETE",
      });

      if (!res.ok) {
        // Revert on error
        setIsLiked(!newIsLiked);
        setLikeCount((prev: number) => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      console.error("Failed to like:", error);
      setIsLiked(!newIsLiked);
      setLikeCount((prev: number) => newIsLiked ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;
    setLoading(true);

    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setRepostCount((prev: number) => newIsReposted ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: newIsReposted ? "POST" : "DELETE",
      });

      if (!res.ok) {
        setIsReposted(!newIsReposted);
        setRepostCount((prev: number) => newIsReposted ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      console.error("Failed to repost:", error);
      setIsReposted(!newIsReposted);
      setRepostCount((prev: number) => newIsReposted ? Math.max(0, prev - 1) : prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (res.ok && onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const renderContent = (content: string) => {
    // Simple link detection and rendering
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }

      // Handle @mentions
      const mentionRegex = /(@\w+)/g;
      const mentionParts = part.split(mentionRegex);
      
      return mentionParts.map((mentionPart, j) => {
        if (mentionPart.match(mentionRegex)) {
          const userId = mentionPart.slice(1);
          return (
            <Link
              key={`${i}-${j}`}
              href={`/profile/${userId}`}
              className="text-blue-500 hover:underline"
            >
              {mentionPart}
            </Link>
          );
        }

        // Handle #hashtags
        const hashtagRegex = /(#\w+)/g;
        const hashtagParts = mentionPart.split(hashtagRegex);
        
        return hashtagParts.map((hashtagPart, k) => {
          if (hashtagPart.match(hashtagRegex)) {
            const tag = hashtagPart.slice(1); // Remove # symbol
            return (
              <Link
                key={`${i}-${j}-${k}`}
                href={`/hashtag/${tag}`}
                className="text-blue-500 hover:underline"
              >
                {hashtagPart}
              </Link>
            );
          }
          return <span key={`${i}-${j}-${k}`}>{hashtagPart}</span>;
        });
      });
    });
  };

  return (
    <div 
      onClick={handleCardClick}
      className="border-b border-gray-800 p-4 hover:bg-gray-900/30 transition-colors cursor-pointer"
    >
      <div className="flex gap-3">
        <Link 
          href={`/profile/${post.author?.userId}`}
          className="shrink-0"
        >
          <img
            src={post.author?.image || "/default-avatar.svg"}
            alt={post.author?.name}
            className="w-12 h-12 rounded-full hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/profile/${post.author?.userId}`}
              className="font-bold hover:underline"
            >
              {post.author?.name}
            </Link>
            <Link
              href={`/profile/${post.author?.userId}`}
              className="text-gray-500 hover:underline"
            >
              @{post.author?.userId}
            </Link>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">
              {formatRelativeTime(new Date(post.createdAt))}
            </span>

            {isOwnPost && showActions && (
              <div className="ml-auto relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="text-gray-500 hover:text-blue-500 p-2"
                >
                  ⋯
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-20 min-w-32">
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-800 flex items-center gap-2"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="text-white whitespace-pre-wrap break-words mb-3">
            {renderContent(post.content)}
          </p>

          {showActions && (
            <div className="flex items-center gap-16 text-gray-500">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReply) onReply();
                }}
                className="flex items-center gap-2 hover:text-blue-500 group"
              >
                <FaComment className="group-hover:bg-blue-500/10 p-2 rounded-full text-3xl" />
                {commentCount > 0 && <span>{commentCount}</span>}
              </button>

              <button
                onClick={handleRepost}
                className={`flex items-center gap-2 hover:text-green-500 group ${
                  isReposted ? "text-green-500" : ""
                }`}
              >
                <FaRetweet className="group-hover:bg-green-500/10 p-2 rounded-full text-3xl" />
                {repostCount > 0 && <span>{repostCount}</span>}
              </button>

              <button
                onClick={handleLike}
                className={`flex items-center gap-2 hover:text-red-500 group ${
                  isLiked ? "text-red-500" : ""
                }`}
              >
              <FaHeart className="group-hover:bg-red-500/10 p-2 rounded-full text-3xl" />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}




