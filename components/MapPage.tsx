'use client';

import { useEffect, useState, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Location {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  anime: {
    title: string;
  };
}

export default function MapPage() {
  const { data: session } = useSession();
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [cart, setCart] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const url = searchQuery
          ? `/api/location?search=${encodeURIComponent(searchQuery)}`
          : '/api/location';
        const res = await fetch(url);
        const data = await res.json();
        setLocations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setLocations([]);
      }
    }
    
    // 防抖處理
    const timeoutId = setTimeout(() => {
      fetchLocations();
    }, searchQuery ? 300 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 初始化地圖
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not set');
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 35.6762, lng: 139.6503 }, // Tokyo
        zoom: 10,
      });

      mapInstanceRef.current = map;
      setMapLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, [mapLoaded]);

  // 更新標記（當 locations 或 searchQuery 變化時）
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 如果有搜索查詢，只顯示搜索到的地點
    const locationsToShow = searchQuery ? locations : locations;

    if (locationsToShow.length > 0) {
      // Add markers for each location
      locationsToShow.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map: mapInstanceRef.current!,
          title: location.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#ec4899',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });

        marker.addListener('click', () => {
          setSelectedLocation(location);
        });

        markersRef.current.push(marker);
      });

      // 調整地圖視圖以包含所有標記
      const bounds = new google.maps.LatLngBounds();
      locationsToShow.forEach((location) => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [locations, mapLoaded, searchQuery]);

  const addToCart = (locationId: string) => {
    if (!cart.includes(locationId)) {
      setCart([...cart, locationId]);
      // 不自动显示购物车，只显示右下角按钮
    }
  };

  const removeFromCart = (locationId: string) => {
    const newCart = cart.filter((id) => id !== locationId);
    setCart(newCart);
    if (newCart.length === 0) {
      setShowCart(false);
    }
  };

  const handleConfirmCart = () => {
    if (cart.length === 0 || !session) return;
    // Redirect to itinerary page with cart items
    window.location.href = `/itinerary?locations=${cart.join(',')}`;
  };

  return (
    <div className="flex h-screen bg-black relative">
      {/* 搜索框 - 固定在顶部 */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋動漫名字或聖地名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 bg-dark-surface border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 shadow-lg"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-300 bg-black/50 px-3 py-1 rounded">
            找到 {locations.length} 個聖地
          </p>
        )}
      </div>

      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-pink-400">
            <div>載入地圖中...</div>
          </div>
        )}
      </div>
      
      {/* Cart Sidebar - Only show when showCart is true */}
      {showCart && (
        <div className="w-96 bg-dark-card shadow-lg overflow-y-auto border-l border-pink-500/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-pink-400">行程購物車</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-400">購物車是空的</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {cart.map((locationId) => {
                    const location = locations.find((loc) => loc._id === locationId);
                    if (!location) return null;
                    return (
                      <div
                        key={locationId}
                        className="flex items-center justify-between p-2 bg-dark-surface rounded border border-pink-500/20"
                      >
                        <span className="text-sm text-white">{location.name}</span>
                        <button
                          onClick={() => removeFromCart(locationId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={handleConfirmCart}
                  className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
                >
                  確認行程 ({cart.length})
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLocation && !showCart && (
        <div className="absolute top-4 right-4 w-96 bg-dark-card shadow-lg rounded-lg border border-pink-500/20 p-4 z-10">
          <button
            onClick={() => setSelectedLocation(null)}
            className="mb-4 text-pink-400 hover:text-pink-300"
          >
            ← 返回地圖
          </button>
          <h2 className="text-2xl font-bold mb-2 text-white">{selectedLocation.name}</h2>
          <p className="text-gray-400 mb-4">{selectedLocation.address}</p>
          <p className="text-sm text-gray-500 mb-4">
            來自: {selectedLocation.anime.title}
          </p>
          {selectedLocation.images.length > 0 && (
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
              <Image
                src={selectedLocation.images[0]}
                alt={selectedLocation.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex space-x-2">
            <a
              href={`/location/${selectedLocation._id}`}
              className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 text-center"
            >
              查看詳情
            </a>
              {session ? (
                cart.includes(selectedLocation._id) ? (
                  <button
                    onClick={() => removeFromCart(selectedLocation._id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    移除
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(selectedLocation._id)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    加入行程
                  </button>
                )
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-center"
                >
                  登入後加入行程
                </Link>
              )}
          </div>
        </div>
      )}

      {/* Shopping Cart Icon - Bottom Right */}
      {cart.length >= 1 && !showCart && (
        <button
          onClick={() => {
            setShowCart(true);
            setSelectedLocation(null); // 关闭景点详情避免重叠
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-pink-500 rounded-full shadow-lg hover:bg-pink-600 transition-all flex items-center justify-center z-20 group"
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
