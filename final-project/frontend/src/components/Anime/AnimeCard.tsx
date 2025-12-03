import { Link } from 'react-router-dom';
import type { Anime } from '../../types';
import { MapPin } from 'lucide-react';

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link
      to={`/animes/${anime.id}`}
      className="group bg-slate-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
    >
      <div className="aspect-[2/3] bg-slate-700 relative overflow-hidden">
        {anime.coverImage ? (
          <img
            src={anime.coverImage}
            alt={anime.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <span className="text-6xl">🎬</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-1 group-hover:text-pink-500 transition-colors line-clamp-2">
          {anime.name}
        </h3>
        {anime.nameEn && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-1">{anime.nameEn}</p>
        )}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{anime.locations?.length || 0} 個地點</span>
        </div>
        {anime.year && (
          <p className="text-xs text-slate-500 mt-2">{anime.year} 年</p>
        )}
      </div>
    </Link>
  );
}


