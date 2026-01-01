import React from 'react';
import NextLink from 'next/link';

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * مكون Link محسن يتوافق مع Next.js 13+
 * يحل مشكلة "Invalid <Link> with <a> child"
 */
const Link: React.FC<LinkProps> = ({ href, children, className, target, rel, onClick }) => {
  // إذا كان الرابط خارجي، استخدم عنصر <a> عادي
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a href={href} className={className} target={target} rel={rel} onClick={onClick}>
        {children}
      </a>
    );
  }

  // للروابط الداخلية، استخدم Next.js Link بدون عنصر <a>
  return (
    <NextLink href={href} className={className} target={target} rel={rel} onClick={onClick}>
      {children}
    </NextLink>
  );
};

export default Link;
