# نظام حفظ واسترجاع النماذج متعددة الخطوات

## 📋 نظرة عامة

نظام احترافي لحفظ واسترجاع بيانات النماذج متعددة الخطوات، مشابه لما تستخدمه الشركات الكبرى مثل Amazon و Google و Airbnb.

## 🎯 المشكلة التي يحلها

- ضياع البيانات المدخلة عند الرجوع للخطوة السابقة
- فقدان البيانات عند إغلاق المتصفح عن طريق الخطأ
- عدم وجود حفظ تلقائي أثناء الكتابة
- صعوبة استرجاع المسودات غير المكتملة

## 🏗️ المكونات الرئيسية

### 1. FormPersistence Service

**الملف:** `lib/forms/form-persistence.ts`

خدمة أساسية للحفظ والاسترجاع تتضمن:

- حفظ تلقائي مع debounce
- دعم localStorage و sessionStorage
- تشفير بسيط للبيانات الحساسة
- انتهاء صلاحية تلقائي (قابل للتخصيص)
- مزامنة بين التبويبات

```typescript
import { FormPersistence, FORM_STORAGE_KEYS } from '@/lib/forms/form-persistence';

// إنشاء instance
const persistence = new FormPersistence({
  storageKey: 'my_form',
  expirationMinutes: 60,
  autoSave: true,
  encrypt: false,
});

// حفظ البيانات
persistence.save(formData);

// تحميل البيانات
const result = persistence.load();
if (result.success) {
  setFormData(result.data);
}

// مسح البيانات
persistence.clear();
```

### 2. useFormPersistence Hook

**الملف:** `hooks/useFormPersistence.ts`

Hook بسيط وسهل الاستخدام:

```typescript
import useFormPersistence from '@/hooks/useFormPersistence';

const MyForm = () => {
  const {
    data,           // البيانات الحالية
    setData,        // تعيين البيانات
    updateField,    // تحديث حقل واحد
    save,           // حفظ يدوي
    clear,          // مسح البيانات
    hasDraft,       // هل يوجد مسودة
    isDirty,        // هل تغيرت البيانات
    draftLoaded,    // هل تم تحميل المسودة
  } = useFormPersistence({
    key: 'carListingData',
    initialValues: {
      brand: '',
      model: '',
      // ...
    },
    autoSave: true,
    autoSaveDelay: 1000,
    expirationMinutes: 120,
  });

  return (
    <form>
      <input
        value={data.brand}
        onChange={(e) => updateField('brand', e.target.value)}
      />
    </form>
  );
};
```

### 3. useMultiStepForm Hook

**الملف:** `hooks/useMultiStepForm.ts`

Hook متقدم للنماذج متعددة الخطوات:

```typescript
import useMultiStepForm from '@/hooks/useMultiStepForm';

const MultiStepForm = () => {
  const {
    data,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    progress,
    goToNextStep,
    goToPrevStep,
    save,
    clear,
  } = useMultiStepForm({
    formId: 'car_listing',
    initialValues: { brand: '', model: '' },
    steps: [
      { id: 'details', title: 'التفاصيل', path: '/car-details' },
      { id: 'images', title: 'الصور', path: '/upload-images' },
      { id: 'preview', title: 'المعاينة', path: '/preview' },
    ],
  });

  // ...
};
```

### 4. MultiStepFormContext

**الملف:** `contexts/MultiStepFormContext.tsx`

Context عالمي لمشاركة البيانات بين الصفحات:

```typescript
// في _app.tsx
import { MultiStepFormProvider } from '@/contexts/MultiStepFormContext';

function MyApp({ Component, pageProps }) {
  return (
    <MultiStepFormProvider>
      <Component {...pageProps} />
    </MultiStepFormProvider>
  );
}

// في أي صفحة
import { useMultiStepFormContext } from '@/contexts/MultiStepFormContext';

const MyPage = () => {
  const { getFormData, setFormData, saveForm } = useMultiStepFormContext();
  // ...
};
```

## 🔑 مفاتيح التخزين المعرفة مسبقاً

```typescript
export const FORM_STORAGE_KEYS = {
  CAR_LISTING: 'car_listing_form',
  CAR_LISTING_IMAGES: 'car_listing_images',
  TRANSPORT_SERVICE: 'transport_service_form',
  SHOWROOM_VEHICLE: 'showroom_vehicle_form',
  AUCTION_CREATE: 'auction_create_form',
  USER_PROFILE: 'user_profile_form',
};
```

## ⚡ الميزات

| الميزة               | الوصف                                             |
| -------------------- | ------------------------------------------------- |
| **حفظ تلقائي**       | يحفظ البيانات تلقائياً بعد كل تغيير (مع debounce) |
| **استرجاع المسودات** | يستعيد البيانات تلقائياً عند العودة للصفحة        |
| **انتهاء الصلاحية**  | تنتهي البيانات تلقائياً بعد فترة (قابلة للتخصيص)  |
| **مزامنة التبويبات** | البيانات متزامنة بين تبويبات المتصفح              |
| **حفظ قبل الإغلاق**  | يحفظ البيانات قبل إغلاق الصفحة                    |
| **تشفير اختياري**    | يدعم تشفير البيانات الحساسة                       |
| **TypeScript**       | دعم كامل لـ TypeScript                            |

## 📁 الملفات المنشأة

```
apps/web/
├── lib/forms/
│   ├── form-persistence.ts      # خدمة الحفظ الأساسية
│   └── form-state-manager.tsx   # إدارة حالة النماذج
├── hooks/
│   ├── useFormPersistence.ts    # Hook بسيط
│   └── useMultiStepForm.ts      # Hook متقدم
├── contexts/
│   └── MultiStepFormContext.tsx # Context عالمي
└── docs/
    └── MULTI_STEP_FORM_SYSTEM.md # هذا الملف
```

## 🔧 استخدام في صفحة car-details.tsx

تم تطبيق النظام على صفحة `/add-listing/car-details` كالتالي:

```typescript
// استرجاع البيانات المحفوظة عند تحميل الصفحة
const [dataLoaded, setDataLoaded] = useState(false);

useEffect(() => {
  if (dataLoaded) return;

  const savedData = localStorage.getItem('carListingData');
  if (savedData) {
    setFormData(JSON.parse(savedData));
    console.log('[استرجاع] تم العثور على بيانات محفوظة');
  }

  setDataLoaded(true);
}, [dataLoaded]);

// الحفظ التلقائي عند تغيير البيانات
const autoSaveTimeoutRef = useRef(null);

useEffect(() => {
  if (!dataLoaded) return;

  if (autoSaveTimeoutRef.current) {
    clearTimeout(autoSaveTimeoutRef.current);
  }

  autoSaveTimeoutRef.current = setTimeout(() => {
    localStorage.setItem('carListingData', JSON.stringify(formData));
    console.log('[حفظ تلقائي] تم حفظ البيانات');
  }, 1000);

  return () => clearTimeout(autoSaveTimeoutRef.current);
}, [formData, dataLoaded]);
```

## 🎉 النتائج

- ✅ البيانات محفوظة عند الرجوع للصفحة السابقة
- ✅ استعادة تلقائية للمسودات غير المكتملة
- ✅ حفظ تلقائي أثناء الكتابة
- ✅ لا ضياع للبيانات عند الإغلاق العرضي
- ✅ تجربة مستخدم سلسة مثل المواقع الكبرى

## 📚 مراجع

- [React Forms Best Practices](https://react.dev/reference/react-dom/components/form)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Multi-step Form UX](https://www.nngroup.com/articles/progress-indicators/)
