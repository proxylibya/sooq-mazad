import React, { useMemo } from 'react';
import { carBrands, findBrand } from '../../../../data/car-brands-logos';
import SelectField from '../../../ui/SelectField';

interface BasicBrandModelFilterProps {
  brand: string; // قيمة الماركة الحالية (قد تكون '')
  model: string; // قيمة الموديل الحالية (قد تكون '')
  onChange: (update: { brand?: string; model?: string }) => void;
  className?: string;
}

/**
 * BasicBrandModelFilter (Unified with SelectField design)
 * - يستخدم SelectField المستعمل في صفحات إضافة إعلان لضمان توافق النمط والسلوك
 * - بحث داخل القوائم، منبثق بارتفاع مدمج (compact)، وحجم صغير لإظهار النص كاملاً
 * - RTL مدعوم بالكامل، ولا يعتمد على قوائم مخصّصة خارجية
 */
const BasicBrandModelFilter: React.FC<BasicBrandModelFilterProps> = ({
  brand,
  model,
  onChange,
  className = '',
}) => {
  // خيارات الماركات
  const brandOptions = useMemo(
    () =>
      carBrands
        .slice()
        .sort((a, b) => (a.sortOrder || 999) - (b.sortOrder || 999))
        .map((b) => ({ value: b.name, label: b.name })),
    [],
  );

  // مفتاح الماركة المختارة لاشتقاق الموديلات
  const brandInfo = useMemo(() => (brand ? findBrand(brand) : undefined), [brand]);
  const brandKey = useMemo(
    () => (brandInfo?.nameEn ? brandInfo.nameEn.toLowerCase() : ''),
    [brandInfo],
  );

  // خريطة موديلات مبسطة للماركات الأكثر شيوعاً (متناسقة مع صفحات أخرى)
  const modelsMap: Record<string, string[]> = {
    toyota: ['كامري', 'كورولا', 'يارس', 'هايلكس', 'راف 4', 'لاند كروزر', 'برادو'],
    nissan: ['التيما', 'سنترا', 'مكسيما', 'باترول', 'اكس تريل', 'جوك', 'تيدا'],
    hyundai: ['النترا', 'سوناتا', 'توسان', 'سانتا في', 'اكسنت', 'كريتا'],
    kia: ['سيراتو', 'اوبتيما', 'سبورتاج', 'سورينتو', 'ريو', 'بيكانتو'],
    honda: ['اكورد', 'سيفيك', 'سي ار في', 'بايلوت', 'اوديسي', 'فيت'],
    mercedes: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'CLA'],
    bmw: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6'],
    audi: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A8'],
  };

  const modelOptions = useMemo(() => {
    if (!brandKey) return [];
    const list = modelsMap[brandKey] || [];
    return list.map((m) => ({ value: m, label: m }));
  }, [brandKey]);

  return (
    <div className={`w-full ${className}`} dir="rtl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {/* SelectField: النوع (الماركة) */}
        <SelectField
          options={[{ value: '', label: 'جميع الماركات' }, ...brandOptions]}
          value={brand}
          onChange={(val) => {
            onChange({ brand: val });
            // إعادة تعيين الموديل عند تغيير النوع
            onChange({ model: '' });
          }}
          placeholder="اختر نوع السيارة"
          searchable={true}
          searchPlaceholder="ابحث عن الماركة"
          clearable={true}
          size="sm"
          compact={true}
          className="text-[13px]"
        />

        {/* SelectField: الموديل */}
        <SelectField
          options={[{ value: '', label: 'جميع الموديلات' }, ...modelOptions]}
          value={model}
          onChange={(val) => onChange({ model: val })}
          placeholder={brand ? 'اختر الموديل' : 'اختر النوع أولاً'}
          searchable={true}
          searchPlaceholder="ابحث عن الموديل"
          clearable={true}
          size="sm"
          compact={true}
          className="text-[13px]"
          disabled={!brand || modelOptions.length === 0}
        />
      </div>
    </div>
  );
};

export default BasicBrandModelFilter;
