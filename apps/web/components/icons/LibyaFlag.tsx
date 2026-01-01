import React from 'react';

interface LibyaFlagProps {
  className?: string;
}

const LibyaFlag: React.FC<LibyaFlagProps> = ({ className = 'w-6 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="علم ليبيا"
  >
    {/* الشريط الأحمر العلوي */}
    <rect width="24" height="5.33" fill="#E53E3E" />

    {/* الشريط الأسود الأوسط */}
    <rect y="5.33" width="24" height="5.33" fill="#000000" />

    {/* الشريط الأخضر السفلي */}
    <rect y="10.67" width="24" height="5.33" fill="#38A169" />

    {/* الهلال والنجمة */}
    <g transform="translate(12, 8)">
      {/* النجمة */}
      <path
        d="M-2 -3 L-0.6 -1.2 L2 -1 L0.4 0.6 L1 3 L-1 1.8 L-3 3 L-2.4 0.6 L-4 -1 L-1.4 -1.2 Z"
        fill="white"
      />
      {/* الهلال */}
      <circle cx="1.5" cy="0" r="1.8" stroke="white" strokeWidth="0.4" fill="none" />
      <circle cx="2.2" cy="0" r="1.4" fill="#000000" />
    </g>
  </svg>
);

export default LibyaFlag;
