import React from 'react';

export interface GridCardProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  responsive?: boolean;
}

/**
 * مكون موحد لشبكات البطاقات
 * يستبدل: ShowroomCardGrid, MarketplaceCarCardGrid, AuctionCardGrid
 */
export const GridCard: React.FC<GridCardProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className = '',
  responsive = true,
}) => {
  const gapStyles = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  const gridClassName = responsive ? columnStyles[columns] : `grid-cols-${columns}`;

  return <div className={`grid ${gridClassName} ${gapStyles[gap]} ${className}`}>{children}</div>;
};

export default GridCard;
