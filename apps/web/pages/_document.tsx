import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ar" dir="rtl">
        <Head>
          {/* Performance: Preconnect & DNS prefetch for fonts and CDNs */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="dns-prefetch" href="//fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//fonts.gstatic.com" />
          <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
          <link rel="dns-prefetch" href="//unpkg.com" />

          {/* SEO: Basic meta tags */}
          <meta charSet="utf-8" />

          {/* CRITICAL: Complete MetaMask/Web3 Error Suppressor - الحل الجذري والشامل */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                if (typeof window === 'undefined') return;
                if (window.__walletErrorsSuppressed) return;
                window.__walletErrorsSuppressed = true;
                
                // الكلمات المفتاحية لأخطاء المحافظ الرقمية
                var WALLET_KEYWORDS = [
                  'metamask', 'ethereum', 'web3', 'wallet', 'inpage.js',
                  'failed to connect', 'extension not found', 'provider',
                  'chrome-extension://', 'moz-extension://', 'ethers',
                  'web3modal', 'walletconnect', 'injected connector',
                  'nkbihfbeogaeaoehlefnkodbefgpgknn', // MetaMask extension ID
                  'request rejected', 'user rejected', 'disconnected',
                  'chain mismatch', 'unsupported chain'
                ];
                
                function containsWalletKeyword(text) {
                  if (!text) return false;
                  var lower = String(text).toLowerCase();
                  for (var i = 0; i < WALLET_KEYWORDS.length; i++) {
                    if (lower.indexOf(WALLET_KEYWORDS[i]) !== -1) return true;
                  }
                  return false;
                }
                
                function isWalletRelatedError(e) {
                  if (!e) return false;
                  // فحص جميع الخصائص الممكنة للخطأ
                  return containsWalletKeyword(e.message) || 
                         containsWalletKeyword(e.reason) || 
                         containsWalletKeyword(e.stack) ||
                         containsWalletKeyword(e.filename) ||
                         containsWalletKeyword(e.name) ||
                         (e.reason && (
                           containsWalletKeyword(e.reason.message) || 
                           containsWalletKeyword(e.reason.stack) ||
                           containsWalletKeyword(e.reason.name)
                         ));
                }
                
                // ===== 1. تغليف console.error و console.warn =====
                var originalError = console.error;
                var originalWarn = console.warn;
                
                console.error = function() {
                  for (var i = 0; i < arguments.length; i++) {
                    if (containsWalletKeyword(String(arguments[i]))) return;
                  }
                  return originalError.apply(console, arguments);
                };
                
                console.warn = function() {
                  for (var i = 0; i < arguments.length; i++) {
                    if (containsWalletKeyword(String(arguments[i]))) return;
                  }
                  return originalWarn.apply(console, arguments);
                };
                
                // ===== 2. معالج Unhandled Promise Rejection =====
                window.addEventListener('unhandledrejection', function(e) {
                  if (isWalletRelatedError(e) || isWalletRelatedError(e.reason)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    return false;
                  }
                }, true);
                
                // ===== 3. معالج Error العام =====
                window.addEventListener('error', function(e) {
                  if (isWalletRelatedError(e) || isWalletRelatedError(e.error)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    return false;
                  }
                }, true);
                
                // ===== 4. إخفاء Next.js Error Overlay لأخطاء المحافظ =====
                function hideNextJsOverlay() {
                  // إخفاء nextjs-portal (Error Overlay container)
                  var overlay = document.getElementById('__next-build-watcher') || 
                                document.querySelector('[data-nextjs-dialog]') ||
                                document.querySelector('nextjs-portal');
                  if (overlay) {
                    var content = overlay.textContent || overlay.innerText || '';
                    if (containsWalletKeyword(content)) {
                      overlay.style.display = 'none';
                      overlay.remove();
                    }
                  }
                  
                  // إخفاء أي overlay يحتوي على أخطاء MetaMask
                  var allOverlays = document.querySelectorAll('[data-nextjs-dialog], nextjs-portal, [id*="next"], [class*="error-overlay"]');
                  allOverlays.forEach(function(el) {
                    var content = el.textContent || el.innerText || '';
                    if (containsWalletKeyword(content)) {
                      el.style.display = 'none';
                      try { el.remove(); } catch(err) {}
                    }
                  });
                }
                
                // مراقبة DOM لإخفاء الـ overlay فور ظهوره
                var observer = new MutationObserver(function(mutations) {
                  hideNextJsOverlay();
                });
                
                // بدء المراقبة عند جاهزية DOM
                if (document.body) {
                  observer.observe(document.body, { childList: true, subtree: true });
                } else {
                  document.addEventListener('DOMContentLoaded', function() {
                    observer.observe(document.body, { childList: true, subtree: true });
                  });
                }
                
                // فحص دوري كل 500ms كاحتياط
                setInterval(hideNextJsOverlay, 500);
                
                // ===== 5. منع MetaMask من محاولة الاتصال التلقائي =====
                // إذا كان MetaMask موجوداً، نتجاهل أخطاء الاتصال
                if (window.ethereum) {
                  var originalRequest = window.ethereum.request;
                  if (originalRequest) {
                    window.ethereum.request = function(args) {
                      return originalRequest.call(window.ethereum, args).catch(function(err) {
                        // تجاهل الخطأ بصمت إذا كان متعلقاً بالاتصال
                        if (containsWalletKeyword(String(err))) {
                          return Promise.resolve(null);
                        }
                        throw err;
                      });
                    };
                  }
                }
              })();
            `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
