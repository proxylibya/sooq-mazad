import { useState, useEffect } from 'react';
import {
  RectangleStackIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function AdTemplateSelector({ value, onChange }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(value || null);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [category]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/banner-templates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    onChange(template);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTemplates();
  };

  if (selectedTemplate) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">
          القالب المحدد
        </label>
        <div className="relative overflow-hidden rounded-lg border-2 border-amber-500 bg-slate-700/50 p-4">
          <button
            type="button"
            onClick={() => {
              setSelectedTemplate(null);
              onChange(null);
            }}
            className="absolute left-2 top-2 rounded-full bg-slate-800 p-1 text-slate-400 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <div className="flex gap-4">
            <img
              src={selectedTemplate.thumbnailUrl || selectedTemplate.previewUrl}
              alt={selectedTemplate.name}
              className="h-24 w-32 rounded-lg object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-500">
                  {selectedTemplate.category}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-white">{selectedTemplate.name}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {selectedTemplate.width} × {selectedTemplate.height} • {selectedTemplate.aspectRatio}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        اختر قالب بنر
      </label>

      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-40 rounded-lg border border-slate-600 bg-slate-700 p-3 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="all">جميع الفئات</option>
          <option value="automotive">سيارات</option>
          <option value="promotional">ترويجي</option>
          <option value="seasonal">موسمي</option>
          <option value="general">عام</option>
        </select>

        <form onSubmit={handleSearch} className="relative flex-1">
          <MagnifyingGlassIcon className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 pr-10 text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </form>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
          <RectangleStackIcon className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-2 text-slate-400">لا توجد قوالب</p>
        </div>
      ) : (
        <div className="grid max-h-96 gap-3 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/50 p-3 sm:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-700/50 transition-all hover:border-amber-500 hover:bg-slate-700"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={template.thumbnailUrl || template.previewUrl}
                  alt={template.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-slate-600 px-2 py-0.5 text-xs font-bold text-white">
                    {template.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    مستخدم {template.usageCount} مرة
                  </span>
                </div>
                <h4 className="font-bold text-white">{template.name}</h4>
                <p className="mt-1 text-xs text-slate-400">
                  {template.width} × {template.height}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
