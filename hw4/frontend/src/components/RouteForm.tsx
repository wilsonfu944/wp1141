// 路線表單組件
import { useState, useEffect } from 'react';
import { MapLocation, RouteFormData } from '../types';
import { Map } from './Map';

interface RouteFormProps {
  initialData?: RouteFormData;
  onSubmit: (data: RouteFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const RouteForm = ({ initialData, onSubmit, onCancel, loading = false }: RouteFormProps) => {
  const [formData, setFormData] = useState<RouteFormData>({
    title: '',
    description: '',
    startLocation: null,
    endLocation: null,
    date: new Date().toISOString().split('T')[0],
  });

  const [selectedLocationType, setSelectedLocationType] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof RouteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location: MapLocation, type: 'start' | 'end') => {
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'startLocation' : 'endLocation']: location
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('請輸入路線標題');
      return;
    }

    if (!formData.startLocation) {
      alert('請選擇起點');
      return;
    }

    if (!formData.endLocation) {
      alert('請選擇終點');
      return;
    }

    if (!formData.date) {
      alert('請選擇日期');
      return;
    }

    onSubmit(formData);
  };

  const clearLocation = (type: 'start' | 'end') => {
    setFormData(prev => ({
      ...prev,
      [type === 'start' ? 'startLocation' : 'endLocation']: null
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 路線標題 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            路線標題 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="input-field"
            placeholder="輸入路線標題"
            required
          />
        </div>

        {/* 路線描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            路線描述
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="input-field"
            rows={3}
            placeholder="輸入路線描述（選填）"
          />
        </div>

        {/* 日期 */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            跑步日期 *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* 位置選擇器 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            選擇位置
          </label>
          <div className="flex space-x-2 mb-2">
            <button
              type="button"
              onClick={() => setSelectedLocationType('start')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedLocationType === 'start'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              起點
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocationType('end')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                selectedLocationType === 'end'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              終點
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            點擊地圖選擇{selectedLocationType === 'start' ? '起點' : '終點'}位置
          </p>
        </div>

        {/* 地圖 */}
        <div>
          <Map
            startLocation={formData.startLocation}
            endLocation={formData.endLocation}
            onLocationSelect={(location) => handleLocationSelect(location, selectedLocationType)}
            height="300px"
          />
        </div>

        {/* 位置資訊顯示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 起點資訊 */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">起點</h3>
            {formData.startLocation ? (
              <div>
                <p className="text-sm text-gray-600">
                  座標: {formData.startLocation.lat.toFixed(6)}, {formData.startLocation.lng.toFixed(6)}
                </p>
                {formData.startLocation.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    地址: {formData.startLocation.address}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => clearLocation('start')}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  清除起點
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">尚未選擇起點</p>
            )}
          </div>

          {/* 終點資訊 */}
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-2">終點</h3>
            {formData.endLocation ? (
              <div>
                <p className="text-sm text-gray-600">
                  座標: {formData.endLocation.lat.toFixed(6)}, {formData.endLocation.lng.toFixed(6)}
                </p>
                {formData.endLocation.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    地址: {formData.endLocation.address}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => clearLocation('end')}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  清除終點
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">尚未選擇終點</p>
            )}
          </div>
        </div>

        {/* 按鈕 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '處理中...' : '儲存路線'}
          </button>
        </div>
      </form>
    </div>
  );
};





