import React, { useState, useEffect } from 'react';
import { Store } from '@/types';
import { loadStoreData } from '@/utils/dataLoader';
import StoreCard from '@/components/StoreCard';
import ItemModal from '@/components/ItemModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, Filter, History, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/contexts/StoreContext';

const StoreList: React.FC = () => {
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { currentStore, setCurrentStore, stores, setStores } = useStore();

  const categories = ['全部', '食物', '生活用品'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadStoreData();
        setStores(data);
        setFilteredStores(data);
      } catch (error) {
        console.error('Error loading store data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setStores]);

  useEffect(() => {
    let filtered = stores;

    // 分類篩選
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(store => store.category === selectedCategory);
    }

    // 搜尋篩選
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.items.some(item => 
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredStores(filtered);
  }, [stores, selectedCategory, searchTerm]);

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store);
    setCurrentStore(store);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStore(null);
    setCurrentStore(null);
  };

  const handleViewCart = () => {
    // 不關閉 Modal，只是跳轉到購物車頁面
    navigate('/cart');
  };

  // 當從購物車頁面返回時，如果有當前店家則自動打開 Modal
  React.useEffect(() => {
    if (currentStore && !isModalOpen) {
      setSelectedStore(currentStore);
      setIsModalOpen(true);
    }
  }, [currentStore, isModalOpen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Ubor Eat</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/history')}
                className="flex items-center space-x-2"
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">訂單歷史</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 訂單狀態提醒 */}
        <div className="mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">訂單狀態追蹤</h3>
                  <p className="text-sm text-blue-700">
                    送出訂單後，您可以在「訂單歷史」頁面查看送達計時器和訂單狀態
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/history')}
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  <History className="w-4 h-4 mr-2" />
                  查看訂單
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜尋和篩選 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* 搜尋框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="搜尋店家或品項..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 分類篩選 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">分類：</span>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 店家列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onStoreClick={handleStoreClick}
            />
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">找不到符合條件的店家</p>
          </div>
        )}
      </div>

      {/* Modal 和 Drawer */}
      <ItemModal
        store={selectedStore}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewCart={handleViewCart}
      />
    </div>
  );
};

export default StoreList;
