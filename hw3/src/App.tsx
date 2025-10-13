import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import { Header } from '@/components/Header/Header';
import { ShoppingCart } from '@/components/ShoppingCart/ShoppingCart';
import { ProductList } from '@/pages/ProductList/ProductList';
import { Checkout } from '@/pages/Checkout/Checkout';
import { ProductProvider } from '@/contexts/ProductContext';
import { CartProvider } from '@/contexts/CartContext';
import './App.css';

const { Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const [cartVisible, setCartVisible] = useState(false);
  const navigate = useNavigate();

  const handleCartClick = () => {
    setCartVisible(true);
  };

  const handleCartClose = () => {
    setCartVisible(false);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onCartClick={handleCartClick} />
      <Content style={{ background: '#f0f2f5' }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#001529', color: 'white' }}>
        購物網站 ©2025 Created with React + TypeScript + Ant Design
      </Footer>
      <ShoppingCart
        visible={cartVisible}
        onClose={handleCartClose}
        onCheckout={handleCheckout}
      />
    </Layout>
  );
};

function App() {
  return (
    <ConfigProvider locale={zhTW}>
      <Router>
        <ProductProvider csvPath="/data/products.csv">
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;




