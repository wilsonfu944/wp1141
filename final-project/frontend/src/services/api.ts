import axios from 'axios';
import type { User, Location, Anime, Favorite, AuthResponse, Comment, Itinerary, OptimizedRoute } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (email: string, password: string, name?: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },
};

// Locations API
export const locationsAPI = {
  getAll: async (animeId?: string, region?: string): Promise<Location[]> => {
    const params: any = {};
    if (animeId) params.animeId = animeId;
    if (region) params.region = region;
    const response = await api.get<Location[]>('/locations', { params });
    return response.data;
  },
  getById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  },
};

// Animes API
export const animesAPI = {
  getAll: async (): Promise<Anime[]> => {
    const response = await api.get<Anime[]>('/animes');
    return response.data;
  },
  getById: async (id: string): Promise<Anime> => {
    const response = await api.get<Anime>(`/animes/${id}`);
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  getAll: async (): Promise<Favorite[]> => {
    const response = await api.get<Favorite[]>('/favorites');
    return response.data;
  },
  add: async (locationId: string): Promise<Favorite> => {
    const response = await api.post<Favorite>(`/favorites/${locationId}`);
    return response.data;
  },
  remove: async (locationId: string): Promise<void> => {
    await api.delete(`/favorites/${locationId}`);
  },
  check: async (locationId: string): Promise<{ isFavorited: boolean }> => {
    const response = await api.get<{ isFavorited: boolean }>(`/favorites/${locationId}/check`);
    return response.data;
  },
};

// Comments API
export const commentsAPI = {
  getByLocation: async (locationId: string, sort?: string): Promise<Comment[]> => {
    const params: any = {};
    if (sort) params.sort = sort;
    const response = await api.get<Comment[]>(`/comments/location/${locationId}`, { params });
    return response.data;
  },
  create: async (locationId: string, content: string, rating?: number, parentId?: string): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', {
      locationId,
      content,
      rating,
      parentId,
    });
    return response.data;
  },
  update: async (id: string, content: string, rating?: number): Promise<Comment> => {
    const response = await api.put<Comment>(`/comments/${id}`, { content, rating });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
  like: async (id: string): Promise<void> => {
    await api.post(`/comments/${id}/like`);
  },
  unlike: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}/like`);
  },
};

// Itineraries API
export const itinerariesAPI = {
  optimize: async (locationIds: string[], transport: string): Promise<OptimizedRoute> => {
    const response = await api.post<OptimizedRoute>('/itineraries/optimize', {
      locationIds,
      transport,
    });
    return response.data;
  },
  create: async (data: {
    name: string;
    description?: string;
    startDate?: string;
    transport: string;
    isPublic: boolean;
    locations: { locationId: string; duration?: number; notes?: string }[];
  }): Promise<Itinerary> => {
    const response = await api.post<Itinerary>('/itineraries', data);
    return response.data;
  },
  getById: async (id: string): Promise<Itinerary> => {
    const response = await api.get<Itinerary>(`/itineraries/${id}`);
    return response.data;
  },
  getByUser: async (userId: string): Promise<Itinerary[]> => {
    const response = await api.get<Itinerary[]>(`/itineraries/user/${userId}`);
    return response.data;
  },
  getPublic: async (sort?: string): Promise<Itinerary[]> => {
    const params: any = {};
    if (sort) params.sort = sort;
    const response = await api.get<Itinerary[]>('/itineraries/public/all', { params });
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/itineraries/${id}`);
  },
  like: async (id: string): Promise<void> => {
    await api.post(`/itineraries/${id}/like`);
  },
  unlike: async (id: string): Promise<void> => {
    await api.delete(`/itineraries/${id}/like`);
  },
  addComment: async (id: string, content: string): Promise<void> => {
    await api.post(`/itineraries/${id}/comments`, { content });
  },
  copy: async (id: string): Promise<Itinerary> => {
    const response = await api.post<Itinerary>(`/itineraries/${id}/copy`);
    return response.data;
  },
};

export default api;

