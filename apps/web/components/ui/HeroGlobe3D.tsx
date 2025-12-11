/**
 * مكون الكرة الأرضية ثلاثية الأبعاد للخلفية - تصميم احترافي متقدم
 * Advanced 3D Hero Globe Component - Premium Background Design
 * كرة أرضية شفافة مع جميع القارات وتركيز على ليبيا
 */

import { useEffect, useRef } from 'react';

interface HeroGlobe3DProps {
  className?: string;
  opacity?: number;
  position?: 'center' | 'right' | 'left';
  size?: 'small' | 'medium' | 'large';
}

// تحويل الإحداثيات الجغرافية إلى إحداثيات الكرة
function geoToSphere(lat: number, lon: number, rotation: number) {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = ((lon - 17) * Math.PI) / 180; // مركز على ليبيا

  return {
    x: Math.cos(latRad) * Math.sin(lonRad + rotation),
    y: -Math.sin(latRad),
    z: Math.cos(latRad) * Math.cos(lonRad + rotation),
  };
}

export default function HeroGlobe3D({
  className = '',
  opacity = 0.2,
  position = 'right',
  size = 'medium',
}: HeroGlobe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // إعداد حجم الكانفاس
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    let rotation = 0;
    let animationId: number;

    // رسم قارة أفريقيا
    const drawAfrica = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const africaPoints = [
        { lat: 37, lon: 10 },
        { lat: 35, lon: -6 },
        { lat: 28, lon: -13 },
        { lat: 15, lon: -17 },
        { lat: 5, lon: -5 },
        { lat: 4, lon: 7 },
        { lat: -5, lon: 12 },
        { lat: -22, lon: 14 },
        { lat: -35, lon: 20 },
        { lat: -26, lon: 33 },
        { lat: -12, lon: 40 },
        { lat: 2, lon: 42 },
        { lat: 12, lon: 44 },
        { lat: 22, lon: 37 },
        { lat: 32, lon: 32 },
        { lat: 33, lon: 25 },
        { lat: 32, lon: 12 },
        { lat: 37, lon: 10 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of africaPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.1) {
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
        ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // رسم أوروبا
    const drawEurope = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const europePoints = [
        { lat: 36, lon: -9 },
        { lat: 43, lon: -9 },
        { lat: 48, lon: -5 },
        { lat: 51, lon: 2 },
        { lat: 54, lon: 8 },
        { lat: 56, lon: 12 },
        { lat: 60, lon: 10 },
        { lat: 64, lon: 20 },
        { lat: 70, lon: 25 },
        { lat: 70, lon: 30 },
        { lat: 65, lon: 40 },
        { lat: 55, lon: 40 },
        { lat: 50, lon: 35 },
        { lat: 45, lon: 40 },
        { lat: 42, lon: 28 },
        { lat: 40, lon: 20 },
        { lat: 38, lon: 15 },
        { lat: 37, lon: 10 },
        { lat: 36, lon: -9 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of europePoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.1) {
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
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم آسيا
    const drawAsia = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const asiaPoints = [
        { lat: 42, lon: 28 },
        { lat: 35, lon: 35 },
        { lat: 25, lon: 50 },
        { lat: 20, lon: 60 },
        { lat: 25, lon: 70 },
        { lat: 30, lon: 80 },
        { lat: 35, lon: 90 },
        { lat: 40, lon: 100 },
        { lat: 50, lon: 100 },
        { lat: 55, lon: 120 },
        { lat: 60, lon: 140 },
        { lat: 65, lon: 170 },
        { lat: 70, lon: 170 },
        { lat: 75, lon: 100 },
        { lat: 70, lon: 60 },
        { lat: 55, lon: 40 },
        { lat: 50, lon: 35 },
        { lat: 42, lon: 28 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of asiaPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.2) {
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
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم أمريكا الشمالية
    const drawNorthAmerica = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const naPoints = [
        { lat: 15, lon: -100 },
        { lat: 20, lon: -105 },
        { lat: 25, lon: -110 },
        { lat: 35, lon: -120 },
        { lat: 45, lon: -125 },
        { lat: 55, lon: -130 },
        { lat: 65, lon: -140 },
        { lat: 70, lon: -160 },
        { lat: 72, lon: -100 },
        { lat: 70, lon: -80 },
        { lat: 60, lon: -70 },
        { lat: 50, lon: -60 },
        { lat: 45, lon: -65 },
        { lat: 40, lon: -75 },
        { lat: 30, lon: -80 },
        { lat: 25, lon: -80 },
        { lat: 20, lon: -90 },
        { lat: 15, lon: -100 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of naPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.2) {
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
        ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم أمريكا الجنوبية
    const drawSouthAmerica = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const saPoints = [
        { lat: 10, lon: -75 },
        { lat: 5, lon: -80 },
        { lat: -5, lon: -80 },
        { lat: -10, lon: -77 },
        { lat: -20, lon: -70 },
        { lat: -30, lon: -72 },
        { lat: -40, lon: -73 },
        { lat: -50, lon: -75 },
        { lat: -55, lon: -68 },
        { lat: -50, lon: -60 },
        { lat: -40, lon: -55 },
        { lat: -30, lon: -50 },
        { lat: -20, lon: -40 },
        { lat: -10, lon: -35 },
        { lat: 0, lon: -50 },
        { lat: 5, lon: -60 },
        { lat: 10, lon: -75 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of saPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.2) {
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
        ctx.fillStyle = 'rgba(34, 211, 238, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم أستراليا
    const drawAustralia = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const ausPoints = [
        { lat: -12, lon: 130 },
        { lat: -15, lon: 125 },
        { lat: -20, lon: 118 },
        { lat: -25, lon: 114 },
        { lat: -30, lon: 115 },
        { lat: -35, lon: 117 },
        { lat: -35, lon: 140 },
        { lat: -38, lon: 145 },
        { lat: -38, lon: 148 },
        { lat: -35, lon: 150 },
        { lat: -30, lon: 153 },
        { lat: -25, lon: 153 },
        { lat: -20, lon: 148 },
        { lat: -15, lon: 145 },
        { lat: -12, lon: 142 },
        { lat: -10, lon: 135 },
        { lat: -12, lon: 130 },
      ];

      ctx.beginPath();
      let started = false;

      for (const point of ausPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > -0.2) {
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
        ctx.fillStyle = 'rgba(244, 114, 182, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(244, 114, 182, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // رسم ليبيا بشكل مميز
    const drawLibya = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      radius: number,
      rot: number,
    ) => {
      const libyaPoints = [
        { lat: 33.2, lon: 11.5 },
        { lat: 33, lon: 10 },
        { lat: 30, lon: 9.5 },
        { lat: 25, lon: 10 },
        { lat: 23, lon: 12 },
        { lat: 22, lon: 14 },
        { lat: 20, lon: 18 },
        { lat: 20, lon: 22 },
        { lat: 22, lon: 24 },
        { lat: 22, lon: 25 },
        { lat: 29, lon: 25 },
        { lat: 31.5, lon: 25 },
        { lat: 32, lon: 25 },
        { lat: 32.5, lon: 24 },
        { lat: 32.8, lon: 22 },
        { lat: 32.5, lon: 20 },
        { lat: 31, lon: 17 },
        { lat: 32, lon: 15 },
        { lat: 32.5, lon: 14 },
        { lat: 33, lon: 12 },
        { lat: 33.2, lon: 11.5 },
      ];

      ctx.beginPath();
      let started = false;
      let allVisible = true;

      for (const point of libyaPoints) {
        const pos = geoToSphere(point.lat, point.lon, rot);
        if (pos.z > 0.1) {
          const x = centerX + pos.x * radius * 0.95;
          const y = centerY + pos.y * radius * 0.95;
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          allVisible = false;
        }
      }

      if (started && allVisible) {
        ctx.closePath();

        // تدرج لوني لليبيا - أكثر وضوحاً وبريقاً
        const gradient = ctx.createRadialGradient(
          centerX,
          centerY - radius * 0.3,
          0,
          centerX,
          centerY - radius * 0.3,
          radius * 0.4,
        );
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        gradient.addColorStop(0.5, 'rgba(220, 38, 38, 0.5)');
        gradient.addColorStop(1, 'rgba(185, 28, 28, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fill();

        // حدود مضيئة
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // حدود خارجية توهج
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // رسم نقطة طرابلس
        const tripoliPos = geoToSphere(32.89, 13.19, rot);
        if (tripoliPos.z > 0.2) {
          const tx = centerX + tripoliPos.x * radius * 0.92;
          const ty = centerY + tripoliPos.y * radius * 0.92;

          // توهج نابض
          const pulseSize = (Math.sin(Date.now() / 300) + 1) * 4 + 6;
          ctx.beginPath();
          ctx.arc(tx, ty, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();

          // النقطة الأساسية
          ctx.beginPath();
          ctx.arc(tx, ty, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width / 2;
      const height = canvas.height / 2;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.42;

      // مسح الكانفاس
      ctx.clearRect(0, 0, width, height);

      // توهج خلفي كبير
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.2,
        centerX,
        centerY,
        radius * 1.8,
      );
      glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
      glowGradient.addColorStop(0.4, 'rgba(59, 130, 246, 0.08)');
      glowGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.03)');
      glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // الكرة الأرضية (المحيط)
      const oceanGradient = ctx.createRadialGradient(
        centerX - radius * 0.3,
        centerY - radius * 0.3,
        0,
        centerX,
        centerY,
        radius,
      );
      oceanGradient.addColorStop(0, 'rgba(96, 165, 250, 0.4)');
      oceanGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.35)');
      oceanGradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.3)');
      oceanGradient.addColorStop(1, 'rgba(29, 78, 216, 0.25)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGradient;
      ctx.fill();

      // خطوط العرض
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 0.5;
      for (let lat = -60; lat <= 60; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const r = Math.cos(latRad) * radius;
        const y = centerY - Math.sin(latRad) * radius;
        ctx.beginPath();
        ctx.ellipse(centerX, y, r, r * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // خطوط الطول
      for (let lon = 0; lon < 360; lon += 20) {
        const lonRad = ((lon - 17) * Math.PI) / 180;
        const cosLon = Math.cos(lonRad + rotation);
        if (cosLon > -0.3) {
          ctx.beginPath();
          for (let lat = -90; lat <= 90; lat += 3) {
            const pos = geoToSphere(lat, lon, rotation);
            const x = centerX + pos.x * radius;
            const y = centerY + pos.y * radius;
            if (lat === -90) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // خط الاستواء
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.1, 0, 0, Math.PI * 2);
      ctx.stroke();

      // رسم جميع القارات
      drawNorthAmerica(ctx, centerX, centerY, radius, rotation);
      drawSouthAmerica(ctx, centerX, centerY, radius, rotation);
      drawEurope(ctx, centerX, centerY, radius, rotation);
      drawAsia(ctx, centerX, centerY, radius, rotation);
      drawAustralia(ctx, centerX, centerY, radius, rotation);
      drawAfrica(ctx, centerX, centerY, radius, rotation);
      drawLibya(ctx, centerX, centerY, radius, rotation);

      // حافة الكرة المتوهجة
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // الغلاف الجوي
      const atmosphereGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.95,
        centerX,
        centerY,
        radius * 1.25,
      );
      atmosphereGradient.addColorStop(0, 'rgba(147, 197, 253, 0)');
      atmosphereGradient.addColorStop(0.3, 'rgba(147, 197, 253, 0.1)');
      atmosphereGradient.addColorStop(0.6, 'rgba(147, 197, 253, 0.05)');
      atmosphereGradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
      ctx.fillStyle = atmosphereGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // تحديث الدوران (بطيء جداً)
      rotation += 0.0015;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // تحديد موقع وحجم الكرة
  const positionClasses = {
    center: 'left-1/2 -translate-x-1/2',
    right: 'left-[60%] md:left-[65%] lg:left-[70%]',
    left: 'right-[60%] md:right-[65%] lg:right-[70%]',
  };

  const sizeClasses = {
    small: 'w-[300px] h-[300px] md:w-[400px] md:h-[400px]',
    medium: 'w-[400px] h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]',
    large: 'w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[800px] lg:h-[800px]',
  };

  return (
    <div
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 overflow-hidden ${positionClasses[position]} ${sizeClasses[size]} ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
