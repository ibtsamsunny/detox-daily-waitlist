import { NextResponse } from "next/server";
import { createLead, findLeadByEmail } from "@/lib/db";
import { upsertHubspotContact } from "@/lib/hubspot";
import { sendEmail } from "@/lib/email";
import { DiscountCodeEmail } from "@/emails/templates/DiscountCodeEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WaitlistPayload = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
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

  // Resubmitting the same email reuses their existing code instead of
  // minting a new one, so the discount stays single-use per person.
  const lead = (await findLeadByEmail(email)) ?? (await createLead({ fullName, email, phone: phone || null }));

  // Best-effort CRM sync — a HubSpot outage should never block someone from
  // getting their discount code.
  await upsertHubspotContact({ email: lead.email, fullName: lead.fullName, phone: lead.phone }).catch((err) =>
    console.error("[hubspot] unexpected error", err)
  );

  const sent = await sendEmail({
    to: lead.email,
    subject: "Your 20% founding member offer is reserved",
    react: DiscountCodeEmail({ fullName: lead.fullName, discountCode: lead.discountCode }),
  });

  if (!sent) {
    return NextResponse.json(
      { error: "We saved your spot but couldn't send the email. We'll follow up." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
