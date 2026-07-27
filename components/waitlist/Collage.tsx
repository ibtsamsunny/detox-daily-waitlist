import { ParallaxLayer } from "@/lib/parallax";
import { CollagePhoto } from "./CollagePhoto";
import { Salad, CupSoda, Sprout } from "lucide-react";

export function Collage() {
  return (
    <div className="relative order-2 h-[420px] w-full max-w-[420px] mx-auto tablet:order-none tablet:mx-0 tablet:w-auto tablet:max-w-none tablet:h-[min(620px,72vh)]">
      {/* main bowl */}
      <ParallaxLayer
        depth={0}
        float={{ amplitude: 14, duration: 9 }}
        className="absolute top-[8px] left-[2%] h-[320px] w-[60%] tablet:top-[40px] tablet:h-[560px] tablet:w-[62%]"
        style={{ rotate: -1.5 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[20px] border-[5px] border-warm-white tablet:rounded-[26px] tablet:border-[6px]"
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
        className="absolute top-0 right-0 h-[170px] w-[42%] tablet:top-[-8px] tablet:h-[340px] tablet:w-[40%]"
        style={{ rotate: 2 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[16px] border-[5px] border-warm-white tablet:rounded-[22px] tablet:border-[6px]"
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
        className="absolute bottom-0 right-[2%] h-[145px] w-[46%] tablet:bottom-3 tablet:right-[4%] tablet:h-[260px] tablet:w-[44%]"
        style={{ rotate: -2.5 }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[16px] border-[5px] border-warm-white tablet:rounded-[22px] tablet:border-[6px]"
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
