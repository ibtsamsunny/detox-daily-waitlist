"use client";

import { motion } from "framer-motion";
import { SparkleIcon } from "./icons";

/** The circular badge itself — reused by both the mobile (inline) and tablet+ (overlay) placements. */
function OfferBadge() {
  return (
    <div
      className="offer-breathe relative flex h-[246px] w-[246px] flex-col items-center justify-center rounded-full border-[3px] text-center text-white"
      style={{
        background: "radial-gradient(circle at 42% 32%, #F9B451 0%, #F39B28 46%, #E5851A 100%)",
        borderColor: "var(--color-offer-gold)",
      }}
    >
      <div className="absolute inset-2 rounded-full border border-white/35" />
      <div className="absolute top-10 opacity-90">
        <SparkleIcon size={18} color="#FFF" />
      </div>
      <div
        className="mt-[30px] text-[11px] font-semibold uppercase opacity-95"
        style={{ letterSpacing: "1.8px" }}
      >
        Founding Member Offer
      </div>
      <div className="mt-0.5 flex items-start leading-none">
        <span className="font-display text-[72px] font-extrabold">20</span>
        <span className="mt-1.5 font-display text-[26px] font-bold">%</span>
        <span className="mb-3 ml-0.5 self-end text-[22px] font-bold">OFF</span>
      </div>
      <div className="my-1.5 h-px w-[120px] bg-white/50" />
      <div className="text-base font-bold" style={{ letterSpacing: "0.5px" }}>
        FREE DELIVERY
      </div>
      <div className="mt-0.5 text-[10px] font-medium opacity-90" style={{ letterSpacing: "1.4px" }}>
        FOR YOUR FIRST MONTH
      </div>
    </div>
  );
}

/**
 * Sits inline right after the intro copy so the offer is visible as soon as
 * the page loads on mobile, instead of after the whole form + photo collage.
 */
export function OfferCircleMobile() {
  return (
    <div className="my-2 flex justify-center tablet:hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.85, ease: [0.2, 0.9, 0.3, 1.2] }}
      >
        <OfferBadge />
      </motion.div>
    </div>
  );
}

/** Absolutely positioned, overlapping both columns — matches the original design at tablet/desktop. */
export function OfferCircleDesktop() {
  return (
    <div className="hidden tablet:absolute tablet:left-1/2 tablet:top-1/2 tablet:z-[5] tablet:block tablet:[transform:translate(-58%,-46%)]">
      {/* Entrance pop lives on this inner wrapper so it never clobbers the outer
          element's centering transform (translate(-58%,-46%)). */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.85, ease: [0.2, 0.9, 0.3, 1.2] }}
      >
        <OfferBadge />
      </motion.div>
    </div>
  );
}
