import '@/styles/globals.css';
import type { AppProps } from 'next/app';

// الخط محمّل مركزياً من _document.tsx
// لا حاجة لـ next/font/google - يتم تحميل Cairo من Google Fonts مباشرة

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
