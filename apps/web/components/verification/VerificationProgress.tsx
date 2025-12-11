import React from 'react';
import { VerificationLevel, VerificationStatus } from '../../types/verification';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import DocumentCheckIcon from '@heroicons/react/24/outline/DocumentCheckIcon';

interface VerificationProgressProps {
  currentLevel: VerificationLevel;
  completionPercentage: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  className?: string;
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({
  currentLevel,
  completionPercentage,
  approvedDocuments,
  pendingDocuments,
  rejectedDocuments,
  className = '',
}) => {
  const levels = [
    {
      level: VerificationLevel.BASIC,
      title: 'أساسي',
      description: 'تحقق من الهوية الأساسية',
      icon: DocumentCheckIcon,
      color: 'gray',
      requirements: ['الهوية الوطنية'],
      benefits: ['إنشاء الإعلانات', 'التواصل مع البائعين'],
    },
    {
      level: VerificationLevel.STANDARD,
      title: 'معياري',
      description: 'تحقق معياري مع وثائق إضافية',
      icon: ShieldCheckIcon,
      color: 'blue',
      requirements: ['الهوية الوطنية', 'إثبات العنوان'],
      benefits: ['حدود أعلى للمعاملات', 'أولوية في البحث', 'شارة التحقق'],
    },
    {
      level: VerificationLevel.PREMIUM,
      title: 'مميز',
      description: 'تحقق شامل مع جميع الوثائق',
      icon: StarIcon,
      color: 'yellow',
      requirements: ['الهوية الوطنية', 'إثبات العنوان', 'كشف بنكي'],
      benefits: ['حدود غير محدودة', 'دعم أولوية', 'مزايا حصرية'],
    },
    {
      level: VerificationLevel.ENTERPRISE,
      title: 'مؤسسي',
      description: 'تحقق للشركات والمؤسسات',
      icon: TrophyIcon,
      color: 'purple',
      requirements: ['السجل التجاري', 'البيانات الضريبية', 'التوقيع المعتمد'],
      benefits: ['حساب مؤسسي', 'إدارة متعددة المستخدمين', 'تقارير مفصلة'],
    },
  ];

  const getCurrentLevelIndex = () => {
    return levels.findIndex((l) => l.level === currentLevel);
  };

  const getNextLevel = () => {
    const currentIndex = getCurrentLevelIndex();
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getLevelColor = (level: VerificationLevel) => {
    const levelData = levels.find((l) => l.level === level);
    return levelData?.color || 'gray';
  };

  const getLevelIcon = (level: VerificationLevel) => {
    const levelData = levels.find((l) => l.level === level);
    return levelData?.icon || DocumentCheckIcon;
  };

  const currentLevelData = levels.find((l) => l.level === currentLevel);
  const nextLevel = getNextLevel();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Level Status */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentLevelData && (
              <>
                <div
                  className={`h-10 w-10 bg-${currentLevelData.color}-100 text-${currentLevelData.color}-600 flex items-center justify-center rounded-full`}
                >
                  <currentLevelData.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    مستوى التحقق: {currentLevelData.title}
                  </h3>
                  <p className="text-sm text-gray-600">{currentLevelData.description}</p>
                </div>
              </>
            )}
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
            <div className="text-sm text-gray-500">مكتمل</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 h-3 w-full rounded-full bg-gray-200">
          <div
            className={`bg-${currentLevelData?.color || 'blue'}-600 h-3 rounded-full transition-all duration-500`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-green-600">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="font-semibold">{approvedDocuments}</span>
            </div>
            <div className="text-xs text-gray-500">مؤكدة</div>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-yellow-600">
              <ClockIcon className="h-4 w-4" />
              <span className="font-semibold">{pendingDocuments}</span>
            </div>
            <div className="text-xs text-gray-500">قيد المراجعة</div>
          </div>

          <div className="text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-red-600">
              <XCircleIcon className="h-4 w-4" />
              <span className="font-semibold">{rejectedDocuments}</span>
            </div>
            <div className="text-xs text-gray-500">مرفوضة</div>
          </div>
        </div>
      </div>

      {/* Current Level Benefits */}
      {currentLevelData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h4 className="mb-3 font-semibold text-blue-900">مزايا المستوى الحالي</h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {currentLevelData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-blue-800">
                <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Level Preview */}
      {nextLevel && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`h-8 w-8 bg-${nextLevel.color}-100 text-${nextLevel.color}-600 flex items-center justify-center rounded-full`}
            >
              <nextLevel.icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">المستوى التالي: {nextLevel.title}</h4>
              <p className="text-sm text-gray-600">{nextLevel.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="mb-2 font-medium text-gray-900">المتطلبات للوصول للمستوى التالي:</h5>
              <div className="space-y-2">
                {nextLevel.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span className="text-sm">{requirement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="mb-2 font-medium text-gray-900">المزايا الإضافية:</h5>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {nextLevel.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Levels Overview */}
      <div className="rounded-lg border bg-white p-6">
        <h4 className="mb-4 font-semibold text-gray-900">مستويات التحقق المتاحة</h4>

        <div className="space-y-4">
          {levels.map((level, index) => {
            const isCurrentLevel = level.level === currentLevel;
            const isCompleted = getCurrentLevelIndex() > index;
            const IconComponent = level.icon;

            return (
              <div
                key={level.level}
                className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
                  isCurrentLevel
                    ? `bg-${level.color}-50 border-${level.color}-200`
                    : isCompleted
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isCurrentLevel
                      ? `bg-${level.color}-100 text-${level.color}-600`
                      : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="h-6 w-6" />
                  ) : (
                    <IconComponent className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h5
                      className={`font-medium ${
                        isCurrentLevel || isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {level.title}
                    </h5>
                    {isCurrentLevel && (
                      <span
                        className={`px-2 py-1 text-xs font-medium bg-${level.color}-100 text-${level.color}-800 rounded-full`}
                      >
                        الحالي
                      </span>
                    )}
                    {isCompleted && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        مكتمل
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${
                      isCurrentLevel || isCompleted ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {level.description}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${
                      isCurrentLevel || isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {level.requirements.length} متطلب
                  </div>
                  <div
                    className={`text-xs ${
                      isCurrentLevel || isCompleted ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {level.benefits.length} ميزة
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// مكون لعرض ملخص سريع للتقدم
interface QuickProgressProps {
  currentLevel: VerificationLevel;
  completionPercentage: number;
  className?: string;
}

export const QuickProgress: React.FC<QuickProgressProps> = ({
  currentLevel,
  completionPercentage,
  className = '',
}) => {
  const getLevelInfo = (level: VerificationLevel) => {
    switch (level) {
      case VerificationLevel.BASIC:
        return { title: 'أساسي', color: 'gray', icon: DocumentCheckIcon };
      case VerificationLevel.STANDARD:
        return { title: 'معياري', color: 'blue', icon: ShieldCheckIcon };
      case VerificationLevel.PREMIUM:
        return { title: 'مميز', color: 'yellow', icon: StarIcon };
      case VerificationLevel.ENTERPRISE:
        return { title: 'مؤسسي', color: 'purple', icon: TrophyIcon };
      default:
        return { title: 'غير محدد', color: 'gray', icon: DocumentCheckIcon };
    }
  };

  const levelInfo = getLevelInfo(currentLevel);
  const IconComponent = levelInfo.icon;

  return (
    <div className={`rounded-lg border bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 bg-${levelInfo.color}-100 text-${levelInfo.color}-600 flex items-center justify-center rounded-full`}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{levelInfo.title}</div>
            <div className="text-sm text-gray-500">{completionPercentage}% مكتمل</div>
          </div>
        </div>

        <div className="h-2 w-16 rounded-full bg-gray-200">
          <div
            className={`h-2 bg-${levelInfo.color}-600 rounded-full transition-all duration-300`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationProgress;
