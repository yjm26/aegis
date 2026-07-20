import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Soft enter on route change. Tailwind-only; no layout thrash, respects reduced-motion.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setEntering(true);
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setEntering(false));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-[100vh]" data-path={location.pathname}>
      <div
        className={`transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          entering ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
