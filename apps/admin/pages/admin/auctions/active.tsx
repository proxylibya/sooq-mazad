/**
 * صفحة المزادات النشطة - تحويل للصفحة الجديدة
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin/auctions/live',
      permanent: true,
    },
  };
};

export default function ActiveAuctionsPage() {
  return null;
}
