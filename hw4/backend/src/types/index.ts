// 型別定義檔案
export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: number;
  title: string;
  description: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distance: number;
  date: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRouteRequest {
  title: string;
  description: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  date: string;
  distance?: number;
}

export interface UpdateRouteRequest {
  title?: string;
  description?: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  date?: string;
  distance?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
  };
}

export interface GoogleMapsGeocodingResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
}

export interface GoogleMapsDirectionsResponse {
  routes: Array<{
    legs: Array<{
      distance: {
        value: number; // 距離（公尺）
        text: string;
      };
    }>;
  }>;
  status: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}



