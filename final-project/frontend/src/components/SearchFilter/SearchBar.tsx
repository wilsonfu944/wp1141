import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import type { Anime } from '../../types';

interface SearchBarProps {
  animes: Anime[];
  onSelectAnime: (animeId: string | null) => void;
  selectedAnimeId?: string;
}

export default function SearchBar({ animes, onSelectAnime, selectedAnimeId }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredAnimes = animes.filter(
    (anime) =>
      anime.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (anime: Anime) => {
    setSearchTerm(anime.name);
    setShowResults(false);
    onSelectAnime(anime.id);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelectAnime(null);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="搜尋動畫名稱..."
          className="w-full pl-10 pr-10 py-3 bg-slate-800/90 backdrop-blur-lg text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
          >
            ×
          </button>
        )}
      </div>

      {showResults && searchTerm && filteredAnimes.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-lg rounded-lg shadow-xl border border-slate-700 max-h-60 overflow-y-auto">
          {filteredAnimes.map((anime) => (
            <button
              key={anime.id}
              onClick={() => handleSelect(anime)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium text-white">{anime.name}</div>
              {anime.nameEn && (
                <div className="text-sm text-slate-400">{anime.nameEn}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

