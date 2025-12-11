import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
}

export default function LoginAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 150;
    const connectionDistance = 120;
    const mouseDistance = 200;

    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;

    // Initialize dimensions
    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          z: Math.random() * 1000 - 500, // Depth
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vz: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
        });
      }
    };

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left - width / 2;
      mouseY = e.clientY - rect.top - height / 2;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Center of projection
      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 800;

      // Update and draw particles
      particles.forEach((p, i) => {
        // Move particles
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Mouse interaction (gentle rotation/push)
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseDistance) {
          const force = (mouseDistance - dist) / mouseDistance;
          p.vx -= (dx / dist) * force * 0.05;
          p.vy -= (dy / dist) * force * 0.05;
        }

        // Boundaries (wrap around)
        if (p.z < -500) p.z = 500;
        if (p.z > 500) p.z = -500;
        if (p.x < -width / 2) p.x = width / 2;
        if (p.x > width / 2) p.x = -width / 2;
        if (p.y < -height / 2) p.y = height / 2;
        if (p.y > height / 2) p.y = -height / 2;

        // 3D Projection
        const scale = focalLength / (focalLength + p.z);
        const x2d = p.x * scale + cx;
        const y2d = p.y * scale + cy;

        // Draw particle
        const alpha = Math.min(1, (p.z + 500) / 1000); // Fade distant particles
        ctx.beginPath();
        ctx.arc(x2d, y2d, p.size * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.8})`; // Sky blue-ish
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dz = p.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDistance) {
            const scale2 = focalLength / (focalLength + p2.z);
            const x2d2 = p2.x * scale2 + cx;
            const y2d2 = p2.y * scale2 + cy;

            ctx.beginPath();
            ctx.moveTo(x2d, y2d);
            ctx.lineTo(x2d2, y2d2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / connectionDistance) * alpha})`;
            ctx.lineWidth = 1 * scale;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-slate-900"
      style={{ backgroundColor: '#0f172a' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-80" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: 'blur(0px)' }}
      />
    </div>
  );
}
