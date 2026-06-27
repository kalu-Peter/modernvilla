import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only animate on actual navigation (not initial mount) — and don't
    // leave any transform/will-change behind once settled. Per the CSS
    // transforms spec, ANY non-"none" transform value (even a no-op like
    // translateY(0)) or "will-change: transform" makes this div the
    // containing block for every position:fixed descendant on the page
    // (modals, lightboxes, the sticky header) instead of the viewport —
    // inset:0 overlays then size themselves to this div's document height
    // and can force the page to scroll to wherever this div happens to sit.
    if (el.dataset.mounted !== "1") {
      el.dataset.mounted = "1";
      el.style.opacity = "1";
      return;
    }
    el.style.willChange = "opacity, transform";
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    const cleanup = window.setTimeout(() => {
      el.style.willChange = "auto";
      el.style.transform = "none";
      el.style.transition = "";
    }, 450);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(cleanup);
    };
  }, [location.pathname]);

  return (
    <div ref={ref} style={{ display: "flow-root" }}>
      {children}
    </div>
  );
};

export default PageTransition;
