import RTLIcon from '../common/icons/RTLIcon';
import { useRouter } from 'next/router';

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  text?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  href,
  onClick,
  text = 'العودة',
  className = '',
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      aria-label="رجوع"
      onClick={handleClick}
      className={`no-flip-icon inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm ${className}`}
    >
      <RTLIcon name="back" className="h-4 w-4" />
      <span>{text}</span>
    </button>
  );
};

export default BackButton;
