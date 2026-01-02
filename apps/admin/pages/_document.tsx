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
