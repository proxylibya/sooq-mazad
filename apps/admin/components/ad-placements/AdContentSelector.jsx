import { useState } from 'react';
import {
  PhotoIcon,
  LinkIcon,
  RectangleGroupIcon,
  VideoCameraIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';

const CONTENT_TYPES = [
  {
    id: 'POST',
    label: 'منشور من الموقع',
    description: 'اختر مزاد أو سيارة من المنشورات الموجودة',
    icon: RectangleGroupIcon,
  },
  {
    id: 'VIDEO',
    label: 'فيديو إعلاني',
    description: 'ارفع فيديو إعلاني مع خيارات التشغيل',
    icon: VideoCameraIcon,
  },
  {
    id: 'BANNER',
    label: 'بنر احترافي',
    description: 'صمم بنر بمقاسات قياسية محترفة',
    icon: RectangleStackIcon,
  },
  {
    id: 'IMAGE',
    label: 'صورة إعلان',
    description: 'ارفع صورة بنر إعلان مع رابط',
    icon: PhotoIcon,
  },
  {
    id: 'EXTERNAL',
    label: 'رابط خارجي',
    description: 'أضف رابط لموقع خارجي مع صورة',
    icon: LinkIcon,
  },
];

export default function AdContentSelector({ value, onChange }) {
  const [selected, setSelected] = useState(value || 'POST');

  const handleSelect = (type) => {
    setSelected(type);
    onChange(type);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        نوع المحتوى
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        {CONTENT_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = selected === type.id;

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => handleSelect(type.id)}
              className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <Icon
                className={`h-8 w-8 ${
                  isSelected ? 'text-amber-500' : 'text-slate-400'
                }`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${
                    isSelected ? 'text-amber-500' : 'text-white'
                  }`}
                >
                  {type.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{type.description}</p>
              </div>
              {isSelected && (
                <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-amber-500"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
