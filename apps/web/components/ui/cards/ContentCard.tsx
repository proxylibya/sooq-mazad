import React from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';

export interface ContentCardProps extends Omit<BaseCardProps, 'children'> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'left' | 'right';
  };
}

/**
 * مكون موحد لبطاقات المحتوى
 * يستبدل: ShowroomCard, FavoriteCard, MarketplaceCard
 */
export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  children,
  header,
  footer,
  actions,
  image,
  ...baseProps
}) => {
  return (
    <BaseCard {...baseProps}>
      {/* Header مخصص */}
      {header && <div className="mb-4">{header}</div>}

      {/* الصورة */}
      {image && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={image.src}
            alt={image.alt}
            className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* العنوان */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}

      {/* المحتوى */}
      <div className="flex-1">{children}</div>

      {/* الإجراءات */}
      {actions && <div className="mt-4 flex items-center justify-end gap-2">{actions}</div>}

      {/* Footer مخصص */}
      {footer && <div className="mt-4 border-t pt-4">{footer}</div>}
    </BaseCard>
  );
};

export default ContentCard;
