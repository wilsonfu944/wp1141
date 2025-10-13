import React, { useMemo } from 'react';
import { Card, Checkbox, Slider, Rate, Radio, Divider, Button, Space, Typography } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { useProductContext } from '@/contexts/ProductContext';
import styles from './FilterSidebar.module.css';

const { Title, Text } = Typography;

export const FilterSidebar: React.FC = () => {
  const { 
    products,
    filterOptions, 
    updateFilterOptions, 
    resetFilters,
    categories 
  } = useProductContext();

  // 獲取所有品牌
  const brands = useMemo(() => {
    const uniqueBrands = new Set(products.map(p => p.brand));
    return Array.from(uniqueBrands).sort();
  }, [products]);

  // 獲取價格範圍
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 100) * 100,
      max: Math.ceil(Math.max(...prices) / 100) * 100,
    };
  }, [products]);

  // 處理分類變更
  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    updateFilterOptions({ category: value === 'all' ? undefined : value });
  };

  // 處理價格範圍變更
  const handlePriceChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      updateFilterOptions({ 
        minPrice: value[0], 
        maxPrice: value[1] 
      });
    }
  };

  // 處理品牌變更
  const handleBrandChange = (checkedValues: string[]) => {
    updateFilterOptions({ 
      brands: checkedValues.length > 0 ? checkedValues : undefined 
    });
  };

  // 處理評分變更
  const handleRatingChange = (value: number) => {
    updateFilterOptions({ 
      minRating: value > 0 ? value : undefined 
    });
  };

  // 處理庫存狀態變更
  const handleStockChange = (e: any) => {
    updateFilterOptions({ 
      inStockOnly: e.target.checked 
    });
  };

  const currentPriceRange: [number, number] = [
    filterOptions.minPrice ?? priceRange.min,
    filterOptions.maxPrice ?? priceRange.max,
  ];

  return (
    <Card 
      className={styles.sidebar}
      title={
        <Space>
          <FilterOutlined />
          <span>篩選條件</span>
        </Space>
      }
      extra={
        <Button 
          size="small" 
          icon={<ClearOutlined />} 
          onClick={resetFilters}
        >
          重置
        </Button>
      }
    >
      {/* 分類篩選 */}
      <div className={styles.filterSection}>
        <Title level={5}>商品分類</Title>
        <Radio.Group 
          value={filterOptions.category || 'all'} 
          onChange={handleCategoryChange}
          className={styles.radioGroup}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="all">所有分類</Radio>
            {categories.map(category => (
              <Radio key={category} value={category}>
                {category}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </div>

      <Divider />

      {/* 價格範圍 */}
      <div className={styles.filterSection}>
        <Title level={5}>價格範圍</Title>
        <Slider
          range
          min={priceRange.min}
          max={priceRange.max}
          step={100}
          value={currentPriceRange}
          onChange={handlePriceChange}
          tooltip={{
            formatter: (value) => `NT$ ${value?.toLocaleString()}`,
          }}
        />
        <div className={styles.priceDisplay}>
          <Text>NT$ {currentPriceRange[0].toLocaleString()}</Text>
          <Text>-</Text>
          <Text>NT$ {currentPriceRange[1].toLocaleString()}</Text>
        </div>
      </div>

      <Divider />

      {/* 評分篩選 */}
      <div className={styles.filterSection}>
        <Title level={5}>最低評分</Title>
        <div className={styles.ratingFilter}>
          <Rate 
            value={filterOptions.minRating || 0}
            onChange={handleRatingChange}
            allowClear
          />
          {filterOptions.minRating && (
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {filterOptions.minRating} 星以上
            </Text>
          )}
        </div>
      </div>

      <Divider />

      {/* 品牌篩選 */}
      <div className={styles.filterSection}>
        <Title level={5}>品牌</Title>
        <Checkbox.Group 
          value={filterOptions.brands || []}
          onChange={handleBrandChange}
          className={styles.checkboxGroup}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {brands.slice(0, 10).map(brand => (
              <Checkbox key={brand} value={brand}>
                {brand}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>
        {brands.length > 10 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            顯示前 10 個品牌
          </Text>
        )}
      </div>

      <Divider />

      {/* 庫存狀態 */}
      <div className={styles.filterSection}>
        <Title level={5}>庫存狀態</Title>
        <Checkbox 
          checked={filterOptions.inStockOnly}
          onChange={handleStockChange}
        >
          僅顯示有庫存商品
        </Checkbox>
      </div>
    </Card>
  );
};


