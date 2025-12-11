import React, { useState } from 'react';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import LightBulbIcon from '@heroicons/react/24/outline/LightBulbIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  carData?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, carData }) => {
  const [activeTab, setActiveTab] = useState<'price' | 'tips' | 'analysis'>('price');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePrice = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const priceAnalysis = {
    estimatedPrice: 18500,
    marketRange: { min: 16000, max: 21000 },
    confidence: 85,
    factors: [
      {
        factor: 'سنة الصنع',
        impact: '+15%',
        description: 'سيارة حديثة نسبياً',
      },
      {
        factor: 'المسافة المقطوعة',
        impact: '-5%',
        description: 'مسافة معقولة للعمر',
      },
      { factor: 'حالة السيارة', impact: '+10%', description: 'حالة ممتازة' },
      {
        factor: 'الطلب في السوق',
        impact: '+8%',
        description: 'طلب عالي على هذا الموديل',
      },
    ],
  };

  const negotiationTips = [
    {
      icon: LightBulbIcon,
      title: 'نصائح التفاوض',
      tips: [
        'ابدأ بعرض أقل بـ 10-15% من السعر المطلوب',
        'اذكر أي عيوب أو مشاكل لاحظتها',
        'قارن مع أسعار سيارات مشابهة في السوق',
        'كن مستعداً للمغادرة إذا لم يوافق البائع',
      ],
    },
    {
      icon: CheckCircleIcon,
      title: 'نقاط القوة',
      tips: [
        'السيارة في حالة ممتازة',
        'صيانة منتظمة واضحة',
        'لون مرغوب في السوق',
        'موديل موثوق ومطلوب',
      ],
    },
    {
      icon: ExclamationTriangleIcon,
      title: 'نقاط الضعف',
      tips: [
        'بعض الخدوش الطفيفة على الجانب',
        'الإطارات تحتاج تغيير قريباً',
        'نظام التكييف يحتاج صيانة',
        'لا توجد ضمانة متبقية',
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">المساعد الذكي</h2>
              <p className="text-sm text-gray-600">تحليل ذكي للأسعار والتفاوض</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'price', label: 'تحليل السعر', icon: CurrencyDollarIcon },
            { key: 'analysis', label: 'تحليل السوق', icon: ChartBarIcon },
            { key: 'tips', label: 'نصائح التفاوض', icon: LightBulbIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-6">
          {activeTab === 'price' && (
            <div className="space-y-6">
              {/* Car Info */}
              {carData && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-semibold text-gray-900">معلومات السيارة</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">الماركة:</span>
                      <span className="mr-2 font-medium">{carData.make}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">الموديل:</span>
                      <span className="mr-2 font-medium">{carData.model}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">السنة:</span>
                      <span className="mr-2 font-medium">{carData.year}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">المسافة:</span>
                      <span className="mr-2 font-medium">
                        {carData.mileage.toLocaleString('en-US')} كم
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Analysis */}
              <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6">
                <div className="mb-4 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">السعر المقدر</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {priceAnalysis.estimatedPrice.toLocaleString('en-US')} د.ل
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    نطاق السوق: {priceAnalysis.marketRange.min.toLocaleString('en-US')} -{' '}
                    {priceAnalysis.marketRange.max.toLocaleString('en-US')} د.ل
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-600">دقة التقدير:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${priceAnalysis.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {priceAnalysis.confidence}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={analyzePrice}
                  disabled={isAnalyzing}
                  className="w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isAnalyzing ? 'جاري التحليل...' : 'إعادة تحليل السعر'}
                </button>
              </div>

              {/* Price Factors */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">العوامل المؤثرة على السعر</h3>
                <div className="space-y-3">
                  {priceAnalysis.factors.map((factor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{factor.factor}</div>
                        <div className="text-sm text-gray-600">{factor.description}</div>
                      </div>
                      <div
                        className={`rounded px-2 py-1 text-sm font-medium ${
                          factor.impact.startsWith('+')
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {factor.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="text-center">
                <ChartBarIcon className="mx-auto mb-4 h-16 w-16 text-blue-500" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">تحليل السوق</h3>
                <p className="text-gray-600">تحليل شامل لاتجاهات السوق والطلب</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900">الطلب في السوق</h4>
                  <div className="text-2xl font-bold text-blue-600">عالي</div>
                  <p className="mt-1 text-sm text-blue-700">زيادة 15% في الطلب هذا الشهر</p>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <h4 className="mb-2 font-semibold text-green-900">متوسط وقت البيع</h4>
                  <div className="text-2xl font-bold text-green-600">12 يوم</div>
                  <p className="mt-1 text-sm text-green-700">أسرع من المتوسط بـ 3 أيام</p>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <h4 className="mb-2 font-semibold text-yellow-900">المنافسة</h4>
                  <div className="text-2xl font-bold text-yellow-600">متوسطة</div>
                  <p className="mt-1 text-sm text-yellow-700">8 سيارات مشابهة في السوق</p>
                </div>

                <div className="rounded-lg bg-purple-50 p-4">
                  <h4 className="mb-2 font-semibold text-purple-900">اتجاه الأسعار</h4>
                  <div className="text-2xl font-bold text-purple-600">صاعد</div>
                  <p className="mt-1 text-sm text-purple-700">ارتفاع 5% في آخر 3 أشهر</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-6">
              {negotiationTips.map((section, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></div>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>مدعوم بالذكاء الاصطناعي</span>
            <span>آخر تحديث: منذ دقيقتين</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
