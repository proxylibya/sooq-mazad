import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  VerificationStatus,
  UserVerificationStatus,
  VerificationLevel,
} from '../types/verification';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import XCircleIcon from '@heroicons/react/24/outline/XCircleIcon';
import DocumentCheckIcon from '@heroicons/react/24/outline/DocumentCheckIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import StarIcon from '@heroicons/react/24/outline/StarIcon';

interface VerificationStatusProps {
  userId: string;
  showDetails?: boolean;
}

const VerificationStatusComponent: React.FC<VerificationStatusProps> = ({
  userId,
  showDetails = false,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<UserVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, [userId]);

  const fetchVerificationStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/verification-status?userId=${userId}`);

      if (!response.ok) {
        throw new Error('فشل في الحصول على حالة التحقق');
      }

      const data = await response.json();
      setVerificationStatus(data.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ غير معروف');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case VerificationStatus.REJECTED:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case VerificationStatus.EXPIRED:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case VerificationStatus.PENDING:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentCheckIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'موثق';
      case VerificationStatus.REJECTED:
        return 'مرفوض';
      case VerificationStatus.EXPIRED:
        return 'منتهي الصلاحية';
      case VerificationStatus.PENDING:
        return 'معلق';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'text-green-600 bg-green-50 border-green-200';
      case VerificationStatus.REJECTED:
        return 'text-red-600 bg-red-50 border-red-200';
      case VerificationStatus.EXPIRED:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case VerificationStatus.PENDING:
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getLevelIcon = (level: VerificationLevel) => {
    switch (level) {
      case VerificationLevel.PREMIUM:
        return <StarIcon className="h-5 w-5 text-yellow-500" />;
      case VerificationLevel.STANDARD:
        return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
      case VerificationLevel.BASIC:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <DocumentCheckIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getLevelText = (level: VerificationLevel) => {
    switch (level) {
      case VerificationLevel.PREMIUM:
        return 'مميز';
      case VerificationLevel.STANDARD:
        return 'قياسي';
      case VerificationLevel.BASIC:
        return 'أساسي';
      default:
        return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-8 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="ml-3 mt-0.5 h-5 w-5 text-red-400" />
          <div>
            <h3 className="text-sm font-medium text-red-800">خطأ في تحميل حالة التحقق</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={fetchVerificationStatus}
              className="mt-2 text-sm text-red-600 underline hover:text-red-500"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!verificationStatus) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">حالة التحقق من الهوية</h3>
        {!verificationStatus.isVerified && (
          <Link
            href="/verify-identity"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            بدء التحقق
          </Link>
        )}
      </div>

      {/* Overall Status */}
      <div className="mb-4 flex items-center space-x-3 space-x-reverse">
        <div className="flex items-center">
          {getLevelIcon(verificationStatus.verificationLevel)}
          <span className="mr-2 font-medium text-gray-900">
            مستوى التحقق: {getLevelText(verificationStatus.verificationLevel)}
          </span>
        </div>
        {verificationStatus.isVerified && (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="ml-1 h-5 w-5" />
            <span className="text-sm font-medium">حساب موثق</span>
          </div>
        )}
      </div>

      {/* Verified Documents */}
      {verificationStatus.verifiedDocuments.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-900">الوثائق الموثقة:</h4>
          <div className="flex flex-wrap gap-2">
            {verificationStatus.verifiedDocuments.map((docType) => (
              <span
                key={docType}
                className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
              >
                <CheckCircleIcon className="ml-1 h-3 w-3" />
                {docType === 'passport' && 'جواز السفر'}
                {docType === 'national_id' && 'البطاقة الشخصية'}
                {docType === 'driving_license' && 'رخصة القيادة'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Verification History */}
      {showDetails && verificationStatus.verificationHistory.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="mb-3 text-sm font-medium text-gray-900">سجل التحقق الأخير:</h4>
          <div className="space-y-3">
            {verificationStatus.verificationHistory.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  {getStatusIcon(request.status)}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {request.documentType === 'passport' && 'جواز السفر'}
                      {request.documentType === 'national_id' && 'البطاقة الشخصية'}
                      {request.documentType === 'driving_license' && 'رخصة القيادة'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(request.submittedAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(request.status)}`}
                >
                  {getStatusText(request.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      {!verificationStatus.isVerified && verificationStatus.verificationHistory.length === 0 && (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex">
            <DocumentCheckIcon className="ml-3 mt-0.5 h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">قم بتوثيق حسابك</h3>
              <p className="mt-1 text-sm text-blue-700">
                احصل على مزيد من الثقة والأمان من خلال توثيق هويتك
              </p>
              <Link
                href="/verify-identity"
                className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                بدء التحقق الآن
                <DocumentCheckIcon className="mr-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      {!verificationStatus.isVerified && (
        <div className="mt-4 text-xs text-gray-500">
          <p className="mb-1 font-medium">مزايا التحقق من الهوية:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>زيادة الثقة مع المشترين والبائعين</li>
            <li>أولوية في عرض الإعلانات</li>
            <li>إمكانية المشاركة في المزادات المميزة</li>
            <li>حماية أكبر من الاحتيال</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationStatusComponent;
