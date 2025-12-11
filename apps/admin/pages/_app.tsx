import type { AppProps } from 'next/app';
import '../styles/globals.css';

function AdminApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

AdminApp.getInitialProps = async () => {
  return { pageProps: {} };
};

export default AdminApp;
