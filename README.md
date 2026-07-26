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
- **Neon Postgres** (via Vercel's integration) — stores leads + discount codes, [`lib/db.ts`](./lib/db.ts)
- **HubSpot** — CRM sync on submit, [`lib/hubspot.ts`](./lib/hubspot.ts)
- **Resend + React Email** — sends the discount code email, [`lib/email.ts`](./lib/email.ts), [`emails/templates/DiscountCodeEmail.tsx`](./emails/templates/DiscountCodeEmail.tsx)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Preview the discount email template on its own with `npm run email:dev`.

## Environment variables

Create `.env.local` (never committed) with:

```bash
# Postgres — from Vercel: Project → Storage → Create Database → Postgres (Neon).
# Vercel injects this automatically in deployed environments; for local dev,
# copy the connection string it gives you (or run `vercel env pull`).
DATABASE_URL=

# HubSpot — Settings → Integrations → Private Apps → Create a private app,
# with the `crm.objects.contacts.write` and `crm.objects.contacts.read` scopes.
HUBSPOT_ACCESS_TOKEN=

# Resend — resend.com/api-keys. Also verify your sending domain under
# Domains, then set NOTIFY_FROM to an address on it.
RESEND_API_KEY=
NOTIFY_FROM="Detox Daily <hello@yourdomain.com>"

# Your deployed URL — used so the logo renders correctly inside emails
# (email clients can't load images from localhost or relative paths).
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.com
```

Without `DATABASE_URL` set, the waitlist API fails loudly (by design — the
discount code's uniqueness depends on the database, so there's no safe local
fallback for it). Without `HUBSPOT_ACCESS_TOKEN` or `RESEND_API_KEY`, those
two steps degrade gracefully instead: HubSpot sync is skipped with a console
warning, and the email is logged to the console instead of sent — so you can
develop the form flow locally before every integration is configured.

## Project structure

- `app/page.tsx` — renders the single `WaitlistPage` component
- `app/api/waitlist/route.ts` — form submission endpoint: creates/reuses the lead
  and its discount code, syncs to HubSpot, sends the discount email
- `components/waitlist/` — all page sections (logo, headline, form, collage, offer circle, background)
- `lib/parallax.tsx` — cursor parallax + continuous float/drift/leaf loop primitives
- `lib/useFitToScreen.ts` — scales the content down (never up) so the page never scrolls, matching the design's single-viewport requirement
- `lib/db.ts` — lead storage + unique discount code generation (`waitlist_leads` table, created automatically on first request)
- `lib/discountCode.ts` — generates a 6-character unique code, e.g. `DD-7K4XPB`
- `lib/hubspot.ts` — upserts the contact by email
- `lib/email.ts`, `emails/templates/DiscountCodeEmail.tsx` — sends the code via Resend

## How the discount code works

- On first submission, a unique code is generated and stored with the lead,
  with a `redeemed` flag defaulting to `false`.
- Resubmitting the same email reuses their existing code rather than
  generating a new one — so refreshing/resubmitting can't mint duplicates,
  and the code stays single-use per person.
- **Redeeming it is not yet wired up** — there's no checkout/ordering system
  yet to check the `redeemed` flag against. When you build one, mark it via a
  small update to `waitlist_leads.redeemed` after the code is applied.

## Before going live

1. **Real product photography.** The three collage images (protein bowl, juice bottle,
   avocado spread) currently render as elegant placeholders (see
   [`components/waitlist/CollagePhoto.tsx`](./components/waitlist/CollagePhoto.tsx)).
   Once you have final shots, pass a `src` prop to each `CollagePhoto` usage in
   [`components/waitlist/Collage.tsx`](./components/waitlist/Collage.tsx) — drop the
   images in `public/` and reference them, e.g. `src="/bowl.jpg"`.
2. **Logo.** Uses the provided `detox-logo.png`; swap for the client's final logo file
   if it changes.

## Deploying

Any Next.js host works (Vercel is the simplest pairing). After pushing to GitHub:

```bash
npx vercel
```

or connect the repo in the Vercel dashboard for automatic deploys on push.
