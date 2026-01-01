import React from 'react';
import CheckCircleIcon from '@heroicons/react/24/outline/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import CameraIcon from '@heroicons/react/24/outline/CameraIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  active?: boolean;
}

interface VerificationStepsProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

const VerificationSteps: React.FC<VerificationStepsProps> = ({
  currentStep,
  steps,
  className = '',
}) => {
  const getStepStatus = (step: Step) => {
    if (step.completed) return 'completed';
    if (step.id === currentStep) return 'active';
    if (step.id < currentStep) return 'completed';
    return 'pending';
  };

  const getStepIcon = (step: Step) => {
    const status = getStepStatus(step);
    const IconComponent = step.icon;

    return (
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          status === 'completed'
            ? 'bg-green-100 text-green-600'
            : status === 'active'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-400'
        } `}
      >
        {status === 'completed' ? (
          <CheckCircleIcon className="h-6 w-6" />
        ) : (
          <IconComponent className="h-6 w-6" />
        )}
      </div>
    );
  };

  const getConnectorColor = (index: number) => {
    const currentStepObj = steps.find((s) => s.id === currentStep);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    if (index < currentIndex || (currentStepObj?.completed && index === currentIndex)) {
      return 'bg-green-300';
    }
    return 'bg-gray-200';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                {getStepIcon(step)}
                <div className="mt-3 max-w-32 text-center">
                  <div
                    className={`text-sm font-medium transition-colors ${
                      getStepStatus(step) === 'completed'
                        ? 'text-green-600'
                        : getStepStatus(step) === 'active'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="mt-1 text-xs leading-tight text-gray-500">{step.description}</div>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 flex-1 transition-colors ${getConnectorColor(index)} `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step);

            return (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  {index < steps.length - 1 && (
                    <div
                      className={`mt-2 h-12 w-0.5 transition-colors ${getConnectorColor(index)} `}
                    />
                  )}
                </div>

                <div className="flex-1 pb-4">
                  <div
                    className={`font-medium transition-colors ${
                      status === 'completed'
                        ? 'text-green-600'
                        : status === 'active'
                          ? 'text-blue-600'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">{step.description}</div>

                  {status === 'active' && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                      <ClockIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">الخطوة الحالية</span>
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">مكتملة</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// مكون لعرض تفاصيل الخطوة الحالية
interface StepDetailsProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export const StepDetails: React.FC<StepDetailsProps> = ({ currentStep, steps, className = '' }) => {
  const currentStepData = steps.find((step) => step.id === currentStep);

  if (!currentStepData) return null;

  const getStepInstructions = (stepId: number) => {
    switch (stepId) {
      case 1:
        return {
          title: 'اختيار نوع الوثيقة',
          instructions: [
            'اختر نوع الوثيقة التي تريد رفعها',
            'الهوية الوطنية مطلوبة للتحقق الأساسي',
            'يمكنك رفع وثائق إضافية لمستوى تحقق أعلى',
          ],
          tips: ['تأكد من صلاحية الوثيقة', 'الوثيقة يجب أن تكون واضحة وغير تالفة'],
        };
      case 2:
        return {
          title: 'رفع الوثائق',
          instructions: [
            'التقط صوراً واضحة للوثائق',
            'تأكد من ظهور جميع التفاصيل',
            'استخدم إضاءة جيدة وتجنب الانعكاسات',
          ],
          tips: [
            'حجم الملف الأقصى: 5 ميجابايت',
            'الأنواع المدعومة: JPG, PNG, PDF',
            'تجنب الصور الضبابية أو المقطوعة',
          ],
        };
      case 3:
        return {
          title: 'مراجعة البيانات',
          instructions: [
            'راجع جميع الوثائق المرفوعة',
            'تأكد من وضوح جميع النصوص',
            'تحقق من صحة المعلومات',
          ],
          tips: ['يمكنك حذف وإعادة رفع أي وثيقة', 'تأكد من مطابقة البيانات لهويتك الحقيقية'],
        };
      case 4:
        return {
          title: 'إرسال الطلب',
          instructions: ['راجع ملخص الطلب النهائي', 'اقرأ الشروط والأحكام', 'أرسل الطلب للمراجعة'],
          tips: ['وقت المراجعة: 24-48 ساعة', 'ستصلك رسالة عند اكتمال المراجعة'],
        };
      default:
        return null;
    }
  };

  const stepDetails = getStepInstructions(currentStep);

  if (!stepDetails) return null;

  return (
    <div className={`rounded-lg border border-blue-200 bg-blue-50 p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
          <ExclamationTriangleIcon className="h-5 w-5 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="mb-3 font-semibold text-blue-900">{stepDetails.title}</h3>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-medium text-blue-800">التعليمات:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {stepDetails.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-medium text-blue-800">نصائح مهمة:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                {stepDetails.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون لعرض ملخص التقدم
interface ProgressSummaryProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  className?: string;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  className = '',
}) => {
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={`rounded-lg border bg-white p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">تقدم التحقق</h3>
        <span className="text-sm text-gray-500">
          {completedSteps} من {totalSteps}
        </span>
      </div>

      <div className="mb-3 h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">الخطوة الحالية: {currentStep}</span>
        <span className="font-medium text-blue-600">{Math.round(progressPercentage)}% مكتمل</span>
      </div>
    </div>
  );
};

export default VerificationSteps;
