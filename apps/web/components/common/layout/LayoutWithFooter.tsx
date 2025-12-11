import React from 'react';
import Head from 'next/head';
import OpensooqNavbar from './OpensooqNavbar';
import AdvancedFooter from '../Footer/AdvancedFooter';

interface LayoutWithFooterProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  className?: string;
  showFooter?: boolean;
}

const LayoutWithFooter: React.FC<LayoutWithFooterProps> = ({
  children,
  title = 'سوق مزاد - أفضل موقع لبيع وشراء السيارات',
  description = 'أكبر منصة لبيع وشراء السيارات في ليبيا. نوفر خدمات المزادات والسوق الفوري مع ضمان الأمان والشفافية',
  keywords = 'مزاد سيارات, سيارات للبيع, سيارات ليبيا, مزادات السيارات, سوق السيارات, شراء سيارة, بيع سيارة',
  className = '',
  showFooter = true,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="سوق مزاد" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_LY" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://sooqmazad.ly" />
      </Head>

      <div className={`min-h-screen bg-gray-50 ${className}`} dir="rtl">
        <OpensooqNavbar />

        <main className="flex-1">{children}</main>

        {showFooter && <AdvancedFooter />}
      </div>
    </>
  );
};

export default LayoutWithFooter;
