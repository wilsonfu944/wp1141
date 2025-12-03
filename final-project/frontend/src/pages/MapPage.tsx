import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MapContainer from '../components/Map/MapContainer';
import LocationDetailPanel from '../components/LocationDetail/LocationDetailPanel';
import AnimeFilter from '../components/SearchFilter/AnimeFilter';
import CartButton from '../components/Itinerary/CartButton';
import { locationsAPI, animesAPI } from '../services/api';
import type { Location, Anime } from '../types';
import Navbar from '../components/Layout/Navbar';

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Fetch animes
  const { data: animes = [] } = useQuery<Anime[]>({
    queryKey: ['animes'],
    queryFn: () => animesAPI.getAll(),
  });

  // Fetch locations with filters
  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['locations', selectedAnimeId, selectedRegion],
    queryFn: () => locationsAPI.getAll(selectedAnimeId || undefined, selectedRegion || undefined),
  });

  // Fetch location details when selected
  const { data: locationDetails } = useQuery<Location>({
    queryKey: ['location', selectedLocation?.id],
    queryFn: () => locationsAPI.getById(selectedLocation!.id),
    enabled: !!selectedLocation,
  });

  const handleLocationClick = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };

  const handleClosePanel = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      <Navbar />
      
      {/* Header */}
      <div className="absolute top-16 left-0 right-0 z-40 p-4 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="container mx-auto">
          {/* Search and Filter */}
          <div className="bg-slate-800/90 backdrop-blur-lg rounded-lg p-4 border border-slate-700">
            <AnimeFilter
              animes={animes}
              selectedAnimeId={selectedAnimeId}
              selectedRegion={selectedRegion}
              onSelectAnime={setSelectedAnimeId}
              onSelectRegion={setSelectedRegion}
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full h-full pt-24">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-slate-900">
            <p className="text-slate-400">載入地圖中...</p>
          </div>
        ) : (
          <MapContainer
            locations={locations}
            onLocationClick={handleLocationClick}
            selectedAnimeId={selectedAnimeId || undefined}
          />
        )}
      </div>

      {/* Location Detail Panel */}
      <LocationDetailPanel
        location={locationDetails || selectedLocation}
        onClose={handleClosePanel}
      />

      {/* Cart Button */}
      <CartButton />
    </div>
  );
}

