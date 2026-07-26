import { neon } from "@neondatabase/serverless";
import { generateDiscountCode } from "./discountCode";

function connectionString() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL (or POSTGRES_URL) is not set. Connect a Postgres database in the Vercel dashboard, or set it in .env.local for local dev."
    );
  }
  return url;
}

function sql() {
  return neon(connectionString());
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = sql()`
      CREATE TABLE IF NOT EXISTS waitlist_leads (
        id BIGSERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        discount_code TEXT NOT NULL UNIQUE,
        redeemed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.then(() => undefined);
  }
  return schemaReady;
}

export type Lead = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  discountCode: string;
  redeemed: boolean;
  createdAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToLead(row: any): Lead {
  return {
    id: Number(row.id),
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    discountCode: row.discount_code,
    redeemed: row.redeemed,
    createdAt: row.created_at,
  };
}

export async function findLeadByEmail(email: string): Promise<Lead | null> {
  await ensureSchema();
  const db = sql();
  const rows = await db`SELECT * FROM waitlist_leads WHERE email = ${email} LIMIT 1`;
  return rows[0] ? rowToLead(rows[0]) : null;
}

const MAX_CODE_ATTEMPTS = 5;

/**
 * Creates a lead with a freshly generated, unique discount code. Retries on a
 * (very unlikely) code collision, and falls back to returning the existing
 * row if a concurrent request already inserted the same email first.
 */
export async function createLead(input: {
  fullName: string;
  email: string;
  phone: string | null;
}): Promise<Lead> {
  await ensureSchema();
  const db = sql();

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const discountCode = generateDiscountCode();
    try {
      const rows = await db`
        INSERT INTO waitlist_leads (full_name, email, phone, discount_code)
        VALUES (${input.fullName}, ${input.email}, ${input.phone}, ${discountCode})
        RETURNING *
      `;
      return rowToLead(rows[0]);
    } catch (err) {
      const code = (err as { code?: string }).code;
      const constraint = (err as { constraint?: string }).constraint;
      if (code === "23505" && constraint === "waitlist_leads_discount_code_key") {
        continue; // collision on the code itself — try again with a new one
      }
      if (code === "23505") {
        // Someone else inserted this email concurrently — treat as idempotent.
        const existing = await findLeadByEmail(input.email);
        if (existing) return existing;
      }
      throw err;
    }
  }

  throw new Error("Could not generate a unique discount code after several attempts.");
}
