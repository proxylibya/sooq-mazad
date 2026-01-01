import WalletIcon from '@heroicons/react/24/outline/WalletIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';

interface BalanceSummaryProps {
  balance: number;
  onTopUp?: () => void;
}

export default function BalanceSummary({ balance, onTopUp }: BalanceSummaryProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* بطاقة المحفظة الموحدة */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 text-white shadow-2xl">
        {/* خلفية زخرفية */}
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/10"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-white/5"></div>

        <div className="relative z-10">
          {/* رأس البطاقة */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                <WalletIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">محفظتك الإلكترونية</h2>
                <p className="text-sm text-blue-100">متاحة لجميع العمليات</p>
              </div>
            </div>

            {/* زر الشحن */}
            {onTopUp && (
              <button
                onClick={onTopUp}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/30"
              >
                <PlusIcon className="h-5 w-5" />
                <span className="font-medium">شحن</span>
              </button>
            )}
          </div>

          {/* الرصيد الرئيسي */}
          <div className="mb-6 text-center">
            <div className="mb-2 text-sm text-blue-100">الرصيد المتاح</div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-5xl font-black tracking-tight text-white">
                {balance.toLocaleString('en-US')}
              </span>
              <div className="bg-white/20 px-3 py-1 rounded-lg text-lg font-bold text-white backdrop-blur-sm">
                د.ل
              </div>
            </div>
          </div>

          {/* معلومات إضافية */}
          <div className="flex items-center justify-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-300"></div>
              <span>آمن ومحمي</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-300"></div>
              <span>متاح 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات الاستخدام */}
      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
          يمكنك استخدام رصيدك في:
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="font-medium text-green-800">ترويج الإعلانات</div>
            <div className="mt-1 text-sm text-green-600">زيادة المشاهدات والوصول</div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <div className="font-medium text-blue-800">الباقات المميزة</div>
            <div className="mt-1 text-sm text-blue-600">اشتراكات وخدمات إضافية</div>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <svg
                className="h-5 w-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            </div>
            <div className="font-medium text-purple-800">خدمات إضافية</div>
            <div className="mt-1 text-sm text-purple-600">رسوم ومميزات خاصة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
