import React, { useState } from 'react';
import {
  Card,
  List,
  Button,
  Typography,
  Space,
  Divider,
  Result,
  Input,
  Form,
  Modal,
} from 'antd';
import { ShoppingOutlined, CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CheckoutFormValues {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export const Checkout: React.FC = () => {
  const { cartItems, getTotalPrice, submitOrder } = useCart();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = (values: CheckoutFormValues) => {
    Modal.confirm({
      title: '確認送出訂單',
      content: '確定要送出訂單嗎？送出後將無法修改。',
      okText: '確定送出',
      cancelText: '取消',
      onOk: () => {
        const order = submitOrder();
        if (order) {
          setOrderNumber(order.id);
          setIsSubmitted(true);
        }
      },
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (cartItems.length === 0 && !isSubmitted) {
    return (
      <div className={styles.container}>
        <Result
          status="warning"
          title="購物車是空的"
          subTitle="請先選購商品後再進行結帳"
          extra={
            <Button type="primary" onClick={handleBackToHome}>
              回到首頁
            </Button>
          }
        />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className={styles.container}>
        <Result
          status="success"
          icon={<CheckCircleOutlined />}
          title="訂單送出成功！"
          subTitle={
            <Space direction="vertical" size="small">
              <Text>訂單編號：{orderNumber}</Text>
              <Text type="secondary">感謝您的購買，我們會盡快為您處理訂單</Text>
            </Space>
          }
          extra={[
            <Button type="primary" key="home" icon={<HomeOutlined />} onClick={handleBackToHome}>
              回到首頁
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Title level={2}>
        <ShoppingOutlined /> 結帳
      </Title>

      <div className={styles.content}>
        <Card title="訂單明細" className={styles.orderCard}>
          <List
            dataSource={cartItems}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=No+Image';
                      }}
                    />
                  }
                  title={item.product.name}
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">單價：NT$ {item.product.price.toLocaleString()}</Text>
                      <Text type="secondary">數量：{item.quantity}</Text>
                    </Space>
                  }
                />
                <div className={styles.itemTotal}>
                  <Text strong>
                    NT$ {(item.product.price * item.quantity).toLocaleString()}
                  </Text>
                </div>
              </List.Item>
            )}
          />
          <Divider />
          <div className={styles.totalSection}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div className={styles.totalRow}>
                <Text>商品總計：</Text>
                <Text strong>NT$ {getTotalPrice().toLocaleString()}</Text>
              </div>
              <div className={styles.totalRow}>
                <Text>運費：</Text>
                <Text strong>NT$ 0</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div className={styles.totalRow}>
                <Title level={4} style={{ margin: 0 }}>總計：</Title>
                <Title level={4} type="danger" style={{ margin: 0 }}>
                  NT$ {getTotalPrice().toLocaleString()}
                </Title>
              </div>
            </Space>
          </div>
        </Card>

        <Card title="收件資訊" className={styles.formCard}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="姓名"
              name="name"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input placeholder="請輸入收件人姓名" />
            </Form.Item>

            <Form.Item
              label="電話"
              name="phone"
              rules={[
                { required: true, message: '請輸入電話' },
                { pattern: /^09\d{8}$/, message: '請輸入有效的手機號碼' },
              ]}
            >
              <Input placeholder="請輸入聯絡電話" />
            </Form.Item>

            <Form.Item
              label="地址"
              name="address"
              rules={[{ required: true, message: '請輸入地址' }]}
            >
              <TextArea
                placeholder="請輸入收件地址"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              label="備註"
              name="note"
            >
              <TextArea
                placeholder="其他備註事項（選填）"
                rows={3}
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%' }} direction="vertical" size="middle">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                >
                  確認送出訂單
                </Button>
                <Button
                  size="large"
                  block
                  onClick={handleBackToHome}
                >
                  返回繼續購物
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

