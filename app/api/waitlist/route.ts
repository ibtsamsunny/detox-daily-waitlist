import { NextResponse } from "next/server";
import { createLead, findLeadByEmail } from "@/lib/db";
import {
  ensureHubSpotProperties,
  findExistingCoupon,
  createOrUpdateContact,
  updateCouponProperties,
  verifyCouponProperties,
  isHubSpotConfigured,
  CouponSyncPartialFailureError,
} from "@/lib/hubspot";
import { generateCoupon } from "@/lib/discountCode";
import { sendCouponEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistPayload = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
};

type SignupInput = {
  fullName: string;
  email: string;
  phone: string;
};

export async function POST(request: Request) {
  let body: WaitlistPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!fullName || !email) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  let couponCode: string;
  try {
    ({ couponCode } = await resolveCoupon({ fullName, email, phone }));
  } catch (err) {
    if (err instanceof CouponSyncPartialFailureError) {
      // The HubSpot contact was created/updated, but writing its coupon
      // properties failed — that's a real inconsistency (a contact with
      // blank coupon fields), not something safe to paper over with a local
      // fallback and a "success" response. Full detail (payload, HubSpot
      // response, correlation id) was already logged in lib/hubspot.ts;
      // this log ties it to the request/contact for quick lookup.
      console.error(
        `[waitlist] coupon property update failed for HubSpot contact ${err.contactId}:`,
        err.message,
        err.cause instanceof Error ? err.cause.message : err.cause
      );
      return NextResponse.json(
        { error: "We couldn't finish saving your coupon. Please try again in a moment." },
        { status: 502 }
      );
    }
    throw err;
  }

  const sent = await sendCouponEmail({ to: email, fullName, couponCode });
  if (!sent) {
    return NextResponse.json(
      { error: "We saved your spot but couldn't send the email. We'll follow up." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

/**
 * Resolves the coupon for this signup, HubSpot-first: when HubSpot is
 * configured and reachable, it's the source of truth for whether a coupon
 * already exists for this email and what it is. Falls back to the local
 * database when HubSpot isn't configured at all, or if a HubSpot call fails
 * *before* any contact was written (nothing to be inconsistent about yet) —
 * so a CRM outage never blocks a visitor from getting their code. A failure
 * *after* the contact was written is a different story: see
 * CouponSyncPartialFailureError, which is deliberately NOT caught here and
 * propagates up to the POST handler as a real error.
 */
async function resolveCoupon(input: SignupInput): Promise<{ couponCode: string }> {
  if (isHubSpotConfigured()) {
    try {
      return await resolveCouponViaHubSpot(input);
    } catch (err) {
      if (err instanceof CouponSyncPartialFailureError) {
        throw err;
      }
      // Logged with no secrets (HubSpotError's message never contains the
      // access token — see lib/hubspot.ts) and never surfaced to the client;
      // the signup still succeeds via the local database below.
      console.error(
        "[hubspot] coupon sync failed before any contact write, falling back to local coupon tracking:",
        err instanceof Error ? err.message : err
      );
    }
  }
  return resolveCouponViaDatabase(input);
}

async function resolveCouponViaHubSpot(input: SignupInput): Promise<{ couponCode: string }> {
  await ensureHubSpotProperties();

  const existing = await findExistingCoupon(input.email);
  const couponCode = existing?.couponCode ?? generateCoupon();

  const contactId = await createOrUpdateContact({
    email: input.email,
    fullName: input.fullName,
    phone: input.phone || null,
  });

  // Never overwrite an existing coupon — only set these the first time.
  if (!existing) {
    try {
      await updateCouponProperties(contactId, { couponCode, discountPercentage: 20 });
      // Proves the write actually persisted, not just that HubSpot returned
      // 2xx — logs the real values HubSpot now has on file for this contact.
      await verifyCouponProperties(contactId);
    } catch (err) {
      throw new CouponSyncPartialFailureError(
        `HubSpot contact ${contactId} was created but its coupon properties failed to save.`,
        contactId,
        err
      );
    }
  }

  // Mirror into the local database too, using this same code, so local
  // tooling (and dev environments without HubSpot configured) stay
  // consistent with what HubSpot has. Best-effort: HubSpot already holds the
  // authoritative record, so a mirroring failure shouldn't fail the signup.
  await mirrorLeadLocally({ ...input, couponCode });

  return { couponCode };
}

async function resolveCouponViaDatabase(input: SignupInput): Promise<{ couponCode: string }> {
  // Resubmitting the same email reuses their existing code instead of
  // minting a new one, so the discount stays single-use per person.
  const lead =
    (await findLeadByEmail(input.email)) ??
    (await createLead({ fullName: input.fullName, email: input.email, phone: input.phone || null }));
  return { couponCode: lead.discountCode };
}

async function mirrorLeadLocally(input: SignupInput & { couponCode: string }): Promise<void> {
  try {
    const existing = await findLeadByEmail(input.email);
    if (!existing) {
      await createLead({
        fullName: input.fullName,
        email: input.email,
        phone: input.phone || null,
        discountCode: input.couponCode,
      });
    }
  } catch (err) {
    console.error("[db] failed to mirror lead locally:", err instanceof Error ? err.message : err);
  }
}
