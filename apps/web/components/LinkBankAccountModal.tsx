import React, { useState, useRef, useEffect } from 'react';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import BuildingLibraryIcon from '@heroicons/react/24/outline/BuildingLibraryIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import { libyanBanks, LibyanBank, getBanksByPopularity } from '../data/libyan-banks';

interface LinkBankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: any) => void;
  preSelectedBank?: LibyanBank;
}

interface FormData {
  bankId: string;
  accountNumber: string;
  accountHolderName: string;
  iban: string;
  isDefault: boolean;
}

interface FormErrors {
  bankId?: string;
  accountNumber?: string;
  accountHolderName?: string;
  iban?: string;
}

// مكون القائمة المنسدلة القابلة للبحث
interface SearchableBankSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  banks: LibyanBank[];
}

const SearchableBankSelect: React.FC<SearchableBankSelectProps> = ({
  value,
  onChange,
  error,
  banks,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBanks, setFilteredBanks] = useState<LibyanBank[]>(banks);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedBank = banks.find((bank) => bank.id === value);

  // فلترة البنوك حسب البحث
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(
        (bank) =>
          bank.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.nameEn.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredBanks(filtered);
    }
  }, [searchTerm, banks]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تركيز على حقل البحث عند فتح القائمة
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleBankSelect = (bank: LibyanBank) => {
    onChange(bank.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* زر فتح القائمة */}
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-right focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''}`}
        dir="rtl"
      >
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
        <span className={selectedBank ? 'text-gray-900' : 'text-gray-500'}>
          {selectedBank ? selectedBank.nameAr : 'اختر البنك'}
        </span>
      </button>

      {/* القائمة المنسدلة */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-300 bg-white shadow-lg">
          {/* حقل البحث */}
          <div className="border-b border-gray-200 p-3">
            <div className="relative" dir="rtl">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن البنك..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-4 pr-10 text-right text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          {/* قائمة البنوك */}
          <div className="max-h-48 overflow-y-auto">
            {filteredBanks.length > 0 ? (
              filteredBanks.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => handleBankSelect(bank)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-gray-50 ${
                    value === bank.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                  dir="rtl"
                >
                  {value === bank.id && (
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
                  )}
                  <div className="flex-1 text-right">
                    <p className="font-medium">{bank.nameAr}</p>
                    <p className="text-xs text-gray-500">{bank.headquarters}</p>
                  </div>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500">
                <MagnifyingGlassIcon className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p>لا توجد نتائج للبحث "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LinkBankAccountModal: React.FC<LinkBankAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preSelectedBank,
}) => {
  const [formData, setFormData] = useState<FormData>({
    bankId: preSelectedBank?.id || '',
    accountNumber: '',
    accountHolderName: '',
    iban: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ترتيب البنوك حسب الشهرة
  const sortedBanks = getBanksByPopularity();

  // التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.bankId) {
      newErrors.bankId = 'يرجى اختيار البنك';
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = 'رقم الحساب مطلوب';
    } else if (!/^\d{10,20}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'رقم الحساب يجب أن يكون من 10 إلى 20 رقم';
    }

    if (!formData.accountHolderName) {
      newErrors.accountHolderName = 'اسم صاحب الحساب مطلوب';
    } else if (formData.accountHolderName.length < 3) {
      newErrors.accountHolderName = 'اسم صاحب الحساب يجب أن يكون 3 أحرف على الأقل';
    }

    if (formData.iban && !/^LY\d{23}$/.test(formData.iban.replace(/\s/g, '').toUpperCase())) {
      newErrors.iban = 'رقم IBAN غير صحيح (يجب أن يبدأ بـ LY ويحتوي على 25 رقم)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // إرسال البيانات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const selectedBank = sortedBanks.find((bank) => bank.id === formData.bankId);

      const response = await fetch('/api/wallet/linked-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankId: formData.bankId,
          bankName: selectedBank?.nameAr || '',
          accountNumber: formData.accountNumber,
          accountHolderName: formData.accountHolderName,
          iban: formData.iban || undefined,
          isDefault: formData.isDefault,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess(data.account);
          handleClose();
        }, 1500);
      } else {
        setErrors({ bankId: data.message });
      }
    } catch (error) {
      console.error('Error linking account:', error);
      setErrors({ bankId: 'حدث خطأ أثناء ربط الحساب' });
    } finally {
      setIsLoading(false);
    }
  };

  // إغلاق النافذة وإعادة تعيين البيانات
  const handleClose = () => {
    setFormData({
      bankId: preSelectedBank?.id || '',
      accountNumber: '',
      accountHolderName: '',
      iban: '',
      isDefault: false,
    });
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  // تنسيق رقم الحساب
  const formatAccountNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // تنسيق IBAN
  const formatIBAN = (value: string) => {
    const clean = value.replace(/\s/g, '').toUpperCase();
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white">
        {/* رأس النافذة */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ربط حساب بنكي</h2>
              <p className="text-sm text-gray-600">أضف حساب بنكي جديد لمحفظتك</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* محتوى النافذة */}
        <div className="p-6">
          {showSuccess ? (
            // رسالة النجاح
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">تم ربط الحساب بنجاح!</h3>
              <p className="text-gray-600">سيتم إعادة توجيهك إلى صفحة المحفظة</p>
            </div>
          ) : (
            // نموذج ربط الحساب
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* اختيار البنك */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">البنك *</label>
                {preSelectedBank ? (
                  <div className="flex w-full items-center gap-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <BuildingLibraryIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{preSelectedBank.nameAr}</p>
                      <p className="text-sm text-gray-600">{preSelectedBank.headquarters}</p>
                    </div>
                  </div>
                ) : (
                  <SearchableBankSelect
                    value={formData.bankId}
                    onChange={(value) => setFormData({ ...formData, bankId: value })}
                    error={errors.bankId}
                    banks={sortedBanks}
                  />
                )}
                {errors.bankId && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.bankId}
                  </p>
                )}
              </div>

              {/* رقم الحساب */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">رقم الحساب *</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatAccountNumber(formData.accountNumber)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value.replace(/\s/g, ''),
                      })
                    }
                    placeholder="1234 5678 9012 3456"
                    className={`w-full rounded-xl border py-3 pl-4 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={23} // 20 أرقام + 3 مسافات
                  />
                </div>
                {errors.accountNumber && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.accountNumber}
                  </p>
                )}
              </div>

              {/* اسم صاحب الحساب */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  اسم صاحب الحساب *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountHolderName: e.target.value,
                      })
                    }
                    placeholder="أحمد محمد علي"
                    className={`w-full rounded-xl border py-3 pl-4 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.accountHolderName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.accountHolderName && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.accountHolderName}
                  </p>
                )}
              </div>

              {/* رقم IBAN */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  رقم IBAN (اختياري)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatIBAN(formData.iban)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        iban: e.target.value.replace(/\s/g, ''),
                      })
                    }
                    placeholder="LY21 0010 0000 0000 0000 0000 123"
                    className={`w-full rounded-xl border py-3 pl-4 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
                      errors.iban ? 'border-red-300' : 'border-gray-300'
                    }`}
                    maxLength={29} // 25 رقم + 4 مسافات
                  />
                </div>
                {errors.iban && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors.iban}
                  </p>
                )}
              </div>

              {/* جعل الحساب افتراضي */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  جعل هذا الحساب افتراضي للإيداع
                </label>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'جاري الربط...' : 'ربط الحساب'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkBankAccountModal;
