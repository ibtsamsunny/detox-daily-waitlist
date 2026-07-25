"use client";

import { motion } from "framer-motion";

const RISE_EASE = [0.2, 0.7, 0.2, 1] as const;

export function LaunchBadge() {
  return (
    <motion.div
      className="mt-5"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: RISE_EASE }}
    >
      <span
        className="inline-flex items-center gap-2 rounded-full bg-sage px-[18px] py-[9px] text-[12px] font-semibold uppercase text-heading"
        style={{
          letterSpacing: "1.6px",
          boxShadow: "0 6px 16px -8px rgba(11,79,55,0.4)",
        }}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest" />
        Launching Soon in Lahore
      </span>
    </motion.div>
  );
}
