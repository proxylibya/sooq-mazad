import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class AdminDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          {/* Performance: Preconnect & DNS prefetch for fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />
          <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

          {/* Preload خط Cairo لمنع تغير الخط المفاجئ */}
          <link
            rel="preload"
            href="https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjQzAMbHNpOw.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* تحميل خط Cairo */}
          <link
            href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;900&display=block"
            rel="stylesheet"
          />

          {/* إخفاء المحتوى حتى يتم تحميل الخط */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @font-face {
              font-family: 'Cairo';
              font-display: block;
            }
          `,
            }}
          />

          {/* SEO: Basic meta tags */}
          <meta charSet="utf-8" />
        </Head>
        <body className="dark">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default AdminDocument;
