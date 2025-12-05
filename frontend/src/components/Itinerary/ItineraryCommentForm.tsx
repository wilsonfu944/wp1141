import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { itinerariesAPI } from '../../services/api';

interface ItineraryCommentFormProps {
  itineraryId: string;
  onSuccess?: () => void;
}

export default function ItineraryCommentForm({ itineraryId, onSuccess }: ItineraryCommentFormProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: (data: { content: string }) =>
      itinerariesAPI.addComment(itineraryId, data.content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itinerary', itineraryId] });
      setContent('');
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('請輸入評論內容');
      return;
    }
    commentMutation.mutate({ content });
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="輸入你的評論..."
        rows={3}
        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-3 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || commentMutation.isPending}
        className="flex items-center gap-2 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {commentMutation.isPending ? '發送中...' : '發送評論'}
      </button>
    </div>
  );
}



