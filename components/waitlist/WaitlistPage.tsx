"use client";

import { ParallaxProvider } from "@/lib/parallax";
import { useFitToScreen } from "@/lib/useFitToScreen";
import { Background } from "./Background";
import { Logo } from "./Logo";
import { LaunchBadge } from "./LaunchBadge";
import { Headline } from "./Headline";
import { AccentDivider } from "./AccentDivider";
import { Description } from "./Description";
import { WaitlistForm } from "./WaitlistForm";
import { Collage } from "./Collage";
import { OfferCircle } from "./OfferCircle";

export function WaitlistPage() {
  const { containerRef, contentRef, scale } = useFitToScreen<HTMLDivElement, HTMLDivElement>();

  return (
    <ParallaxProvider>
      <div className="relative min-h-dvh w-full bg-cream font-body tablet:h-dvh tablet:overflow-hidden">
        <Background />

        <div
          ref={containerRef}
          className="relative z-[2] mx-auto flex min-h-dvh max-w-[1400px] flex-col justify-center px-5 py-10 tablet:h-dvh tablet:p-[40px_56px_64px]"
        >
          <div
            ref={contentRef}
            style={{ transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: "center center" }}
            className="relative grid grid-cols-1 items-center gap-5 text-center tablet:grid-cols-2 tablet:gap-10 tablet:text-left desktop:grid-cols-[1.02fr_1.15fr]"
          >
            {/* LEFT COLUMN */}
            <div className="mx-auto max-w-[520px] tablet:mx-0 tablet:max-w-[560px]">
              <Logo />
              <LaunchBadge />
              <Headline />
              <AccentDivider />
              <Description />
              <div className="flex justify-center tablet:block">
                <WaitlistForm />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <Collage />

            {/* OFFER CIRCLE (overlaps both columns on tablet/desktop) */}
            <OfferCircle />
          </div>
        </div>
      </div>
    </ParallaxProvider>
  );
}
