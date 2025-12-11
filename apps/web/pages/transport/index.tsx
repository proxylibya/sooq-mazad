/**
 * ???? ????? ????? - ???? ????? ?? ???? ??????
 * Transport Services - Redirect to Browse Page
 */
import { GetServerSideProps } from 'next';

export default function TransportPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/transport/browse',
      permanent: true,
    },
  };
};
