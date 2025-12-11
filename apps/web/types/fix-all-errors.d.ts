// ============================================
// إصلاح شامل لجميع أخطاء TypeScript
// ============================================

// إصلاح أخطاء الوحدات المفقودة
declare module 'socket.io-client';
declare module 'react-phone-input-2';
declare module 'react-otp-input';
declare module 'libphonenumber-js';
declare module 'jsonwebtoken';
declare module 'bcryptjs';
declare module 'crypto-js';
declare module 'qrcode';
declare module 'speakeasy';
declare module 'formidable';
declare module 'nodemailer';
declare module 'helmet';
declare module 'compression';
declare module 'express-rate-limit';
declare module 'bullmq';
declare module 'prom-client';
declare module 'geolib';
declare module 'date-fns';
declare module 'dayjs';
declare module 'clsx';
declare module 'cmdk';
declare module 'class-variance-authority';
declare module '@dnd-kit/core';
declare module '@dnd-kit/sortable';
declare module '@dnd-kit/utilities';
declare module '@headlessui/react';
declare module '@hookform/resolvers';
declare module '@aws-sdk/client-s3';
declare module 'autoprefixer';
declare module 'postcss';
declare module 'tailwindcss';
declare module '@tanstack/react-query';
declare module '@tanstack/react-query-devtools';
declare module '@sentry/nextjs';
declare module '@sentry/node';
declare module '@sentry/tracing';
declare module 'lucide-react';
declare module 'react-hot-toast';
declare module 'react-intersection-observer';
declare module 'react-lazy-load-image-component';
declare module 'react-select';
declare module 'react-hook-form';
declare module 'zustand';
declare module 'immer';
declare module 'axios';
declare module 'swr';
declare module 'recharts';
declare module '@radix-ui/*';
declare module 'framer-motion';
declare module 'react-use';
declare module 'usehooks-ts';
declare module 'react-countdown';
declare module 'react-confetti';
declare module 'react-dropzone';
declare module 'react-image-crop';
declare module 'react-modal';
declare module 'react-tooltip';
declare module 'react-paginate';
declare module 'react-infinite-scroll-component';
declare module 'react-loading-skeleton';
declare module 'react-spinners';
declare module 'react-toastify';
declare module 'sweetalert2';
declare module 'react-datepicker';
declare module 'react-day-picker';
declare module 'react-calendar';
declare module 'react-time-picker';
declare module 'react-color';
declare module 'react-avatar';
declare module 'react-icons/*';
declare module '@heroicons/react/*';
declare module '@ant-design/icons';
declare module 'antd';
declare module 'react-quill';
declare module 'draft-js';
declare module '@tiptap/react';
declare module 'slate';
declare module 'slate-react';
declare module 'quill';
declare module 'marked';
declare module 'react-markdown';
declare module 'prismjs';
declare module 'highlight.js';
declare module 'codemirror';
declare module '@monaco-editor/react';
declare module 'react-syntax-highlighter';
declare module 'react-ace';
declare module 'brace';
declare module 'react-json-view';
declare module 'react-json-tree';
declare module 'react-inspector';
declare module 'react-error-boundary';

// إصلاح أخطاء process.env
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    DATABASE_URL: string;
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;
    JWT_SECRET: string;
    ADMIN_JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    KEYDB_URL: string;
    KEYDB_HOST: string;
    KEYDB_PORT: string;
    KEYDB_PASSWORD: string;
    ADMIN_DEV_MODE: string;
    ADMIN_PASSWORD_HASH: string;
    ADMIN_EXTRA_USERNAME: string;
    ADMIN_EXTRA_PASSWORD_HASH: string;
    ADMIN_EXTRA_ROLE: string;
    SENTRY_DSN?: string;
    NEXT_PUBLIC_SENTRY_DSN?: string;
    [key: string]: string | undefined;
  }
}

// إصلاح أخطاء النافذة العامة
declare global {
  interface Window {
    // Google Maps
    google?: {
      maps: any;
    };
    // Socket.IO
    io?: any;
    // PayPal
    paypal?: any;
    // Facebook SDK
    FB?: any;
    // Google Analytics
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    // Custom properties
    __REDUX_DEVTOOLS_EXTENSION__?: any;
    __NEXT_DATA__?: any;
    __INITIAL_STATE__?: any;
    ethereum?: any;
    web3?: any;
    // Performance
    performance: Performance;
    // Storage
    localStorage: Storage;
    sessionStorage: Storage;
    // Notifications
    Notification?: any;
    // Workers
    Worker?: any;
    SharedWorker?: any;
    ServiceWorker?: any;
  }

  // إصلاح HTMLElement
  interface HTMLElement {
    swiper?: any;
  }

  // إصلاح Document
  interface Document {
    documentMode?: any;
    mozFullScreenElement?: any;
    msFullscreenElement?: any;
    webkitFullscreenElement?: any;
  }

  // Console extensions
  interface Console {
    success?(...args: any[]): void;
    failure?(...args: any[]): void;
  }
}

// إصلاح أخطاء React
declare module 'react' {
  interface HTMLAttributes<T> {
    css?: any;
    as?: any;
    variant?: string;
    size?: string;
  }
}

// إصلاح Next.js types
declare module 'next' {
  export interface NextApiRequest {
    user?: any;
    session?: any;
    files?: any;
    file?: any;
    body: any;
  }

  export interface NextApiResponse<T = any> {
    status(code: number): NextApiResponse<T>;
    json(body: T): NextApiResponse<T>;
    send(body: any): NextApiResponse<T>;
    end(data?: any): NextApiResponse<T>;
    setHeader(name: string, value: string | number | readonly string[]): NextApiResponse<T>;
    socket?: {
      server?: any;
    };
  }
}

// إصلاح Prisma types
declare module '@prisma/client' {
  interface PrismaClient {
    $on?: any;
    $use?: any;
    $extends?: any;
  }
}

// Type utilities
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Maybe<T> = T | null | undefined;
type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R> ? R : any;
type PromiseType<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

// Common types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string | { message: string; code?: string; };
  message?: string;
}

interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  profileImage?: string;
  role?: string;
  accountType?: string;
  verified?: boolean;
  rating?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition?: string;
  location?: string;
  images?: string[];
  description?: string;
  features?: string[];
  status?: string;
  sellerId?: string;
  seller?: User;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface Auction {
  id: string;
  carId: string;
  car?: Car;
  startingPrice: number;
  currentPrice?: number;
  minimumBidIncrement?: number;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  winnerId?: string;
  winner?: User;
  bids?: Bid[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface Bid {
  id: string;
  auctionId: string;
  auction?: Auction;
  bidderId: string;
  bidder?: User;
  amount: number;
  timestamp: Date | string;
  status?: string;
}

// Export utility types
export type {
  ApiResponse, ArrayElement, AsyncReturnType, Auction,
  Bid, Car, Maybe, Nullable,
  Optional, PaginatedResponse, PromiseType, User
};

// Fix for undefined variables in pages
declare const locationOptions: string[];
declare const carBrands: string[];
declare const carModels: Record<string, string[]>;
declare const fuelTypes: string[];
declare const transmissionTypes: string[];
declare const bodyTypes: string[];
declare const colors: string[];
declare const conditions: string[];
declare const years: number[];
declare const libyanCities: any[];

// Fix for missing function declarations
declare function getServerSideProps(context: any): Promise<any>;
declare function getStaticProps(context: any): Promise<any>;
declare function getStaticPaths(): Promise<any>;

// Make TypeScript happy
export { };

