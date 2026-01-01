import { UserIcon } from '@heroicons/react/24/outline';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { quickDecodeName } from '../utils/universalNameDecoder';

interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  profileImage?: string;
  verified: boolean;
  accountType: string;
}

interface StartConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartConversation: (userId: string, userName: string) => void;
  currentUserId: string;
}

const StartConversationModal: React.FC<StartConversationModalProps> = ({
  isOpen,
  onClose,
  onStartConversation,
  currentUserId,
}) => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // البحث عن المستخدمين
  const searchUsers = async (term: string) => {
    if (!term.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = getToken();
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(term)}&exclude=${currentUserId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
      } else {
        setError(data.error || 'فشل في البحث عن المستخدمين');
      }
    } catch (_) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // تأثير البحث مع تأخير
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // بدء محادثة جديدة
  const handleStartConversation = async (user: User) => {
    try {
      setLoading(true);
      setError('');

      const token = getToken();
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          userId1: currentUserId,
          userId2: user.id,
          otherUserId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onStartConversation(user.id, user.name);
        onClose();
      } else {
        setError(data.error || 'فشل في إنشاء المحادثة');
      }
    } catch (_) {
      setError('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* رأس النافذة */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">بدء محادثة جديدة</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* مربع البحث */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن مستخدم بالاسم أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            dir="rtl"
          />
        </div>

        {/* رسالة خطأ */}
        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* قائمة المستخدمين */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="animate-spin rounded-full border-4 border-white border-t-blue-600 shadow-lg"
                style={{ width: 24, height: 24 }}
                role="status"
                aria-label="جاري التحميل"
              />
              <span className="mr-2 text-sm text-gray-600">جاري البحث...</span>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartConversation(user)}
                  className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray-50"
                >
                  {/* صورة المستخدم */}
                  <div className="ml-3 flex-shrink-0">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={quickDecodeName(user.name)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* معلومات المستخدم */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">
                        {quickDecodeName(user.name)}
                      </h4>
                      {user.verified && (
                        <div className="mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                          <svg
                            className="h-2.5 w-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {user.accountType === 'DEALER'
                        ? 'تاجر'
                        : user.accountType === 'TRANSPORT'
                          ? 'شركة نقل'
                          : 'مستخدم عادي'}
                    </p>
                    {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                  </div>

                  {/* سهم */}
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm.trim() ? (
            <div className="py-8 text-center">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">لم يتم العثور على مستخدمين</p>
              <p className="text-xs text-gray-400">جرب البحث بكلمات مختلفة</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">ابدأ بكتابة اسم أو رقم هاتف</p>
              <p className="text-xs text-gray-400">للبحث عن المستخدمين</p>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartConversationModal;
