/**
 * مكون الكرة الأرضية ثلاثية الأبعاد - تصميم Google Maps الاحترافي
 * Premium 3D Globe Component - Google Maps Style Design
 * تصميم عالمي احترافي مع تفاصيل دقيقة وأيقونات مرتبة
 */

import { useEffect, useMemo, useRef, useState } from 'react';

interface Globe3DProps {
  yardName: string;
  city: string;
  className?: string;
  showDetails?: boolean;
  activeAuctions?: number;
  rating?: number;
  verified?: boolean;
  auctionDays?: string[];
}

// إحداثيات المدن الليبية (خطوط الطول والعرض)
const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  // المنطقة الغربية
  طرابلس: { lat: 32.89, lon: 13.19 },
  الزاوية: { lat: 32.76, lon: 12.73 },
  صبراتة: { lat: 32.79, lon: 12.18 },
  زوارة: { lat: 32.93, lon: 12.08 },
  غريان: { lat: 32.17, lon: 13.02 },
  نالوت: { lat: 31.87, lon: 10.98 },
  الزنتان: { lat: 31.93, lon: 12.25 },
  ترهونة: { lat: 32.44, lon: 13.63 },
  'بني وليد': { lat: 31.76, lon: 14.01 },

  // المنطقة الوسطى
  مصراتة: { lat: 32.38, lon: 15.09 },
  زليتن: { lat: 32.47, lon: 14.57 },
  الخمس: { lat: 32.64, lon: 14.26 },
  سرت: { lat: 31.21, lon: 16.59 },
  هون: { lat: 29.12, lon: 15.93 },

  // المنطقة الشرقية
  بنغازي: { lat: 32.12, lon: 20.09 },
  البيضاء: { lat: 32.76, lon: 21.74 },
  درنة: { lat: 32.76, lon: 22.64 },
  طبرق: { lat: 32.08, lon: 23.98 },
  اجدابيا: { lat: 30.76, lon: 20.23 },
  المرج: { lat: 32.49, lon: 20.83 },
  الكفرة: { lat: 24.18, lon: 23.32 },

  // المنطقة الجنوبية
  سبها: { lat: 27.04, lon: 14.43 },
  مرزق: { lat: 25.92, lon: 13.9 },
  أوباري: { lat: 26.58, lon: 12.93 },
  غات: { lat: 25.13, lon: 10.17 },
  غدامس: { lat: 30.13, lon: 9.5 },

  // الافتراضي (وسط ليبيا)
  default: { lat: 27.0, lon: 17.0 },
};

// استخراج اسم المدينة من النص
function extractCityName(cityText: string): string {
  // إزالة المنطقة بعد الشرطة
  const mainCity = cityText.split('-')[0].trim();
  return mainCity;
}

// تحويل الإحداثيات الجغرافية إلى إحداثيات الكرة
function geoToSphere(lat: number, lon: number, rotation: number) {
  // تحويل من درجات إلى راديان
  const latRad = (lat * Math.PI) / 180;
  const lonRad = ((lon - 17) * Math.PI) / 180; // مركز على ليبيا (خط طول 17)

  return {
    x: Math.cos(latRad) * Math.sin(lonRad + rotation),
    y: -Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad + rotation),
  };
}

// تحويل أيام الأسبوع (جميع الصيغ الممكنة)
const dayLabels: Record<string, string> = {
  // الصيغة الكاملة
  sunday: 'الأحد',
  monday: 'الاثنين',
  tuesday: 'الثلاثاء',
  wednesday: 'الأربعاء',
  thursday: 'الخميس',
  friday: 'الجمعة',
  saturday: 'السبت',
  // الصيغة المختصرة (3 حروف كبيرة)
  SUN: 'الأحد',
  MON: 'الاثنين',
  TUE: 'الثلاثاء',
  WED: 'الأربعاء',
  THU: 'الخميس',
  FRI: 'الجمعة',
  SAT: 'السبت',
  // الصيغة المختصرة (3 حروف صغيرة)
  sun: 'الأحد',
  mon: 'الاثنين',
  tue: 'الثلاثاء',
  wed: 'الأربعاء',
  thu: 'الخميس',
  fri: 'الجمعة',
  sat: 'السبت',
  // الصيغة العربية
  الأحد: 'الأحد',
  الاثنين: 'الاثنين',
  الثلاثاء: 'الثلاثاء',
  الأربعاء: 'الأربعاء',
  الخميس: 'الخميس',
  الجمعة: 'الجمعة',
  السبت: 'السبت',
};

export default function Globe3D({
  yardName,
  city,
  className = '',
  showDetails = true,
  activeAuctions = 0,
  rating,
  verified = false,
  auctionDays = [],
}: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // استخراج إحداثيات المدينة
  const cityCoords = useMemo(() => {
    const cityName = extractCityName(city);
    return CITY_COORDINATES[cityName] || CITY_COORDINATES['default'];
  }, [city]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // إعداد حجم الكانفاس
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2; // للوضوح العالي
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
      }
    };
    resize();

    let rotation = 0;
    let animationId: number;

    // رسم شكل أفريقيا
    const drawAfrica = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      // نقاط حدود أفريقيا المبسطة
      const africaPoints = [
        { lat: 37, lon: 10 }, // تونس
        { lat: 35, lon: -6 }, // المغرب
        { lat: 28, lon: -13 }, // الصحراء الغربية
        { lat: 15, lon: -17 }, // السنغال
        { lat: 5, lon: -5 }, // ساحل العاج
        { lat: 4, lon: 7 }, // نيجيريا
        { lat: -5, lon: 12 }, // الكونغو
        { lat: -22, lon: 14 }, // ناميبيا
        { lat: -35, lon: 20 }, // جنوب أفريقيا
        { lat: -26, lon: 33 }, // موزمبيق
        { lat: -12, lon: 40 }, // تنزانيا
        { lat: 2, lon: 42 }, // الصومال
        { lat: 12, lon: 44 }, // جيبوتي
        { lat: 22, lon: 37 }, // السودان
        { lat: 32, lon: 32 }, // مصر
        { lat: 33, lon: 25 }, // ليبيا الشرقية
        { lat: 32, lon: 12 }, // ليبيا الغربية
        { lat: 37, lon: 10 }, // تونس (إغلاق)
      ];

      ctx.beginPath();
      let started = false;

      for (const point of africaPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.1) {
          // مرئي من الأمام
          const x = centerX + pos.x * radius * 0.95;
          const y = centerY + pos.y * radius * 0.95;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      if (started) {
        ctx.closePath();

        // تدرج لوني للقارة
        const gradient = ctx.createLinearGradient(
          centerX - radius * 0.3,
          centerY - radius * 0.5,
          centerX + radius * 0.3,
          centerY + radius * 0.5,
        );
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)');
        gradient.addColorStop(0.5, 'rgba(22, 163, 74, 0.5)');
        gradient.addColorStop(1, 'rgba(21, 128, 61, 0.4)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // حدود القارة
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم حدود ليبيا
    const drawLibya = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const libyaPoints = [
        { lat: 33, lon: 12 }, // الحدود التونسية
        { lat: 32, lon: 10 }, // غدامس
        { lat: 25, lon: 10 }, // الحدود الجزائرية الجنوبية
        { lat: 23, lon: 14 }, // الحدود النيجرية
        { lat: 22, lon: 24 }, // الحدود التشادية/السودانية
        { lat: 22, lon: 25 }, // الحدود المصرية الجنوبية
        { lat: 31.5, lon: 25 }, // الحدود المصرية الشمالية
        { lat: 32.5, lon: 25 }, // طبرق
        { lat: 32.5, lon: 20 }, // بنغازي
        { lat: 31, lon: 17 }, // سرت
        { lat: 32.5, lon: 15 }, // مصراتة
        { lat: 33, lon: 12 }, // إغلاق
      ];

      ctx.beginPath();
      let started = false;

      for (const point of libyaPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > 0) {
          const x = centerX + pos.x * radius * 0.95;
          const y = centerY + pos.y * radius * 0.95;

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      if (started) {
        ctx.closePath();

        // تدرج لوني لليبيا - أكثر وضوحاً
        const libyaGradient = ctx.createLinearGradient(
          centerX - radius * 0.2,
          centerY - radius * 0.3,
          centerX + radius * 0.2,
          centerY + radius * 0.1,
        );
        libyaGradient.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        libyaGradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.45)');
        libyaGradient.addColorStop(1, 'rgba(185, 28, 28, 0.35)');
        ctx.fillStyle = libyaGradient;
        ctx.fill();

        // حدود ليبيا أكثر وضوحاً
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // حدود داخلية للتأكيد
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width / 2;
      const height = canvas.height / 2;
      const centerX = width / 2;
      const centerY = height / 2 - 10; // رفع الكرة قليلاً
      const radius = Math.min(width, height) * 0.38;

      // مسح الكانفاس
      ctx.clearRect(0, 0, width, height);

      // توهج خلفي
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.3,
        centerX,
        centerY,
        radius * 1.5,
      );
      glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // رسم الكرة الأرضية (المحيط)
      const oceanGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius,
      );
      oceanGradient.addColorStop(0, '#60a5fa');
      oceanGradient.addColorStop(0.4, '#3b82f6');
      oceanGradient.addColorStop(0.7, '#2563eb');
      oceanGradient.addColorStop(1, '#1d4ed8');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGradient;
      ctx.fill();

      // خطوط العرض
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const r = Math.cos(latRad) * radius;
        const y = centerY - Math.sin(latRad) * radius;

        ctx.beginPath();
        ctx.ellipse(centerX, y, r, r * 0.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // خطوط الطول
      for (let lon = 0; lon < 360; lon += 30) {
        const lonRad = ((lon - 17) * Math.PI) / 180;
        const cosLon = Math.cos(lonRad + rotation);

        if (cosLon > -0.5) {
          ctx.beginPath();
          for (let lat = -90; lat <= 90; lat += 5) {
            const pos = geoToSphere(lat, lon, rotation);
            const x = centerX + pos.x * radius;
            const y = centerY + pos.y * radius;

            if (lat === -90) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      }

      // خط الاستواء
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();

      // رسم القارات
      drawAfrica(ctx, centerX, centerY, radius, rotation);
      drawLibya(ctx, centerX, centerY, radius, rotation);

      // علامة موقع المدينة
      const cityPos = geoToSphere(cityCoords.lat, cityCoords.lon, rotation);

      if (cityPos.z > 0.1) {
        // مرئي من الأمام
        const markerX = centerX + cityPos.x * radius * 0.92;
        const markerY = centerY + cityPos.y * radius * 0.92;
        const visibility = Math.min(1, (cityPos.z + 0.2) * 1.5);

        // توهج العلامة
        const markerGlow = ctx.createRadialGradient(
          markerX,
          markerY,
          0,
          markerX,
          markerY,
          25 * visibility,
        );
        markerGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        markerGlow.addColorStop(0.4, 'rgba(239, 68, 68, 0.3)');
        markerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = markerGlow;
        ctx.beginPath();
        ctx.arc(markerX, markerY, 25 * visibility, 0, Math.PI * 2);
        ctx.fill();

        // حلقة نابضة
        const pulseSize = (Math.sin(Date.now() / 200) + 1) * 6 + 8;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 * visibility})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(markerX, markerY, pulseSize * visibility, 0, Math.PI * 2);
        ctx.stroke();

        // شكل الدبوس
        const pinHeight = 18 * visibility;
        const pinWidth = 10 * visibility;

        // ظل الدبوس
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * visibility})`;
        ctx.beginPath();
        ctx.ellipse(
          markerX + 2,
          markerY + pinHeight + 2,
          pinWidth * 0.4,
          pinWidth * 0.15,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // جسم الدبوس
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(markerX, markerY + pinHeight);
        ctx.bezierCurveTo(
          markerX - pinWidth,
          markerY + pinHeight * 0.3,
          markerX - pinWidth,
          markerY - pinWidth * 0.8,
          markerX,
          markerY - pinWidth,
        );
        ctx.bezierCurveTo(
          markerX + pinWidth,
          markerY - pinWidth * 0.8,
          markerX + pinWidth,
          markerY + pinHeight * 0.3,
          markerX,
          markerY + pinHeight,
        );
        ctx.fill();

        // انعكاس لامع
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(
          markerX - pinWidth * 0.3,
          markerY - pinWidth * 0.3,
          pinWidth * 0.35,
          pinWidth * 0.5,
          -0.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // الدائرة البيضاء في الأعلى
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(markerX, markerY - pinWidth * 0.3, pinWidth * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // حافة الكرة
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // تأثير الغلاف الجوي
      const atmosphereGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.92,
        centerX,
        centerY,
        radius * 1.15,
      );
      atmosphereGradient.addColorStop(0, 'rgba(147, 197, 253, 0)');
      atmosphereGradient.addColorStop(0.5, 'rgba(147, 197, 253, 0.15)');
      atmosphereGradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // تحديث الدوران (بطيء)
      rotation += 0.003;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cityCoords]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* خلفية متدرجة احترافية */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950" />

      {/* نمط شبكي خفيف */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}
      />

      {/* الكانفاس - الكرة الأرضية */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-transform duration-500 ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
      />

      {/* طبقة التدرج للنص - Google Maps Style */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {/* شريط المعلومات السفلي - تصميم احترافي */}
      {showDetails && (
        <div className="absolute bottom-0 left-0 right-0">
          {/* الخط الفاصل المتوهج */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <div className="bg-gradient-to-t from-black/95 via-black/80 to-transparent px-5 pb-4 pt-5 backdrop-blur-xl">
            {/* الصف الأول: اسم الساحة والموقع */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-bold leading-tight text-white">{yardName}</h3>
                <div className="mt-1.5 flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 flex-shrink-0 text-red-400"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="truncate text-sm text-white/80">{city}</span>
                </div>
              </div>

              {/* التقييم */}
              {rating && rating > 0 && (
                <div className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-amber-500/20 px-2.5 py-1.5">
                  <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold text-amber-300">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* الصف الثاني: معلومات مهمة */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {/* أيام المزاد */}
              {auctionDays.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <svg
                    className="h-3.5 w-3.5 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-white/90">
                    {auctionDays
                      .slice(0, 2)
                      .map((d) => dayLabels[d] || d)
                      .join(' - ')}
                    {auctionDays.length > 2 && ` +${auctionDays.length - 2}`}
                  </span>
                </div>
              )}

              {/* السعة أو معلومة إضافية */}
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <svg
                  className="h-3.5 w-3.5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-xs font-medium text-white/90">ساحة معتمدة</span>
              </div>

              {/* موثق */}
              {verified && (
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 backdrop-blur-sm">
                  <svg
                    className="h-3.5 w-3.5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-300">موثق</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* مؤشر المزادات النشطة - في اليسار لتجنب التداخل مع شارات الصفحة */}
      {activeAuctions > 0 && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600/90 to-red-500/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
          </span>
          <span className="text-xs font-bold text-white">{activeAuctions} مزاد</span>
        </div>
      )}
    </div>
  );
}
