# Detox Daily — Pre-Launch Waitlist

A single-screen, high-fidelity waitlist landing page for **Detox Daily**, a healthy-food
delivery brand launching in Lahore. Visitors submit name/email/phone to reserve a 20%
founding-member offer.

Built from the design handoff in [`design_handoff_detox_waitlist/`](./design_handoff_detox_waitlist)
(see that folder's `README.md` for the full design spec) using Next.js (App Router),
Tailwind CSS v4, and Framer Motion.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Tailwind CSS v4** — design tokens and custom breakpoints in [`app/globals.css`](./app/globals.css)
- **Framer Motion** — entrance staggers and continuous float/parallax loops, see [`lib/parallax.tsx`](./lib/parallax.tsx)
- **lucide-react** — form field icons

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/page.tsx` — renders the single `WaitlistPage` component
- `app/api/waitlist/route.ts` — form submission endpoint (see TODO below)
- `components/waitlist/` — all page sections (logo, headline, form, collage, offer circle, background)
- `lib/parallax.tsx` — cursor parallax + continuous float/drift/leaf loop primitives
- `lib/useFitToScreen.ts` — scales the content down (never up) so the page never scrolls, matching the design's single-viewport requirement

## Before going live

1. **Real product photography.** The three collage images (protein bowl, juice bottle,
   avocado spread) currently render as elegant placeholders (see
   [`components/waitlist/CollagePhoto.tsx`](./components/waitlist/CollagePhoto.tsx)).
   Once you have final shots, pass a `src` prop to each `CollagePhoto` usage in
   [`components/waitlist/Collage.tsx`](./components/waitlist/Collage.tsx) — drop the
   images in `public/` and reference them, e.g. `src="/bowl.jpg"`.
2. **Wire up real lead capture.** `app/api/waitlist/route.ts` currently appends
   submissions to a local `data/waitlist-leads.jsonl` file. That works for local dev,
   but **not** on serverless/ephemeral hosts (e.g. Vercel) since the filesystem isn't
   persisted between requests. Swap it for a database, a Google Sheet, or a
   CRM/email-list webhook (Mailchimp, Klaviyo, HubSpot, etc.) before launch.
3. **Logo.** Uses the provided `detox-logo.png`; swap for the client's final logo file
   if it changes.

## Deploying

Any Next.js host works (Vercel is the simplest pairing). After pushing to GitHub:

```bash
npx vercel
```

or connect the repo in the Vercel dashboard for automatic deploys on push.
