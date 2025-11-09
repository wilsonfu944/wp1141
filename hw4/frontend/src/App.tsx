// 主應用程式組件
import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useRoutes } from './hooks/useRoutes';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { RouteList } from './components/RouteList';
import { RouteForm } from './components/RouteForm';
import { Map } from './components/Map';
import { Route, RouteFormData } from './types';

function App() {
  const { user, login, register, loading: authLoading } = useAuth();
  const { 
    routes, 
    loading: routesLoading, 
    error: routesError,
    createRoute, 
    updateRoute, 
    deleteRoute 
  } = useRoutes();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // 處理認證
  const handleAuth = async (email: string, password: string) => {
    try {
      setAuthError(null);
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '認證失敗');
    }
  };

  // 處理路線表單提交
  const handleRouteSubmit = async (formData: RouteFormData) => {
    if (!formData.startLocation || !formData.endLocation) return;

    const routeData = {
      title: formData.title,
      description: formData.description,
      startLat: formData.startLocation.lat,
      startLng: formData.startLocation.lng,
      endLat: formData.endLocation.lat,
      endLng: formData.endLocation.lng,
      date: formData.date,
    };

    try {
      if (editingRoute) {
        await updateRoute(editingRoute.id, routeData);
        setEditingRoute(null);
      } else {
        await createRoute(routeData);
      }
      setShowRouteForm(false);
    } catch (error) {
      console.error('路線操作失敗:', error);
    }
  };

  // 處理路線編輯
  const handleEditRoute = (route: Route) => {
    const formData: RouteFormData = {
      title: route.title,
      description: route.description,
      startLocation: {
        lat: route.startLat,
        lng: route.startLng,
      },
      endLocation: {
        lat: route.endLat,
        lng: route.endLng,
      },
      date: route.date,
    };
    setEditingRoute(route);
    setShowRouteForm(true);
  };

  // 處理路線刪除
  const handleDeleteRoute = async (routeId: number) => {
    try {
      await deleteRoute(routeId);
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
      }
    } catch (error) {
      console.error('刪除路線失敗:', error);
    }
  };

  // 處理路線選擇
  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  // 如果正在載入認證狀態，顯示載入畫面
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  // 如果未登入，顯示認證表單
  if (!user) {
    return (
      <AuthForm
        mode={authMode}
        onSubmit={handleAuth}
        onSwitchMode={() => {
          setAuthMode(authMode === 'login' ? 'register' : 'login');
          setAuthError(null);
        }}
        loading={authLoading}
        error={authError}
      />
    );
  }

  // 主要應用程式介面
  return (
    <Layout>
      <div className="space-y-6">
        {/* 頁面標題和操作按鈕 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">我的跑步路線</h1>
          <button
            onClick={() => {
              setEditingRoute(null);
              setShowRouteForm(true);
            }}
            className="btn-primary"
          >
            新增路線
          </button>
        </div>

        {/* 錯誤訊息 */}
        {routesError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{routesError}</div>
          </div>
        )}

        {/* 路線表單 */}
        {showRouteForm && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRoute ? '編輯路線' : '新增路線'}
            </h2>
            <RouteForm
              initialData={editingRoute ? {
                title: editingRoute.title,
                description: editingRoute.description,
                startLocation: {
                  lat: editingRoute.startLat,
                  lng: editingRoute.startLng,
                },
                endLocation: {
                  lat: editingRoute.endLat,
                  lng: editingRoute.endLng,
                },
                date: editingRoute.date,
              } : undefined}
              onSubmit={handleRouteSubmit}
              onCancel={() => {
                setShowRouteForm(false);
                setEditingRoute(null);
              }}
              loading={routesLoading}
            />
          </div>
        )}

        {/* 地圖和路線列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 地圖區域 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">地圖檢視</h2>
            <div className="card">
              <Map
                selectedRoute={selectedRoute ? {
                  startLat: selectedRoute.startLat,
                  startLng: selectedRoute.startLng,
                  endLat: selectedRoute.endLat,
                  endLng: selectedRoute.endLng,
                } : null}
                height="500px"
              />
            </div>
          </div>

          {/* 路線列表區域 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">路線列表</h2>
            <RouteList
              routes={routes}
              currentUser={user}
              onRouteSelect={handleRouteSelect}
              onEditRoute={handleEditRoute}
              onDeleteRoute={handleDeleteRoute}
              loading={routesLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;