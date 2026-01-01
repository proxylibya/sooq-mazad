import React from 'react';

/**
 * قالب footer محسن ليحل محل النص القديم المتكرر
 * النص القديم كان:
 * <div class="mt-8 border-t border-gray-700 pt-8">
 *   <div class="country-footer-info mb-4">
 *     <div class="flex items-center justify-between">
 *       <div class="flex items-center gap-2">
 *         <span>ليبيا</span>
 *         <span class="text-sm font-medium">ليبيا</span>  // نص متكرر - تم إصلاحه
 *       </div>
 *       <div class="text-sm text-gray-600">سيتم تحديثه</div>  // نص غير واضح - تم تحسينه
 *     </div>
 *   </div>
 *   <div class="text-center text-gray-300">
 *     <p>© 2024 موقع مزاد السيارات. جميع الحقوق محفوظة.</p>  // تم تحسينه
 *   </div>
 * </div>
 */

interface FooterTemplateProps {
  showCountryInfo?: boolean;
  showCopyright?: boolean;
  className?: string;
  customCountryText?: string;
  customStatusText?: string;
}

const FooterTemplate: React.FC<FooterTemplateProps> = ({
  showCountryInfo = true,
  showCopyright = true,
  className = '',
  customCountryText = 'ليبيا',
  customStatusText = 'قريباً على الإنترنت',
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={`mt-8 border-t border-gray-700 pt-8 ${className}`}>
      {showCountryInfo && (
        <div className="country-footer-info mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* إزالة النص المتكرر - أصبح نص واحد فقط */}
              <span className="text-sm font-medium text-gray-300">{customCountryText}</span>
            </div>
            <div className="text-sm text-gray-400">
              {/* تحسين النص من "سيتم تحديثه" إلى نص أكثر وضوحاً */}
              {customStatusText}
            </div>
          </div>
        </div>
      )}

      {showCopyright && (
        <div className="text-center text-gray-300">
          {/* تحسين نص حقوق النشر */}
          <p>© {currentYear} سوق مزاد. جميع الحقوق محفوظة.</p>
        </div>
      )}
    </div>
  );
};

export default FooterTemplate;
