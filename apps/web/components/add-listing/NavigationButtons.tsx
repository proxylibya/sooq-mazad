import React from 'react';
import { BackIcon, ForwardIcon } from '../common/icons/RTLIcon';

interface NavigationButtonsProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  canContinue?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  showBack?: boolean;
  nextIcon?: React.ReactNode;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onNext,
  nextLabel = 'متابعة',
  backLabel = 'السابق',
  canContinue = true,
  isLoading = false,
  loadingLabel = 'جاري المعالجة...',
  showBack = true,
  nextIcon,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* زر السابق */}
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md active:scale-95"
            >
              <BackIcon className="h-5 w-5" />
              <span>{backLabel}</span>
            </button>
          ) : (
            <div /> // Spacer
          )}

          {/* زر المتابعة */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canContinue || isLoading}
            className={`flex items-center gap-2 rounded-xl px-8 py-3 font-medium transition-all duration-200 ${
              canContinue && !isLoading
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95'
                : 'cursor-not-allowed bg-gray-200 text-gray-400'
            }`}
          >
            {isLoading ? (
              <>
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                  role="status"
                  aria-label="جاري التحميل"
                />
                <span>{loadingLabel}</span>
              </>
            ) : (
              <>
                <span>{nextLabel}</span>
                {nextIcon || <ForwardIcon className="h-5 w-5" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;
