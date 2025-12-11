import { CogIcon } from '@heroicons/react/24/outline';

interface CarSpecificationsProps {
  details: Record<string, any>;
}

const specLabels: Record<string, string> = {
  brand: 'الماركة',
  model: 'الموديل',
  year: 'سنة الصنع',
  condition: 'الحالة',
  mileage: 'المسافة المقطوعة',
  fuelType: 'نوع الوقود',
  transmission: 'ناقل الحركة',
  bodyType: 'نوع الهيكل',
  exteriorColor: 'اللون الخارجي',
  interiorColor: 'اللون الداخلي',
  seatCount: 'عدد المقاعد',
  regionalSpec: 'المواصفات الإقليمية',
  chassisNumber: 'رقم الشاسيه',
  engineNumber: 'رقم المحرك',
  engineSize: 'سعة المحرك',
  vehicleType: 'نوع المركبة',
  manufacturingCountry: 'بلد الصنع',
  customsStatus: 'حالة الجمارك',
  licenseStatus: 'حالة الترخيص',
  insuranceStatus: 'حالة التأمين',
  paymentMethod: 'طريقة الدفع',
};

export default function CarSpecifications({ details }: CarSpecificationsProps) {
  // فلترة المواصفات المتاحة
  const filteredSpecs = Object.entries(details).filter(([key, value]) => {
    const stringValue = value as string;
    return (
      specLabels[key] &&
      stringValue &&
      stringValue.trim() !== '' &&
      stringValue !== 'غير محدد' &&
      stringValue !== 'غير متوفر'
    );
  });

  // ترتيب المواصفات حسب الأولوية
  const priority: Record<string, number> = {
    brand: 1,
    model: 2,
    year: 3,
    condition: 4,
    mileage: 5,
    fuelType: 6,
    transmission: 7,
    bodyType: 8,
    engineSize: 9,
    exteriorColor: 10,
    interiorColor: 11,
    seatCount: 12,
  };

  const sortedSpecs = filteredSpecs.sort(
    ([keyA], [keyB]) => (priority[keyA] || 99) - (priority[keyB] || 99),
  );

  if (sortedSpecs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-6 flex items-center text-2xl font-bold text-gray-900">
        <CogIcon className="ml-2 h-6 w-6 text-blue-600" />
        مواصفات السيارة
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedSpecs.map(([key, value]) => {
          // تحديد نوع المواصفة للألوان
          const isBasic = ['brand', 'model', 'year', 'condition', 'mileage'].includes(key);
          const isTechnical = [
            'chassisNumber',
            'engineNumber',
            'engineSize',
            'fuelType',
            'transmission',
          ].includes(key);

          const colorClass = isBasic
            ? 'bg-blue-50 border-blue-200'
            : isTechnical
              ? 'bg-purple-50 border-purple-200'
              : 'bg-gray-50 border-gray-200';

          return (
            <div
              key={key}
              className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${colorClass}`}
            >
              <p className="mb-1 text-sm font-medium text-gray-600">{specLabels[key]}</p>
              <p className="text-lg font-semibold text-gray-900">{value as string}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
