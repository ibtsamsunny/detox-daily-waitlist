import { NextResponse } from "next/server";
import { appendFile, mkdir } from "fs/promises";
import path from "path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "waitlist-leads.jsonl");

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
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (!fullName || !email) {
    return NextResponse.json({ error: "Full name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const lead = {
    fullName,
    email,
    phone: phone || null,
    submittedAt: new Date().toISOString(),
  };

  // TODO(production): this appends leads to a local file, which works for a single
  // persistent server but NOT on serverless/ephemeral hosts (e.g. Vercel). Before
  // going live, swap this for a real destination — a database, Google Sheet,
  // Mailchimp/Klaviyo list, or CRM webhook.
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(LEADS_FILE, JSON.stringify(lead) + "\n", "utf8");

  return NextResponse.json({ ok: true });
}
