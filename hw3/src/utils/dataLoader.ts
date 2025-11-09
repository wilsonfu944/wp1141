import Papa from 'papaparse';
import { Store, Item } from '@/types';

export const loadStoreData = async (): Promise<Store[]> => {
  try {
    const response = await fetch('/delivery_data2.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const items: Item[] = results.data
            .filter((row: any) => row.store_name && row.item_name && row.price && row.rating) // 過濾掉空行和無效數據
            .map((row: any, index: number) => ({
              id: `${row.store_name}-${row.item_name}-${index}`,
              item_name: row.item_name,
              price: parseFloat(row.price),
              rating: parseFloat(row.rating),
              description: row.description,
              store_name: row.store_name,
              category: row.category as '食物' | '生活用品',
            }));

          // 將品項按店家分組
          const storeMap = new Map<string, Store>();
          
          items.forEach(item => {
            if (!storeMap.has(item.store_name)) {
              // 為每家店生成隨機外送時間（20-100秒）
              const deliveryTime = Math.floor(Math.random() * 81) + 20; // 20-100秒
              storeMap.set(item.store_name, {
                id: item.store_name,
                store_name: item.store_name,
                category: item.category,
                average_rating: 3.0, // 初始評分設為3顆星
                description: `${item.store_name}提供優質的${item.category}服務`,
                delivery_time: deliveryTime,
                items: [],
              });
            }
            
            const store = storeMap.get(item.store_name)!;
            store.items.push(item);
          });

          // 店家評分保持初始值3.0，不基於商品評分計算
          const stores = Array.from(storeMap.values());

          resolve(stores);
        },
        error: (error: any) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error loading store data:', error);
    throw error;
  }
};
