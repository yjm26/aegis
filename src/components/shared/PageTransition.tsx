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
    const raf = window.requestAnimationFrame(() => setEntering(false));
    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div className="min-h-[100vh]" data-path={location.pathname}>
      <div
        className={`transition-[opacity,transform] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          entering ? 'translate-y-2.5 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
