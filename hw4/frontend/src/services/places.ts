import api from './api';
import type { Place } from '../types';

export interface PlacesResponse {
  success: boolean;
  data: Place[];
}

export const getPlaces = async () => {
  const response = await api.get<PlacesResponse>('/api/places');
  return response.data.data;
};

export const getPlace = async (id: number) => {
  const response = await api.get<{ success: boolean; data: Place }>(`/api/places/${id}`);
  return response.data.data;
};

export const createPlace = async (data: Partial<Place>) => {
  const response = await api.post<{ success: boolean; data: Place }>('/api/places', data);
  return response.data.data;
};

export const updatePlace = async (id: number, data: Partial<Place>) => {
  const response = await api.put<{ success: boolean; data: Place }>(`/api/places/${id}`, data);
  return response.data.data;
};

export const deletePlace = async (id: number) => {
  await api.delete(`/api/places/${id}`);
};

export const searchPlaces = async (keyword: string, lat?: number, lng?: number, radius = 5000) => {
  const response = await api.post('/api/places/search', { keyword, lat, lng, radius });
  return response.data.data;
};

export const geocodeAddress = async (address: string) => {
  const response = await api.post('/api/places/geocode', { address });
  return response.data.data;
};

