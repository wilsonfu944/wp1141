import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle, Truck } from 'lucide-react';

interface DeliveryTimerProps {
  orderId: string;
  deliveryTime: number; // 送達時間（秒）
  isDelivered: boolean;
  orderTimestamp: Date; // 訂單創建時間
  onDeliveryComplete: (orderId: string) => void;
}

const DeliveryTimer: React.FC<DeliveryTimerProps> = ({
  orderId,
  deliveryTime,
  isDelivered,
  orderTimestamp,
  onDeliveryComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(isDelivered);

  useEffect(() => {
    if (isCompleted) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const orderTime = new Date(orderTimestamp);
      const elapsedSeconds = Math.floor((now.getTime() - orderTime.getTime()) / 1000);
      const remainingSeconds = Math.max(0, deliveryTime - elapsedSeconds);
      
      if (remainingSeconds <= 0) {
        setIsCompleted(true);
        onDeliveryComplete(orderId);
        return 0;
      }
      
      return remainingSeconds;
    };

    // 立即計算一次
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, orderId, onDeliveryComplete, orderTimestamp, deliveryTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-100 text-green-800 border-green-200';
    if (timeLeft <= 60) return 'bg-red-100 text-red-800 border-red-200';
    if (timeLeft <= 300) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusText = () => {
    if (isCompleted) return '已送達';
    if (timeLeft <= 60) return '即將送達';
    if (timeLeft <= 300) return '準備中';
    return '處理中';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle className="w-4 h-4" />;
    return <Truck className="w-4 h-4" />;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg">
                  {isCompleted ? '訂單已送達！' : '預計送達時間'}
                </span>
                <Badge className={getStatusColor()}>
                  {getStatusText()}
                </Badge>
              </div>
              {!isCompleted && (
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl font-mono font-bold text-primary">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
            </div>
          </div>
          {isCompleted && (
            <div className="text-right">
              <div className="text-green-600 font-bold text-lg">✓ 送達</div>
              <div className="text-sm text-muted-foreground">
                感謝您的耐心等待
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryTimer;
