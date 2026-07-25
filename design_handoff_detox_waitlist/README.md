# Handoff: Detox Daily — Pre-Launch Waitlist Landing Page

## Overview
A single-screen (non-scrolling, 100vh) premium waitlist landing page for **Detox Daily**, a healthy-food delivery brand launching in Lahore. Its only goal is **lead capture** before launch: name, email, phone → "Reserve My Spot" → confirmation state. The aesthetic target is calm, elegant, organic-luxury wellness (think Aesop / Sweetgreen / Apple), not a typical food-delivery site.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look, motion, and behavior. They are **not** production code to drop in verbatim.

Your task is to **recreate this design in the target codebase's environment** (the original brief specifies React / Next.js + Tailwind + Framer Motion or GSAP) using that stack's established patterns and component conventions. If no codebase exists yet, scaffold a Next.js + Tailwind project and implement it there.

Two files matter:
- `Detox Daily Waitlist.dc.html` — the authoritative source. It uses a small in-house "Design Component" runtime (`<x-dc>` template + a `Component` logic class). **Ignore the runtime**; read it as "markup with inline styles + a component class with state/handlers/effects." All values (styles, animations, copy) are literal and portable.
- `detox-waitlist-standalone.html` — the same design compiled to a single self-contained HTML file (all JS/CSS/logo inlined). Open it directly in a browser to see the finished design and all animations. Use this as the visual/motion ground truth.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, copy, and animation timings are all specified below and are intended to be reproduced pixel-for-pixel. The only placeholders are the three food photographs (see Assets).

## Screens / Views

### Screen: Waitlist (single view, two states)
- **Purpose:** Visitor reads the value prop and submits the waitlist form to reserve a 20%-off founding-member offer.
- **Canvas:** Full viewport. Root is `height: 100vh; overflow: hidden` — the page **never scrolls**. Content is centered and **auto-scales down** (CSS `transform: scale`) when the viewport is shorter than the content's natural height, so the logo, CTA, and fine print always stay on screen (see Interactions → Fit-to-screen).
- **Max content width:** 1400px, centered, horizontal padding 56px (desktop) / 20px (mobile).

**Layout — desktop (≥1180px):** CSS grid, 2 columns `1.02fr 1.15fr`, gap 40px, vertically centered.
- **Left column** (max-width 560px): logo → launch badge → headline → accent divider → description → waitlist card (stacked, top-aligned).
- **Right column** (height `min(620px, 72vh)`, `position: relative`): a **collage of 3 absolutely-positioned, slightly-rotated, floating image cards**.
- **Offer circle:** absolutely positioned at the grid's center (`left:50%; top:50%; transform: translate(-58%,-46%)`), `z-index:5`, overlapping both columns.

**Layout — tablet (900–1179px):** grid becomes `1fr 1fr`, same structure.

**Layout — mobile (<900px):** single column, centered text. Order: left column (logo/badge/headline/desc/form) → offer circle (becomes static, centered, `margin: 6px auto 8px`) → right column collage (`order: 2`, height 480px). Form is full-width (max 520px), large tap targets (48–52px).

#### Components

**1. Logo**
- Image asset `detox-logo.png` (DD monogram with leaf + "DETOX DAILY" wordmark, dark green on transparent). Rendered at `height: 62px; width: auto`.
- Entrance: fade in, delay 0.05s.

**2. Launch badge (pill)**
- Text: `Launching Soon in Lahore` — uppercase, 12px, weight 600, letter-spacing 1.6px.
- Small 6px dark-green dot before text, gap 8px.
- Background `#B7BE95` (light sage), text `#123323`, padding `9px 18px`, border-radius 999px, shadow `0 6px 16px -8px rgba(11,79,55,0.4)`.
- Entrance: rise (translateY 28px→0 + fade), delay 0.2s.

**3. Headline**
- Two lines, Playfair Display, line-height 1.02, letter-spacing -1px, `font-size: clamp(40px, 4.6vw, 70px)`.
  - Line 1 `Healthy food` — weight 700, color `#123323`. Entrance rise, delay 0.3s.
  - Line 2 `worth waiting for.` — **italic**, weight 500, color `#7C8A54` (olive). Entrance rise, delay 0.42s.
- Decorative orange 4-point sparkle (SVG) at top-right of headline; twinkle loop + fade-in at 0.9s.

**4. Accent divider**
- Orange bar `#F39B28`, 64px × 2px, radius 2px, + a small olive leaf SVG (18px). Gap 10px. Fade in, delay 0.55s.

**5. Description**
- Copy: `Fresh protein bowls, vibrant salads and detox drinks — prepared daily and delivered across **Lahore.**` ("Lahore." bold, `#123323`).
- 16.5px, line-height 1.55, color `#5F6558` (secondary), max-width 440px. Entrance rise, delay 0.6s.

**6. Waitlist card** (the conversion focus)
- Background `rgba(252,251,248,0.86)` + `backdrop-filter: blur(8px)`, border `1px solid rgba(183,190,149,0.45)`, **border-radius 28px**, padding `24px 30px 22px`, max-width 470px.
- Shadow: `0 30px 70px -34px rgba(11,79,55,0.35), 0 2px 8px rgba(11,79,55,0.04)`.
- Entrance: scale-in (0.95→1 + fade), delay 0.7s. Hover: soft lift (transition on transform + shadow).
- **Header (centered):** small green leaf SVG → `Unlock Your Launch Offer` (Playfair, 25px, weight 600, `#123323`) → `Reserve your spot before launch and activate your exclusive rewards.` (14.5px, `#5F6558`, max-width 320px).
- **Inputs (3), stacked, gap 10px:** each is a `<label>` wrapper containing a 18px stroke icon + `<input>`.
  - Fields: **Full Name** (text, required, user icon), **Email Address** (email, required, envelope icon), **Phone Number** (tel, optional, phone icon).
  - Field style: background `#FBFAF5`, border `1.5px solid #E7E4D6`, radius 14px, height 48px, padding `0 16px`, icon+input gap 11px. Input text 15px `#123323`, placeholder `#9AA08F`.
  - **Hover:** border `#C9CDBB`.
  - **Focus (`:focus-within`):** border `#0B4F37`, background `#FFFFFF`, glow `box-shadow: 0 0 0 4px rgba(183,190,149,0.3)`.
- **Primary button (submit):** height 52px, radius 15px, full width, gap 10px, centered.
  - Background `linear-gradient(180deg, #0F5E42 0%, #0B4F37 100%)`, text `#FCFBF8`, weight 600, 15.5px.
  - Label: `Reserve My Spot & Unlock 20% OFF` + right-arrow SVG.
  - Shadow `0 14px 28px -12px rgba(11,79,55,0.6)`.
  - **Hover:** lift `translateY(-3px)`, `filter: brightness(1.12)`, glow `0 22px 40px -14px rgba(11,79,55,0.7), 0 0 0 4px rgba(183,190,149,0.35)`, and the **arrow slides right 4px**. (Brief also calls for a click ripple — optional, not implemented in the prototype.)
- **Below button:** `✦ FREE delivery for your first month` — 14px, weight 600, orange `#E88A1A` (✦ mark `#F39B28`). Then `No payment required today.` — 12.5px, `#97998C`.
- **Success state** (replaces form contents after submit): centered green check in a `#E9EEDD` circle (62px) → `You're on the list.` (Playfair 26px) → `Your **20% founding member offer** is reserved. We'll email you the moment we launch in Lahore.`

**7. Right-column collage (3 cards)** — each card: `border: 6px solid #FCFBF8`, rounded corners, drop shadow, slight rotation, continuous float loop.
- **Main bowl** — `top:40px; left:2%; width:62%; height:560px`, rotate `-1.5deg`, radius 26px, shadow `0 40px 90px -34px rgba(11,79,55,0.5)`, float 9s. Photo: protein bowl (chicken, avocado, quinoa, cherry tomatoes, purple cabbage, greens, microgreens).
- **Juice bottle** — `top:-8px; right:0; width:40%; height:340px`, rotate `2deg`, radius 22px, shadow `…-30px…`, float 11s (delay 1s). Photo: Detox Daily green juice bottle w/ condensation + ice.
- **Avocado** — `bottom:12px; right:4%; width:44%; height:260px`, rotate `-2.5deg`, radius 22px, float 12s (delay 0.5s). Photo: avocado, lemon, cucumber, herbs on wood.

**8. Offer circle** (overlapping badge)
- 246px circle, `background: radial-gradient(circle at 42% 32%, #F9B451 0%, #F39B28 46%, #E5851A 100%)`, border `3px solid #F7C76A` (gold), inner ring `inset:8px; 1px solid rgba(255,255,255,0.35)`, white text.
- Content (centered, stacked): small white sparkle → `FOUNDING MEMBER OFFER` (11px, uppercase, ls 1.8px) → `20` (Playfair 72px weight 800) `%` (26px) `OFF` (22px) on one baseline → 120px hairline divider → `FREE DELIVERY` (16px, 700) → `FOR YOUR FIRST MONTH` (10px, ls 1.4px).
- Entrance: **pop** (scale 0.6→1.06→1 + fade), delay 0.85s. Continuous: **breathing glow** (see animations).
- ⚠ Implementation note: keep the entrance pop on an **inner wrapper**, and the centering `translate(-58%,-46%)` on the outer element — an entrance animation that animates `transform` will otherwise clobber the positioning transform. The pop keyframes' final frame must include `opacity: 1`.

## Interactions & Behavior

**Entrance (staggered, on load):** logo 0.05s → wordmark/badge 0.2s → headline L1 0.3s / L2 0.42s → divider 0.55s → description 0.6s → form 0.7s → offer circle 0.85s → sparkle 0.9s. Easing `cubic-bezier(.2,.7,.2,1)` for rises, `cubic-bezier(.2,.9,.3,1.2)` for the pop.

**Continuous loops:**
- Food cards: `float` (translateY 0→-14px→0) 9/11/12s ease-in-out infinite, preserving each card's base rotation via a `--r` CSS var.
- Floating leaves (3, decorative SVG): `leaf` drift loop, 18/22/26s.
- Background blobs: `float`, 16/22s.
- Contour lines SVG: `drift` (translateX 0→-40px) 40s alternate.
- Offer circle: `breathe` — expanding/contracting orange glow ring, 4.2s.
- Headline sparkle: `twinkle` (opacity/scale pulse), 3.4s.

**Cursor parallax:** on `mousemove`, every element with `.dd-par` translates opposite the cursor, scaled by its `data-depth` (8–40). Formula: `translate(-dx*depth, -dy*depth)` where `dx,dy` are cursor offset from viewport center normalized to [-1,1]. Set `will-change: transform`. (Note: this overwrites the float loop's transform on those layers while the mouse moves — acceptable; in a Framer Motion rebuild, prefer combining via motion values.)

**Fit-to-screen (critical for the one-screen requirement):** after layout and after fonts load and on resize, measure the content grid's natural height; if it exceeds `viewportHeight − verticalPadding`, apply `transform: scale(avail/natural)` (clamped ≥ 0.5) to the grid, origin center. This guarantees the full lockup stays visible without scrolling on short viewports.

**Form:** controlled inputs (name/email/phone). Submit is prevented default; requires name + email non-empty; on success flips to the confirmation state. No backend in the prototype — wire to your waitlist API/CRM.

**Reduced motion:** `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`.

**Responsive:** breakpoints at 900px (mobile) and 1180px (tablet). See Layout above.

## State Management
- `fullName: string`, `email: string`, `phone: string` — controlled input values.
- `submitted: boolean` — false shows form, true shows confirmation. Set true on valid submit.
- Effects: window `resize` + `mousemove` listeners; `document.fonts.ready` re-measure; a 350ms post-mount re-measure. Clean all up on unmount.

## Design Tokens

**Colors**
| Token | Hex |
|---|---|
| Primary green | `#0B4F37` |
| Dark forest green | `#083826` |
| Button gradient top | `#0F5E42` |
| Leaf green (accents) | `#2E7D46` / `#5C7A4E` |
| Olive (headline L2, divider leaf) | `#7C8A54` |
| Light sage | `#B7BE95` |
| Sage tint (glow) | `rgba(183,190,149,0.3)` |
| Cream background | `#F8F4EB` |
| Warm white | `#FCFBF8` |
| Field background | `#FBFAF5` |
| Field border | `#E7E4D6` |
| Field border hover | `#C9CDBB` |
| Success chip bg | `#E9EEDD` |
| Offer orange (mid) | `#F39B28` |
| Offer orange (light/dark) | `#F9B451` / `#E5851A` |
| Soft gold (border) | `#F7C76A` |
| Orange text | `#E88A1A` |
| Text (headings/strong) | `#123323` |
| Secondary text | `#5F6558` |
| Muted text | `#97998C` |
| Placeholder | `#9AA08F` |

**Typography**
- Headings / display: **Playfair Display** (400–800, incl. italic). Google Fonts.
- Body / UI / buttons: **Inter** (400–700). Google Fonts.
- (Cormorant Garamond 500/600 is loaded as an alternate serif but not currently used.)
- Scale in use: 72/70(clamp)/26/25/22/18/16.5/16/15.5/15/14.5/14/12.5/12/11/10 px. Letter-spacing: headline -1px; badge 1.6px; offer labels 1.4–1.8px.

**Radii:** card 28px, button 15px, field 14px, badge/pill 999px, food cards 22–26px.

**Shadows:** see per-component values above (all use `rgba(11,79,55,…)` green-tinted, no harsh black).

**Spacing rhythm (left column):** logo → badge 20px → headline 18px → divider 14px → description 12px → card 20px. Root vertical padding 24px.

## Assets
- **`detox-logo.png`** (included) — Detox Daily logo, dark green on transparent, cropped to content. Provided by the client. Use their official logo file in production.
- **`image-slot.js`** (included) — the prototype's drag-and-drop image placeholder component (prototype-only). **Do not port it.** Replace the three slots with real `<img>`/`next/image` for:
  1. Protein bowl (chicken, avocado, quinoa, cherry tomatoes, purple cabbage, greens, seeds, microgreens).
  2. Detox Daily green juice bottle (branded label, condensation, ice, fresh leaves).
  3. Avocado + lemon + cucumber + herbs on a natural wood surface.
  These are **client-supplied food photography** placeholders — obtain final product shots. Lazy-load them.
- **Icons** are inline stroke SVGs (user, envelope, phone, arrow, check, leaf, sparkle) — recreate with your icon library (e.g. lucide-react) or keep as inline SVG.
- **Background textures** are pure CSS/SVG (radial gradients, an inline `feTurbulence` noise data-URI at 0.035 opacity, hand-authored contour/blob/watermark SVGs) — no raster assets needed.
- **Fonts** load from Google Fonts via `<link>`; self-host in production if preferred.

## Files
- `Detox Daily Waitlist.dc.html` — authoritative source (markup + component logic). Read the inline styles and the `Component` class.
- `detox-waitlist-standalone.html` — single self-contained build; open in a browser to see the finished design + all motion.
- `detox-logo.png` — logo asset.
- `image-slot.js` — prototype image-placeholder component (reference only; do not port).
- `README.md` — this document (self-sufficient).
