import React, { useState } from 'react';
import { Layout, Input, Badge, Button, Select, Space } from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useCart } from '@/contexts/CartContext';
import { useProductContext } from '@/contexts/ProductContext';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;
const { Search } = Input;
const { Option } = Select;

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { getTotalItems } = useCart();
  const { updateFilterOptions, categories, filterOptions, resetFilters } = useProductContext();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    updateFilterOptions({ searchQuery: value });
  };

  const handleCategoryChange = (value: string) => {
    updateFilterOptions({ category: value === 'all' ? undefined : value });
  };

  const handleSortChange = (value: string) => {
    updateFilterOptions({ 
      sortBy: value === 'default' ? undefined : value as any 
    });
  };

  const handleReset = () => {
    setSearchValue('');
    resetFilters();
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <ShopOutlined className={styles.logoIcon} />
          <span className={styles.logoText}>購物網站</span>
        </div>

        <div className={styles.searchSection}>
          <Space.Compact style={{ width: '100%' }}>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              onChange={handleCategoryChange}
              value={filterOptions.category || 'all'}
            >
              <Option value="all">所有分類</Option>
              {categories.map(category => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
            <Search
              placeholder="搜尋商品..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{ flex: 1 }}
            />
          </Space.Compact>
        </div>

        <div className={styles.actions}>
          <Select
            defaultValue="default"
            style={{ width: 150 }}
            onChange={handleSortChange}
            value={filterOptions.sortBy || 'default'}
          >
            <Option value="default">預設排序</Option>
            <Option value="price-asc">價格：低到高</Option>
            <Option value="price-desc">價格：高到低</Option>
            <Option value="name">名稱</Option>
            <Option value="rating">評分</Option>
            <Option value="date">新品優先</Option>
          </Select>

          <Button onClick={handleReset}>
            重置篩選
          </Button>

          <Badge count={getTotalItems()} showZero>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={onCartClick}
              size="large"
            >
              購物車
            </Button>
          </Badge>
        </div>
      </div>
    </AntHeader>
  );
};


