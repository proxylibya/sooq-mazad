/**
 * 📞 CallButtons Component
 * أزرار بدء المكالمات الصوتية والفيديو
 */

interface CallButtonsProps {
  onVoiceCall: () => void;
  onVideoCall: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'header';
}

export function CallButtons({
  onVoiceCall,
  onVideoCall,
  disabled = false,
  size = 'md',
  variant = 'default',
}: CallButtonsProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonClass = sizeClasses[size];
  const iconClass = iconSizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-1">
        {/* مكالمة صوتية */}
        <button
          onClick={onVoiceCall}
          disabled={disabled}
          className={`${buttonClass} flex items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50`}
          title="مكالمة صوتية"
        >
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>

        {/* مكالمة فيديو */}
        <button
          onClick={onVideoCall}
          disabled={disabled}
          className={`${buttonClass} flex items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50`}
          title="مكالمة فيديو"
        >
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2">
        {/* مكالمة صوتية */}
        <button
          onClick={onVoiceCall}
          disabled={disabled}
          className={`${buttonClass} flex items-center justify-center rounded-full bg-green-50 text-green-600 transition-all hover:scale-105 hover:bg-green-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
          title="مكالمة صوتية"
        >
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>

        {/* مكالمة فيديو */}
        <button
          onClick={onVideoCall}
          disabled={disabled}
          className={`${buttonClass} flex items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-all hover:scale-105 hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
          title="مكالمة فيديو"
        >
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-3">
      {/* مكالمة صوتية */}
      <button
        onClick={onVoiceCall}
        disabled={disabled}
        className={`${buttonClass} flex items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-all hover:scale-105 hover:bg-green-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
        title="مكالمة صوتية"
      >
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      </button>

      {/* مكالمة فيديو */}
      <button
        onClick={onVideoCall}
        disabled={disabled}
        className={`${buttonClass} flex items-center justify-center rounded-full bg-blue-500 text-white shadow-md transition-all hover:scale-105 hover:bg-blue-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
        title="مكالمة فيديو"
      >
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
    </div>
  );
}

export default CallButtons;
