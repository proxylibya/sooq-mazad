/**
 * عارض ملفات PDF
 */

import {
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export interface PDFViewerProps {
  src: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  showToolbar?: boolean;
  showDownload?: boolean;
  showPagination?: boolean;
  showZoom?: boolean;
}

export function PDFViewer({
  src,
  title = 'PDF Document',
  width = '100%',
  height = 600,
  className = '',
  showToolbar = true,
  showDownload = true,
  showPagination = true,
  showZoom = true,
}: PDFViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // سيتم تحديثها عند تحميل PDF

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className={`flex flex-col overflow-hidden rounded-lg bg-gray-100 ${className}`}>
      {/* شريط الأدوات */}
      {showToolbar && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 text-white">
          <div className="flex items-center gap-4">
            {/* التكبير/التصغير */}
            {showZoom && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="rounded p-1 hover:bg-gray-700 disabled:opacity-50"
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5" />
                </button>
                <span className="min-w-[50px] text-center text-sm">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="rounded p-1 hover:bg-gray-700 disabled:opacity-50"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* التنقل بين الصفحات */}
            {showPagination && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="rounded p-1 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="rounded p-1 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="max-w-[200px] truncate text-sm">{title}</span>

            {/* زر التحميل */}
            {showDownload && (
              <button
                onClick={handleDownload}
                className="rounded p-1 hover:bg-gray-700"
                title="تحميل"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* محتوى PDF */}
      <div
        className="flex-1 overflow-auto"
        style={{ height: typeof height === 'number' ? height : undefined }}
      >
        <iframe
          src={`${src}#page=${currentPage}&zoom=${zoom}`}
          title={title}
          width={width}
          height="100%"
          className="border-0"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        />
      </div>
    </div>
  );
}

export default PDFViewer;
