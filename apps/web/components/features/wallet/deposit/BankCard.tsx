import Link from 'next/link';
import BankLogo from './BankLogo';

interface BankCardProps {
  bankName: string;
  bankInfo: {
    color: string;
    bgColor: string;
    description?: string;
  };
  href?: string;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  asLink?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function BankCard({
  bankName,
  bankInfo,
  href,
  size = 'medium',
  showDescription = false,
  asLink = true,
  onClick,
  className = '',
}: BankCardProps) {
  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'w-10 h-10',
      iconText: 'text-lg',
      iconImage: 'w-6 h-6',
      title: 'text-xs',
      description: 'text-xs',
    },
    medium: {
      container: 'p-4',
      icon: 'w-14 h-14',
      iconText: 'text-2xl',
      iconImage: 'w-10 h-10',
      title: 'text-sm',
      description: 'text-xs',
    },
    large: {
      container: 'p-6',
      icon: 'w-16 h-16',
      iconText: 'text-3xl',
      iconImage: 'w-12 h-12',
      title: 'text-base',
      description: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  const cardContent = (
    <>
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* الشعار الاحترافي الموحد */}
        <div className="flex items-center justify-center">
          <BankLogo
            bankName={bankName}
            size={size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium'}
          />
        </div>

        {/* اسم البنك */}
        {size !== 'small' && (
          <div className="text-center">
            <h5 className={`${classes.title} font-bold ${bankInfo.color} mb-1 leading-tight`}>
              {bankName}
            </h5>

            {showDescription && bankInfo.description && (
              <p className={`${classes.description} ${bankInfo.color} leading-relaxed opacity-90`}>
                {bankInfo.description}
              </p>
            )}

            <div className="mt-2 flex items-center justify-center gap-1">
              <div className={`h-1 w-1 rounded-full bg-current opacity-70`}></div>
              <span className={`text-xs ${bankInfo.color} opacity-90`}>متاح</span>
              <div className={`h-1 w-1 rounded-full bg-current opacity-70`}></div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const baseClasses = `group rounded-2xl ${bankInfo.bgColor} border-2 ${classes.container} hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-center relative overflow-hidden ${className}`;

  if (asLink && href) {
    return (
      <Link href={href} className={`block ${baseClasses}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={`${baseClasses} ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {cardContent}
    </div>
  );
}
