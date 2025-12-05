'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationsAPI, animesAPI } from '@/lib/api';
import MapContainer from '@/components/Map/MapContainer';
import { useRouter } from 'next/navigation';
import AnimeFilter from '@/components/SearchFilter/AnimeFilter';
import RegionFilter from '@/components/SearchFilter/RegionFilter';

export default function MapPage() {
  const router = useRouter();
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: locations = [], isLoading: locationsLoading, error: locationsError } = useQuery({
    queryKey: ['locations', selectedAnimeId, selectedRegion],
    queryFn: () => locationsAPI.getAll(selectedAnimeId || undefined, selectedRegion || undefined),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: animes = [], isLoading: animesLoading } = useQuery({
    queryKey: ['animes'],
    queryFn: () => animesAPI.getAll(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleLocationClick = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };

  const mapLocations = locations.map((loc) => ({
    id: loc.id,
    latitude: loc.latitude,
    longitude: loc.longitude,
    name: loc.name,
    animeId: loc.animeId,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">地圖探索</h1>
          <p className="text-slate-300">在地圖上探索動漫聖地</p>
        </div>
        <div className="mb-4">
          <AnimeFilter
            animes={animes}
            selectedAnimeId={selectedAnimeId}
            selectedRegion={selectedRegion}
            onSelectAnime={setSelectedAnimeId}
            onSelectRegion={setSelectedRegion}
          />
        </div>
      </div>
      <div className="flex-1 relative min-h-[600px]">
        {locationsLoading || animesLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <div className="text-white text-xl">載入地圖中...</div>
            </div>
          </div>
        ) : locationsError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <p className="text-red-400 text-xl mb-2">載入失敗</p>
              <p className="text-slate-400 text-sm">無法載入地點資料</p>
            </div>
          </div>
        ) : (
          <MapContainer
            locations={mapLocations}
            onLocationClick={handleLocationClick}
            selectedAnimeId={selectedAnimeId || undefined}
          />
        )}
      </div>
    </div>
  );
}

