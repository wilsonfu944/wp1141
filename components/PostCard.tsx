import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import NextImage from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale/zh-TW';
import { FiMessageCircle, FiRepeat, FiHeart, FiTrash2 } from 'react-icons/fi';
import Pusher from 'pusher-js';

interface Post {
  _id: string;
  author: {
    name: string;
    userID: string;
    image?: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isOwnPost: boolean;
  repostOf?: string;
  originalPost?: {
    _id: string;
    author: {
      name: string;
      userID: string;
      image?: string;
    };
    content: string;
    createdAt: string;
  };
}

interface PostCardProps {
  post: Post;
  onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isReposted, setIsReposted] = useState(post.isReposted);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');

  // Pusher 即時更新
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUSHER_KEY) {
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
      });

      const channel = pusher.subscribe('posts');
      
      channel.bind('update-like', (data: any) => {
        if (data.postId === post._id) {
          setLikesCount(data.likesCount);
          setIsLiked(data.isLiked);
        }
      });

      channel.bind('update-repost', (data: any) => {
        if (data.postId === post._id) {
          setRepostsCount(data.repostsCount);
          setIsReposted(data.isReposted);
        }
      });

      channel.bind('new-comment', (data: any) => {
        if (data.postId === post._id) {
          setCommentsCount((prev) => prev + 1);
          if (showComments) {
            fetchComments();
          }
        }
      });

      return () => {
        pusher.unsubscribe('posts');
        pusher.disconnect();
      };
    }
  }, [post._id, showComments]);

  const handleLike = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleRepost = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${post._id}/repost`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setIsReposted(data.isReposted);
        setRepostsCount(data.repostsCount);
        if (data.isReposted && onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error('Error toggling repost:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除此文章嗎？')) return;

    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
      });

      if (res.ok && onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${post._id}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!session || !commentContent.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          content: commentContent.trim(),
          parentId,
        }),
      });

      if (res.ok) {
        setCommentContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleMentionClick = (userID: string) => {
    router.push(`/profile/${userID}`);
  };

  const renderContent = (text: string) => {
    // 處理 mentions 和 hashtags
    const parts = text.split(/(@\w+|#\w+|https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const userID = part.substring(1);
        return (
          <span
            key={index}
            className="text-primary-600 hover:underline cursor-pointer"
            onClick={() => handleMentionClick(userID)}
          >
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return (
          <span key={index} className="text-primary-600">
            {part}
          </span>
        );
      } else if (part.startsWith('http')) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const displayPost = post.originalPost || post;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      {post.repostOf && (
        <div className="text-sm text-gray-500 mb-2 flex items-center">
          <FiRepeat className="w-4 h-4 mr-1" />
          {post.author.name} 轉發
        </div>
      )}

      <div className="flex space-x-4">
        <div
          className="cursor-pointer"
          onClick={() => router.push(`/profile/${displayPost.author.userID}`)}
        >
          {displayPost.author.image ? (
            <NextImage
              src={displayPost.author.image}
              alt={displayPost.author.name}
              width={48}
              height={48}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">
                {displayPost.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span
                className="font-semibold cursor-pointer hover:underline"
                onClick={() => router.push(`/profile/${displayPost.author.userID}`)}
              >
                {displayPost.author.name}
              </span>
              <span className="text-gray-500 ml-2">
                @{displayPost.author.userID}
              </span>
              <span className="text-gray-500 ml-2">
                · {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true, locale: zhTW })}
              </span>
            </div>
            {post.isOwnPost && !post.repostOf && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-4 text-gray-900 whitespace-pre-wrap">
            {renderContent(displayPost.content)}
          </div>

          <div className="flex items-center space-x-6 text-gray-500">
            <button
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments) {
                  fetchComments();
                }
              }}
              className="flex items-center space-x-2 hover:text-primary-600"
            >
              <FiMessageCircle className="w-5 h-5" />
              <span>{commentsCount}</span>
            </button>

            <button
              onClick={handleRepost}
              className={`flex items-center space-x-2 ${
                isReposted ? 'text-green-600' : 'hover:text-green-600'
              }`}
            >
              <FiRepeat className="w-5 h-5" />
              <span>{repostsCount}</span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 ${
                isLiked ? 'text-red-600' : 'hover:text-red-600'
              }`}
            >
              <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <form onSubmit={handleCommentSubmit} className="mb-4">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="寫下你的留言..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={2}
                />
                <button
                  type="submit"
                  className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  留言
                </button>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    postId={post._id}
                    onUpdate={fetchComments}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  onUpdate,
}: {
  comment: any;
  postId: string;
  onUpdate: () => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !replyContent.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: replyContent.trim(),
          parentId: comment._id,
        }),
      });

      if (res.ok) {
        setReplyContent('');
        setShowReply(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  return (
    <div className="pl-4 border-l-2 border-gray-200">
      <div className="flex items-start space-x-3">
        {comment.author?.image ? (
          <NextImage
            src={comment.author.image}
            alt={comment.author.name}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 text-sm">
              {comment.author?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">{comment.author?.name}</span>
            <span className="text-gray-500 text-xs">
              @{comment.author?.userID}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
          {session && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-gray-500 hover:text-primary-600"
            >
              回覆
            </button>
          )}
          {showReply && (
            <form onSubmit={handleReplySubmit} className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="寫下你的回覆..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                rows={2}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  回覆
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReply(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                >
                  取消
                </button>
              </div>
            </form>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

