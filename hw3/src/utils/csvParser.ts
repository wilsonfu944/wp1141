import Papa from 'papaparse';
import { Product } from '@/types';

/**
 * 從 CSV 檔案載入商品資料
 * @param filePath CSV 檔案路徑
 * @returns Promise<Product[]>
 */
export const loadProductsFromCSV = async (filePath: string): Promise<Product[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const products: Product[] = results.data.map((row, index) => ({
            id: row.id || `product-${index + 1}`,
            name: row.name || '',
            category: row.category || '其他',
            price: parseFloat(row.price) || 0,
            stock: parseInt(row.stock) || 0,
            description: row.description || '',
            image_url: row.image_url || row.image || '',
            brand: row.brand || '未知品牌',
            rating: parseFloat(row.rating) || 0,
            features: row.features || '',
            created_date: row.created_date || new Date().toISOString().split('T')[0],
          }));
          resolve(products);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
};

/**
 * 篩選商品
 * @param products 商品陣列
 * @param searchQuery 搜尋關鍵字
 * @param category 商品分類
 * @returns 篩選後的商品陣列
 */
export const filterProducts = (
  products: Product[],
  searchQuery?: string,
  category?: string
): Product[] => {
  let filtered = [...products];

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((product) => product.category === category);
  }

  return filtered;
};

/**
 * 排序商品
 * @param products 商品陣列
 * @param sortBy 排序方式
 * @returns 排序後的商品陣列
 */
export const sortProducts = (
  products: Product[],
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'rating' | 'date'
): Product[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.created_date).getTime();
        const dateB = new Date(b.created_date).getTime();
        return dateB - dateA; // 新品優先（日期降序）
      });
    default:
      return sorted;
  }
};

