/**
 * Custom Image Loader لـ Next.js
 * يدعم Cloudflare Images و CloudFront
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Cloudflare Images Loader
 */
export function cloudflareLoader({ src, width, quality }: ImageLoaderProps): string {
  const params = [`width=${width}`];

  if (quality) {
    params.push(`quality=${quality}`);
  }

  // إذا كان الرابط من Cloudflare بالفعل
  if (src.includes('imagedelivery.net')) {
    return src;
  }

  // إذا كان رابط محلي
  const cloudflareAccountHash = process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH;
  if (cloudflareAccountHash) {
    // تحويل الرابط المحلي إلى Cloudflare
    const imageId = src.replace(/^\//, '').replace(/\//g, '-');
    return `https://imagedelivery.net/${cloudflareAccountHash}/${imageId}/${params.join(',')}`;
  }

  return src;
}

/**
 * CloudFront Loader
 */
export function cloudfrontLoader({ src, width, quality }: ImageLoaderProps): string {
  const cloudfrontDomain = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN;

  if (!cloudfrontDomain) {
    return src;
  }

  // إذا كان الرابط من CloudFront بالفعل
  if (src.includes(cloudfrontDomain)) {
    return src;
  }

  // تحويل الرابط المحلي إلى CloudFront
  const params = new URLSearchParams({
    width: width.toString(),
    ...(quality && { quality: quality.toString() }),
  });

  return `https://${cloudfrontDomain}${src}?${params.toString()}`;
}

/**
 * Custom CDN Loader (يمكن تخصيصه)
 */
export function customCDNLoader({ src, width, quality }: ImageLoaderProps): string {
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;

  if (!cdnDomain) {
    return src;
  }

  // بناء URL مع المعاملات
  const params = new URLSearchParams({
    w: width.toString(),
    q: (quality || 75).toString(),
  });

  // إذا كان الرابط محلي
  if (src.startsWith('/')) {
    return `https://${cdnDomain}${src}?${params.toString()}`;
  }

  return src;
}

/**
 * Default Loader - يختار تلقائياً بناءً على الإعدادات
 */
export default function imageLoader(props: ImageLoaderProps): string {
  const cdnProvider = process.env.NEXT_PUBLIC_CDN_PROVIDER;

  switch (cdnProvider) {
    case 'cloudflare':
      return cloudflareLoader(props);
    case 'cloudfront':
      return cloudfrontLoader(props);
    case 'custom':
      return customCDNLoader(props);
    default:
      // Default Next.js loader
      const { src, width, quality } = props;
      const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: (quality || 75).toString(),
      });
      return `/_next/image?${params.toString()}`;
  }
}

/**
 * توليد srcset للصور المستجيبة
 */
export function generateImageSrcSet(
  src: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920],
  quality?: number,
): string {
  const loader = imageLoader;

  return sizes
    .map((width) => {
      const url = loader({ src, width, quality });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * توليد sizes attribute
 */
export function generateSizesAttribute(
  breakpoints: { maxWidth: number; imageWidth: string }[] = [
    { maxWidth: 640, imageWidth: '100vw' },
    { maxWidth: 768, imageWidth: '50vw' },
    { maxWidth: 1024, imageWidth: '33vw' },
  ],
  defaultSize: string = '25vw',
): string {
  const mediaQueries = breakpoints.map(
    ({ maxWidth, imageWidth }) => `(max-width: ${maxWidth}px) ${imageWidth}`,
  );

  return [...mediaQueries, defaultSize].join(', ');
}

/**
 * توليد placeholder blur
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * استخراج أبعاد الصورة من URL
 */
export function extractImageDimensions(src: string): {
  width?: number;
  height?: number;
} {
  const match = src.match(/\/(\d+)x(\d+)\//);
  if (match) {
    return {
      width: parseInt(match[1], 10),
      height: parseInt(match[2], 10),
    };
  }
  return {};
}

/**
 * إنشاء responsive image config
 */
export function createResponsiveImageConfig(
  src: string,
  alt: string,
  options: {
    sizes?: string;
    quality?: number;
    priority?: boolean;
    placeholder?: 'blur' | 'empty';
  } = {},
) {
  const dimensions = extractImageDimensions(src);

  return {
    src,
    alt,
    ...dimensions,
    sizes: options.sizes || generateSizesAttribute(),
    quality: options.quality || 80,
    priority: options.priority || false,
    placeholder: options.placeholder || 'blur',
    blurDataURL:
      options.placeholder === 'blur'
        ? generateBlurDataURL(dimensions.width, dimensions.height)
        : undefined,
  };
}
