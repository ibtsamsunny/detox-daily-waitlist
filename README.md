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

# HubSpot — Settings → Integrations → Private Apps → Create a private app
# (or edit your existing one), with these scopes:
#   - crm.objects.contacts.write / crm.objects.contacts.read
#   - crm.schemas.contacts.write / crm.schemas.contacts.read
#     (needed to create the custom coupon_* properties on first run — see
#     "How the coupon system works" below)
HUBSPOT_ACCESS_TOKEN=

# Resend — resend.com/api-keys. Also verify your sending domain under
# Domains, then set NOTIFY_FROM to an address on it.
RESEND_API_KEY=
NOTIFY_FROM="Detox Daily <hello@yourdomain.com>"

# Your deployed URL — used so the logo renders correctly inside emails
# (email clients can't load images from localhost or relative paths).
NEXT_PUBLIC_SITE_URL=https://your-deployed-domain.com
```

Without `DATABASE_URL` set, the waitlist API fails loudly if HubSpot is also
unconfigured or unreachable (by design — a coupon's uniqueness has to be
guaranteed by *something*, and that's the database's job when HubSpot isn't
available). Without `HUBSPOT_ACCESS_TOKEN`, HubSpot sync is skipped entirely
and coupons are generated/tracked in the database alone. Without
`RESEND_API_KEY`, the email is logged to the console instead of sent — so you
can develop the form flow locally before every integration is configured.

## Project structure

- `app/page.tsx` — renders the single `WaitlistPage` component
- `app/api/waitlist/route.ts` — form submission endpoint: creates/reuses the lead
  and its discount code, syncs to HubSpot, sends the discount email
- `components/waitlist/` — all page sections (logo, headline, form, collage, offer circle, background)
- `lib/parallax.tsx` — cursor parallax + continuous float/drift/leaf loop primitives
- `lib/useFitToScreen.ts` — scales the content down (never up) so the page never scrolls, matching the design's single-viewport requirement
- `lib/db.ts` — local lead storage (`waitlist_leads` table, created automatically on first
  request) — the fallback/mirror described below
- `lib/discountCode.ts` — generates a 6-character unique code, e.g. `DD-7K4XPB`
  (exported as both `generateDiscountCode` and `generateCoupon`)
- `lib/hubspot.ts` — HubSpot contact sync, the custom coupon property definitions,
  and the property-creation/coupon-lookup/coupon-write functions
- `lib/email.ts`, `emails/templates/DiscountCodeEmail.tsx` — sends the coupon email via Resend

## How the coupon system works

**HubSpot is the source of truth for coupons when it's configured.** On each
submission (`resolveCoupon` in `app/api/waitlist/route.ts`):

1. `ensureHubSpotProperties()` checks the portal for 7 custom contact properties
   and creates whichever are missing (cached after the first check per server
   lifetime, so this isn't a real API call on every request):
   - `coupon_code` (text), `coupon_status` (dropdown: Unused/Redeemed),
     `discount_percentage` (number), `coupon_sent` (boolean),
     `coupon_sent_date` / `waitlist_join_date` / `redemption_date` (date)
2. `findExistingCoupon(email)` looks the contact up in HubSpot by email. If they
   already have a `coupon_code`, that code is reused — **a coupon is never
   regenerated or overwritten** for a contact that already has one.
3. Otherwise a new code is generated (`generateCoupon()`) and written to HubSpot
   via `updateCouponProperties()`: `coupon_status = Unused`, `discount_percentage = 20`,
   `coupon_sent = true`, and both date fields set to today.
4. `createOrUpdateContact()` upserts the contact's name/email/phone (unrelated to
   the coupon fields — always safe to run, doesn't touch existing coupon data).
5. The same coupon is mirrored into the local Postgres `waitlist_leads` table
   (best-effort — a mirroring failure doesn't fail the signup), so local tooling
   and dev environments without HubSpot configured stay consistent.
6. `sendCouponEmail()` sends the code via Resend using the coupon that was
   resolved above — from HubSpot when available, or from the database otherwise.

**If a HubSpot call fails** (bad token, missing scope, portal down, etc.), the
error is logged server-side — using only HubSpot's own error response, never the
access token — and the request transparently falls back to the database-only
flow from before, so a CRM outage never blocks a visitor from getting their
code. If HubSpot isn't configured at all, this fallback is the only path used,
and behaves exactly as it did before this feature existed.

**Redemption isn't wired up yet** — there's no checkout/ordering system yet to
flip `coupon_status` to `Redeemed` (HubSpot) / `redeemed` (database) or set
`redemption_date`. When you build one, update both after the code is applied.

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
