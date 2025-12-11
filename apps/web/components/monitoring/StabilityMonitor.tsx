import React, { useState, useEffect } from 'react';
import { useStabilityEnhancer } from '@/hooks/useStabilityEnhancer';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  BoltIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface StabilityMonitorProps {
  showDetails?: boolean;
  autoHide?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
}

const StabilityMonitor: React.FC<StabilityMonitorProps> = ({
  showDetails = false,
  autoHide = true,
  position = 'bottom-right'
}) => {
  const {
    metrics,
    isStable,
    isOnline,
    performAutoOptimization,
    getDetailedReport
  } = useStabilityEnhancer();

  const [isExpanded, setIsExpanded] = useState(!autoHide || !isStable);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [detailedReport, setDetailedReport] = useState<any>(null);

  // إظهار المراقب عند عدم الاستقرار
  useEffect(() => {
    if (!isStable && autoHide) {
      setIsExpanded(true);
    }
  }, [isStable, autoHide]);

  // إخفاء تلقائي بعد استقرار النظام
  useEffect(() => {
    if (isStable && autoHide && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isStable, autoHide, isExpanded]);

  const getStatusColor = () => {
    if (!isStable) return 'bg-red-500';
    if (metrics.memoryUsage > 70 || metrics.performanceScore < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isStable) return 'غير مستقر';
    if (metrics.memoryUsage > 70 || metrics.performanceScore < 80) return 'تحذير';
    return 'مستقر';
  };

  const getPositionClasses = () => {
    const positions = {
      'top-right': 'top-4 right-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-left': 'top-4 left-4'
    };
    return positions[position];
  };

  const handleShowDetails = async () => {
    const report = getDetailedReport();
    setDetailedReport(report);
    setShowDetailedReport(true);
  };

  // في بيئة الإنتاج، إخفاء المراقب إذا كان النظام مستقر
  if (process.env.NODE_ENV === 'production' && isStable && autoHide && !isExpanded) {
    return null;
  }

  return (
    <>
      {/* المراقب الأساسي */}
      <div className={`fixed ${getPositionClasses()} z-50 transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-12 h-12'
      }`}>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          
          {/* Header دائماً مرئي */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
              {isExpanded && (
                <span className="text-sm font-medium text-gray-700">
                  {getStatusText()}
                </span>
              )}
            </div>
            
            {isExpanded && (
              <div className="flex items-center gap-1">
                {!isOnline && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" title="غير متصل" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    performAutoOptimization();
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="تحسين تلقائي"
                >
                  <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>

          {/* التفاصيل */}
          {isExpanded && (
            <div className="px-3 pb-3 space-y-3">
              
              {/* مقاييس سريعة */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <CpuChipIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">ذاكرة:</span>
                  <span className={`font-medium ${
                    metrics.memoryUsage > 80 ? 'text-red-600' : 
                    metrics.memoryUsage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.memoryUsage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <BoltIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">أداء:</span>
                  <span className={`font-medium ${
                    metrics.performanceScore < 70 ? 'text-red-600' : 
                    metrics.performanceScore < 85 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {metrics.performanceScore.toFixed(0)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <CircleStackIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">تخزين:</span>
                  <span className="font-medium text-green-600">
                    {metrics.cacheHitRate.toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <SignalIcon className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">اتصال:</span>
                  <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline ? 'متصل' : 'منقطع'}
                  </span>
                </div>
              </div>

              {/* أخطاء */}
              {metrics.errorCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <span>{metrics.errorCount} خطأ</span>
                </div>
              )}

              {/* أزرار إضافية */}
              {showDetails && (
                <div className="flex gap-1">
                  <button
                    onClick={handleShowDetails}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                  >
                    <EyeIcon className="w-3 h-3" />
                    <span>تفاصيل</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* نافذة التفاصيل */}
      {showDetailedReport && detailedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                تقرير الاستقرار المفصل
              </h3>
              <button
                onClick={() => setShowDetailedReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* معلومات الذاكرة */}
              {detailedReport.memory && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">استخدام الذاكرة</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                    <div>المستخدم: {(detailedReport.memory.current.used / (1024 * 1024)).toFixed(1)} MB</div>
                    <div>الإجمالي: {(detailedReport.memory.current.total / (1024 * 1024)).toFixed(1)} MB</div>
                    <div>النسبة: {detailedReport.memory.current.percentage.toFixed(1)}%</div>
                    <div>الاتجاه: {detailedReport.memory.trend}</div>
                  </div>
                </div>
              )}

              {/* معلومات الأداء */}
              {detailedReport.performance && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">الأداء</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                    <div>متوسط زمن API: {detailedReport.performance.averageApiTime?.toFixed(0) || 0} ms</div>
                    <div>إجمالي المقاييس: {detailedReport.performance.totalMetrics || 0}</div>
                  </div>
                </div>
              )}

              {/* معلومات التخزين المؤقت */}
              {detailedReport.cache && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">التخزين المؤقت</h4>
                  <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                    <div>العناصر الصحيحة: {detailedReport.cache.validItems}</div>
                    <div>معدل النجاح: {detailedReport.cache.hitRate}</div>
                    <div>الحجم: {detailedReport.cache.currentSizeMB} MB</div>
                  </div>
                </div>
              )}

              {/* التنبيهات الأخيرة */}
              {detailedReport.alerts && detailedReport.alerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">التنبيهات الأخيرة</h4>
                  <div className="space-y-2">
                    {detailedReport.alerts.slice(-5).map((alert: any, index: number) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm ${
                          alert.level === 'critical' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                        }`}
                      >
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-xs opacity-75">
                          {new Date(alert.timestamp).toLocaleString('ar-LY')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(StabilityMonitor);
