import { UnifiedButton } from '@/components/unified';
import React, { useState } from 'react';
import {
  EnhancedButton,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  SuccessButton,
  GhostButton,
  OutlineButton,
  ToggleGroup,
  ToggleButton,
  IconButton,
  LoadingButton,
} from '../ui/EnhancedButton';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import CheckIcon from '@heroicons/react/24/outline/CheckIcon';
import ListBulletIcon from '@heroicons/react/24/outline/ListBulletIcon';
import Squares2X2Icon from '@heroicons/react/24/outline/Squares2X2Icon';

/**
 * مكون لعرض جميع أنواع الأزرار المحسنة
 * Component to showcase all enhanced button types
 */
const ButtonShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-8" dir="rtl">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">عرض الأزرار المحسنة</h1>
        <p className="mb-8 text-gray-600">مجموعة شاملة من الأزرار المحسنة لتطبيق سوق مزاد</p>

        {/* الأزرار الأساسية */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">الأزرار الأساسية</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <PrimaryButton>
              <PlusIcon className="h-4 w-4" />
              إضافة جديد
            </PrimaryButton>

            <SecondaryButton>
              <PencilIcon className="h-4 w-4" />
              تعديل
            </SecondaryButton>

            <DangerButton>
              <TrashIcon className="h-4 w-4" />
              حذف
            </DangerButton>

            <SuccessButton>
              <CheckIcon className="h-4 w-4" />
              حفظ
            </SuccessButton>
          </div>
        </section>

        {/* أحجام الأزرار */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أحجام الأزرار</h2>
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton size="sm">صغير</PrimaryButton>
            <PrimaryButton size="md">متوسط</PrimaryButton>
            <PrimaryButton size="lg">كبير</PrimaryButton>
            <PrimaryButton size="xl">كبير جداً</PrimaryButton>
          </div>
        </section>

        {/* أنواع الأزرار */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أنواع الأزرار</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <UnifiedButton variant="primary">أساسي</UnifiedButton>
            <UnifiedButton variant="secondary">ثانوي</UnifiedButton>
            <UnifiedButton variant="outline">محدد</UnifiedButton>
            <UnifiedButton variant="ghost">شفاف</UnifiedButton>
            <UnifiedButton variant="danger">خطر</UnifiedButton>
            <UnifiedButton variant="success">نجاح</UnifiedButton>
            <UnifiedButton variant="warning">تحذير</UnifiedButton>
            <UnifiedButton variant="link">رابط</UnifiedButton>
          </div>
        </section>

        {/* أزرار الأيقونات */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أزرار الأيقونات</h2>
          <div className="flex flex-wrap gap-4">
            <IconButton
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              aria-label="بحث"
              variant="primary"
            />
            <IconButton
              icon={<PlusIcon className="h-5 w-5" />}
              aria-label="إضافة"
              variant="secondary"
            />
            <IconButton
              icon={<PencilIcon className="h-5 w-5" />}
              aria-label="تعديل"
              variant="outline"
            />
            <IconButton
              icon={<TrashIcon className="h-5 w-5" />}
              aria-label="حذف"
              variant="danger"
            />
            <IconButton
              icon={<XMarkIcon className="h-5 w-5" />}
              aria-label="إغلاق"
              variant="ghost"
            />
          </div>
        </section>

        {/* مجموعة أزرار التبديل */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أزرار التبديل</h2>
          <ToggleGroup value={viewMode} onValueChange={setViewMode}>
            <ToggleButton value="list">
              <ListBulletIcon className="view-mode-icon h-5 w-5" />
              قائمة
            </ToggleButton>
            <ToggleButton value="grid">
              <Squares2X2Icon className="view-mode-icon h-5 w-5" />
              شبكة
            </ToggleButton>
          </ToggleGroup>
          <p className="mt-2 text-sm text-gray-600">
            الوضع المحدد: {viewMode === 'list' ? 'قائمة' : 'شبكة'}
          </p>
        </section>

        {/* أزرار التحميل */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أزرار التحميل</h2>
          <div className="flex flex-wrap gap-4">
            <LoadingButton
              loading={loading}
              loadingText="جاري الحفظ..."
              onClick={handleLoadingTest}
            >
              حفظ البيانات
            </LoadingButton>

            <UnifiedButton loading={loading} variant="secondary" onClick={handleLoadingTest}>
              تحديث
            </UnifiedButton>
          </div>
        </section>

        {/* الحالات المختلفة */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">الحالات المختلفة</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <PrimaryButton>عادي</PrimaryButton>
            <PrimaryButton disabled>معطل</PrimaryButton>
            <PrimaryButton loading>تحميل</PrimaryButton>
            <PrimaryButton fullWidth>عرض كامل</PrimaryButton>
          </div>
        </section>

        {/* أزرار مع أيقونات */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أزرار مع أيقونات</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <PrimaryButton leftIcon={<PlusIcon className="h-4 w-4" />}>إضافة عنصر</PrimaryButton>

            <SecondaryButton rightIcon={<MagnifyingGlassIcon className="h-4 w-4" />}>
              بحث متقدم
            </SecondaryButton>

            <DangerButton leftIcon={<TrashIcon className="h-4 w-4" />}>حذف المحدد</DangerButton>

            <SuccessButton leftIcon={<CheckIcon className="h-4 w-4" />}>
              تأكيد العملية
            </SuccessButton>

            <OutlineButton rightIcon={<PencilIcon className="h-4 w-4" />}>
              تعديل الملف
            </OutlineButton>

            <GhostButton leftIcon={<XMarkIcon className="h-4 w-4" />}>إلغاء</GhostButton>
          </div>
        </section>

        {/* أمثلة من الاستخدام الفعلي */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">أمثلة من الاستخدام الفعلي</h2>

          {/* شريط أدوات */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-medium">شريط أدوات</h3>
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
              <PrimaryButton size="sm" leftIcon={<PlusIcon className="h-4 w-4" />}>
                إضافة
              </PrimaryButton>
              <SecondaryButton size="sm" leftIcon={<PencilIcon className="h-4 w-4" />}>
                تعديل
              </SecondaryButton>
              <DangerButton size="sm" leftIcon={<TrashIcon className="h-4 w-4" />}>
                حذف
              </DangerButton>
              <div className="mr-auto">
                <ToggleGroup value={viewMode} onValueChange={setViewMode} size="sm">
                  <ToggleButton value="list">
                    <ListBulletIcon className="view-mode-icon h-4 w-4" />
                  </ToggleButton>
                  <ToggleButton value="grid">
                    <Squares2X2Icon className="view-mode-icon h-4 w-4" />
                  </ToggleButton>
                </ToggleGroup>
              </div>
            </div>
          </div>

          {/* نموذج */}
          <div>
            <h3 className="mb-3 text-lg font-medium">نموذج</h3>
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex justify-end gap-3">
                <GhostButton>إلغاء</GhostButton>
                <SecondaryButton>حفظ كمسودة</SecondaryButton>
                <PrimaryButton leftIcon={<CheckIcon className="h-4 w-4" />}>نشر</PrimaryButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonShowcase;
