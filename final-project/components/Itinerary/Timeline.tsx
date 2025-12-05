'use client';
import { MapPin, Clock, Car, Train, Footprints, ArrowDown } from 'lucide-react';
import type { ItineraryItem } from '@/types';
import Link from 'next/link';

interface TimelineProps {
  items: ItineraryItem[];
  transport: string;
  startDate?: string;
  segments?: {
    from: string;
    to: string;
    distance: number;
    travelTime: number;
  }[];
}

export default function Timeline({ items, transport, startDate, segments }: TimelineProps) {
  const TransportIcon = transport === 'walking' ? Footprints : transport === 'driving' ? Car : Train;

  // 計算每個地點的預計到達時間
  const calculateArrivalTimes = () => {
    const times: Date[] = [];
    const start = startDate ? new Date(startDate) : new Date();
    let currentTime = new Date(start);

    items.forEach((item, index) => {
      if (index > 0 && segments && segments[index - 1]) {
        // 加上移動時間
        currentTime = new Date(currentTime.getTime() + segments[index - 1].travelTime * 60000);
      }
      times.push(new Date(currentTime));
      // 加上停留時間
      currentTime = new Date(currentTime.getTime() + (item.duration || 30) * 60000);
    });

    return times;
  };

  const arrivalTimes = calculateArrivalTimes();

  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const segment = segments && segments[index];
        const arrivalTime = arrivalTimes[index];

        return (
          <div key={item.id}>
            {/* Location Item */}
            <div className="flex gap-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {index + 1}
                </div>
                {index < items.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-700 my-2 flex-1 min-h-[100px]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-pink-500 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                          {arrivalTime.toLocaleTimeString('zh-TW', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {item.duration && (
                          <span className="text-slate-500 text-sm">
                            （停留 {item.duration} 分鐘）
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/locations/${item.location.id}`}
                        className="text-xl font-bold text-white hover:text-pink-500 transition-colors block mb-2"
                      >
                        {item.location.name}
                      </Link>
                      {item.location.anime && (
                        <Link
                          href={`/animes/${item.location.anime.id}`}
                          className="inline-block px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-sm mb-2 hover:bg-pink-500/30 transition-colors"
                        >
                          {item.location.anime.name}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-400 text-sm mb-3">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{item.location.address}</p>
                  </div>

                  {item.notes && (
                    <div className="bg-slate-700/50 rounded p-3 text-slate-300 text-sm">
                      💡 {item.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Segment */}
            {index < items.length - 1 && segment && (
              <div className="flex gap-4 -mt-6 mb-2">
                <div className="w-10" />
                <div className="flex-1 pl-4">
                  <div className="flex items-center gap-3 text-slate-400 text-sm bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
                    <TransportIcon className="w-4 h-4" />
                    <span>{segment.distance.toFixed(1)} km</span>
                    <span>·</span>
                    <span>{Math.round(segment.travelTime)} 分鐘</span>
                    <ArrowDown className="w-4 h-4 ml-auto" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


