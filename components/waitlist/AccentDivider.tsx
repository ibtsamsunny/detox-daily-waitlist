"use client";

import { motion } from "framer-motion";
import { LeafSproutIcon } from "./icons";

export function AccentDivider() {
  return (
    <motion.div
      className="mt-3.5 flex items-center gap-2.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
    >
      <span className="h-0.5 w-16 rounded-full bg-offer-mid" />
      <LeafSproutIcon size={18} />
    </motion.div>
  );
}
