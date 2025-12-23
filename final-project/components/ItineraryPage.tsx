'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  arrivalTime?: string;
  order: number;
}

interface Itinerary {
  _id: string;
  title: string;
  description?: string;
  items: ItineraryItem[];
  startDate: string;
  endDate?: string;
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
  updateArrivalTime,
}: {
  item: ItineraryItem;
  index: number;
  updateStayDuration: (index: number, duration: number) => void;
  updateArrivalTime: (index: number, time: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.location._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-dark-card rounded-lg shadow-md p-4 border border-pink-500/20"
    >
      <div className="flex items-start space-x-4">
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
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 text-white">{item.location.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{item.location.address}</p>
          {item.location.images.length > 0 && (
            <div className="relative h-32 w-48 rounded-lg overflow-hidden mb-2">
              <Image
                src={item.location.images[0]}
                alt={item.location.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex items-center space-x-4 mt-2">
            <div>
              <label className="text-sm text-gray-400">到達時間</label>
              <input
                type="time"
                value={item.arrivalTime || ''}
                onChange={(e) => updateArrivalTime(index, e.target.value)}
                className="w-32 p-1 border border-pink-500/30 rounded ml-2 bg-dark-surface text-white"
              />
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [popularItineraries, setPopularItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'popular'>('my');
  const [showDropdown, setShowDropdown] = useState(false);
  const [likedItineraries, setLikedItineraries] = useState<Set<string>>(new Set());
  const [showMessageDialog, setShowMessageDialog] = useState<{ userId: string; userName: string } | null>(null);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const locationIds = searchParams.get('locations')?.split(',') || [];
    if (locationIds.length > 0 && session) {
      fetchLocations(locationIds);
    }
    if (session) {
      fetchItineraries();
    }
    fetchPopularItineraries();
  }, [searchParams, session]);

  async function fetchLocations(ids: string[]) {
    try {
      const res = await fetch(`/api/location?ids=${ids.join(',')}`);
      const data = await res.json();
      const sortedLocations = optimizeRoute(data);
      setLocations(sortedLocations);
      setCurrentItinerary({
        _id: '',
        title: '',
        items: sortedLocations.map((loc, index) => ({
          location: loc,
          stayDuration: 60,
          arrivalTime: '',
          order: index + 1,
        })),
        startDate: new Date().toISOString(),
        isPublic: false,
        author: { 
          _id: session?.user?.id || '', 
          name: session?.user?.name || '',
          image: session?.user?.image 
        },
        likes: [],
      });
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  }

  async function fetchItineraries() {
    try {
      const res = await fetch('/api/itinerary');
      const data = await res.json();
      setItineraries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch itineraries:', error);
      setItineraries([]);
    }
  }

  async function fetchPopularItineraries(retries = 3) {
    setLoadingPopular(true);
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch('/api/itinerary?popular=true');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const itineraries = Array.isArray(data) ? data : [];
        
        if (itineraries.length > 0 || i === retries - 1) {
          setPopularItineraries(itineraries);
          // Initialize liked state
          if (session?.user?.id) {
            const liked = new Set<string>();
            itineraries.forEach((it: Itinerary) => {
              if (it.likes?.some((id: any) => id.toString() === session.user.id)) {
                liked.add(it._id);
              }
            });
            setLikedItineraries(liked);
          }
          setLoadingPopular(false);
          return;
        }
      } catch (error) {
        console.error(`Failed to fetch popular itineraries (attempt ${i + 1}/${retries}):`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        }
      }
    }
    setPopularItineraries([]);
    setLoadingPopular(false);
  }

  // Simple route optimization using nearest neighbor
  function optimizeRoute(locs: Location[]): Location[] {
    if (locs.length <= 1) return locs;

    const optimized: Location[] = [];
    const remaining = [...locs];
    let current = remaining.shift()!;
    optimized.push(current);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remaining.forEach((loc, index) => {
        const distance = calculateDistance(
          current.latitude,
          current.longitude,
          loc.latitude,
          loc.longitude
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      current = remaining.splice(nearestIndex, 1)[0];
      optimized.push(current);
    }

    return optimized;
  }

  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!currentItinerary || !over || active.id === over.id) return;

    const oldIndex = currentItinerary.items.findIndex((item) => item.location._id === active.id);
    const newIndex = currentItinerary.items.findIndex((item) => item.location._id === over.id);

    const newItems = arrayMove(currentItinerary.items, oldIndex, newIndex);
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });

    setCurrentItinerary({ ...currentItinerary, items: newItems });
  };

  const updateArrivalTime = (index: number, time: string) => {
    if (!currentItinerary) return;
    const newItems = [...currentItinerary.items];
    newItems[index].arrivalTime = time;
    setCurrentItinerary({ ...currentItinerary, items: newItems });
  };

  const handleSaveItinerary = async () => {
    if (!session || !currentItinerary || !title || !startDate) return;

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: currentItinerary.description,
          items: currentItinerary.items.map((item) => ({
            location: item.location._id,
            stayDuration: item.stayDuration,
            arrivalTime: item.arrivalTime,
            order: item.order,
          })),
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : undefined,
          isPublic,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        setCurrentItinerary(null);
        setLocations([]);
        setTitle('');
        setStartDate(new Date());
        setEndDate(null);
        setIsPublic(false);
        fetchItineraries();
        // Refresh popular itineraries if the saved itinerary is public
        if (isPublic) {
          fetchPopularItineraries();
        }
        alert('行程已保存！');
      }
    } catch (error) {
      console.error('Failed to save itinerary:', error);
    }
  };

  const updateStayDuration = (index: number, duration: number) => {
    if (!currentItinerary) return;
    const newItems = [...currentItinerary.items];
    newItems[index].stayDuration = duration;
    setCurrentItinerary({ ...currentItinerary, items: newItems });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!currentItinerary) return;
    const newItems = [...currentItinerary.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => {
      item.order = i + 1;
    });
    setCurrentItinerary({ ...currentItinerary, items: newItems });
  };

  const handleLike = async (itineraryId: string) => {
    if (!session) return;

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        const newLiked = new Set(likedItineraries);
        if (data.liked) {
          newLiked.add(itineraryId);
        } else {
          newLiked.delete(itineraryId);
        }
        setLikedItineraries(newLiked);
        
        // Update the itinerary in the list
        setPopularItineraries((prev) =>
          prev.map((it) => {
            if (it._id === itineraryId) {
              return { ...it, likes: data.liked ? [...it.likes, session.user.id] : it.likes.filter((id: string) => id !== session.user.id) };
            }
            return it;
          })
        );
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };


  const handleDelete = async (itineraryId: string) => {
    if (!confirm('確定要刪除此行程嗎？')) return;

    try {
      const res = await fetch(`/api/itinerary/${itineraryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItineraries((prev) => prev.filter((it) => it._id !== itineraryId));
        alert('行程已刪除！');
      }
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
    }
  };

  if (currentItinerary) {
    if (!session) {
      return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
          <div className="text-center py-16">
            <p className="text-gray-400 text-xl mb-4">請先登入才能創建行程</p>
            <Link href="/auth/signin" className="text-pink-400 hover:text-pink-300">
              立即登入 →
            </Link>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-pink-400">創建行程</h1>
        <div className="bg-dark-card rounded-lg shadow-md p-6 mb-6 border border-pink-500/20">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-white">行程標題</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              placeholder="例如: 東京動漫巡禮之旅"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-white">開始日期</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              wrapperClassName="w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-white">結束日期（選填）</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={startDate || undefined}
              className="w-full p-2 border border-pink-500/30 rounded-lg bg-dark-surface text-white"
              wrapperClassName="w-full"
              isClearable
              placeholderText="選擇結束日期"
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
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentItinerary.items.map((item) => item.location._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {currentItinerary.items.map((item, index) => (
                <SortableItem
                  key={item.location._id}
                  item={item}
                  index={index}
                  updateStayDuration={updateStayDuration}
                  updateArrivalTime={updateArrivalTime}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSaveItinerary}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
          >
            保存行程
          </button>
          <button
            onClick={() => {
              setCurrentItinerary(null);
              setLocations([]);
            }}
            className="bg-dark-surface text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pink-400 mb-6">行程</h1>
        
        {/* Tab Buttons */}
        <div className="flex space-x-4 border-b border-pink-500/20">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'my'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            我的行程
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'popular'
                ? 'border-pink-500 text-pink-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            熱門行程
          </button>
        </div>
      </div>

      {/* My Itineraries */}
      {activeTab === 'my' && (
        <section>
          {!session ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl mb-4">請先登入才能查看你的行程</p>
              <Link href="/auth/signin" className="text-pink-400 hover:text-pink-300">
                立即登入 →
              </Link>
            </div>
          ) : itineraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map((itinerary) => (
                <div key={itinerary._id} className="bg-dark-card rounded-lg shadow-md p-6 border border-pink-500/20 hover:shadow-xl transition-shadow">
                  <h3 className="font-bold text-xl mb-3 text-white">{itinerary.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">
                    出發日期: {new Date(itinerary.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    {itinerary.items.length} 個地點
                  </p>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/itinerary/${itinerary._id}`}
                        className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        查看詳情 →
                      </Link>
                      <button
                        onClick={() => handleDelete(itinerary._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        title="刪除"
                      >
                        刪除
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">暫無行程</p>
              <p className="text-gray-500 text-sm mt-2">從地圖頁面選擇景點來創建你的第一個行程吧！</p>
            </div>
          )}
        </section>
      )}

      {/* Popular Itineraries */}
      {activeTab === 'popular' && (
        <section>
          <div className="mb-4 p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
            <p className="text-sm text-pink-300">
              💡 <strong>提示：</strong>點擊作者頭像可以與行程創建者私訊，了解更多行程細節或尋找旅伴！
            </p>
          </div>
          {loadingPopular ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mb-4"></div>
              <p className="text-gray-400 text-xl">載入中...</p>
              <p className="text-gray-500 text-sm mt-2">正在讀取熱門行程</p>
            </div>
          ) : popularItineraries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularItineraries.map((itinerary) => {
                const isLiked = session && itinerary.likes?.some((id: any) => id.toString() === session.user.id);
                const author = itinerary.author || { _id: '', name: '未知用戶', image: undefined };
                return (
                  <div key={itinerary._id} className="bg-dark-card rounded-lg shadow-md p-6 border border-pink-500/20 hover:shadow-xl transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <button
                        onClick={() => {
                          if (session && author._id !== session.user.id) {
                            setShowMessageDialog({ userId: author._id, userName: author.name });
                          } else if (author._id === session?.user.id) {
                            router.push('/profile');
                          }
                        }}
                        className="flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        {author.image ? (
                          <Image
                            src={author.image}
                            alt={author.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                            {author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-400">作者</p>
                        <p className="font-semibold text-white truncate">{author.name}</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-white">{itinerary.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {itinerary.items.length} 個地點
                    </p>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/itinerary/${itinerary._id}`}
                        className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        查看詳情 →
                      </Link>
                      <button
                        onClick={() => handleLike(itinerary._id)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          isLiked
                            ? 'bg-pink-500 text-white'
                            : 'bg-dark-surface text-gray-300 hover:bg-gray-700'
                        }`}
                        title="點贊"
                      >
                        👍 {itinerary.likes?.length || 0}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-xl">暫無行程</p>
              <p className="text-gray-500 text-sm mt-2">還沒有用戶公開行程</p>
              <button
                onClick={() => fetchPopularItineraries()}
                className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                重新載入
              </button>
            </div>
          )}
        </section>
      )}

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-2xl p-6 max-w-md w-full mx-4 border border-pink-500/20">
            <h3 className="text-xl font-bold text-white mb-4">私訊 {showMessageDialog.userName}</h3>
            <p className="text-gray-400 mb-6">確定要與 {showMessageDialog.userName} 開始對話嗎？</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  router.push(`/messages?userId=${showMessageDialog.userId}`);
                  setShowMessageDialog(null);
                }}
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors font-semibold"
              >
                確定
              </button>
              <button
                onClick={() => setShowMessageDialog(null)}
                className="flex-1 bg-dark-surface text-white px-4 py-2 rounded-full hover:bg-dark-card transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
