import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Plus, Minus, Trash2, CheckCircle, Star, History, Store } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/types';
import RatingDialog from '@/components/RatingDialog';
import { useStore } from '@/contexts/StoreContext';

const CartPage: React.FC = () => {
  const { items, getTotalPrice, clearCart, addOrder, updateOrderRating, removeItem, updateQuantity } = useCart();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const navigate = useNavigate();
  const { currentStore, setCurrentStore } = useStore();

  const handlePlaceOrder = () => {
    // 按店家分組商品
    const storeGroups = items.reduce((groups, cartItem) => {
      const storeName = cartItem.item.store_name;
      if (!groups[storeName]) {
        groups[storeName] = [];
      }
      groups[storeName].push(cartItem);
      return groups;
    }, {} as Record<string, typeof items>);

    // 為每個店家創建一筆訂單
    const orders: Order[] = [];
    Object.entries(storeGroups).forEach(([storeName, storeItems]) => {
      // 生成隨機送達時間（20-100秒）
      const deliveryTime = Math.floor(Math.random() * 81) + 20;
      
      const order: Order = {
        id: `order-${Date.now()}-${storeName}`,
        storeName,
        items: storeItems,
        totalPrice: storeItems.reduce((total, item) => total + (item.item.price * item.quantity), 0),
        timestamp: new Date(),
        deliveryTime,
        isDelivered: false,
      };
      
      // 保存到訂單歷史
      addOrder(order);
      orders.push(order);
    });
    
    // 清空購物車
    clearCart();
    
    // 顯示成功頁面
    setIsOrderPlaced(true);
    
    // 準備評分（使用第一個訂單）
    if (orders.length > 0) {
      setCurrentOrder(orders[0]);
    }
  };

  const handleBackToStores = () => {
    navigate('/');
  };

  const handleContinueShopping = () => {
    // 總是跳回主頁面
    navigate('/');
  };


  const handleRate = (orderId: string, rating: number, review: string) => {
    updateOrderRating(orderId, rating, review);
    setShowRating(false);
    // 評分完成後可以繼續評分其他訂單或關閉
  };


  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">訂單已送出！</h2>
            <p className="text-muted-foreground mb-6">
              感謝您的訂購，我們會盡快為您處理。
            </p>
            <div className="space-y-2">
              <Button onClick={handleBackToStores} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回店家列表
              </Button>
              <Button variant="outline" onClick={() => navigate('/history')} className="w-full">
                <History className="w-4 h-4 mr-2" />
                查看訂單歷史
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" onClick={() => {
                setCurrentStore(null);
                navigate('/');
              }} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <h1 className="text-2xl font-bold">購物車</h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">購物車是空的</h2>
              <p className="text-muted-foreground mb-6">
                快去選擇你喜歡的商品吧！
              </p>
              <Button onClick={handleContinueShopping}>
                <Store className="w-4 h-4 mr-2" />
                開始購物
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認返回</AlertDialogTitle>
                  <AlertDialogDescription>
                    確定要返回店家列表嗎？購物車中的商品將會被清空。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    clearCart();
                    navigate('/');
                  }}>
                    確認返回
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <h1 className="text-2xl font-bold">購物車</h1>
          </div>
        </div>
      </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* 購物車商品列表 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>購物車商品</CardTitle>
                    <Button 
                      onClick={handleContinueShopping}
                      variant="outline"
                      size="sm"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      繼續購物
                    </Button>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                {items.map((cartItem) => (
                  <div key={cartItem.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{cartItem.item.item_name}</h3>
                      <p className="text-sm text-muted-foreground">{cartItem.item.store_name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {cartItem.item.category}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {cartItem.item.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">NT$ {cartItem.item.price}</p>
                      <p className="text-sm text-muted-foreground">
                        小計：NT$ {cartItem.item.price * cartItem.quantity}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(cartItem.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 訂單摘要 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>商品數量</span>
                  <span>{items.reduce((total, item) => total + item.quantity, 0)} 項</span>
                </div>
                <div className="flex justify-between">
                  <span>小計</span>
                  <span>NT$ {getTotalPrice()}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>總計</span>
                    <span className="text-primary">NT$ {getTotalPrice()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/checkout')} 
                  className="w-full mt-6"
                  size="lg"
                >
                  前往結帳
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 評分對話框 */}
      <RatingDialog
        order={currentOrder}
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        onRate={handleRate}
      />
    </div>
  );
};

export default CartPage;
