import React from 'react';
import { Store } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Star, Store as StoreIcon, Clock } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

interface StoreCardProps {
  store: Store;
  onStoreClick: (store: Store) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onStoreClick }) => {
  const { getAverageRating, storeRatings } = useStore();
  
  // 使用平均評分
  const currentRating = getAverageRating(store.store_name);
  const ratingCount = storeRatings[store.store_name]?.length || 0;
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
      onClick={() => onStoreClick(store)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StoreIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{store.store_name}</CardTitle>
          </div>
          <Badge variant={store.category === '食物' ? 'default' : 'secondary'}>
            {store.category}
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          {store.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center space-x-1">
            {renderStars(currentRating)}
            <span className="text-sm font-medium ml-1">
              {currentRating.toFixed(1)}
            </span>
            {ratingCount > 0 && (
              <span className="text-xs text-muted-foreground ml-1">
                ({ratingCount})
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>預估送達時間 {store.delivery_time}-{store.delivery_time + 20}秒</span>
            </div>
            <div>
              {store.items.length} 個品項
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreCard;
