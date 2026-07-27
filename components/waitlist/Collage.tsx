import { ParallaxLayer } from "@/lib/parallax";
import { CollagePhoto } from "./CollagePhoto";
import { Salad, CupSoda, Sprout } from "lucide-react";

export function Collage() {
  return (
    <div className="relative order-2 h-[480px] tablet:order-none tablet:h-[min(620px,72vh)]">
      {/* main bowl */}
      <ParallaxLayer
        depth={0}
        float={{ amplitude: 14, duration: 9 }}
        className="absolute top-[40px] left-[2%] h-[560px] w-[62%]"
        style={{ rotate: -1.5 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[26px] border-[6px] border-warm-white"
          style={{ boxShadow: "0 40px 90px -34px rgba(11,79,55,0.5)" }}
        >
          <CollagePhoto
            src="/Bowl.png"
            alt="Protein bowl with avocado, quinoa, chickpeas and greens"
            placeholderLabel="Protein bowl — chicken, avocado, quinoa, greens"
            placeholderIcon={Salad}
            priority
          />
        </div>
      </ParallaxLayer>

      {/* juice bottle */}
      <ParallaxLayer
        depth={0}
        float={{ amplitude: 14, duration: 11, delay: 1 }}
        className="absolute top-[-8px] right-0 h-[340px] w-[40%]"
        style={{ rotate: 2 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[22px] border-[6px] border-warm-white"
          style={{ boxShadow: "0 34px 70px -30px rgba(11,79,55,0.5)" }}
        >
          <CollagePhoto
            src="/juice.png"
            alt="Detox Daily green, orange and pink juice bottles"
            placeholderLabel="Detox Daily green juice bottle"
            placeholderIcon={CupSoda}
          />
        </div>
      </ParallaxLayer>

      {/* avocado */}
      <ParallaxLayer
        depth={0}
        float={{ amplitude: 14, duration: 12, delay: 0.5 }}
        className="absolute bottom-3 right-[4%] h-[260px] w-[44%]"
        style={{ rotate: -2.5 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[22px] border-[6px] border-warm-white"
          style={{ boxShadow: "0 30px 64px -28px rgba(11,79,55,0.45)" }}
        >
          <CollagePhoto
            src="/Ingredients.png"
            alt="Detox Daily healthy ingredients spread — avocado, spinach, nuts and seeds"
            placeholderLabel="Avocado, lemon, cucumber, herbs"
            placeholderIcon={Sprout}
          />
        </div>
      </ParallaxLayer>
    </div>
  );
}
