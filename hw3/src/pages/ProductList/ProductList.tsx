import React, { useState } from 'react';
import { Row, Col, Spin, Alert, Empty, Layout, Button, Space, Badge, FloatButton } from 'antd';
import { SwapOutlined, UpOutlined } from '@ant-design/icons';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { FilterSidebar } from '@/components/FilterSidebar/FilterSidebar';
import { ProductCompare } from '@/components/ProductCompare/ProductCompare';
import { useProductContext } from '@/contexts/ProductContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import styles from './ProductList.module.css';

const { Content, Sider } = Layout;

export const ProductList: React.FC = () => {
  const { filteredProducts, loading, error, updateFilterOptions, filterOptions } = useProductContext();
  const { addToCart } = useCart();
  
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);

  // 處理商品比較選擇
  const handleCompareChange = (product: Product, checked: boolean) => {
    if (checked) {
      if (compareProducts.length < 3) {
        setCompareProducts([...compareProducts, product]);
      }
    } else {
      setCompareProducts(compareProducts.filter(p => p.id !== product.id));
    }
  };

  // 移除比較商品
  const handleRemoveCompare = (productId: string) => {
    setCompareProducts(compareProducts.filter(p => p.id !== productId));
  };

  // 開啟比較彈窗
  const handleOpenCompare = () => {
    if (compareProducts.length > 0) {
      setCompareModalVisible(true);
    }
  };

  // 處理從比較彈窗加入購物車
  const handleAddToCartFromCompare = (product: Product) => {
    addToCart(product, 1);
  };

  // 回到頂部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" tip="載入商品中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Alert
          message="載入失敗"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <Layout className={styles.layout}>
      {/* 篩選側邊欄 */}
      <Sider
        width={280}
        breakpoint="lg"
        collapsedWidth="0"
        className={styles.sider}
        theme="light"
      >
        <FilterSidebar />
      </Sider>

      {/* 主要內容區 */}
      <Content className={styles.content}>
        {/* 工具列 - 移除重複的搜尋框，排序功能已在 Header 中 */}
        {compareProducts.length > 0 && (
          <div className={styles.toolbar}>
            <Space size="middle" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Badge count={compareProducts.length} offset={[-5, 5]}>
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={handleOpenCompare}
                  size="large"
                >
                  商品比較 ({compareProducts.length}/3)
                </Button>
              </Badge>
            </Space>
          </div>
        )}

        {/* 結果統計 */}
        <div className={styles.resultInfo}>
          共找到 <span className={styles.count}>{filteredProducts.length}</span> 個商品
          {compareProducts.length > 0 && (
            <span className={styles.compareInfo}>
              {' '}· 已選擇 {compareProducts.length}/3 個商品進行比較
            </span>
          )}
        </div>

        {/* 商品列表 */}
        {filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            <Empty
              description="找不到符合條件的商品"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredProducts.map((product) => (
              <Col
                key={product.id}
                xs={24}
                sm={12}
                md={12}
                lg={8}
                xl={6}
              >
                <ProductCard 
                  product={product}
                  onCompareChange={handleCompareChange}
                  isComparing={compareProducts.some(p => p.id === product.id)}
                  compareDisabled={compareProducts.length >= 3}
                />
              </Col>
            ))}
          </Row>
        )}
      </Content>

      {/* 商品比較彈窗 */}
      <ProductCompare
        visible={compareModalVisible}
        products={compareProducts}
        onClose={() => setCompareModalVisible(false)}
        onRemove={handleRemoveCompare}
        onAddToCart={handleAddToCartFromCompare}
      />

      {/* 浮動按鈕 - 回到頂部 */}
      <FloatButton.BackTop
        icon={<UpOutlined />}
        tooltip="回到頂部"
        onClick={scrollToTop}
      />

      {/* 浮動按鈕 - 商品比較（移動端） */}
      {compareProducts.length > 0 && (
        <FloatButton
          icon={<SwapOutlined />}
          tooltip={`商品比較 (${compareProducts.length})`}
          type="primary"
          onClick={handleOpenCompare}
          badge={{ count: compareProducts.length }}
          style={{ right: 24, bottom: 80 }}
        />
      )}
    </Layout>
  );
};
