import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { useAddress } from '@/contexts/AddressContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, ShoppingBag, MapPin, User, Phone, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Order, Address } from '@/types';

const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, clearCart, addOrder } = useCart();
  const { getStoreByName, setCurrentStore } = useStore();
  const { addresses, addAddress, getDefaultAddress } = useAddress();
  const navigate = useNavigate();

  // 地址表單狀態
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    phone: '',
  });

  // 初始化默認地址
  useEffect(() => {
    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      setSelectedAddressId(defaultAddress.id);
      setAddressForm({
        name: defaultAddress.name,
        address: defaultAddress.address,
        phone: defaultAddress.phone,
      });
    }
  }, [getDefaultAddress]);

  // 地址處理函數
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    setIsNewAddress(false);
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setAddressForm({
        name: selectedAddress.name,
        address: selectedAddress.address,
        phone: selectedAddress.phone,
      });
    }
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressId('');
    setAddressForm({ name: '', address: '', phone: '' });
  };

  const handleAddressFormChange = (field: string, value: string) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    // 驗證地址信息
    if (!addressForm.name || !addressForm.address || !addressForm.phone) {
      alert('請填寫完整的送達地址信息');
      return;
    }

    // 如果是新地址，保存到地址列表
    if (isNewAddress) {
      addAddress({
        name: addressForm.name,
        address: addressForm.address,
        phone: addressForm.phone,
        isDefault: addresses.length === 0, // 如果是第一個地址，設為默認
      });
    }
    // 按店家分組商品
    const storeGroups = items.reduce((groups, cartItem) => {
      const storeName = cartItem.item.store_name;
      if (!groups[storeName]) {
        groups[storeName] = [];
      }
      groups[storeName].push(cartItem);
      return groups;
    }, {} as Record<string, typeof items>);

    const newOrders: Order[] = [];

    // 為每個店家創建一筆訂單
    Object.entries(storeGroups).forEach(([storeName, storeItems]) => {
      // 獲取店家的實際送達時間
      const store = getStoreByName(storeName);
      const deliveryTime = store?.delivery_time || 300; // 如果找不到店家，使用默認5分鐘
      
      const order: Order = {
        id: `order-${Date.now()}-${storeName}`,
        storeName,
        items: storeItems,
        totalPrice: storeItems.reduce((total, item) => total + (item.item.price * item.quantity), 0),
        timestamp: new Date(),
        deliveryTime,
        isDelivered: false,
        deliveryAddress: {
          name: addressForm.name,
          address: addressForm.address,
          phone: addressForm.phone,
        },
      };
      
      // 保存到訂單歷史
      addOrder(order);
      newOrders.push(order);
    });
    
    // 清空購物車
    clearCart();
    
    // 直接跳轉到訂單歷史頁面
    navigate('/history');
  };

  const handleBackToStores = () => {
    // 清除當前店家狀態，避免返回主頁面時自動打開店家 Modal
    setCurrentStore(null);
    navigate('/');
  };


  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">購物車是空的</h2>
            <p className="text-muted-foreground mb-6">
              請先選擇一些商品再進行結帳。
            </p>
            <Button onClick={handleBackToStores} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回店家列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={handleBackToStores} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <h1 className="text-2xl font-bold">確認訂單</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 訂單詳情 */}
          <div className="lg:col-span-2">
            {/* 送達地址 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>送達地址</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* 地址選擇 */}
                {addresses.length > 0 && !isNewAddress && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">選擇地址</label>
                    <div className="space-y-2">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAddressSelect(address.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{address.name}</div>
                              <div className="text-sm text-gray-600">{address.address}</div>
                              <div className="text-sm text-gray-500">{address.phone}</div>
                            </div>
                            {address.isDefault && (
                              <Badge variant="outline" className="text-xs">默認</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNewAddress}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      新增地址
                    </Button>
                  </div>
                )}

                {/* 地址表單 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">收件人姓名</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="請輸入收件人姓名"
                          value={addressForm.name}
                          onChange={(e) => handleAddressFormChange('name', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">聯絡電話</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="tel"
                          placeholder="請輸入聯絡電話"
                          value={addressForm.phone}
                          onChange={(e) => handleAddressFormChange('phone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">詳細地址</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="請輸入詳細地址"
                        value={addressForm.address}
                        onChange={(e) => handleAddressFormChange('address', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>訂單詳情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((cartItem) => (
                    <div key={cartItem.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <h3 className="font-semibold">{cartItem.item.item_name}</h3>
                        <p className="text-sm text-muted-foreground">{cartItem.item.store_name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{cartItem.item.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            數量：{cartItem.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">NT$ {cartItem.item.price}</p>
                        <p className="text-sm text-muted-foreground">
                          小計：NT$ {cartItem.item.price * cartItem.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 訂單摘要 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((cartItem) => (
                    <div key={cartItem.id} className="flex justify-between text-sm">
                      <span>{cartItem.item.item_name} x {cartItem.quantity}</span>
                      <span>NT$ {cartItem.item.price * cartItem.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>總計：</span>
                    <span className="text-primary">NT$ {getTotalPrice()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePlaceOrder} 
                  className="w-full"
                  size="lg"
                >
                  確認送出訂單
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CheckoutPage;
