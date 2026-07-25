"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
    >
      <Image
        src="/detox-logo.png"
        alt="Detox Daily"
        height={62}
        width={276}
        priority
        style={{ height: 62, width: "auto" }}
      />
    </motion.div>
  );
}
