import { calculateGoogleMapsDistance } from './googleMapsDistance';

// Haversine 公式計算兩點間的距離（公里）- 作為備用
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 地球半徑（公里）
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

// 交通方式的平均速度（km/h）
const TRANSPORT_SPEEDS: Record<string, number> = {
  walking: 5,
  public: 30,
  driving: 40,
};

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  duration?: number; // 停留時間（分鐘）
}

interface OptimizedRoute {
  order: string[]; // 優化後的地點 ID 順序
  totalDistance: number; // 總距離（km）
  totalTravelTime: number; // 總移動時間（分鐘）
  totalDuration: number; // 總停留時間（分鐘）
  segments: {
    from: string;
    to: string;
    distance: number;
    travelTime: number;
  }[];
}

/**
 * 最近鄰居演算法（Nearest Neighbor Algorithm）
 * 從起點開始，每次選擇最近的未訪問地點
 */
function nearestNeighbor(
  locations: Location[],
  startIndex: number = 0
): string[] {
  if (locations.length === 0) return [];
  if (locations.length === 1) return [locations[0].id];

  const unvisited = new Set(locations.map((l) => l.id));
  const route: string[] = [];
  let current = locations[startIndex];

  route.push(current.id);
  unvisited.delete(current.id);

  while (unvisited.size > 0) {
    let nearest: Location | null = null;
    let minDistance = Infinity;

    for (const location of locations) {
      if (unvisited.has(location.id)) {
        const distance = calculateDistance(
          current.latitude,
          current.longitude,
          location.latitude,
          location.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = location;
        }
      }
    }

    if (nearest) {
      route.push(nearest.id);
      unvisited.delete(nearest.id);
      current = nearest;
    } else {
      break;
    }
  }

  return route;
}

/**
 * 2-opt 演算法優化路線
 * 嘗試交換路線中的邊，以減少總距離
 */
function twoOptImprove(
  locations: Location[],
  route: string[]
): string[] {
  let improved = true;
  let bestRoute = [...route];

  while (improved) {
    improved = false;

    for (let i = 1; i < bestRoute.length - 1; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        const newRoute = [...bestRoute];
        // 反轉 i 到 j 之間的順序
        const reversed = newRoute.slice(i, j + 1).reverse();
        newRoute.splice(i, j - i + 1, ...reversed);

        // 計算新路線的總距離
        const oldDistance = calculateRouteDistance(locations, bestRoute);
        const newDistance = calculateRouteDistance(locations, newRoute);

        if (newDistance < oldDistance) {
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  return bestRoute;
}

function calculateRouteDistance(locations: Location[], route: string[]): number {
  let total = 0;
  const locationMap = new Map(locations.map((l) => [l.id, l]));

  for (let i = 0; i < route.length - 1; i++) {
    const from = locationMap.get(route[i]);
    const to = locationMap.get(route[i + 1]);
    if (from && to) {
      total += calculateDistance(from.latitude, from.longitude, to.latitude, to.longitude);
    }
  }

  return total;
}

/**
 * 優化路線順序
 * 綜合考慮距離和時間
 * 使用 Google Maps API 計算真實距離和時間（如果可用）
 */
export async function optimizeRoute(
  locations: Location[],
  transport: string = 'public',
  startDate?: Date
): Promise<OptimizedRoute> {
  if (locations.length === 0) {
    return {
      order: [],
      totalDistance: 0,
      totalTravelTime: 0,
      totalDuration: 0,
      segments: [],
    };
  }

  if (locations.length === 1) {
    return {
      order: [locations[0].id],
      totalDistance: 0,
      totalTravelTime: 0,
      totalDuration: locations[0].duration || 30,
      segments: [],
    };
  }

  // 步驟 1：使用最近鄰居演算法獲得初始路線
  let optimizedOrder = nearestNeighbor(locations, 0);

  // 步驟 2：使用 2-opt 演算法優化
  optimizedOrder = twoOptImprove(locations, optimizedOrder);

  // 步驟 3：計算路線詳細資訊（使用 Google Maps API 如果可用）
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const segments: OptimizedRoute['segments'] = [];
  let totalDistance = 0;
  let totalTravelTime = 0;
  let totalDuration = 0;

  for (let i = 0; i < optimizedOrder.length - 1; i++) {
    const from = locationMap.get(optimizedOrder[i]);
    const to = locationMap.get(optimizedOrder[i + 1]);

    if (from && to) {
      // 嘗試使用 Google Maps API，如果失敗則使用 Haversine
      try {
        const result = await calculateGoogleMapsDistance(
          { latitude: from.latitude, longitude: from.longitude },
          { latitude: to.latitude, longitude: to.longitude },
          transport as 'walking' | 'public' | 'driving'
        );

        segments.push({
          from: from.id,
          to: to.id,
          distance: result.distance,
          travelTime: result.duration,
        });

        totalDistance += result.distance;
        totalTravelTime += result.duration;
      } catch (error) {
        // 回退到 Haversine 公式
        const speed = TRANSPORT_SPEEDS[transport] || 30;
        const distance = calculateDistance(
          from.latitude,
          from.longitude,
          to.latitude,
          to.longitude
        );
        const travelTime = (distance / speed) * 60;

        segments.push({
          from: from.id,
          to: to.id,
          distance,
          travelTime,
        });

        totalDistance += distance;
        totalTravelTime += travelTime;
      }
    }
  }

  // 計算總停留時間
  totalDuration = locations.reduce((sum, loc) => sum + (loc.duration || 30), 0);

  return {
    order: optimizedOrder,
    totalDistance,
    totalTravelTime,
    totalDuration,
    segments,
  };
}


