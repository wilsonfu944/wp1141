import React from 'react';
import { Store, Item } from '@/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/AlertDialog';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface ItemModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onViewCart?: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ store, isOpen, onClose, onViewCart }) => {
  const { addItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [itemQuantities, setItemQuantities] = React.useState<Record<string, number>>({});
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);

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

  const getItemQuantity = (itemId: string) => {
    return itemQuantities[itemId] || 0;
  };

  const handleUpdateQuantity = (item: Item, newQuantity: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [item.id]: Math.max(0, newQuantity)
    }));
  };


  const getTotalSelectedItems = () => {
    return Object.values(itemQuantities).reduce((total, quantity) => total + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(itemQuantities).reduce((total, [itemId, quantity]) => {
      const item = store?.items.find(item => item.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const handleAddAllToCart = () => {
    if (!store) return;
    
    // 將所有選中的商品加入購物車
    Object.entries(itemQuantities).forEach(([itemId, quantity]) => {
      const item = store.items.find(item => item.id === itemId);
      if (item && quantity > 0) {
        for (let i = 0; i < quantity; i++) {
          addItem(item);
        }
      }
    });
    
    // 重置所有商品的數量
    setItemQuantities({});
  };


  const handleAbandonAndClose = () => {
    // 清空購物車
    clearCart();
    
    // 重置商品數量
    setItemQuantities({});
    
    // 關閉 Modal
    onClose();
  };

  const handleCloseAttempt = () => {
    // 總是顯示確認對話框
    setShowCloseConfirm(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleCloseAttempt();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl">{store?.store_name}</DialogTitle>
          <p className="text-muted-foreground">{store?.description}</p>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid gap-4">
            {store?.items.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.item_name}</h3>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {renderStars(item.rating)}
                          <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">NT$ {item.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleUpdateQuantity(item, Math.max(0, quantity - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleUpdateQuantity(item, quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 購物車操作區域 - 固定在底部 */}
        <div className="border-t p-4 bg-white sticky bottom-0">
          <div className="space-y-3">
            {/* 選中商品摘要 */}
            {getTotalSelectedItems() > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    已選擇 {getTotalSelectedItems()} 項商品
                  </span>
                  <span className="text-lg font-bold text-primary">
                    NT$ {getTotalPrice()}
                  </span>
                </div>
                
                {/* 顯示選中的商品 */}
                <div className="max-h-16 overflow-y-auto space-y-1">
                  {Object.entries(itemQuantities)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([itemId, quantity]) => {
                      const item = store?.items.find(item => item.id === itemId);
                      return item ? (
                        <div key={itemId} className="flex items-center justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{item.item_name}</span>
                          <span className="text-muted-foreground">x{quantity}</span>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            )}
            
            {/* 操作按鈕 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {getTotalSelectedItems() > 0 
                    ? "選擇完商品後點擊「加入購物車」" 
                    : "選擇商品數量後點擊「加入購物車」按鈕"
                  }
                </p>
              </div>
              
              <div className="ml-4 flex space-x-2">
                <Button 
                  onClick={onViewCart || (() => navigate('/cart'))}
                  variant="outline"
                  className="animate-bounce-in"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  查看購物車
                </Button>
                
                {getTotalSelectedItems() > 0 && (
                  <Button 
                    onClick={handleAddAllToCart}
                    className="animate-bounce-in"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    加入購物車
                  </Button>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* 關閉確認對話框 */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認關閉</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.values(itemQuantities).some(quantity => quantity > 0) 
                ? "確定要關閉店家頁面嗎？未加入購物車的商品將會遺失。"
                : "確定要關閉店家頁面嗎？"
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleAbandonAndClose} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              放棄並關閉
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default ItemModal;
