'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Heart, MapPin, ExternalLink, ArrowRight, Plus, Check } from 'lucide-react';
import type { Location } from '@/types';
import ImageSlider from '@/components/ImageSlider/ImageSlider';
import { favoritesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useItineraryCart } from '@/context/ItineraryCartContext';

interface LocationDetailPanelProps {
  location: Location | null;
  onClose: () => void;
}

export default function LocationDetailPanel({ location, onClose }: LocationDetailPanelProps) {
  const { isAuthenticated } = useAuth();
  const { addItem, removeItem, hasItem } = useItineraryCart();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const inCart = location ? hasItem(location.id) : false;

  useEffect(() => {
    if (location && isAuthenticated) {
      favoritesAPI
        .check(location.id)
        .then((data) => {
          setIsFavorited(data.isFavorited);
        })
        .catch(() => {
          setIsFavorited(false);
        });
    } else {
      setIsFavorited(false);
    }
  }, [location, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!location || !isAuthenticated) return;

    setLoading(true);
    try {
      if (isFavorited) {
        await favoritesAPI.remove(location.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(location.id);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMaps = () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    window.open(url, '_blank');
  };

  if (!location) return null;

  return (
    <div
      className={`
        fixed inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto
        w-full md:w-96 h-[85vh] md:h-full bg-slate-800/90 backdrop-blur-lg
        shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        overflow-y-auto rounded-t-2xl md:rounded-none
        ${location ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}
      `}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{location.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Anime Info */}
        {location.anime && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium">
              {location.anime.name}
            </span>
            {location.episode && (
              <span className="ml-2 text-slate-400 text-sm">第 {location.episode} 話</span>
            )}
          </div>
        )}

        {/* Image Slider */}
        <div className="mb-6">
          <ImageSlider
            leftImage={location.animeImage}
            rightImage={location.realImage}
            leftImageLabel="動畫截圖"
            rightImageLabel="真實照片"
          />
        </div>

        {/* Description */}
        {location.description && (
          <div className="mb-6">
            <p className="text-slate-300 leading-relaxed">{location.description}</p>
          </div>
        )}

        {/* Address */}
        <div className="mb-6 flex items-start gap-2">
          <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-slate-300 text-sm">{location.address}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to={`/locations/${location.id}`}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            查看完整詳情
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          {/* Add to Cart Button */}
          <button
            onClick={() => {
              if (inCart) {
                removeItem(location.id);
              } else {
                addItem(location);
              }
            }}
            className={`
              w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              font-medium transition-all duration-200
              ${
                inCart
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }
            `}
          >
            {inCart ? (
              <>
                <Check className="w-5 h-5" />
                已加入巡禮清單
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                加入巡禮清單
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleToggleFavorite}
              disabled={!isAuthenticated || loading}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                font-medium transition-all duration-200
                ${
                  isFavorited
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }
                ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Heart
                className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
              />
              {isFavorited ? '已收藏' : '收藏'}
            </button>

            <button
              onClick={handleGoogleMaps}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              導航
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

