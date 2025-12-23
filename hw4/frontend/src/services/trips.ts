import api from './api';
import type { Trip } from '../types';

export interface TripsResponse {
  success: boolean;
  data: Trip[];
}

export const getTrips = async () => {
  const response = await api.get<TripsResponse>('/api/trips');
  return response.data.data;
};

export const getTrip = async (id: number) => {
  const response = await api.get<{ success: boolean; data: Trip }>(`/api/trips/${id}`);
  return response.data.data;
};

export const createTrip = async (data: Partial<Trip>) => {
  const response = await api.post<{ success: boolean; data: Trip }>('/api/trips', data);
  return response.data.data;
};

export const updateTrip = async (id: number, data: Partial<Trip>) => {
  const response = await api.put<{ success: boolean; data: Trip }>(`/api/trips/${id}`, data);
  return response.data.data;
};

export const deleteTrip = async (id: number) => {
  await api.delete(`/api/trips/${id}`);
};

export interface AddPlaceToTripData {
  placeId: number;
  date: string;
  order: number;
  notes?: string;
  startTime?: string;
}

export const addPlaceToTrip = async (tripId: number, data: AddPlaceToTripData) => {
  const response = await api.post(`/api/trips/${tripId}/days`, data);
  return response.data.data;
};

export interface UpdateTripDayData {
  order?: number;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

export const updateTripDay = async (tripId: number, dayId: number, data: UpdateTripDayData) => {
  const response = await api.put(`/api/trips/${tripId}/days/${dayId}`, data);
  return response.data.data;
};

export const removePlaceFromTrip = async (tripId: number, dayId: number) => {
  await api.delete(`/api/trips/${tripId}/days/${dayId}`);
};

export const getDirections = async (tripId: number, date?: string) => {
  const response = await api.get(`/api/trips/${tripId}/directions`, {
    params: date ? { date } : {}
  });
  return response.data.data;
};

