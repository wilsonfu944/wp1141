'use client';
import { useState } from 'react';
import { Calendar, Car, Train, Footprints, Lock, Globe } from 'lucide-react';

interface PlanSettingsProps {
  name: string;
  description: string;
  startDate: string;
  transport: string;
  isPublic: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onStartDateChange: (date: string) => void;
  onTransportChange: (transport: string) => void;
  onIsPublicChange: (isPublic: boolean) => void;
}

export default function PlanSettings({
  name,
  description,
  startDate,
  transport,
  isPublic,
  onNameChange,
  onDescriptionChange,
  onStartDateChange,
  onTransportChange,
  onIsPublicChange,
}: PlanSettingsProps) {
  const transportOptions = [
    { value: 'walking', label: '步行', icon: Footprints, speed: 5 },
    { value: 'public', label: '大眾運輸', icon: Train, speed: 30 },
    { value: 'driving', label: '自駕', icon: Car, speed: 40 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
          行程名稱 *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="例如：東京動漫聖地一日遊"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
          行程描述（選填）
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="描述這次巡禮的特色..."
          rows={3}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
        />
      </div>

      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-slate-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          開始日期時間 *
        </label>
        <input
          id="startDate"
          type="datetime-local"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          交通方式 *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {transportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onTransportChange(option.value)}
                className={`
                  flex flex-col items-center gap-2 px-3 py-3 rounded-lg font-medium transition-colors
                  ${
                    transport === option.value
                      ? 'bg-pink-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{option.label}</span>
                <span className="text-xs opacity-75">{option.speed} km/h</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          公開設定
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onIsPublicChange(false)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                !isPublic
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
          >
            <Lock className="w-4 h-4" />
            僅自己
          </button>
          <button
            type="button"
            onClick={() => onIsPublicChange(true)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${
                isPublic
                  ? 'bg-pink-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
          >
            <Globe className="w-4 h-4" />
            公開分享
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {isPublic
            ? '其他使用者可以查看、點讚和評論您的行程'
            : '只有您自己可以查看此行程'}
        </p>
      </div>
    </div>
  );
}


