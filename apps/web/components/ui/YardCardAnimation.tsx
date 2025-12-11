import { useEffect, useRef } from 'react';

export default function YardCardAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // Configuration for the premium look
    const config = {
      gridColor: 'rgba(56, 189, 248, 0.15)', // Light Blue
      spotlightColor: 'rgba(255, 255, 255, 0.03)',
      accentColor: 'rgba(234, 179, 8, 0.6)', // Gold for "Auction"
      particleCount: 40,
      speed: 0.5,
    };

    // Particles for "atmosphere"
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      life: number;
    }[] = [];

    const initParticles = () => {
      particles.length = 0;
      for (let i = 0; i < config.particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          life: Math.random() * 100,
        });
      }
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.life -= 0.1;

        // Wrap around
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Pulse opacity
        const opacity = p.alpha * (0.5 + 0.5 * Math.sin(time * 0.05 + p.life));

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Dynamic Grid (Perspective Floor)
    const drawGrid = () => {
      const horizonY = height * 0.3; // Horizon line
      const centerX = width / 2;

      ctx.lineWidth = 1;

      // Vertical lines (perspective)
      for (let i = -10; i <= 10; i++) {
        const xOffset = i * 60;
        // Move lines based on time to simulate forward movement
        const moveOffset = Math.sin(time * 0.005) * 50;

        ctx.strokeStyle = config.gridColor;
        ctx.beginPath();
        ctx.moveTo(centerX + xOffset * 0.1 + moveOffset * 0.1, horizonY);
        ctx.lineTo(centerX + xOffset * 3 + moveOffset, height);
        ctx.stroke();
      }

      // Horizontal lines (moving towards camera)
      const speed = (time * config.speed) % 40;
      for (let i = 0; i < 15; i++) {
        const y = horizonY + Math.pow(i / 10, 2) * (height - horizonY) + speed;
        if (y > height) continue;

        const alpha = 1 - (y - horizonY) / (height - horizonY); // Fade out near bottom
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    // Sweeping Spotlights (Car Showroom feel)
    const drawSpotlights = () => {
      // Spotlight 1: Blue/White sweeping left to right
      const spot1X = width * 0.2 + Math.sin(time * 0.01) * width * 0.4;
      const spot1Y = height * 0.5;
      const grad1 = ctx.createRadialGradient(spot1X, spot1Y, 0, spot1X, spot1Y, width * 0.6);
      grad1.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Spotlight 2: Gold/Warm sweeping right to left (Reliability/Premium)
      const spot2X = width * 0.8 + Math.sin(time * 0.015 + Math.PI) * width * 0.4;
      const spot2Y = height * 0.6;
      const grad2 = ctx.createRadialGradient(spot2X, spot2Y, 0, spot2X, spot2Y, width * 0.5);
      grad2.addColorStop(0, 'rgba(234, 179, 8, 0.08)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    };

    // Abstract "Car Shape" or "Motion Lines" passing by
    const drawMotionLines = () => {
      if (Math.random() > 0.95) {
        // Occasionally spawn a fast moving line
      }

      const lineY = height * 0.7 + Math.sin(time * 0.02) * 50;
      const lineWidth = 200;
      const lineX = ((time * 5) % (width + lineWidth * 2)) - lineWidth;

      const grad = ctx.createLinearGradient(lineX, lineY, lineX + lineWidth, lineY);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = grad;
      ctx.transform(1, 0, -0.5, 1, 0, 0); // Skew for speed look
      ctx.fillRect(lineX, lineY, lineWidth, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    };

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const animate = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // Background base
      // (Handled by CSS gradient in parent, but we can add a dark overlay if needed)

      drawSpotlights();
      drawGrid();
      drawMotionLines();
      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden bg-slate-900">
      {/* Base Gradient - Deep Premium Blue/Black */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-950" />

      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full mix-blend-screen" />

      {/* Overlay Gradient for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Top Shine/Reflection */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
    </div>
  );
}
