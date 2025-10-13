import React from 'react';
import { Modal, Table, Button, Empty, Tag, Rate } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { Product } from '@/types';
import styles from './ProductCompare.module.css';

interface ProductCompareProps {
  visible: boolean;
  products: Product[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
}

export const ProductCompare: React.FC<ProductCompareProps> = ({
  visible,
  products,
  onClose,
  onRemove,
  onAddToCart,
}) => {
  if (products.length === 0) {
    return (
      <Modal
        title="商品比較"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={1000}
      >
        <Empty description="尚未選擇要比較的商品" />
      </Modal>
    );
  }

  // 準備比較資料
  const comparisonData = [
    {
      key: 'image',
      attribute: '商品圖片',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <div className={styles.imageContainer}>
            <img 
              src={product.image_url} 
              alt={product.name}
              className={styles.compareImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
              }}
            />
            <Button
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => onRemove(product.id)}
              className={styles.removeBtn}
            >
              移除
            </Button>
          </div>
        ),
      }), {}),
    },
    {
      key: 'name',
      attribute: '商品名稱',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: <strong>{product.name}</strong>,
      }), {}),
    },
    {
      key: 'brand',
      attribute: '品牌',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: <Tag color="gold">{product.brand}</Tag>,
      }), {}),
    },
    {
      key: 'category',
      attribute: '分類',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: <Tag color="blue">{product.category}</Tag>,
      }), {}),
    },
    {
      key: 'price',
      attribute: '價格',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <span className={styles.price}>
            NT$ {product.price.toLocaleString()}
          </span>
        ),
      }), {}),
    },
    {
      key: 'rating',
      attribute: '評分',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <Rate disabled defaultValue={product.rating} style={{ fontSize: 14 }} />
        ),
      }), {}),
    },
    {
      key: 'stock',
      attribute: '庫存',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: product.stock > 0 ? (
          <Tag color="green">{product.stock} 件</Tag>
        ) : (
          <Tag color="red">已售完</Tag>
        ),
      }), {}),
    },
    {
      key: 'features',
      attribute: '特徵',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <div className={styles.features}>
            {product.features.split('/').map((feature, idx) => (
              <Tag key={idx} style={{ marginBottom: 4 }}>
                {feature}
              </Tag>
            ))}
          </div>
        ),
      }), {}),
    },
    {
      key: 'description',
      attribute: '描述',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <div className={styles.description}>{product.description}</div>
        ),
      }), {}),
    },
    {
      key: 'action',
      attribute: '操作',
      ...products.reduce((acc, product, index) => ({
        ...acc,
        [`product${index}`]: (
          <Button
            type="primary"
            disabled={product.stock === 0}
            onClick={() => onAddToCart?.(product)}
            block
          >
            {product.stock > 0 ? '加入購物車' : '已售完'}
          </Button>
        ),
      }), {}),
    },
  ];

  const columns = [
    {
      title: '屬性',
      dataIndex: 'attribute',
      key: 'attribute',
      width: 150,
      fixed: 'left' as const,
      className: styles.attributeColumn,
    },
    ...products.map((_, index) => ({
      title: `商品 ${index + 1}`,
      dataIndex: `product${index}`,
      key: `product${index}`,
      width: 250,
    })),
  ];

  return (
    <Modal
      title={`商品比較 (${products.length}/3)`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ maxWidth: 1200 }}
      className={styles.modal}
    >
      <div className={styles.compareContainer}>
        <Table
          dataSource={comparisonData}
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
          className={styles.compareTable}
        />
      </div>
    </Modal>
  );
};


