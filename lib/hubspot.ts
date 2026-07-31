/**
 * HubSpot integration — contact sync plus the custom "coupon" properties that
 * make HubSpot the source of truth for which discount code belongs to which
 * customer (see app/api/waitlist/route.ts for how this is orchestrated).
 */

const HUBSPOT_API_BASE = "https://api.hubapi.com";
const CONTACTS_OBJECT = "contacts";

/**
 * Thrown by every HubSpot call in this module. `.message` is always safe to
 * log or surface — it only ever contains HubSpot's own response body (which
 * describes the error, e.g. "PROPERTY_DOESNT_EXIST"), never the access token.
 */
export class HubSpotError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "HubSpotError";
  }
}

export function isHubSpotConfigured(): boolean {
  return Boolean(process.env.HUBSPOT_ACCESS_TOKEN);
}

function accessToken(): string {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new HubSpotError("HubSpot is not configured (HUBSPOT_ACCESS_TOKEN is not set).");
  }
  return token;
}

/** Thin wrapper around fetch: auth header, JSON body/response, and one error shape. */
async function hubspotFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    // HubSpot's error body describes what went wrong (invalid scope, bad
    // property value, etc.) and never contains the token, so it's safe to
    // include verbatim — truncated in case of an unexpectedly large body.
    const body = await res.text().catch(() => "");
    throw new HubSpotError(
      `HubSpot ${init?.method ?? "GET"} ${path} failed (${res.status}): ${body.slice(0, 500)}`,
      res.status
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstname: parts[0] ?? "",
    lastname: parts.slice(1).join(" "),
  };
}

// ---------------------------------------------------------------------------
// Custom contact properties
// ---------------------------------------------------------------------------

type HubSpotPropertyOption = { label: string; value: string; displayOrder: number; hidden?: boolean };

type HubSpotPropertyDef = {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "enumeration" | "bool";
  fieldType: "text" | "number" | "date" | "select" | "booleancheckbox";
  options?: HubSpotPropertyOption[];
};

// HubSpot requires every custom property to belong to an existing group;
// "contactinformation" is a built-in group present in every portal.
const PROPERTY_GROUP = "contactinformation";

const COUPON_PROPERTIES: readonly HubSpotPropertyDef[] = [
  { name: "coupon_code", label: "Coupon Code", type: "string", fieldType: "text" },
  {
    name: "coupon_status",
    label: "Coupon Status",
    type: "enumeration",
    fieldType: "select",
    options: [
      { label: "Unused", value: "Unused", displayOrder: 0 },
      { label: "Redeemed", value: "Redeemed", displayOrder: 1 },
    ],
  },
  { name: "discount_percentage", label: "Discount Percentage", type: "number", fieldType: "number" },
  {
    name: "coupon_sent",
    label: "Coupon Sent",
    type: "bool",
    fieldType: "booleancheckbox",
    // HubSpot models a single checkbox (boolean) as a two-option enumeration.
    options: [
      { label: "True", value: "true", displayOrder: 0 },
      { label: "False", value: "false", displayOrder: 1 },
    ],
  },
  { name: "coupon_sent_date", label: "Coupon Sent Date", type: "date", fieldType: "date" },
  { name: "waitlist_join_date", label: "Waitlist Join Date", type: "date", fieldType: "date" },
  { name: "redemption_date", label: "Redemption Date", type: "date", fieldType: "date" },
] as const;

// Cached for the lifetime of the server process, so a busy waitlist doesn't
// re-check/re-create properties on every single submission. Cleared on
// failure so a transient error (rather than a permanent misconfiguration)
// gets retried on the next request instead of being cached forever.
let propertiesEnsured: Promise<void> | null = null;

/**
 * Ensures the custom "coupon" contact properties exist in this HubSpot
 * portal, creating whichever ones are missing. Safe to call on every
 * request — the actual check only happens once per server lifetime.
 */
export function ensureHubSpotProperties(): Promise<void> {
  if (!propertiesEnsured) {
    propertiesEnsured = createMissingProperties().catch((err) => {
      propertiesEnsured = null;
      throw err;
    });
  }
  return propertiesEnsured;
}

async function createMissingProperties(): Promise<void> {
  const existing = await hubspotFetch<{ results: { name: string }[] }>(
    `/crm/v3/properties/${CONTACTS_OBJECT}`
  );
  const existingNames = new Set(existing.results.map((p) => p.name));
  const missing = COUPON_PROPERTIES.filter((p) => !existingNames.has(p.name));

  for (const prop of missing) {
    await hubspotFetch(`/crm/v3/properties/${CONTACTS_OBJECT}`, {
      method: "POST",
      body: JSON.stringify({
        name: prop.name,
        label: prop.label,
        type: prop.type,
        fieldType: prop.fieldType,
        groupName: PROPERTY_GROUP,
        ...(prop.options ? { options: prop.options } : {}),
      }),
    });
  }
}

// ---------------------------------------------------------------------------
// Contact + coupon reads/writes
// ---------------------------------------------------------------------------

export type ContactInput = {
  email: string;
  fullName: string;
  phone: string | null;
};

/** Creates or updates a contact's name/email/phone in one call (upsert by email). */
export async function createOrUpdateContact(input: ContactInput): Promise<void> {
  const { firstname, lastname } = splitName(input.fullName);

  await hubspotFetch(`/crm/v3/objects/${CONTACTS_OBJECT}/batch/upsert`, {
    method: "POST",
    body: JSON.stringify({
      inputs: [
        {
          idProperty: "email",
          id: input.email,
          properties: {
            email: input.email,
            firstname,
            lastname,
            ...(input.phone ? { phone: input.phone } : {}),
          },
        },
      ],
    }),
  });
}

export type ExistingCoupon = {
  couponCode: string;
  status: string | null;
};

/**
 * Looks up whether this email already has a coupon on file in HubSpot.
 * Returns null if the contact doesn't exist yet, or exists but has no
 * coupon_code set (e.g. imported from elsewhere).
 */
export async function findExistingCoupon(email: string): Promise<ExistingCoupon | null> {
  try {
    const contact = await hubspotFetch<{ properties: Record<string, string | null> }>(
      `/crm/v3/objects/${CONTACTS_OBJECT}/${encodeURIComponent(email)}` +
        `?idProperty=email&properties=coupon_code,coupon_status`
    );
    const couponCode = contact.properties.coupon_code;
    if (!couponCode) return null;
    return { couponCode, status: contact.properties.coupon_status ?? null };
  } catch (err) {
    if (err instanceof HubSpotError && err.status === 404) return null;
    throw err;
  }
}

export type CouponPropertiesInput = {
  couponCode: string;
  discountPercentage: number;
};

/** Midnight UTC today, as the millisecond timestamp HubSpot's date properties expect. */
function hubspotDateToday(): string {
  const now = new Date();
  return String(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Writes a brand-new coupon onto the contact: code, status, discount, and
 * both timestamps. Only ever called once per contact (see
 * app/api/waitlist/route.ts) — call sites are responsible for never
 * overwriting an existing coupon.
 */
export async function updateCouponProperties(email: string, input: CouponPropertiesInput): Promise<void> {
  const today = hubspotDateToday();

  await hubspotFetch(`/crm/v3/objects/${CONTACTS_OBJECT}/${encodeURIComponent(email)}?idProperty=email`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        coupon_code: input.couponCode,
        coupon_status: "Unused",
        discount_percentage: String(input.discountPercentage),
        coupon_sent: "true",
        coupon_sent_date: today,
        waitlist_join_date: today,
      },
    }),
  });
}
