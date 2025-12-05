import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar, Package, DollarSign, Star, Store as StoreIcon, CheckCircle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import RatingModal from '@/components/RatingModal';
import DeliveryTimer from '@/components/DeliveryTimer';

const OrderHistory: React.FC = () => {
  const { orderHistory, updateStoreRating, updateOrderRating, updateOrderDeliveryStatus } = useCart();
  const { updateStoreRating: updateStoreContextRating } = useStore();
  const navigate = useNavigate();
  const [showStoreRating, setShowStoreRating] = React.useState<string | null>(null);
  const [showOrderRating, setShowOrderRating] = React.useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleStoreRating = (orderId: string, rating: number, review: string) => {
    updateStoreRating(orderId, rating, review);
    
    // 找到對應的訂單並添加店家評分到平均計算中
    const order = orderHistory.find(o => o.id === orderId);
    if (order) {
      updateStoreContextRating(order.storeName, rating);
    }
    
    setShowStoreRating(null);
  };

  const handleOrderRating = (orderId: string, rating: number, review: string) => {
    updateOrderRating(orderId, rating, review);
    setShowOrderRating(null);
  };

  const handleDeliveryComplete = (orderId: string) => {
    updateOrderDeliveryStatus(orderId, true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold">訂單歷史</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orderHistory.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">尚無訂單記錄</h2>
              <p className="text-muted-foreground mb-6">
                您還沒有任何訂單記錄，快去選購商品吧！
              </p>
              <Button onClick={() => navigate('/')}>
                開始購物
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">共 {orderHistory.length} 筆訂單</h2>
            </div>

            {orderHistory.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.timestamp)}
                        </span>
                      </div>
                      <Badge variant="outline">訂單 #{order.id.split('-')[1]}</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {getTotalItems(order)} 項商品
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-lg font-bold text-primary">
                          NT$ {order.totalPrice}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {order.deliveryAddress.address}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        {order.storeRating && (
                          <div className="flex items-center space-x-1">
                            <StoreIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-blue-600">店家: {order.storeRating}/5</span>
                          </div>
                        )}
                        {order.orderRating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">訂單: {order.orderRating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* 送達狀態顯示 */}
                  <div className="mb-6">
                    {!order.isDelivered ? (
                      <DeliveryTimer
                        orderId={order.id}
                        deliveryTime={order.deliveryTime}
                        isDelivered={order.isDelivered}
                        orderTimestamp={order.timestamp}
                        onDeliveryComplete={handleDeliveryComplete}
                      />
                    ) : (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-green-900">訂單已送達</div>
                                <div className="text-sm text-green-700">
                                  感謝您的耐心等待
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 font-bold text-lg">✓ 送達</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {order.items.map((cartItem) => (
                      <div key={cartItem.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <h3 className="font-medium">{cartItem.item.item_name}</h3>
                          <p className="text-sm text-muted-foreground">{cartItem.item.store_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cartItem.item.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              數量：{cartItem.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">NT$ {cartItem.item.price}</p>
                          <p className="text-sm text-muted-foreground">
                            小計：NT$ {cartItem.item.price * cartItem.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 評分按鈕區域 */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h4 className="font-medium">評分</h4>
                        <div className="flex items-center space-x-2">
                          {order.storeRating ? (
                            <div className="flex items-center space-x-1">
                              <StoreIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">店家: {order.storeRating}/5</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowStoreRating(order.id)}
                            >
                              <StoreIcon className="w-4 h-4 mr-1" />
                              評分店家
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {order.orderRating ? (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">訂單: {order.orderRating}/5</span>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowOrderRating(order.id)}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              評分訂單
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 店家評分對話框 */}
      <RatingModal
        isOpen={showStoreRating !== null}
        onClose={() => setShowStoreRating(null)}
        onRate={(rating, review) => showStoreRating && handleStoreRating(showStoreRating, rating, review)}
        title="評分店家"
        currentRating={showStoreRating ? orderHistory.find(o => o.id === showStoreRating)?.storeRating : 0}
      />

      {/* 訂單評分對話框 */}
      <RatingModal
        isOpen={showOrderRating !== null}
        onClose={() => setShowOrderRating(null)}
        onRate={(rating, review) => showOrderRating && handleOrderRating(showOrderRating, rating, review)}
        title="評分訂單"
        currentRating={showOrderRating ? orderHistory.find(o => o.id === showOrderRating)?.orderRating : 0}
      />
    </div>
  );
};

export default OrderHistory;
