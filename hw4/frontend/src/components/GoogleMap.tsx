// Google Maps 地圖組件
import { useEffect, useRef, useState } from 'react';
import { MapLocation } from '../types';

interface GoogleMapProps {
  startLocation?: MapLocation | null;
  endLocation?: MapLocation | null;
  onLocationSelect?: (location: MapLocation, type: 'start' | 'end') => void;
  selectedRoute?: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
  } | null;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export const GoogleMap = ({ 
  startLocation, 
  endLocation, 
  onLocationSelect, 
  selectedRoute,
  height = '400px' 
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // 載入 Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      // 檢查是否已經載入
      if (window.google && window.google.maps) {
        initMap();
        return;
      }

      // 檢查是否已經有腳本在載入
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // 等待載入完成
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkLoaded);
            initMap();
          }
        }, 100);
        return;
      }

      // 載入 Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_JS_KEY}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setMapError('無法載入 Google Maps API，請檢查 API Key 設定');
      };
      
      window.initMap = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 13,
          center: { lat: 25.0330, lng: 121.5654 }, // 台北市預設位置
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        });

        mapInstanceRef.current = map;
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          draggable: false,
          suppressMarkers: true,
        });

        directionsRendererRef.current.setMap(map);
        setIsMapLoaded(true);
        setMapError(null);

        // 點擊地圖選擇位置
        if (onLocationSelect) {
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const location: MapLocation = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              };

              // 使用 Geocoding API 獲取地址
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location }, (results: any[], status: string) => {
                if (status === 'OK' && results[0]) {
                  location.address = results[0].formatted_address;
                }
                onLocationSelect(location, 'start'); // 預設選擇起點
              });
            }
          });
        }
      } catch (error) {
        console.error('地圖初始化錯誤:', error);
        setMapError('地圖初始化失敗');
      }
    };

    loadGoogleMaps();

    return () => {
      // 清理
      if (window.google && mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [onLocationSelect]);

  // 更新標記和路線
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;

    // 清除現有標記
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 清除現有路線
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }

    // 顯示起點和終點
    if (startLocation) {
      const startMarker = new window.google.maps.Marker({
        position: { lat: startLocation.lat, lng: startLocation.lng },
        map: mapInstanceRef.current,
        title: '起點',
        label: 'A',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4CAF50',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(startMarker);
    }

    if (endLocation) {
      const endMarker = new window.google.maps.Marker({
        position: { lat: endLocation.lat, lng: endLocation.lng },
        map: mapInstanceRef.current,
        title: '終點',
        label: 'B',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#F44336',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(endMarker);
    }

    // 顯示路線
    if (startLocation && endLocation && directionsServiceRef.current && directionsRendererRef.current) {
      const request = {
        origin: { lat: startLocation.lat, lng: startLocation.lng },
        destination: { lat: endLocation.lat, lng: endLocation.lng },
        travelMode: window.google.maps.TravelMode.WALKING,
      };

      directionsServiceRef.current.route(request, (result: any, status: string) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current!.setDirections(result);
        }
      });
    }

    // 顯示選中的路線
    if (selectedRoute && directionsServiceRef.current && directionsRendererRef.current) {
      const request = {
        origin: { lat: selectedRoute.startLat, lng: selectedRoute.startLng },
        destination: { lat: selectedRoute.endLat, lng: selectedRoute.endLng },
        travelMode: window.google.maps.TravelMode.WALKING,
      };

      directionsServiceRef.current.route(request, (result: any, status: string) => {
        if (status === 'OK' && result) {
          directionsRendererRef.current!.setDirections(result);
        }
      });

      // 添加起點和終點標記
      const startMarker = new window.google.maps.Marker({
        position: { lat: selectedRoute.startLat, lng: selectedRoute.startLng },
        map: mapInstanceRef.current,
        title: '起點',
        label: 'A',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4CAF50',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      const endMarker = new window.google.maps.Marker({
        position: { lat: selectedRoute.endLat, lng: selectedRoute.endLng },
        map: mapInstanceRef.current,
        title: '終點',
        label: 'B',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#F44336',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      markersRef.current.push(startMarker, endMarker);
    }

    // 調整地圖視圖以包含所有標記
    if (markersRef.current.length > 0 && mapInstanceRef.current) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [isMapLoaded, startLocation, endLocation, selectedRoute]);

  if (mapError) {
    return (
      <div 
        className="w-full rounded-lg border-2 border-red-300 bg-red-50 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-red-600">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm font-medium">地圖載入失敗</p>
          <p className="text-xs mt-1">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="w-full rounded-lg border border-gray-300"
    />
  );
};





