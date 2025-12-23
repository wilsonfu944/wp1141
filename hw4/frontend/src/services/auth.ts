import api from './api';
import type { User } from '../types';

interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

interface RegisterResponse extends LoginResponse {}

export const login = async (email: string, password: string) => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};

export const register = async (email: string, password: string, name?: string) => {
  const response = await api.post<RegisterResponse>('/auth/register', { email, password, name });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

