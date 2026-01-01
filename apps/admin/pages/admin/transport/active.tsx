/**
 * صفحة خدمات النقل النشطة
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin/transport?status=ACTIVE',
      permanent: false,
    },
  };
};

export default function ActiveTransportPage() {
  return null;
}
