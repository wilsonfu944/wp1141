// 前端型別定義
export interface User {
  id: number;
  email: string;
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
}

export interface UpdateRouteRequest {
  title?: string;
  description?: string;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
  date?: string;
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
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteFormData {
  title: string;
  description: string;
  startLocation: MapLocation | null;
  endLocation: MapLocation | null;
  date: string;
}





