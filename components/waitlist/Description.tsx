"use client";

import { motion } from "framer-motion";

const RISE_EASE = [0.2, 0.7, 0.2, 1] as const;

export function Description() {
  return (
    <motion.p
      className="mt-3 max-w-[440px] text-[16.5px] text-body-secondary"
      style={{ lineHeight: 1.55 }}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6, ease: RISE_EASE }}
    >
      Fresh protein bowls, vibrant salads and detox drinks — prepared daily and delivered
      across <strong className="font-semibold text-heading">Lahore.</strong>
    </motion.p>
  );
}
