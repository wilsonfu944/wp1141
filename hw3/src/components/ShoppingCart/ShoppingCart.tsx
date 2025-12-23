import React from 'react';
import { Drawer, List, Button, InputNumber, Space, Typography, Empty, Divider } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useCart } from '@/contexts/CartContext';
import styles from './ShoppingCart.module.css';

const { Text, Title } = Typography;

interface ShoppingCartProps {
  visible: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({ visible, onClose, onCheckout }) => {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  const handleCheckout = () => {
    onClose();
    onCheckout();
  };

  return (
    <Drawer
      title={
        <Space>
          <ShoppingOutlined />
          <span>購物車</span>
          <Text type="secondary">({getTotalItems()} 件商品)</Text>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      footer={
        cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalSection}>
              <Text strong>總計：</Text>
              <Title level={4} type="danger" style={{ margin: 0 }}>
                NT$ {getTotalPrice().toLocaleString()}
              </Title>
            </div>
            <Button
              type="primary"
              size="large"
              block
              onClick={handleCheckout}
              icon={<ShoppingOutlined />}
            >
              前往結帳
            </Button>
          </div>
        )
      }
    >
      {cartItems.length === 0 ? (
        <Empty
          description="購物車是空的"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 100 }}
        />
      ) : (
        <List
          dataSource={cartItems}
          renderItem={(item) => (
            <List.Item className={styles.cartItem}>
              <div className={styles.itemContent}>
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className={styles.itemImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                  }}
                />
                <div className={styles.itemDetails}>
                  <Text strong ellipsis className={styles.itemName}>
                    {item.product.name}
                  </Text>
                  <Text type="secondary" className={styles.itemPrice}>
                    NT$ {item.product.price.toLocaleString()}
                  </Text>
                  <Space className={styles.itemActions}>
                    <InputNumber
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.product.id, value || 1)}
                      size="small"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.product.id)}
                      size="small"
                    >
                      移除
                    </Button>
                  </Space>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text strong>
                    小計：NT$ {(item.product.price * item.quantity).toLocaleString()}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Drawer>
  );
};

