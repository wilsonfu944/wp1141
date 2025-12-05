import { useState } from 'react';
import { Heart, Reply, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { commentsAPI } from '../../services/api';
import type { Comment } from '../../types';
import RatingStars from '../Rating/RatingStars';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  onUpdate?: () => void;
}

export default function CommentItem({ comment, onUpdate }: CommentItemProps) {
  const { user: currentUser } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liking, setLiking] = useState(false);

  const isOwner = currentUser?.id === comment.userId;
  const isLiked = comment.isLiked || false;

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      if (isLiked) {
        await commentsAPI.unlike(comment.id);
      } else {
        await commentsAPI.like(comment.id);
      }
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除這則評論嗎？')) return;
    try {
      await commentsAPI.delete(comment.id);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleReplySuccess = () => {
    setIsReplying(false);
    if (onUpdate) onUpdate();
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt={comment.user.name || 'User'} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-slate-400 text-lg">
              {comment.user.name?.[0] || comment.user.email[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-white">
                {comment.user.name || comment.user.email}
              </h4>
              <p className="text-xs text-slate-400">
                {new Date(comment.createdAt).toLocaleString('zh-TW')}
              </p>
            </div>
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-slate-700 rounded-lg shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-600 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      編輯
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      刪除
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {comment.rating && (
            <div className="mb-2">
              <RatingStars rating={comment.rating} size="sm" />
            </div>
          )}

          {isEditing ? (
            <CommentForm
              locationId={comment.locationId}
              parentId={comment.parentId}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              <p className="text-slate-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

              {comment.photos && comment.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {comment.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Comment photo"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-pink-500/20 text-pink-400'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likeCount || 0}</span>
                </button>
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  回覆
                </button>
              </div>

              {isReplying && (
                <div className="mt-4">
                  <CommentForm
                    locationId={comment.locationId}
                    parentId={comment.id}
                    onSuccess={handleReplySuccess}
                    onCancel={() => setIsReplying(false)}
                  />
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-slate-700">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} onUpdate={onUpdate} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


