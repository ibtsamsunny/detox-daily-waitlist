"use client";

import { createContext, useContext, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  MotionValue,
  animate,
} from "framer-motion";

type ParallaxContextValue = {
  mx: MotionValue<number>;
  my: MotionValue<number>;
};

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

/** Tracks normalized cursor offset from viewport center ([-1, 1]) for the whole page. */
export function ParallaxProvider({ children }: { children: React.ReactNode }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mx.set((e.clientX - w / 2) / (w / 2));
      my.set((e.clientY - h / 2) / (h / 2));
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <ParallaxContext.Provider value={{ mx, my }}>
      {children}
    </ParallaxContext.Provider>
  );
}

function useParallaxCursor() {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error("useParallaxCursor must be used within a ParallaxProvider");
  return ctx;
}

/** A motion value that loops through keyframes forever, e.g. a float or drift animation. */
function useLoop(
  keyframes: number[],
  {
    duration,
    delay = 0,
    repeatType = "loop",
    times,
  }: {
    duration: number;
    delay?: number;
    repeatType?: "loop" | "reverse";
    times?: number[];
  }
) {
  const mv = useMotionValue(keyframes[0]);
  useEffect(() => {
    const controls = animate(mv, keyframes, {
      duration,
      delay,
      repeat: Infinity,
      repeatType,
      ease: "easeInOut",
      times,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mv, duration, delay, repeatType]);
  return mv;
}

type ParallaxLayerProps = {
  depth: number;
  className?: string;
  /** Plain CSS props plus a numeric `rotate` (degrees) — Framer Motion accepts a bare number here. */
  style?: Omit<React.CSSProperties, "rotate"> & { rotate?: number };
  children?: React.ReactNode;
  /** Continuous float loop on the Y axis (translateY 0 -> -amplitude -> 0). */
  float?: { amplitude: number; duration: number; delay?: number };
  /** Continuous drift loop on the X axis (translateX 0 -> -amplitude, alternating). */
  drift?: { amplitude: number; duration: number };
  /** Continuous organic leaf-like drift on both axes plus rotation. */
  leaf?: { duration: number; delay?: number };
};

const ZERO: [number] = [0];

/**
 * Combines page-wide cursor parallax with a layer's own continuous animation loop
 * by composing motion values via useTransform, rather than writing to the `transform`
 * style directly (which would fight a CSS keyframe animation on the same property).
 */
export function ParallaxLayer({
  depth,
  className,
  style,
  children,
  float,
  drift,
  leaf,
}: ParallaxLayerProps) {
  const { mx, my } = useParallaxCursor();

  const floatY = useLoop(float ? [0, -float.amplitude, 0] : ZERO, {
    duration: float?.duration ?? 1,
    delay: float?.delay,
  });
  const driftX = useLoop(drift ? [0, -drift.amplitude] : ZERO, {
    duration: drift?.duration ?? 1,
    repeatType: "reverse",
  });
  const leafX = useLoop(leaf ? [0, 14, -10, 0] : ZERO, {
    duration: leaf?.duration ?? 1,
    delay: leaf?.delay,
    times: [0, 0.33, 0.66, 1],
  });
  const leafY = useLoop(leaf ? [0, -22, -10, 0] : ZERO, {
    duration: leaf?.duration ?? 1,
    delay: leaf?.delay,
    times: [0, 0.33, 0.66, 1],
  });
  const leafRotate = useLoop(leaf ? [0, 18, -12, 0] : ZERO, {
    duration: leaf?.duration ?? 1,
    delay: leaf?.delay,
    times: [0, 0.33, 0.66, 1],
  });

  const px = useTransform(mx, (v) => -v * depth);
  const py = useTransform(my, (v) => -v * depth);

  // leafX/leafY/driftX are constant 0 motion values when their prop isn't passed,
  // so they can always be included in the sum below.
  const x = useTransform([px, driftX, leafX], ([a, b, c]) => Number(a) + Number(b) + Number(c));
  const y = useTransform([py, floatY, leafY], ([a, b, c]) => Number(a) + Number(b) + Number(c));

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        x,
        y,
        rotate: leaf ? leafRotate : style?.rotate,
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}
