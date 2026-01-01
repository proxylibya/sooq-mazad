/**
 * صفحة خدمات النقل غير النشطة
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin/transport?status=INACTIVE',
      permanent: false,
    },
  };
};

export default function InactiveTransportPage() {
  return null;
}
