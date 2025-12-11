/**
 * مكون رمز QR
 */

import { useEffect, useRef } from 'react';

export interface QRCodeProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
}

export function QRCode({
  value,
  size = 128,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'L',
  includeMargin = false,
  className = '',
  imageSettings,
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // رسم خلفية
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // رسم رمز QR بسيط (placeholder)
    // في الإنتاج، استخدم مكتبة مثل qrcode.react
    ctx.fillStyle = fgColor;

    const margin = includeMargin ? size * 0.1 : 0;
    const qrSize = size - margin * 2;
    const cellSize = qrSize / 25;

    // رسم نمط QR مبسط
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Position detection patterns (corners)
        const isCorner = (row < 7 && col < 7) || (row < 7 && col >= 18) || (row >= 18 && col < 7);

        // Timing patterns
        const isTiming = row === 6 || col === 6;

        // Pseudo-random data based on value
        const hash = value.charCodeAt(row % value.length) ^ value.charCodeAt(col % value.length);
        const isData = (hash + row + col) % 3 === 0;

        if (isCorner || isTiming || isData) {
          ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize, cellSize);
        }
      }
    }

    // رسم الصورة في المنتصف إذا وجدت
    if (imageSettings) {
      const img = new Image();
      img.onload = () => {
        const x = (size - imageSettings.width) / 2;
        const y = (size - imageSettings.height) / 2;

        if (imageSettings.excavate) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(x - 2, y - 2, imageSettings.width + 4, imageSettings.height + 4);
        }

        ctx.drawImage(img, x, y, imageSettings.width, imageSettings.height);
      };
      img.src = imageSettings.src;
    }
  }, [value, size, bgColor, fgColor, level, includeMargin, imageSettings]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />
      <noscript>
        <p className="mt-2 text-center text-sm text-gray-500">يرجى تفعيل JavaScript لعرض رمز QR</p>
      </noscript>
    </div>
  );
}

export default QRCode;
