'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/store/authStore';

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = authStore();
  const [phase, setPhase] = useState<'idle' | 'enter' | 'hold' | 'exit'>('idle');

  useEffect(() => {
    // Start animation sequence immediately
    const t1 = setTimeout(() => setPhase('enter'), 50);
    const t2 = setTimeout(() => setPhase('hold'), 700);
    const t3 = setTimeout(() => setPhase('exit'), 2000);
    const t4 = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }, 2600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isAuthenticated, router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .rp-splash * { font-family: 'Poppins', sans-serif; }

        .rp-splash {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: hsl(var(--background));
          overflow: hidden;
          position: relative;
        }

        /* Subtle animated background rings */
        .rp-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
          animation: rp-ring-pulse 3s ease-in-out infinite;
        }
        .rp-ring-1 {
          width: 220px; height: 220px;
          border-color: #1d4ed8;
          opacity: 0;
          animation-delay: 0.4s;
        }
        .rp-ring-2 {
          width: 340px; height: 340px;
          border-color: #0d9488;
          opacity: 0;
          animation-delay: 0.7s;
        }
        .rp-ring-3 {
          width: 460px; height: 460px;
          border-color: #1d4ed8;
          opacity: 0;
          animation-delay: 1s;
        }
        @keyframes rp-ring-pulse {
          0%   { opacity: 0; transform: scale(0.85); }
          30%  { opacity: 0.18; }
          70%  { opacity: 0.08; }
          100% { opacity: 0; transform: scale(1.08); }
        }

        /* Logo wrapper */
        .rp-logo-wrap {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        /* Phase: idle — hidden below */
        .rp-logo-wrap.idle {
          opacity: 0;
          transform: translateY(24px) scale(0.92);
        }

        /* Phase: enter — slide up and scale in */
        .rp-logo-wrap.enter {
          opacity: 0;
          transform: translateY(24px) scale(0.92);
          animation: rp-logo-enter 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes rp-logo-enter {
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Phase: hold — fully visible, gentle float */
        .rp-logo-wrap.hold {
          opacity: 1;
          transform: translateY(0) scale(1);
          animation: rp-logo-float 1.4s ease-in-out infinite;
        }
        @keyframes rp-logo-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }

        /* Phase: exit — fade out and scale down slightly */
        .rp-logo-wrap.exit {
          animation: rp-logo-exit 0.55s cubic-bezier(0.4, 0, 1, 1) forwards;
        }
        @keyframes rp-logo-exit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(-16px) scale(0.94); }
        }

        /* Logo image — shimmer sweep over it */
        .rp-logo-img {
          height: 72px;
          width: auto;
          position: relative;
          filter: drop-shadow(0 4px 24px rgba(29, 78, 216, 0.18));
        }

        /* Shimmer overlay on logo */
        .rp-logo-shimmer {
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255,255,255,0.45) 50%,
            transparent 80%
          );
          animation: rp-shimmer 2.2s ease-in-out infinite;
          pointer-events: none;
          z-index: 3;
        }
        @keyframes rp-shimmer {
          0%   { left: -80%; }
          50%  { left: 120%; }
          100% { left: 120%; }
        }

        /* Tagline fade in after logo */
        .rp-tagline {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          margin-top: 14px;
          opacity: 0;
          animation: rp-tagline-in 0.5s ease 0.9s forwards;
        }
        @keyframes rp-tagline-in {
          to { opacity: 1; }
        }

        /* Dot loader */
        .rp-dots {
          display: flex;
          gap: 6px;
          margin-top: 40px;
          opacity: 0;
          animation: rp-tagline-in 0.4s ease 1.1s forwards;
        }
        .rp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1d4ed8;
          animation: rp-dot-bounce 1.2s ease-in-out infinite;
        }
        .rp-dot:nth-child(1) { animation-delay: 0s; }
        .rp-dot:nth-child(2) { animation-delay: 0.18s; background: #0f7c6b; }
        .rp-dot:nth-child(3) { animation-delay: 0.36s; }
        @keyframes rp-dot-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%            { transform: scale(1.2); opacity: 1; }
        }

        /* Bottom brand line */
        .rp-brand-line {
          position: absolute;
          bottom: 36px;
          font-size: 11px;
          color: hsl(var(--muted-foreground));
          font-weight: 400;
          letter-spacing: 0.04em;
          opacity: 0;
          animation: rp-tagline-in 0.5s ease 1.3s forwards;
        }
      `}</style>

      <div className="rp-splash">
        {/* Background pulse rings */}
        <div className="rp-ring rp-ring-1" />
        <div className="rp-ring rp-ring-2" />
        <div className="rp-ring rp-ring-3" />

        {/* Animated logo block */}
        <div className={`rp-logo-wrap ${phase}`}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src="/rotapay-logo.png"
              alt="RotaPay"
              className="rp-logo-img"
              draggable={false}
            />
            <div className="rp-logo-shimmer" />
          </div>

          <p className="rp-tagline">Employee Finance &amp; Time Management</p>

          <div className="rp-dots">
            <div className="rp-dot" />
            <div className="rp-dot" />
            <div className="rp-dot" />
          </div>
        </div>

        <p className="rp-brand-line">Powered by RotaPay &copy; {new Date().getFullYear()}</p>
      </div>
    </>
  );
}