import { Filter } from 'lucide-react';

interface RegionFilterProps {
  selectedRegion: string | null;
  onSelectRegion: (region: string | null) => void;
}

const REGIONS = [
  { id: 'tokyo', name: '東京' },
  { id: 'kyoto', name: '京都' },
  { id: 'osaka', name: '大阪' },
];

export default function RegionFilter({ selectedRegion, onSelectRegion }: RegionFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="w-5 h-5 text-slate-400" />
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onSelectRegion(null)}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${
              !selectedRegion
                ? 'bg-pink-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }
          `}
        >
          全部
        </button>
        {REGIONS.map((region) => (
          <button
            key={region.id}
            onClick={() => onSelectRegion(region.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                selectedRegion === region.id
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
          >
            {region.name}
          </button>
        ))}
      </div>
    </div>
  );
}


