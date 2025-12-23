import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Star, MessageSquare } from 'lucide-react';
import { Order } from '@/types';

interface RatingDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRate: (orderId: string, rating: number, review: string) => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ order, isOpen, onClose, onRate }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (order && rating > 0) {
      onRate(order.id, rating, review);
      setRating(0);
      setReview('');
      onClose();
    }
  };

  const renderStars = (currentRating: number, interactive = true) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= currentRating;
      
      return (
        <button
          key={index}
          type="button"
          className={`w-8 h-8 ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
          }`}
          onClick={() => interactive && setRating(starValue)}
          disabled={!interactive}
        >
          <Star
            className={`w-full h-full ${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      );
    });
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">為 {order.storeName} 評分</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 訂單摘要 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">訂單摘要</h3>
            <p className="text-sm text-muted-foreground">
              共 {order.items.length} 項商品，總計 NT$ {order.totalPrice}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Intl.DateTimeFormat('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).format(order.timestamp)}
            </p>
          </div>

          {/* 評分區域 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">請為這次訂單評分</label>
              <div className="flex justify-center space-x-1">
                {renderStars(rating)}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {rating === 0 ? '點擊星星評分' : 
                 rating === 1 ? '很不滿意' :
                 rating === 2 ? '不滿意' :
                 rating === 3 ? '普通' :
                 rating === 4 ? '滿意' : '非常滿意'}
              </p>
            </div>

            {/* 評論區域 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                評論（選填）
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="分享你的用餐體驗..."
                className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          {/* 按鈕區域 */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              稍後評分
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={rating === 0}
              className="flex-1"
            >
              提交評分
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;

