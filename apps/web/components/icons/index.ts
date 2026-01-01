/**
 * ملف الوصول المركزي لجميع الأيقونات
 *
 * هذا الملف يوفر نقطة دخول واحدة لجميع أنواع الأيقونات في المشروع
 */

// ========================================
// الأيقونات المخصصة
// ========================================

export {
  WalletProfessionalIcon,
  StoreProfessionalIcon,
  SettingsProfessionalIcon,
  SecurityProfessionalIcon,
  HelpProfessionalIcon,
  ReportsProfessionalIcon,
  StatsProfessionalIcon,
  NotificationsProfessionalIcon,
  TransactionsProfessionalIcon,
  LimitsProfessionalIcon,
  BanksProfessionalIcon,
  CryptoProfessionalIcon,
  PaymentProfessionalIcon,
  getProfessionalIcon,
} from './ProfessionalIcons';

// ========================================
// أيقونات الفئات (مع دعم الأيقونات الخارجية)
// ========================================

export { default as CategoryIcon } from './CategoryIcon';

// ========================================
// مكونات الأيقونات المساعدة
// ========================================

export { IconWrapper, IconButton, IconCard, IconList } from './IconWrapper';

export type { IconSize, IconColor } from './IconWrapper';

// ========================================
// نظام RTL
// ========================================

export { default as RTLIcon } from '../common/icons/RTLIcon';
export { BackIcon, ForwardIcon } from '../common/icons/RTLIcon';
export type { RTLIconName, RTLIconProps } from '../common/icons/RTLIcon';

// ========================================
// الأيقونات الشائعة من Heroicons
// ========================================

// أيقونات الإجراءات
export {
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

// أيقونات التنقل
export {
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

// أيقونات المستخدم
export { UserIcon, UsersIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

// أيقونات الاتصال
export {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

// أيقونات التجارة
export {
  ShoppingCartIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

// أيقونات النظام
export {
  CogIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';

// أيقونات الملفات
export {
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  FolderOpenIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

// أيقونات الحالات
export {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// أيقونات أخرى
export {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  EyeIcon,
  EyeSlashIcon,
  ShareIcon,
  BookmarkIcon,
  FlagIcon,
  PrinterIcon,
  LinkIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BellAlertIcon,
  InboxIcon,
  ArchiveBoxIcon,
  TagIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
  LightBulbIcon,
  TrophyIcon,
  AcademicCapIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  TruckIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  QueueListIcon,
  RectangleStackIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ViewColumnsIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

// ========================================
// دوال مساعدة
// ========================================

/**
 * الحصول على أيقونة Heroicons حسب الاسم
 */
export const getHeroicon = (name: string) => {
  // يمكن إضافة منطق للحصول على الأيقونة حسب الاسم
  // هذا مفيد للأيقونات الديناميكية
  return null;
};

/**
 * التحقق من وجود أيقونة
 */
export const hasIcon = (name: string): boolean => {
  // منطق التحقق من وجود الأيقونة
  return false;
};

// ========================================
// ملاحظات مهمة
// ========================================

/**
 * قواعد استخدام الأيقونات:
 *
 * 1. لا تستخدم الإيموجي أبداً - استخدم Heroicons أو الأيقونات المخصصة
 * 2. استخدم Heroicons أولاً قبل إنشاء أيقونات مخصصة
 * 3. استخدم الأحجام الموحدة من Tailwind (w-4, w-5, w-6, w-8, w-12)
 * 4. استخدم currentColor للألوان القابلة للتخصيص
 * 5. استخدم RTLIcon للأيقونات الاتجاهية
 * 6. أضف aria-label للأيقونات بدون نص
 * 7. اختبر الأيقونات في الوضع المظلم والفاتح
 *
 * أمثلة:
 *
 * // استخدام أيقونة Heroicons
 * import { UserIcon } from '@/components/icons';
 * <UserIcon className="w-6 h-6 text-blue-600" />
 *
 * // استخدام أيقونة مخصصة
 * import { WalletProfessionalIcon } from '@/components/icons';
 * <WalletProfessionalIcon className="w-8 h-8 text-green-600" />
 *
 * // استخدام IconWrapper
 * import { IconWrapper, UserIcon } from '@/components/icons';
 * <IconWrapper icon={UserIcon} size="lg" color="primary" />
 *
 * // استخدام RTLIcon
 * import { RTLIcon } from '@/components/icons';
 * <RTLIcon name="back" className="w-5 h-5" />
 *
 * للمزيد من المعلومات، راجع:
 * - docs/ICONS_README.md
 * - docs/ICON_STANDARDS.md
 * - docs/ICONS_EXAMPLES.md
 */
