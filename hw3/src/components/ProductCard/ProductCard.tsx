import React from 'react';
import { Card, Button, InputNumber, Tag, Rate, Space, Typography, Tooltip, Checkbox } from 'antd';
import { ShoppingCartOutlined, CheckCircleOutlined, TagOutlined, EyeOutlined } from '@ant-design/icons';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import styles from './ProductCard.module.css';

const { Meta } = Card;
const { Text, Paragraph } = Typography;

interface ProductCardProps {
  product: Product;
  onCompareChange?: (product: Product, checked: boolean) => void;
  isComparing?: boolean;
  compareDisabled?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onCompareChange,
  isComparing = false,
  compareDisabled = false,
}) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const isInStock = product.stock > 0;
  const features = product.features ? product.features.split('/') : [];

  const handleCompareChange = (e: any) => {
    onCompareChange?.(product, e.target.checked);
  };

  return (
    <Card
      hoverable
      className={`${styles.card} ${isComparing ? styles.comparing : ''}`}
      cover={
        <div className={styles.imageContainer}>
          <img
            alt={product.name}
            src={product.image_url}
            className={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
          {!isInStock && (
            <div className={styles.outOfStock}>
              <Tag color="red">已售完</Tag>
            </div>
          )}
          {product.brand && (
            <div className={styles.brandTag}>
              <Tag color="gold">{product.brand}</Tag>
            </div>
          )}
          {onCompareChange && (
            <div className={styles.compareCheckbox}>
              <Tooltip title={compareDisabled && !isComparing ? '最多只能比較 3 個商品' : '加入比較'}>
                <Checkbox
                  checked={isComparing}
                  onChange={handleCompareChange}
                  disabled={compareDisabled && !isComparing}
                >
                  比較
                </Checkbox>
              </Tooltip>
            </div>
          )}
          <div 
            className={styles.quickView}
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            <Tooltip title="快速預覽">
              <EyeOutlined />
            </Tooltip>
          </div>
        </div>
      }
      actions={[
        <Space key="quantity" className={styles.quantityControl}>
          <Text>數量：</Text>
          <InputNumber
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(value) => setQuantity(value || 1)}
            disabled={!isInStock}
            size="small"
          />
        </Space>,
        <Button
          key="add"
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={!isInStock}
          block
        >
          加入購物車
        </Button>,
      ]}
    >
      <Meta
        title={
          <div className={styles.titleContainer}>
            <Typography.Title level={5} ellipsis={{ rows: 2 }}>
              {product.name}
            </Typography.Title>
          </div>
        }
        description={
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <div className={styles.categoryRating}>
              <Tag color="blue">{product.category}</Tag>
              <Rate disabled defaultValue={product.rating} style={{ fontSize: 14 }} />
            </div>

            <Paragraph
              ellipsis={showFullDescription ? false : { rows: 2 }}
              className={styles.description}
            >
              {product.description}
            </Paragraph>
            
            {product.description.length > 50 && (
              <Button 
                type="link" 
                size="small"
                onClick={() => setShowFullDescription(!showFullDescription)}
                style={{ padding: 0, height: 'auto' }}
              >
                {showFullDescription ? '收起' : '展開'}
              </Button>
            )}

            {features.length > 0 && (
              <div className={styles.features}>
                <Tooltip title={product.features}>
                  <Space size={[4, 4]} wrap>
                    <TagOutlined style={{ fontSize: 12, color: '#999' }} />
                    {features.slice(0, 3).map((feature, index) => (
                      <Tag key={index} color="default" style={{ fontSize: 11, margin: 0 }}>
                        {feature}
                      </Tag>
                    ))}
                    {features.length > 3 && <Text type="secondary" style={{ fontSize: 11 }}>+{features.length - 3}</Text>}
                  </Space>
                </Tooltip>
              </div>
            )}

            <div className={styles.footer}>
              <Text strong className={styles.price}>
                NT$ {product.price.toLocaleString()}
              </Text>
              <Text type="secondary" className={styles.stock}>
                {isInStock ? (
                  <>
                    <CheckCircleOutlined /> 庫存：{product.stock}
                  </>
                ) : (
                  '已售完'
                )}
              </Text>
            </div>
          </Space>
        }
      />
    </Card>
  );
};

