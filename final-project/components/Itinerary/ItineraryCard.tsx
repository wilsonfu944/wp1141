'use client';
import Link from 'next/link';
import { MapPin, Clock, Heart, Eye, Calendar, Trash2 } from 'lucide-react';
import type { Itinerary } from '@/types';

interface ItineraryCardProps {
  itinerary: Itinerary;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export default function ItineraryCard({ itinerary, showActions = false, onDelete }: ItineraryCardProps) {
  const totalDuration = itinerary.items
    ? itinerary.items.reduce((sum, item) => sum + (item.duration || 30), 0)
    : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('確定要刪除這個行程嗎？')) {
      onDelete?.(itinerary.id);
    }
  };

  return (
    <Link
      href={`/itineraries/${itinerary.id}`}
      className="group bg-slate-800 rounded-lg overflow-hidden hover:scale-[1.02] transition-transform border border-slate-700 hover:border-pink-500"
    >
      {/* Preview Images */}
      <div className="grid grid-cols-3 gap-1 aspect-video bg-slate-700">
        {itinerary.items && itinerary.items.slice(0, 3).map((item) => (
          <div key={item.id} className="aspect-square relative overflow-hidden">
            <img
              src={item.location.realImage}
              alt={item.location.name}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {(!itinerary.items || itinerary.items.length === 0) && (
          <div className="col-span-3 flex items-center justify-center text-slate-500">
            <MapPin className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-pink-500 transition-colors line-clamp-2">
          {itinerary.name}
        </h3>
        {itinerary.description && (
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{itinerary.description}</p>
        )}

        <div className="flex flex-wrap gap-3 text-slate-400 text-sm mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{itinerary.items?.length || 0} 個地點</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
          </div>
          {itinerary.startDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(itinerary.startDate).toLocaleDateString('zh-TW')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{itinerary.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{itinerary.viewCount || 0}</span>
            </div>
          </div>
          {showActions && onDelete && (
            <button
              onClick={handleDelete}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              aria-label="刪除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}


