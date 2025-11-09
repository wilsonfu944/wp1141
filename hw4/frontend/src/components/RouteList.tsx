// 路線列表組件
import { Route, User } from '../types';

interface RouteListProps {
  routes: Route[];
  currentUser: User | null;
  onRouteSelect: (route: Route) => void;
  onEditRoute: (route: Route) => void;
  onDeleteRoute: (routeId: number) => void;
  loading?: boolean;
}

export const RouteList = ({ 
  routes, 
  currentUser,
  onRouteSelect, 
  onEditRoute, 
  onDeleteRoute, 
  loading = false 
}: RouteListProps) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} 公尺`;
    } else {
      const km = meters / 1000;
      return `${km.toFixed(2)} 公里`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏃‍♂️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有跑步路線</h3>
        <p className="text-gray-500">點擊「新增路線」開始記錄您的跑步路線吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <div key={route.id} className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {route.title}
              </h3>
              
              {route.description && (
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {route.description}
                </p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                <div>
                  <span className="font-medium">距離:</span>
                  <br />
                  {formatDistance(route.distance)}
                </div>
                <div>
                  <span className="font-medium">日期:</span>
                  <br />
                  {formatDate(route.date)}
                </div>
                <div>
                  <span className="font-medium">起點:</span>
                  <br />
                  {route.startLat.toFixed(4)}, {route.startLng.toFixed(4)}
                </div>
                <div>
                  <span className="font-medium">終點:</span>
                  <br />
                  {route.endLat.toFixed(4)}, {route.endLng.toFixed(4)}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                <span>
                  建立於 {new Date(route.createdAt).toLocaleString('zh-TW')}
                </span>
                <span className="text-blue-600 font-medium">
                  創建者: {route.createdBy === currentUser?.id ? '我' : `用戶 ${route.createdBy}`}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <button
                onClick={() => onRouteSelect(route)}
                className="btn-primary text-sm px-3 py-1"
                title="在地圖上查看"
              >
                查看地圖
              </button>
              
              {/* 只有創建者可以編輯和刪除 */}
              {route.createdBy === currentUser?.id && (
                <>
                  <button
                    onClick={() => onEditRoute(route)}
                    className="btn-secondary text-sm px-3 py-1"
                    title="編輯路線"
                  >
                    編輯
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('確定要刪除此路線嗎？')) {
                        onDeleteRoute(route.id);
                      }
                    }}
                    className="btn-danger text-sm px-3 py-1"
                    title="刪除路線"
                  >
                    刪除
                  </button>
                </>
              )}
              
              {/* 如果不是創建者，顯示只讀提示 */}
              {route.createdBy !== currentUser?.id && (
                <div className="text-xs text-gray-500 text-center py-2">
                  只能查看此路線
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
