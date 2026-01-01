import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

interface CarDetails {
  brand?: string;
  model?: string;
  year?: number;
  condition?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  engineSize?: string;
  exteriorColor?: string;
  interiorColor?: string;
  seatCount?: string;
  regionalSpec?: string;
  vehicleType?: string;
  manufacturingCountry?: string;
  customsStatus?: string;
  licenseStatus?: string;
  insuranceStatus?: string;
  paymentMethod?: string;
  chassisNumber?: string;
  engineNumber?: string;
}

interface AuctionCarSpecificationsProps {
  carDetails: CarDetails;
}

const AuctionCarSpecifications: React.FC<AuctionCarSpecificationsProps> = ({
  carDetails,
}) => {
  // تصفية البيانات المتاحة
  const availableSpecs = Object.entries(carDetails)
    .filter(([key, value]) => {
      const allKeys = [
        "brand", "model", "year", "condition", "mileage", "fuelType",
        "transmission", "bodyType", "engineSize", "exteriorColor", 
        "interiorColor", "seatCount", "regionalSpec", "vehicleType",
        "manufacturingCountry", "customsStatus", "licenseStatus", 
        "insuranceStatus", "paymentMethod", "chassisNumber", "engineNumber"
      ];
      const stringValue = String(value);
      return (
        allKeys.includes(key) &&
        value &&
        stringValue.trim() !== "" &&
        stringValue !== "غير محدد" &&
        stringValue !== "غير متوفر"
      );
    })
    .sort(([keyA], [keyB]) => {
      // ترتيب الحقول حسب الأولوية
      const priority: { [key: string]: number } = {
        // المواصفات الأساسية
        brand: 1, model: 2, year: 3, condition: 4, mileage: 5,
        // المواصفات التقنية
        fuelType: 6, transmission: 7, bodyType: 8, engineSize: 9,
        // المواصفات الخارجية
        exteriorColor: 10, interiorColor: 11, seatCount: 12,
        // المواصفات الإقليمية والقانونية
        regionalSpec: 13, vehicleType: 14, manufacturingCountry: 15,
        customsStatus: 16, licenseStatus: 17, insuranceStatus: 18,
        paymentMethod: 19,
        // المواصفات التقنية المتقدمة
        chassisNumber: 20, engineNumber: 21,
      };
      return (priority[keyA] || 99) - (priority[keyB] || 99);
    });

  // دالة للحصول على العنوان العربي
  const getArabicLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      brand: "الماركة",
      model: "الموديل", 
      year: "سنة الصنع",
      condition: "الحالة",
      mileage: "المسافة المقطوعة",
      fuelType: "نوع الوقود",
      transmission: "ناقل الحركة",
      bodyType: "نوع الهيكل",
      engineSize: "حجم المحرك",
      exteriorColor: "اللون الخارجي",
      interiorColor: "اللون الداخلي",
      seatCount: "عدد المقاعد",
      regionalSpec: "المواصفات الإقليمية",
      vehicleType: "نوع المركبة",
      manufacturingCountry: "بلد الصنع",
      customsStatus: "حالة الجمارك",
      licenseStatus: "حالة الترخيص",
      insuranceStatus: "حالة التأمين",
      paymentMethod: "طريقة الدفع",
      chassisNumber: "رقم الشاسيه",
      engineNumber: "رقم المحرك"
    };
    return labels[key] || key;
  };

  // دالة لتحديد نوع المواصفة وتطبيق الستايل المناسب
  const getSpecClass = (key: string): string => {
    const isBasic = ["brand", "model", "year", "condition", "mileage"].includes(key);
    const isTechnical = ["chassisNumber", "engineNumber", "engineSize", "fuelType", "transmission"].includes(key);
    const isLegal = ["customsStatus", "licenseStatus", "insuranceStatus", "paymentMethod", "regionalSpec"].includes(key);
    const isAppearance = ["bodyType", "exteriorColor", "interiorColor", "seatCount", "vehicleType", "manufacturingCountry"].includes(key);

    if (isBasic) return "spec-basic";
    if (isTechnical) return "spec-technical"; 
    if (isLegal) return "spec-legal";
    if (isAppearance) return "spec-appearance";
    return "spec-general";
  };

  // دالة لتنسيق القيم
  const formatValue = (key: string, value: any): string => {
    if (key === 'mileage' && typeof value === 'number') {
      return `${value.toLocaleString()} كم`;
    }
    if (key === 'year' && typeof value === 'number') {
      return value.toString();
    }
    return String(value);
  };

  if (availableSpecs.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
        <CogIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>لا توجد مواصفات متاحة</p>
      </div>
    );
  }

  return (
    <div className="car-specifications-container bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="car-specifications-title flex items-center text-xl font-bold text-gray-900 mb-6">
        <CogIcon className="ml-2 h-6 w-6 text-blue-600" />
        مواصفات السيارة
      </h3>
      
      <div className="car-specifications-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableSpecs.map(([key, value]) => (
          <div
            key={key}
            className={`car-spec-card-enhanced ${getSpecClass(key)} bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors`}
          >
            <div className="car-spec-label text-sm font-medium text-gray-600 mb-1">
              {getArabicLabel(key)}
            </div>
            <div className="car-spec-value text-lg font-semibold text-gray-900">
              {formatValue(key, value)}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .spec-basic {
          border-left: 4px solid #3b82f6;
        }
        .spec-technical {
          border-left: 4px solid #059669;
        }
        .spec-legal {
          border-left: 4px solid #dc2626;
        }
        .spec-appearance {
          border-left: 4px solid #7c3aed;
        }
        .spec-general {
          border-left: 4px solid #6b7280;
        }
      `}</style>
    </div>
  );
};

export default AuctionCarSpecifications;
