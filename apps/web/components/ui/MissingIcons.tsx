import React from 'react';

// خريطة أيقونات مفقودة/مخصصة بتوافق نمط Heroicons (stroke=currentColor)
// استخدام: <CarIcon className="h-4 w-4" />
export const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className={className}
    {...props}
  >
    {/* هيكل سيارة بسيط مع عجلات، بأسلوب خطوط متوافقة */}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 13l2.1-5.25A2 2 0 0 1 7.99 6h8.02a2 2 0 0 1 1.89 1.75L20 13m-16 0h16M8.5 16.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
    />
  </svg>
);

export const ForwardIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className={className}
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export const FuelIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    aria-hidden="true"
    data-slot="icon"
    className={className}
    {...props}
  >
    {/* مضخة وقود مبسطة */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l2.5-2.5a1.5 1.5 0 0 1 2.5 1.06V14a2 2 0 0 1-2 2h-1" />
  </svg>
);
