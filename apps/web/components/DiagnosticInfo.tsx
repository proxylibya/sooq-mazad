import React from 'react';

interface DiagnosticInfoProps {
  /** معلومات التشخيص الأساسية */
  basicInfo?: Record<string, any>;
  /** معلومات تشخيصية مفصلة */
  detailedInfo?: Record<string, any>;
  /** نصائح وتعليمات */
  tips?: string[];
  /** خطوات التشخيص */
  steps?: string[];
  /** إظهار المكون فقط في بيئة التطوير */
  developmentOnly?: boolean;
  /** عنوان مخصص للمكون */
  title?: string;
  /** كلاس CSS إضافي */
  className?: string;
}

/**
 * مكون لعرض معلومات التشخيص والنصائح في أسفل الصفحة
 * يتم عرضه بشكل افتراضي فقط في بيئة التطوير
 */
export const DiagnosticInfo: React.FC<DiagnosticInfoProps> = ({
  basicInfo,
  detailedInfo,
  tips,
  steps,
  developmentOnly = true,
  title = 'معلومات التشخيص',
  className = '',
}) => {
  // إخفاء المكون في الإنتاج إذا كان developmentOnly = true
  if (developmentOnly && process.env.NODE_ENV === 'production') {
    return null;
  }

  // إذا لم تكن هناك معلومات للعرض، لا تعرض المكون
  if (!basicInfo && !detailedInfo && !tips && !steps) {
    return null;
  }

  return (
    <div className={`mt-8 space-y-4 ${className}`}>
      {/* معلومات التشخيص الأساسية */}
      {basicInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 font-medium text-blue-800">{title}</h4>
          <div className="space-y-1 text-sm text-blue-700">
            {Object.entries(basicInfo).map(([key, value]) => (
              <p key={key}>
                {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* معلومات تشخيصية مفصلة */}
      {detailedInfo && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 font-medium text-green-800">تشخيص مفصل</h4>
          <div className="space-y-2 text-sm text-green-700">
            {Object.entries(detailedInfo).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span>
                <div className="mt-1 rounded bg-white p-2 text-xs">
                  <pre className="whitespace-pre-wrap">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* النصائح والتعليمات */}
      {tips && tips.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="mb-2 font-medium text-yellow-800">نصائح وتعليمات</h4>
          <ul className="space-y-1 text-sm text-yellow-700">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* خطوات التشخيص */}
      {steps && steps.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h4 className="mb-2 font-medium text-purple-800">خطوات التشخيص</h4>
          <ol className="space-y-1 text-sm text-purple-700">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-bold text-purple-600">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

/**
 * مكون مبسط لعرض معلومات التشخيص الأساسية فقط
 */
export const BasicDiagnosticInfo: React.FC<{
  info: Record<string, any>;
  title?: string;
  className?: string;
}> = ({ info, title = 'معلومات التشخيص', className = '' }) => {
  return (
    <DiagnosticInfo basicInfo={info} title={title} className={className} developmentOnly={true} />
  );
};

/**
 * مكون لعرض النصائح والتعليمات فقط
 */
export const TipsAndInstructions: React.FC<{
  tips?: string[];
  steps?: string[];
  className?: string;
}> = ({ tips, steps, className = '' }) => {
  return (
    <DiagnosticInfo
      tips={tips}
      steps={steps}
      className={className}
      developmentOnly={false} // النصائح يمكن عرضها في الإنتاج
    />
  );
};

export default DiagnosticInfo;
