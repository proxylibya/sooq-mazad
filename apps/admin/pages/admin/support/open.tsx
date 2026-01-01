/**
 * صفحة التذاكر المفتوحة
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin/support/tickets?status=open',
      permanent: false,
    },
  };
};

export default function OpenTicketsPage() {
  return null;
}
