import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, MapPin } from 'lucide-react';
import type { CartItem } from '../../context/ItineraryCartContext';

interface SortableItemProps {
  item: CartItem;
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<Omit<CartItem, 'location'>>) => void;
}

function SortableItem({ item, index, onRemove, onUpdate }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.location.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white mt-1"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-shrink-0 w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
          <span className="text-pink-500 font-bold">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white mb-1">{item.location.name}</h3>
          {item.location.anime && (
            <p className="text-pink-400 text-sm mb-2">{item.location.anime.name}</p>
          )}
          <div className="flex items-start gap-1 text-slate-400 text-xs mb-3">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-1">{item.location.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">停留時間（分鐘）</label>
              <input
                type="number"
                value={item.duration || 30}
                onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 30 })}
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                min="5"
                max="480"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">筆記（選填）</label>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="備註..."
                className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 transition-colors mt-1"
          aria-label="移除"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

interface LocationListEditorProps {
  items: CartItem[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove: (locationId: string) => void;
  onUpdate: (locationId: string, updates: Partial<Omit<CartItem, 'location'>>) => void;
}

export default function LocationListEditor({
  items,
  onReorder,
  onRemove,
  onUpdate,
}: LocationListEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.location.id === active.id);
      const newIndex = items.findIndex((item) => item.location.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>還沒有選擇任何地點</p>
        <p className="text-sm mt-2">前往地圖選擇想要巡禮的地點吧！</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.location.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <SortableItem
              key={item.location.id}
              item={item}
              index={index}
              onRemove={() => onRemove(item.location.id)}
              onUpdate={(updates) => onUpdate(item.location.id, updates)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

