import { useState, useMemo, useCallback } from 'react';
import { Product, FilterOptions } from '@/types';
import { filterProducts, sortProducts } from '@/utils/csvParser';

/**
 * 自定義 Hook：管理商品篩選和排序
 * @param products 原始商品列表
 * @returns 篩選後的商品列表和控制函數
 */
export const useFilters = (products: Product[]) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // 取得所有可用的分類
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return Array.from(uniqueCategories);
  }, [products]);

  // 取得價格範圍
  const priceRange = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 0 };
    }
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // 篩選和排序商品
  const filteredProducts = useMemo(() => {
    let result = filterProducts(
      products,
      filterOptions.searchQuery,
      filterOptions.category
    );

    // 價格篩選
    if (filterOptions.minPrice !== undefined) {
      result = result.filter(p => p.price >= filterOptions.minPrice!);
    }
    if (filterOptions.maxPrice !== undefined) {
      result = result.filter(p => p.price <= filterOptions.maxPrice!);
    }

    // 排序
    if (filterOptions.sortBy) {
      result = sortProducts(result, filterOptions.sortBy);
    }

    return result;
  }, [products, filterOptions]);

  // 更新篩選選項
  const updateFilters = useCallback((options: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...options }));
  }, []);

  // 重置所有篩選
  const resetFilters = useCallback(() => {
    setFilterOptions({});
  }, []);

  // 設定搜尋關鍵字
  const setSearchQuery = useCallback((query: string) => {
    setFilterOptions(prev => ({ ...prev, searchQuery: query }));
  }, []);

  // 設定分類
  const setCategory = useCallback((category: string | undefined) => {
    setFilterOptions(prev => ({ ...prev, category }));
  }, []);

  // 設定排序方式
  const setSortBy = useCallback((sortBy: FilterOptions['sortBy']) => {
    setFilterOptions(prev => ({ ...prev, sortBy }));
  }, []);

  // 設定價格範圍
  const setPriceRange = useCallback((minPrice?: number, maxPrice?: number) => {
    setFilterOptions(prev => ({ ...prev, minPrice, maxPrice }));
  }, []);

  return {
    filteredProducts,
    filterOptions,
    categories,
    priceRange,
    updateFilters,
    resetFilters,
    setSearchQuery,
    setCategory,
    setSortBy,
    setPriceRange,
  };
};







