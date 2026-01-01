/**
 * صفحة تسجيل دخول المديرين - تصميم رسمي
 * Admin Login Page - Professional Corporate Design
 */

import {
  BoltIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        window.location.href = '/admin';
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>تسجيل الدخول | لوحة تحكم سوق مزاد</title>
      </Head>

      <div className="flex min-h-screen" dir="rtl">
        {/* الجانب الأيسر - العلامة التجارية */}
        <div className="relative hidden overflow-hidden bg-slate-950 lg:flex lg:w-1/2">
          <StarfieldBackground />

          {/* المحتوى */}
          <div className="relative z-10 flex w-full flex-col items-center justify-center p-16">
            {/* الشعار */}
            <div className="mb-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                <ShieldCheckIcon className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* العنوان */}
            <h1 className="mb-3 text-center text-4xl font-bold text-white">سوق مزاد</h1>
            <p className="mb-16 text-center text-lg text-slate-400">لوحة التحكم الإدارية</p>

            {/* الميزات */}
            <div className="w-full max-w-sm space-y-5">
              <FeatureItem
                icon={<ShieldCheckIcon className="h-5 w-5" />}
                title="أمان متقدم"
                description="حماية كاملة لبياناتك ومعلوماتك"
              />
              <FeatureItem
                icon={<ChartBarIcon className="h-5 w-5" />}
                title="تحليلات شاملة"
                description="تقارير وإحصائيات تفصيلية"
              />
              <FeatureItem
                icon={<BoltIcon className="h-5 w-5" />}
                title="أداء عالي"
                description="سرعة واستجابة فورية"
              />
            </div>

            {/* حقوق النشر */}
            <div className="absolute bottom-8 text-sm text-slate-500">
              {new Date().getFullYear()} سوق مزاد - جميع الحقوق محفوظة
            </div>
          </div>
        </div>

        {/* الجانب الأيمن - نموذج الدخول */}
        <div className="flex w-full items-center justify-center bg-slate-950 p-8 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-md">
            {/* شعار للشاشات الصغيرة */}
            <div className="mb-10 text-center lg:hidden">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600">
                <ShieldCheckIcon className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">سوق مزاد</h1>
              <p className="text-sm text-slate-400">لوحة التحكم الإدارية</p>
            </div>

            {/* عنوان النموذج */}
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-bold text-white">تسجيل الدخول</h2>
              <p className="text-sm text-slate-400">أدخل بياناتك للوصول إلى لوحة التحكم</p>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-600/30 bg-amber-900/20 px-4 py-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-amber-400">{error}</p>
              </div>
            )}

            {/* نموذج الدخول */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* حقل اسم المستخدم */}
              <div>
                <label className="mb-2 block text-right text-sm font-medium text-slate-300">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-left text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="admin"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div>
                <label className="mb-2 block text-right text-sm font-medium text-slate-300">
                  كلمة المرور
                </label>
                <div className="relative">
                  {/* أيقونة القفل على اليمين */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    <LockClosedIcon className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-11 pr-11 text-left text-white placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  {/* زر إظهار/إخفاء على اليسار */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-400"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* زر تسجيل الدخول */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>جاري التحقق...</span>
                  </span>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>

            {/* معلومات إضافية */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <LockClosedIcon className="h-4 w-4" />
                <span>اتصال آمن ومشفر بتقنية SSL</span>
              </div>
            </div>

            {/* بيانات التطوير */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-4 rounded-lg border border-emerald-600/30 bg-emerald-900/20 px-4 py-3 text-center">
                <p className="mb-1 text-xs font-medium text-emerald-400">بيانات التطوير</p>
                <p className="text-xs text-emerald-300/70">
                  اسم المستخدم: <span className="font-mono">admin</span> | كلمة المرور:{' '}
                  <span className="font-mono">123456</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// مكون الميزة
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-blue-600/20 bg-blue-600/10 text-blue-500">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    const dpr = window.devicePixelRatio || 1;

    type Star = {
      x: number;
      y: number;
      z: number;
      radius: number;
      speed: number;
    };

    const maxDepth = 900;
    const starCount = 260;
    const stars: Star[] = [];

    const createStar = (): Star => {
      return {
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * maxDepth,
        radius: 0.7 + Math.random() * 1.5,
        speed: 1.2 + Math.random() * 1.8,
      };
    };

    const initStars = () => {
      stars.length = 0;
      if (!width || !height) return;
      for (let i = 0; i < starCount; i += 1) {
        stars.push(createStar());
      }
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width || window.innerWidth / 2;
      height = bounds.height || window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      initStars();
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      context.clearRect(0, 0, width, height);

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.35, '#020617');
      gradient.addColorStop(1, '#020617');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        star.z -= star.speed;

        if (star.z <= 0.5) {
          stars[i] = createStar();
          continue;
        }

        const perspective = 320 / star.z;
        const x = centerX + star.x * perspective;
        const y = centerY + star.y * perspective * 0.9;

        if (x < 0 || x >= width || y < 0 || y >= height) {
          stars[i] = createStar();
          continue;
        }

        const radius = star.radius * perspective * 0.7;
        const depthFactor = 1 - star.z / maxDepth;
        const alpha = 0.25 + depthFactor * 0.7;

        context.beginPath();
        context.fillStyle = `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
        context.shadowBlur = 6 + depthFactor * 12;
        context.shadowColor = 'rgba(59, 130, 246, 0.35)';
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;

      const roadHeight = Math.max(height * 0.18, 90);
      const roadGradient = context.createLinearGradient(0, height - roadHeight, 0, height);
      roadGradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
      roadGradient.addColorStop(0.4, 'rgba(15, 23, 42, 0.65)');
      roadGradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      context.fillStyle = roadGradient;
      context.fillRect(0, height - roadHeight, width, roadHeight);

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
    </div>
  );
}
