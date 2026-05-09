import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  );
};

export default PageTransition;
