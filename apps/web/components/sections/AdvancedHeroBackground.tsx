import React from 'react';

const AdvancedHeroBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-blue-600">
      {/* Primary Blue Gradient Background - Consistent with Project Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 opacity-100"></div>
      
      {/* 3D Perspective Grid - Stability & Tech */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) scale(2)',
          transformOrigin: 'top center',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%, black 100%)'
        }}
      />

      {/* Abstract Security/Trust Particles - Network Effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Professional Floating Data/Numbers - Subtle & 3D */}
      <div className="absolute inset-0 overflow-hidden perspective-container">
        {[
          { val: '24,500', top: '20%', left: '10%', delay: '0s', scale: 0.8 },
          { val: '18,200', top: '60%', left: '85%', delay: '2s', scale: 0.9 },
          { val: 'BID', top: '30%', left: '80%', delay: '4s', scale: 0.7 },
          { val: 'LIVE', top: '70%', left: '15%', delay: '1s', scale: 0.6 },
          { val: '32,000', top: '15%', left: '60%', delay: '3s', scale: 0.5 },
          { val: '%', top: '80%', left: '50%', delay: '5s', scale: 0.4 },
        ].map((item, i) => (
          <div
            key={i}
            className="absolute font-mono text-blue-200/10 font-bold select-none animate-float-3d backdrop-blur-sm border border-white/5 rounded px-2 py-1"
            style={{
              top: item.top,
              left: item.left,
              fontSize: `${item.scale * 2 + 1}rem`,
              animationDelay: item.delay,
              transform: `scale(${item.scale})`,
            }}
          >
            {item.val}
          </div>
        ))}
      </div>

      {/* Overlay Vignette for Focus */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-transparent to-transparent opacity-80"></div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        @keyframes float-3d {
          0% { 
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg); 
            opacity: 0.1;
          }
          50% { 
            transform: translate3d(20px, -30px, 50px) rotateX(5deg) rotateY(10deg); 
            opacity: 0.2;
          }
          100% { 
            transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg); 
            opacity: 0.1;
          }
        }
        .animate-float-3d {
          animation: float-3d 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdvancedHeroBackground;
