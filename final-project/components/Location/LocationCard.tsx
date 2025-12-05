import { Link } from 'react-router-dom';
import type { Location } from '../../types';
import { MapPin, ExternalLink } from 'lucide-react';
import RatingDisplay from '../Rating/RatingDisplay';

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform">
      <Link to={`/locations/${location.id}`}>
        <div className="aspect-video bg-slate-700 relative overflow-hidden">
          <img
            src={location.realImage}
            alt={location.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-white text-lg mb-1">{location.name}</h3>
            {location.anime && (
              <p className="text-pink-400 text-sm">{location.anime.name}</p>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start gap-2 text-slate-400 text-sm mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{location.address}</p>
        </div>
        {location.episode && (
          <p className="text-xs text-slate-500 mb-3">第 {location.episode} 話</p>
        )}
        <div className="mb-3">
          <RatingDisplay type="location" id={location.id} size="sm" showText={false} />
        </div>
        <a
          href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-4 h-4" />
          在 Google Maps 中開啟
        </a>
      </div>
    </div>
  );
}


