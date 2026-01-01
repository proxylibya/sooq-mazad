import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import ArrowTrendingUpIcon from '@heroicons/react/24/outline/ArrowTrendingUpIcon';
import ClipboardDocumentIcon from '@heroicons/react/24/outline/ClipboardDocumentIcon';
import CalculatorIcon from '@heroicons/react/24/outline/CalculatorIcon';
import BeakerIcon from '@heroicons/react/24/outline/BeakerIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import SparklesIcon from '@heroicons/react/24/outline/SparklesIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import TrophyIcon from '@heroicons/react/24/outline/TrophyIcon';
import ArrowRightIcon from '@heroicons/react/24/outline/ArrowRightIcon';
import WrenchScrewdriverIcon from '@heroicons/react/24/outline/WrenchScrewdriverIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import CogIcon from '@heroicons/react/24/outline/CogIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';
import FaceSmileIcon from '@heroicons/react/24/outline/FaceSmileIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import FolderIcon from '@heroicons/react/24/outline/FolderIcon';
import ArchiveBoxIcon from '@heroicons/react/24/outline/ArchiveBoxIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import NoSymbolIcon from '@heroicons/react/24/outline/NoSymbolIcon';
import BoltIcon from '@heroicons/react/24/outline/BoltIcon';
import CloudIcon from '@heroicons/react/24/outline/CloudIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import HeartIcon from '@heroicons/react/24/outline/HeartIcon';
import MusicalNoteIcon from '@heroicons/react/24/outline/MusicalNoteIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

// واجهة للأيقونة الاحترافية
interface ProfessionalIconProps {
  className?: string;
  size?: number;
  color?: string;
}

// مكتبة الأيقونات الاحترافية البديلة
export const ProfessionalIcons = {
  // أيقونات التحقق والحالة
  Success: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CheckCircleIcon className={className} style={{ color }} />
  ),

  Error: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <XCircleIcon className={className} style={{ color }} />
  ),

  Check: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CheckIcon className={className} style={{ color }} />
  ),

  Close: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <XMarkIcon className={className} style={{ color }} />
  ),

  // أيقونات البحث والتحليل
  Search: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <MagnifyingGlassIcon className={className} style={{ color }} />
  ),

  Analytics: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ChartBarIcon className={className} style={{ color }} />
  ),

  Trending: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ArrowTrendingUpIcon className={className} style={{ color }} />
  ),

  Report: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ClipboardDocumentIcon className={className} style={{ color }} />
  ),

  // أيقونات الأدوات والعمليات
  Calculator: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CalculatorIcon className={className} style={{ color }} />
  ),

  Test: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <BeakerIcon className={className} style={{ color }} />
  ),

  Global: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <GlobeAltIcon className={className} style={{ color }} />
  ),

  Vehicle: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <TruckIcon className={className} style={{ color }} />
  ),

  // أيقونات الاحتفال والنجاح
  Celebration: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <SparklesIcon className={className} style={{ color }} />
  ),

  Money: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CurrencyDollarIcon className={className} style={{ color }} />
  ),

  Trophy: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <TrophyIcon className={className} style={{ color }} />
  ),

  Star: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <StarIcon className={className} style={{ color }} />
  ),

  // أيقونات التنقل والاتجاه
  Arrow: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ArrowRightIcon className={className} style={{ color }} />
  ),

  Refresh: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ArrowPathIcon className={className} style={{ color }} />
  ),

  // أيقونات الأدوات والصيانة
  Tools: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <WrenchScrewdriverIcon className={className} style={{ color }} />
  ),

  Delete: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <TrashIcon className={className} style={{ color }} />
  ),

  Settings: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CogIcon className={className} style={{ color }} />
  ),

  // أيقونات الملفات والمستندات
  Document: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <DocumentIcon className={className} style={{ color }} />
  ),

  Edit: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <PencilIcon className={className} style={{ color }} />
  ),

  Image: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <PhotoIcon className={className} style={{ color }} />
  ),

  Folder: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <FolderIcon className={className} style={{ color }} />
  ),

  // أيقونات التحذير والتنبيه
  Warning: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ExclamationTriangleIcon className={className} style={{ color }} />
  ),

  Forbidden: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <NoSymbolIcon className={className} style={{ color }} />
  ),

  // أيقونات الطقس والطبيعة
  Lightning: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <BoltIcon className={className} style={{ color }} />
  ),

  Cloud: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <CloudIcon className={className} style={{ color }} />
  ),

  Sun: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <SunIcon className={className} style={{ color }} />
  ),

  // أيقونات أخرى
  Heart: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <HeartIcon className={className} style={{ color }} />
  ),

  Music: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <MusicalNoteIcon className={className} style={{ color }} />
  ),

  Smile: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <FaceSmileIcon className={className} style={{ color }} />
  ),

  Archive: ({ className = 'w-6 h-6', color = 'currentColor' }: ProfessionalIconProps) => (
    <ArchiveBoxIcon className={className} style={{ color }} />
  ),
};

// خريطة الاستبدال للإيموجي
export const EmojiReplacementMap = {
  '<CheckCircleIcon className="w-5 h-5 text-green-500" />': ProfessionalIcons.Success,
  '<XCircleIcon className="w-5 h-5 text-red-500" />': ProfessionalIcons.Error,
  '<MagnifyingGlassIcon className="w-5 h-5" />': ProfessionalIcons.Search,
  '<ChartBarIcon className="w-5 h-5" />': ProfessionalIcons.Analytics,
  '<ArrowTrendingUpIcon className="w-5 h-5" />': ProfessionalIcons.Trending,
  '<ClipboardDocumentIcon className="w-5 h-5" />': ProfessionalIcons.Report,
  '<CalculatorIcon className="w-5 h-5" />': ProfessionalIcons.Calculator,
  '<BeakerIcon className="w-5 h-5" />': ProfessionalIcons.Test,
  '<GlobeAltIcon className="w-5 h-5" />': ProfessionalIcons.Global,
  '<TruckIcon className="w-5 h-5" />': ProfessionalIcons.Vehicle,
  '<SparklesIcon className="w-5 h-5 text-yellow-500" />': ProfessionalIcons.Celebration,
  '<CurrencyDollarIcon className="w-5 h-5 text-green-500" />': ProfessionalIcons.Money,
  '<TrophyIcon className="w-5 h-5 text-yellow-500" />': ProfessionalIcons.Trophy,
  '<ArrowRightIcon className="w-5 h-5" />': ProfessionalIcons.Arrow,
  '<WrenchScrewdriverIcon className="w-5 h-5" />': ProfessionalIcons.Tools,
  '<TrashIcon className="w-5 h-5" />': ProfessionalIcons.Delete,
  '<DocumentIcon className="w-5 h-5" />': ProfessionalIcons.Document,
  '<PencilIcon className="w-5 h-5" />': ProfessionalIcons.Edit,
  '<CogIcon className="w-5 h-5" />': ProfessionalIcons.Settings,
  '<StarIcon className="w-5 h-5 text-yellow-500" />': ProfessionalIcons.Star,
  '<FaceSmileIcon className="w-5 h-5 text-yellow-500" />': ProfessionalIcons.Smile,
  '<ArrowPathIcon className="w-5 h-5" />': ProfessionalIcons.Refresh,
  '<PhotoIcon className="w-5 h-5" />': ProfessionalIcons.Image,
  '<FolderIcon className="w-5 h-5" />': ProfessionalIcons.Folder,
  '💾': ProfessionalIcons.Archive,
  '<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />': ProfessionalIcons.Warning,
  '<NoSymbolIcon className="w-5 h-5 text-red-500" />': ProfessionalIcons.Forbidden,
  '⚡': ProfessionalIcons.Lightning,
  '☁': ProfessionalIcons.Cloud,
  '☀': ProfessionalIcons.Sun,
  '♥': ProfessionalIcons.Heart,
  '♪': ProfessionalIcons.Music,
  '<CheckIcon className="w-5 h-5 text-green-500" />': ProfessionalIcons.Check,
  '<XMarkIcon className="w-5 h-5 text-red-500" />': ProfessionalIcons.Close,
};

// دالة مساعدة للحصول على الأيقونة البديلة
export const getReplacementIcon = (emoji: string) => {
  const IconComponent =
    EmojiReplacementMap[emoji as keyof typeof EmojiReplacementMap] || ProfessionalIcons.Document;
  // Return the component as JSX, not as a function reference
  return IconComponent;
};

// دالة آمنة لعرض الأيقونة
export const renderReplacementIcon = (emoji: string, props: ProfessionalIconProps = {}) => {
  const IconComponent =
    EmojiReplacementMap[emoji as keyof typeof EmojiReplacementMap] || ProfessionalIcons.Document;
  return <IconComponent {...props} />;
};

// مكون لعرض النص مع الأيقونة البديلة
export const TextWithIcon: React.FC<{
  text: string;
  emoji: string;
  iconProps?: ProfessionalIconProps;
}> = ({ text, emoji, iconProps = {} }) => {
  const IconComponent = getReplacementIcon(emoji);

  return (
    <span className="flex items-center gap-2">
      <IconComponent {...iconProps} />
      <span>{text}</span>
    </span>
  );
};

export default ProfessionalIcons;
