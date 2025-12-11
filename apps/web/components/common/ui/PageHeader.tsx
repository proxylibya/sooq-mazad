import React from 'react';
import { useRouter } from 'next/router';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProjectLogo from '../ProjectLogo';

interface PageHeaderProps {
  /** عنوان الصفحة */
  title?: string;
  /** وصف الصفحة */
  description?: string;
  /** عرض زر الرجوع */
  showBackButton?: boolean;
  /** رابط الرجوع المخصص */
  backHref?: string;
  /** نص زر الرجوع */
  backText?: string;
  /** عرض الشعار */
  showLogo?: boolean;
  /** رابط الشعار */
  logoHref?: string;
  /** نص الشعار */
  logoText?: string;
  /** أيقونة أو صورة الشعار */
  logoSrc?: string;
  /** محتوى إضافي في اليسار */
  rightContent?: React.ReactNode;
  /** فئات CSS إضافية */
  className?: string;
  /** لون خلفية الهيدر */
  variant?: 'white' | 'gray' | 'transparent';
}

/**
 * مكون Header موحد للصفحات
 * يحتوي على شعار قابل للنقر وزر رجوع محسّن
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = false,
  backHref,
  backText = 'رجوع',
  showLogo = true,
  logoHref = '/',
  rightContent,
  className = '',
  variant = 'white',
}) => {
  const router = useRouter();

  // أنماط الخلفية المختلفة
  const variantStyles = {
    white: 'bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm',
    gray: 'bg-gray-50 border-b border-gray-200',
    transparent: 'bg-transparent',
  };

  // دالة الرجوع
  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className={`sticky top-0 z-10 px-6 py-5 ${variantStyles[variant]} ${className}`}>
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* زر الرجوع */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-50 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="button"
            aria-label={backText}
            title={backText}
          >
            <ArrowRightIcon className="h-5 w-5 text-gray-700 transition-colors duration-200 group-hover:text-blue-600" />
          </button>
        )}

        {/* الشعار */}
        {showLogo && <ProjectLogo size="md" showText={true} linkTo={logoHref} />}

        {/* عنوان الصفحة */}
        {title && !showLogo && (
          <div className="flex-1 text-center">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
        )}

        {/* محتوى إضافي */}
        {rightContent && <div className="flex items-center">{rightContent}</div>}

        {/* placeholder للمحاذاة */}
        {showBackButton && !rightContent && <div className="h-10 w-10" />}
      </div>
    </div>
  );
};

export default PageHeader;

// مكونات جاهزة للاستخدامات الشائعة
export const SimplePageHeader: React.FC<{
  title: string;
  showBackButton?: boolean;
  backHref?: string;
}> = ({ title, showBackButton = true, backHref }) => (
  <PageHeader
    title={title}
    showBackButton={showBackButton}
    {...(backHref && { backHref })}
    showLogo={false}
  />
);

export const LogoPageHeader: React.FC<{
  showBackButton?: boolean;
  backHref?: string;
  logoHref?: string;
}> = ({ showBackButton = false, backHref, logoHref = '/' }) => (
  <PageHeader
    showBackButton={showBackButton}
    {...(backHref && { backHref })}
    showLogo={true}
    logoHref={logoHref}
  />
);
