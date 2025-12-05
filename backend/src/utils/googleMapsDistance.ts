/**
 * 使用 Google Maps Distance Matrix API 計算距離和時間
 * 如果 API 不可用，則回退到 Haversine 公式
 */

interface Location {
  latitude: number;
  longitude: number;
}

interface DistanceResult {
  distance: number; // 公里
  duration: number; // 分鐘
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * 使用 Haversine 公式計算兩點間的距離（公里）
 */
function calculateHaversineDistance(
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

/**
 * 使用 Google Maps Distance Matrix API 計算距離和時間
 */
export async function calculateGoogleMapsDistance(
  from: Location,
  to: Location,
  transport: 'walking' | 'public' | 'driving' = 'driving'
): Promise<DistanceResult> {
  if (!GOOGLE_MAPS_API_KEY) {
    // 如果沒有 API Key，使用 Haversine 公式估算
    return calculateHaversineDistanceWithTime(from, to, transport);
  }

  try {
    const mode = transport === 'walking' ? 'walking' : transport === 'public' ? 'transit' : 'driving';
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from.latitude},${from.longitude}&destinations=${to.latitude},${to.longitude}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}&language=zh-TW`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.value / 1000, // 轉換為公里
        duration: element.duration.value / 60, // 轉換為分鐘
      };
    } else {
      // API 失敗，回退到 Haversine
      return calculateHaversineDistanceWithTime(from, to, transport);
    }
  } catch (error) {
    console.error('Google Maps API error:', error);
    // 回退到 Haversine
    return calculateHaversineDistanceWithTime(from, to, transport);
  }
}

/**
 * 使用 Haversine 公式計算距離，並根據交通方式估算時間
 */
function calculateHaversineDistanceWithTime(
  from: Location,
  to: Location,
  transport: 'walking' | 'public' | 'driving'
): DistanceResult {
  const distance = calculateHaversineDistance(
    from.latitude,
    from.longitude,
    to.latitude,
    to.longitude
  );

  // 交通方式的平均速度（km/h）
  const speeds: Record<string, number> = {
    walking: 5,
    public: 30,
    driving: 40,
  };

  const speed = speeds[transport] || 30;
  const duration = (distance / speed) * 60; // 轉換為分鐘

  return { distance, duration };
}



