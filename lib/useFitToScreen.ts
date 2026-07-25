"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures the content element's natural height against the *actual* available
 * space inside its (padded) container, and scales the content down (never up)
 * so it always fits without scrolling — the page's core "single screen"
 * requirement. Re-measures on resize, on font load, and shortly after mount
 * (fonts/images can still shift layout after the first paint).
 *
 * Deriving "available" from the container's own padded box (rather than
 * `window.innerHeight` minus a guessed constant) keeps this correct across
 * breakpoints where vertical padding changes.
 */
export function useFitToScreen<C extends HTMLElement, T extends HTMLElement>() {
  const containerRef = useRef<C | null>(null);
  const contentRef = useRef<T | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;

      const containerStyle = window.getComputedStyle(container);
      const paddingTop = parseFloat(containerStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(containerStyle.paddingBottom) || 0;
      const available = container.clientHeight - paddingTop - paddingBottom;

      const prevTransform = content.style.transform;
      content.style.transform = "none";
      const natural = content.offsetHeight;
      content.style.transform = prevTransform;

      if (natural > available) {
        setScale(Math.max(0.5, available / natural));
      } else {
        setScale(1);
      }
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const timeout = window.setTimeout(measure, 350);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { containerRef, contentRef, scale };
}
