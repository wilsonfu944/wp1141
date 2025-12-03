import axios from 'axios';
import type { User, Location, Anime, Favorite, AuthResponse, Comment, Itinerary, ItineraryComment, OptimizedRoute, ForumPost, ForumReply, Message, Conversation } from '../types';

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
  addComment: async (id: string, content: string): Promise<ItineraryComment> => {
    const response = await api.post<ItineraryComment>(`/itineraries/${id}/comments`, { content });
    return response.data;
  },
  copy: async (id: string): Promise<Itinerary> => {
    const response = await api.post<Itinerary>(`/itineraries/${id}/copy`);
    return response.data;
  },
};

// Forum API
export const forumAPI = {
  getPosts: async (category?: string, sort?: string): Promise<ForumPost[]> => {
    const params: any = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;
    const response = await api.get<ForumPost[]>('/forum/posts', { params });
    return response.data;
  },
  getPostById: async (id: string): Promise<ForumPost> => {
    const response = await api.get<ForumPost>(`/forum/posts/${id}`);
    return response.data;
  },
  createPost: async (data: { title: string; content: string; category?: string }): Promise<ForumPost> => {
    const response = await api.post<ForumPost>('/forum/posts', data);
    return response.data;
  },
  createReply: async (postId: string, data: { content: string; parentId?: string }): Promise<ForumReply> => {
    const response = await api.post<ForumReply>(`/forum/posts/${postId}/replies`, data);
    return response.data;
  },
  likePost: async (id: string): Promise<void> => {
    await api.post(`/forum/posts/${id}/like`);
  },
};

// Messages API
export const messagesAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<Conversation[]>('/messages/conversations');
    return response.data;
  },
  getConversation: async (userId: string): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/messages/conversations/${userId}`);
    return response.data;
  },
  sendMessage: async (data: { receiverId: string; content: string; itineraryId?: string }): Promise<Message> => {
    const response = await api.post<Message>('/messages', data);
    return response.data;
  },
  markAsRead: async (id: string): Promise<void> => {
    await api.put(`/messages/${id}/read`);
  },
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/messages/unread/count');
    return response.data;
  },
};

// AI API
export const aiAPI = {
  chat: async (message: string, conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<{ response: string }> => {
    const response = await api.post<{ response: string }>('/ai/chat', {
      message,
      conversationHistory,
    });
    return response.data;
  },
};

// Favorite Animes API
export const favoriteAnimesAPI = {
  getAll: async (): Promise<Anime[]> => {
    const response = await api.get<Anime[]>('/favorite-animes');
    return response.data;
  },
  add: async (animeId: string): Promise<Anime> => {
    const response = await api.post<Anime>(`/favorite-animes/${animeId}`);
    return response.data;
  },
  remove: async (animeId: string): Promise<void> => {
    await api.delete(`/favorite-animes/${animeId}`);
  },
  check: async (animeId: string): Promise<{ isFavorited: boolean }> => {
    const response = await api.get<{ isFavorited: boolean }>(`/favorite-animes/${animeId}/check`);
    return response.data;
  },
};

// Friends API
export interface FriendRecommendation {
  user: User;
  commonAnimeCount: number;
  commonAnimes: Anime[];
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  sender?: User;
  receiver?: User;
  createdAt: string;
}

export const friendsAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/friends');
    return response.data;
  },
  sendRequest: async (receiverId: string): Promise<FriendRequest> => {
    const response = await api.post<FriendRequest>(`/friends/request/${receiverId}`);
    return response.data;
  },
  getRequests: async (): Promise<FriendRequest[]> => {
    const response = await api.get<FriendRequest[]>('/friends/requests');
    return response.data;
  },
  handleRequest: async (requestId: string, action: 'accept' | 'reject'): Promise<void> => {
    await api.put(`/friends/request/${requestId}`, { action });
  },
  getRecommendations: async (): Promise<FriendRecommendation[]> => {
    const response = await api.get<FriendRecommendation[]>('/friends/recommendations');
    return response.data;
  },
};

// Ratings API
export const ratingsAPI = {
  rateAnime: async (animeId: string, rating: number): Promise<void> => {
    await api.post(`/ratings/anime/${animeId}`, { rating });
  },
  getAnimeRating: async (animeId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    userRating: number | null;
  }> => {
    const response = await api.get<{
      averageRating: number;
      totalRatings: number;
      userRating: number | null;
    }>(`/ratings/anime/${animeId}`);
    return response.data;
  },
  rateLocation: async (locationId: string, rating: number): Promise<void> => {
    await api.post(`/ratings/location/${locationId}`, { rating });
  },
  getLocationRating: async (locationId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    userRating: number | null;
  }> => {
    const response = await api.get<{
      averageRating: number;
      totalRatings: number;
      userRating: number | null;
    }>(`/ratings/location/${locationId}`);
    return response.data;
  },
};

export default api;

