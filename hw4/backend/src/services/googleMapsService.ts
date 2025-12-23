// Google Maps API 服務
import axios from 'axios';
import { 
  GoogleMapsGeocodingResponse, 
  GoogleMapsDirectionsResponse 
} from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';
  // 快取：避免重複 API 呼叫
  private geocodingCache: Map<string, CacheEntry<any>> = new Map();
  private directionsCache: Map<string, CacheEntry<number>> = new Map();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24小時
  private readonly MIN_CALL_INTERVAL = 100; // 100ms，避免短時間內大量呼叫

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_SERVER_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Maps API Key 未設定，將使用直線距離計算');
    }
  }

  // 檢查快取是否有效
  private isValidCache<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < this.CACHE_TTL;
  }

  // 從快取取得資料
  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (this.isValidCache(entry)) {
      return entry!.data;
    }
    if (entry) {
      cache.delete(key);
    }
    return null;
  }

  // 儲存到快取
  private saveToCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 地址轉座標 (Geocoding)
  async geocodeAddress(address: string): Promise<{
    lat: number;
    lng: number;
    formattedAddress: string;
  } | null> {
    if (!this.apiKey) {
      console.warn('Google Maps API Key 未設定，無法進行地址轉換');
      return null;
    }

    // 檢查快取
    const cacheKey = `geocode:${address}`;
    const cachedResult = this.getFromCache(this.geocodingCache, cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await axios.get<GoogleMapsGeocodingResponse>(
        `${this.baseUrl}/geocode/json`,
        {
          params: {
            address: address,
            key: this.apiKey
          }
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const geocodeResult = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address
        };

        // 儲存到快取
        this.saveToCache(this.geocodingCache, cacheKey, geocodeResult);
        return geocodeResult;
      }

      console.error('Geocoding 失敗:', response.data.status);
      return null;
    } catch (error) {
      console.error('Geocoding API 錯誤:', error);
      throw new Error('地址轉換失敗');
    }
  }

  // 計算兩點間距離 (Directions API)
  async calculateDistance(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<number> {
    if (!this.apiKey) {
      console.warn('Google Maps API Key 未設定，使用直線距離計算');
      return this.calculateStraightLineDistance(startLat, startLng, endLat, endLng);
    }

    // 檢查快取
    const cacheKey = `directions:${startLat},${startLng}:${endLat},${endLng}`;
    const cachedDistance = this.getFromCache(this.directionsCache, cacheKey);
    if (cachedDistance !== null) {
      return cachedDistance;
    }

    try {
      const origin = `${startLat},${startLng}`;
      const destination = `${endLat},${endLng}`;

      const response = await axios.get<GoogleMapsDirectionsResponse>(
        `${this.baseUrl}/directions/json`,
        {
          params: {
            origin: origin,
            destination: destination,
            key: this.apiKey,
            mode: 'walking' // 使用步行模式計算跑步距離
          }
        }
      );

      if (response.data.status === 'OK' && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        if (route.legs.length > 0) {
          const distance = route.legs[0].distance.value;
          // 儲存到快取
          this.saveToCache(this.directionsCache, cacheKey, distance);
          return distance;
        }
      }

      console.error('Directions API 失敗:', response.data.status);
      // 如果 API 失敗，使用簡單的直線距離計算
      const straightDistance = this.calculateStraightLineDistance(startLat, startLng, endLat, endLng);
      return straightDistance;
    } catch (error) {
      console.error('Directions API 錯誤:', error);
      // 如果 API 失敗，使用簡單的直線距離計算
      return this.calculateStraightLineDistance(startLat, startLng, endLat, endLng);
    }
  }

  // 計算直線距離（備用方案）
  calculateStraightLineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371000; // 地球半徑（公尺）
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 距離（公尺）
    
    return Math.round(distance);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // 驗證座標是否有效
  validateCoordinates(lat: number, lng: number): boolean {
    return (
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }

  // 格式化距離顯示
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} 公尺`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(2)} 公里`;
    }
  }
}

export const googleMapsService = new GoogleMapsService();
