'use client';
import type { Anime } from '@/types';
import SearchBar from './SearchBar';
import RegionFilter from './RegionFilter';

interface AnimeFilterProps {
  animes: Anime[];
  selectedAnimeId: string | null;
  selectedRegion: string | null;
  onSelectAnime: (animeId: string | null) => void;
  onSelectRegion: (region: string | null) => void;
}

export default function AnimeFilter({
  animes,
  selectedAnimeId,
  selectedRegion,
  onSelectAnime,
  onSelectRegion,
}: AnimeFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <SearchBar
        animes={animes}
        onSelectAnime={onSelectAnime}
        selectedAnimeId={selectedAnimeId || undefined}
      />
      <RegionFilter selectedRegion={selectedRegion} onSelectRegion={onSelectRegion} />
    </div>
  );
}

