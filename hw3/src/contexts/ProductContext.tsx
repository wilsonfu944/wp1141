import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product, FilterOptions } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { filterProducts, sortProducts } from '@/utils/csvParser';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  loading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  updateFilterOptions: (options: Partial<FilterOptions>) => void;
  resetFilters: () => void;
  categories: string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
  csvPath?: string;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ 
  children,
  csvPath = '/data/products.csv'
}) => {
  const { products, loading, error } = useProducts(csvPath);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});

  // 獲取所有商品分類
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return Array.from(uniqueCategories);
  }, [products]);

  // 篩選和排序商品
  const filteredProducts = React.useMemo(() => {
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

    // 品牌篩選
    if (filterOptions.brands && filterOptions.brands.length > 0) {
      result = result.filter(p => filterOptions.brands!.includes(p.brand));
    }

    // 評分篩選
    if (filterOptions.minRating !== undefined) {
      result = result.filter(p => p.rating >= filterOptions.minRating!);
    }

    // 庫存狀態篩選
    if (filterOptions.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // 排序
    if (filterOptions.sortBy) {
      result = sortProducts(result, filterOptions.sortBy);
    }

    return result;
  }, [products, filterOptions]);

  const updateFilterOptions = useCallback((options: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...options }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions({});
  }, []);

  const value: ProductContextType = {
    products,
    filteredProducts,
    loading,
    error,
    filterOptions,
    updateFilterOptions,
    resetFilters,
    categories,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

