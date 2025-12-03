import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { loadProductsFromCSV } from '@/utils/csvParser';

/**
 * 載入並管理商品資料的 Hook
 * @param csvPath CSV 檔案路徑
 */
export const useProducts = (csvPath: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadProductsFromCSV(csvPath);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [csvPath]);

  return { products, loading, error };
};




