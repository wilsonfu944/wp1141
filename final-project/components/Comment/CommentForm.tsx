import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RatingStars from '../Rating/RatingStars';
import { commentsAPI } from '../../services/api';
import type { Comment } from '../../types';

interface CommentFormProps {
  locationId: string;
  parentId?: string;
  onSuccess?: (comment: Comment) => void;
  onCancel?: () => void;
}

export default function CommentForm({ locationId, parentId, onSuccess, onCancel }: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !content.trim()) return;

    setLoading(true);
    try {
      const comment = await commentsAPI.create(locationId, content, rating, parentId);
      setContent('');
      setRating(undefined);
      if (onSuccess) {
        onSuccess(comment);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      alert('發表評論失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 text-center text-slate-400">
        請先登入才能發表評論
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-lg p-4">
      {!parentId && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">評分（選填）</label>
          <RatingStars
            rating={rating || 0}
            interactive
            onRatingChange={setRating}
          />
        </div>
      )}
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? '回覆評論...' : '分享你的想法...'}
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
          required
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {loading ? '發表中...' : '發表'}
        </button>
      </div>
    </form>
  );
}


