// 路線相關 Hook
import { useState, useEffect } from 'react';
import { Route, CreateRouteRequest, UpdateRouteRequest } from '../types';
import { apiService } from '../services/api';
import { useAuth } from './useAuth';

export const useRoutes = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 取得所有路線
  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRoutes();
      
      if (response.success && response.data) {
        setRoutes(response.data);
      } else {
        throw new Error(response.error || '取得路線失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '取得路線失敗';
      setError(errorMessage);
      console.error('取得路線錯誤:', err);
    } finally {
      setLoading(false);
    }
  };

  // 建立新路線
  const createRoute = async (routeData: CreateRouteRequest): Promise<Route | null> => {
    try {
      setError(null);
      const response = await apiService.createRoute(routeData);
      
      if (response.success && response.data) {
        const newRoute = response.data;
        setRoutes(prev => [newRoute, ...prev]);
        return newRoute;
      } else {
        throw new Error(response.error || '建立路線失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '建立路線失敗';
      setError(errorMessage);
      console.error('建立路線錯誤:', err);
      return null;
    }
  };

  // 更新路線
  const updateRoute = async (id: number, routeData: UpdateRouteRequest): Promise<Route | null> => {
    try {
      setError(null);
      const response = await apiService.updateRoute(id, routeData);
      
      if (response.success && response.data) {
        const updatedRoute = response.data;
        setRoutes(prev => prev.map(route => 
          route.id === id ? updatedRoute : route
        ));
        return updatedRoute;
      } else {
        throw new Error(response.error || '更新路線失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新路線失敗';
      setError(errorMessage);
      console.error('更新路線錯誤:', err);
      return null;
    }
  };

  // 刪除路線
  const deleteRoute = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.deleteRoute(id);
      
      if (response.success) {
        setRoutes(prev => prev.filter(route => route.id !== id));
        return true;
      } else {
        throw new Error(response.error || '刪除路線失敗');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '刪除路線失敗';
      setError(errorMessage);
      console.error('刪除路線錯誤:', err);
      return false;
    }
  };

  // 根據 ID 取得單一路線
  const getRouteById = (id: number): Route | undefined => {
    return routes.find(route => route.id === id);
  };

  // 當用戶登入時載入路線，登出時清空路線
  useEffect(() => {
    if (user) {
      fetchRoutes();
    } else {
      setRoutes([]);
      setError(null);
    }
  }, [user]);

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    getRouteById
  };
};
