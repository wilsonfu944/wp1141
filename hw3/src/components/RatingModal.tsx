import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Star } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number, review: string) => void;
  title: string;
  currentRating?: number;
}

const RatingModal: React.FC<RatingModalProps> = ({ 
  isOpen, 
  onClose, 
  onRate, 
  title, 
  currentRating = 0 
}) => {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = () => {
    onRate(rating, review);
    setRating(0);
    setReview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
        <CardHeader>
          <CardTitle className="text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 評分區域 */}
          <div className="text-center">
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= (hoverRating || rating);
                return (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'fill-yellow-400 text-yellow-400 scale-110'
                        : 'text-gray-300 hover:text-yellow-300 hover:scale-105'
                    }`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  />
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating > 0 ? `您選擇了 ${rating} 星評分` : '請選擇評分'}
            </p>
          </div>

          {/* 評論區域 */}
          <div>
            <label className="block text-sm font-medium mb-2">評論（可選）</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="請輸入您的評論..."
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          {/* 按鈕區域 */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1"
            >
              確認評分
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingModal;

