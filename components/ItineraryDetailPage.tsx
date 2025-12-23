'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Location {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
}

interface ItineraryItem {
  location: Location;
  stayDuration: number;
  order: number;
}

interface Itinerary {
  _id: string;
  title: string;
  description?: string;
  items: ItineraryItem[];
  startDate: string;
  isPublic: boolean;
  author: {
    _id: string;
    name: string;
    image?: string;
  };
  likes: string[];
}

function SortableItem({
  item,
  index,
  updateStayDuration,
  isAuthor,
}: {
  item: ItineraryItem;
  index: number;
  updateStayDuration: (index: number, duration: number) => void;
  isAuthor: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.location?._id || `item-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!item.location) {
    return (
      <div className="bg-dark-card rounded-lg shadow-md p-4 border border-pink-500/20">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
              {item.order}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-400">地點資料已遺失</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-dark-card rounded-lg shadow-md p-4 border border-pink-500/20"
    >
      <div className="flex items-start space-x-4">
        {isAuthor ? (
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          >
            <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
              {item.order}
            </div>
            <div className="text-xs text-gray-400 mt-1 text-center">拖曳</div>
          </div>
        ) : (
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">
              {item.order}
            </div>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 text-white">{item.location.name || '未知地點'}</h3>
          <p className="text-sm text-gray-400 mb-2">{item.location.address || '地址未知'}</p>
          {item.location.images && item.location.images.length > 0 && (
            <div className="relative h-32 w-48 rounded-lg overflow-hidden mb-2">
              <Image
                src={item.location.images[0]}
                alt={item.location.name || '地點圖片'}
                fill
                className="object-cover"
              />
            </div>
          )}
          {isAuthor && (
            <div className="flex items-center space-x-4 mt-2">
              <div>
                <label className="text-sm text-gray-400">停留時間 (分鐘)</label>
                <input
                  type="number"
                  value={item.stayDuration}
                  onChange={(e) => updateStayDuration(index, parseInt(e.target.value))}
                  className="w-20 p-1 border border-pink-500/30 rounded ml-2 bg-dark-surface text-white"
                  min="15"
                  step="15"
                />
              </div>
              {item.location._id && (
                <Link
                  href={`/location/${item.location._id}`}
                  className="text-pink-400 hover:text-pink-300 text-sm"
                >
                  查看詳情 →
                </Link>
              )}
            </div>
          )}
          {!isAuthor && item.location._id && (
            <Link
              href={`/location/${item.location._id}`}
              className="text-pink-400 hover:text-pink-300 text-sm mt-2 inline-block"
            >
              查看詳情 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryDetailPage({ itineraryId }: { itineraryId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const res = await fetch(`/api/itinerary/${itineraryId}`);
        if (res.ok) {
          const data = await res.json();
          setItinerary(data);
          setTitle(data.title);
          setDescription(data.description || '');
          setStartDate(data.startDate ? data.startDate.split('T')[0] : '');
          setIsPublic(data.isPublic);
          const userId = session?.user?.id;
          setIsLiked(userId ? data.likes?.some((id: any) => id.toString() === userId) || false : false);
          setLikesCount(data.likes?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch itinerary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchItinerary();
  }, [itineraryId, session]);

  const handleLike = async () => {
    if (!session) return;

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };


  const handleDelete = async () => {
    if (!confirm('確定要刪除此行程嗎？')) return;

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/itinerary');
      }
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
    }
  };

  const handleSave = async () => {
    if (!session || !title || !startDate || !itinerary) return;

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          startDate,
          isPublic,
          items: itinerary.items
            .filter((item) => item.location && item.location._id)
            .map((item) => ({
              location: item.location!._id,
              stayDuration: item.stayDuration,
              order: item.order,
            })),
        }),
      });

      if (res.ok) {
        alert('已保存');
        setTimeout(() => {
          router.push('/itinerary');
        }, 500);
      }
    } catch (error) {
      console.error('Failed to update itinerary:', error);
    }
  };

  const updateStayDuration = (index: number, duration: number) => {
    if (!itinerary) return;
    const newItems = [...itinerary.items];
    newItems[index].stayDuration = duration;
    setItinerary({ ...itinerary, items: newItems });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!itinerary || !over || active.id === over.id) return;

    const oldIndex = itinerary.items.findIndex((item) => item.location?._id === active.id);
    const newIndex = itinerary.items.findIndex((item) => item.location?._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(itinerary.items, oldIndex, newIndex);
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });

    setItinerary({ ...itinerary, items: newItems });
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">載入中...</div>;
  }

  if (!itinerary) {
    return <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">行程不存在</div>;
  }

  const isAuthor = session?.user?.id && itinerary.author?._id 
    ? session.user.id === itinerary.author._id.toString() 
    : false;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="mb-6">
        <Link href="/itinerary" className="text-pink-400 hover:underline mb-4 inline-block">
          ← 返回行程列表
        </Link>
      </div>

      <div className="bg-dark-card rounded-lg shadow-md p-6 mb-6 border border-pink-500/20">
        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-white">行程標題</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-white">描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-white">出發日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="mr-2"
                />
                <span>公開此行程</span>
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-dark-surface text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 text-pink-400">{itinerary.title}</h1>
                {itinerary.description && (
                  <p className="text-gray-300 mb-2">{itinerary.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>作者: {itinerary.author.name}</span>
                  <span>出發日期: {new Date(itinerary.startDate).toLocaleDateString()}</span>
                  <span>{itinerary.items.length} 個地點</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-pink-500 text-white'
                      : 'bg-dark-surface text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  👍 {likesCount}
                </button>
                {isAuthor && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      編輯
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {isAuthor ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={itinerary.items.map((item, index) => item.location?._id || `item-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {itinerary.items.map((item, index) => (
                <SortableItem
                  key={item.location?._id || `item-${index}`}
                  item={item}
                  index={index}
                  updateStayDuration={updateStayDuration}
                  isAuthor={isAuthor}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-4">
          {itinerary.items.map((item, index) => (
            <SortableItem
              key={item.location?._id || `item-${index}`}
              item={item}
              index={index}
              updateStayDuration={updateStayDuration}
              isAuthor={false}
            />
          ))}
        </div>
      )}

      {isAuthor && !isEditing && (
        <div className="mt-6">
          <button
            onClick={async () => {
              if (!session || !itinerary) return;
              try {
                const res = await fetch(`/api/itinerary/${itineraryId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: itinerary.title,
                    description: itinerary.description,
                    startDate: itinerary.startDate,
                    isPublic: itinerary.isPublic,
                    items: itinerary.items
                      .filter((item) => item.location && item.location._id)
                      .map((item) => ({
                        location: item.location!._id,
                        stayDuration: item.stayDuration,
                        order: item.order,
                      })),
                  }),
                });
                if (res.ok) {
                  alert('已保存');
                  setTimeout(() => {
                    router.push('/itinerary');
                  }, 500);
                }
              } catch (error) {
                console.error('Failed to save itinerary:', error);
              }
            }}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            保存行程變更
          </button>
        </div>
      )}
    </div>
  );
}

