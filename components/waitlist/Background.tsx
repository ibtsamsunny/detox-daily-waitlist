import { ParallaxLayer } from "@/lib/parallax";
import { FloatingLeafIcon } from "./icons";

const NOISE_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* base gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(1100px 700px at 82% 18%, rgba(183,190,149,0.28), transparent 60%),
            radial-gradient(900px 620px at 12% 78%, rgba(252,251,248,0.9), transparent 55%),
            radial-gradient(700px 500px at 60% 55%, rgba(247,199,106,0.10), transparent 60%),
            linear-gradient(160deg, #FCFBF8 0%, #F8F4EB 45%, #F3EFE2 100%)`,
        }}
      />

      {/* flowing contour lines */}
      <ParallaxLayer
        depth={8}
        drift={{ amplitude: 40, duration: 40 }}
        className="absolute -top-[6%] -right-[8%] w-[70%] h-[120%] opacity-50"
      >
        <svg viewBox="0 0 800 900" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid slice">
          <g stroke="#B7BE95" strokeWidth={1.1} opacity={0.55}>
            <path d="M-40 120 C 200 60, 420 220, 640 150 S 900 120, 1000 220" />
            <path d="M-40 200 C 200 150, 420 300, 640 230 S 900 210, 1000 300" />
            <path d="M-40 300 C 220 240, 430 400, 660 330 S 900 300, 1000 400" />
            <path d="M-40 400 C 220 350, 430 500, 660 430 S 900 410, 1000 500" />
            <path d="M-40 520 C 220 460, 430 610, 660 540 S 900 520, 1000 610" />
            <path d="M-40 640 C 220 590, 430 730, 660 660 S 900 640, 1000 730" />
          </g>
        </svg>
      </ParallaxLayer>

      {/* soft blurred organic blobs — the blur filter is expensive to recomposite on
          mobile GPUs during scroll, so it's tablet+ only; the gradient's own falloff
          reads soft enough on mobile without it. */}
      <ParallaxLayer
        depth={16}
        float={{ amplitude: 14, duration: 16 }}
        className="absolute top-[8%] left-[4%] w-[380px] h-[380px] rounded-full tablet:blur-[30px]"
        style={{
          background: "radial-gradient(circle at 40% 35%, rgba(183,190,149,0.35), transparent 62%)",
        }}
      />
      <ParallaxLayer
        depth={24}
        float={{ amplitude: 14, duration: 22 }}
        className="absolute -bottom-[6%] right-[22%] w-[460px] h-[460px] rounded-full tablet:blur-[40px]"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(247,199,106,0.18), transparent 60%)",
        }}
      />

      {/* botanical watermark */}
      <svg
        viewBox="0 0 200 300"
        width={360}
        height={540}
        className="absolute -bottom-10 -left-8 opacity-5"
        fill="none"
        stroke="#0B4F37"
        strokeWidth={2}
      >
        <path d="M100 290 C 100 200, 100 140, 100 60" />
        <path d="M100 220 C 60 200, 40 160, 44 120 C 84 128, 100 170, 100 210" />
        <path d="M100 180 C 140 160, 160 120, 156 82 C 116 92, 100 132, 100 172" />
        <path d="M100 130 C 66 116, 52 84, 56 52 C 90 62, 100 96, 100 126" />
      </svg>

      {/* floating leaves */}
      <ParallaxLayer depth={30} leaf={{ duration: 18 }} className="absolute top-[12%] left-[46%]">
        <FloatingLeafIcon size={34} color="#5C7A4E" strokeColor="#3F5A34" />
      </ParallaxLayer>
      <ParallaxLayer depth={40} leaf={{ duration: 22, delay: 2 }} className="absolute top-[70%] left-[58%]">
        <FloatingLeafIcon size={26} color="#7A8B5A" />
      </ParallaxLayer>
      <ParallaxLayer depth={22} leaf={{ duration: 26, delay: 1 }} className="absolute top-[40%] left-[33%]">
        <FloatingLeafIcon size={20} color="#93A06E" />
      </ParallaxLayer>

      {/* noise — mix-blend-mode forces a repaint of whatever's behind it, which is
          expensive during scroll; the effect is subtle enough to skip on mobile. */}
      <div
        className="absolute inset-0 hidden opacity-[0.035] mix-blend-multiply tablet:block"
        style={{ backgroundImage: `url("${NOISE_DATA_URI}")` }}
      />
    </div>
  );
}
