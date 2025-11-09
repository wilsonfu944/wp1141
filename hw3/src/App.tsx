import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { AddressProvider } from '@/contexts/AddressContext';
import StoreList from '@/pages/StoreList';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderHistory from '@/pages/OrderHistory';
import './index.css';

function App() {
  return (
    <CartProvider>
      <StoreProvider>
        <AddressProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<StoreList />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/history" element={<OrderHistory />} />
              </Routes>
            </div>
          </Router>
        </AddressProvider>
      </StoreProvider>
    </CartProvider>
  );
}

export default App;