"use client";

import { motion } from "framer-motion";
import { SparkleIcon } from "./icons";

const RISE_EASE = [0.2, 0.7, 0.2, 1] as const;

export function Headline() {
  return (
    <h1
      className="relative mt-[18px] font-display font-bold text-heading"
      style={{
        lineHeight: 1.02,
        letterSpacing: "-1px",
        fontSize: "clamp(40px, 4.6vw, 70px)",
      }}
    >
      <motion.span
        className="block"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: RISE_EASE }}
      >
        Healthy food
      </motion.span>
      <motion.span
        className="block font-medium italic text-olive"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.42, ease: RISE_EASE }}
      >
        worth waiting for.
      </motion.span>
      <motion.span
        className="absolute -top-1.5 right-[8%] animate-twinkle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
      >
        <SparkleIcon size={26} />
      </motion.span>
    </h1>
  );
}
