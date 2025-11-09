// API 服務
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest, 
  Route, 
  CreateRouteRequest, 
  UpdateRouteRequest,
  ApiResponse 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 請求攔截器 - 自動添加 token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 響應攔截器 - 處理錯誤
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token 過期或無效，清除本地存儲
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // 認證相關 API
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await this.api.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/logout');
    return response.data;
  }

  async verifyToken(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/auth/verify');
    return response.data;
  }

  // 路線相關 API
  async getRoutes(): Promise<ApiResponse<Route[]>> {
    const response: AxiosResponse<ApiResponse<Route[]>> = await this.api.get('/api/routes');
    return response.data;
  }

  async getRoute(id: number): Promise<ApiResponse<Route>> {
    const response: AxiosResponse<ApiResponse<Route>> = await this.api.get(`/api/routes/${id}`);
    return response.data;
  }

  async createRoute(data: CreateRouteRequest): Promise<ApiResponse<Route>> {
    const response: AxiosResponse<ApiResponse<Route>> = await this.api.post('/api/routes', data);
    return response.data;
  }

  async updateRoute(id: number, data: UpdateRouteRequest): Promise<ApiResponse<Route>> {
    const response: AxiosResponse<ApiResponse<Route>> = await this.api.put(`/api/routes/${id}`, data);
    return response.data;
  }

  async deleteRoute(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/api/routes/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();





