/**
 * صفحة الإعلانات المميزة
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/admin/marketplace?featured=true',
      permanent: false,
    },
  };
};

export default function FeaturedListingsPage() {
  return null;
}
