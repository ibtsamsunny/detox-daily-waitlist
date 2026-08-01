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
    public readonly status?: number,
    public readonly correlationId?: string | null
  ) {
    super(message);
    this.name = "HubSpotError";
  }
}

/**
 * Thrown specifically when a HubSpot contact was already created/updated but
 * writing its coupon properties then failed. Callers must NOT treat this like
 * an ordinary HubSpotError (which is safe to fall back from) — the contact
 * now exists in HubSpot with blank coupon fields, a real inconsistency that
 * has to be surfaced rather than silently papered over by a local fallback.
 */
export class CouponSyncPartialFailureError extends Error {
  constructor(
    message: string,
    public readonly contactId: string,
    public readonly cause: unknown
  ) {
    super(message);
    this.name = "CouponSyncPartialFailureError";
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

type RawResponse<T> = {
  status: number;
  correlationId: string | null;
  bodyText: string;
  data: T | undefined;
};

/**
 * Lowest-level HubSpot call: never throws on a non-2xx status (callers decide
 * what that means), and always surfaces status/correlation-id/raw body so
 * every call site can log exactly what HubSpot said. The access token is
 * read fresh per call and never appears in anything returned here.
 */
async function hubspotRequest<T>(path: string, init?: RequestInit): Promise<RawResponse<T>> {
  const res = await fetch(`${HUBSPOT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const correlationId = res.headers.get("x-hubspot-correlation-id");
  const bodyText = res.status === 204 ? "" : await res.text().catch(() => "");
  let data: T | undefined;
  if (bodyText) {
    try {
      data = JSON.parse(bodyText) as T;
    } catch {
      // Non-JSON body (rare, usually only on gateway-level errors) — leave
      // data undefined, bodyText still carries whatever HubSpot sent back.
    }
  }
  return { status: res.status, correlationId, bodyText, data };
}

/** Convenience wrapper: throws a HubSpotError (with status + correlation id) on any non-2xx. */
async function hubspotFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { status, correlationId, bodyText, data } = await hubspotRequest<T>(path, init);
  if (status < 200 || status >= 300) {
    throw new HubSpotError(
      `HubSpot ${init?.method ?? "GET"} ${path} failed (${status}, correlation ${correlationId ?? "n/a"}): ${bodyText.slice(0, 500)}`,
      status,
      correlationId
    );
  }
  return data as T;
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

/** Shape of a property as HubSpot's properties API actually returns it. */
type HubSpotFullProperty = {
  name: string;
  label: string;
  type: string;
  fieldType: string;
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

/** Every coupon property's internal name — used to explicitly request them back on verification reads. */
export const COUPON_PROPERTY_NAMES: readonly string[] = COUPON_PROPERTIES.map((p) => p.name);

type ResolvedCouponOptionValues = {
  /** The actual internal `value` (not label) for the "Unused" coupon_status option, as this portal defines it. */
  statusUnused: string;
};

/**
 * Finds the option whose LABEL matches (case-insensitively), and returns its
 * internal VALUE — never assume label === internal value. Throws with the
 * full list of available labels if no match is found, so a portal-specific
 * naming difference shows up immediately in logs instead of silently writing
 * the wrong string.
 */
function resolveOptionValue(
  propertyName: string,
  options: HubSpotPropertyOption[] | undefined,
  wantedLabel: string
): string {
  const match = options?.find((o) => o.label.toLowerCase() === wantedLabel.toLowerCase());
  if (!match) {
    const available = options?.map((o) => `${o.label}=${o.value}`).join(", ") || "none";
    throw new HubSpotError(
      `Property "${propertyName}" has no option labeled "${wantedLabel}" in this HubSpot portal (available options: ${available}).`
    );
  }
  return match.value;
}

// Cached for the lifetime of the server process, so a busy waitlist doesn't
// re-check/re-create properties on every single submission. Cleared on
// failure so a transient error (rather than a permanent misconfiguration)
// gets retried on the next request instead of being cached forever.
let ensuredPropertiesPromise: Promise<ResolvedCouponOptionValues> | null = null;

/**
 * Ensures the custom "coupon" contact properties exist in this HubSpot
 * portal (creating whichever are missing), and resolves the *actual* internal
 * option value this portal uses for coupon_status = "Unused" by reading the
 * live property definition rather than assuming label and value match. Safe
 * to call on every request — the real work only happens once per server
 * lifetime.
 */
export function ensureHubSpotProperties(): Promise<ResolvedCouponOptionValues> {
  if (!ensuredPropertiesPromise) {
    ensuredPropertiesPromise = setupProperties().catch((err) => {
      ensuredPropertiesPromise = null;
      throw err;
    });
  }
  return ensuredPropertiesPromise;
}

async function setupProperties(): Promise<ResolvedCouponOptionValues> {
  const existing = await hubspotFetch<{ results: HubSpotFullProperty[] }>(
    `/crm/v3/properties/${CONTACTS_OBJECT}`
  );
  const byName = new Map(existing.results.map((p) => [p.name, p]));

  const missing = COUPON_PROPERTIES.filter((p) => !byName.has(p.name));
  console.log(
    "[hubspot] checked coupon properties:",
    COUPON_PROPERTY_NAMES.map((name) => `${name}=${byName.has(name) ? "exists" : "missing"}`).join(", ")
  );

  for (const prop of missing) {
    console.log(`[hubspot] creating missing property "${prop.name}" (label "${prop.label}")`);
    const created = await hubspotFetch<HubSpotFullProperty>(`/crm/v3/properties/${CONTACTS_OBJECT}`, {
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
    byName.set(prop.name, created);
  }

  const statusProp = byName.get("coupon_status");
  const statusUnused = resolveOptionValue("coupon_status", statusProp?.options, "Unused");

  const sentProp = byName.get("coupon_sent");
  console.log("[hubspot] resolved internal option values:", {
    coupon_status: statusProp?.options?.map((o) => `${o.label}=${o.value}`),
    coupon_status_unused_value_used: statusUnused,
    coupon_sent: sentProp?.options?.map((o) => `${o.label}=${o.value}`),
  });

  return { statusUnused };
}

// ---------------------------------------------------------------------------
// Contact + coupon reads/writes
// ---------------------------------------------------------------------------

export type ContactInput = {
  email: string;
  fullName: string;
  phone: string | null;
};

type UpsertResult = { id: string };

/**
 * Creates or updates a contact's name/email/phone in one call (upsert by
 * email), and returns HubSpot's own internal contact ID for that record —
 * every subsequent write for this signup uses that ID directly rather than
 * re-resolving by email.
 */
export async function createOrUpdateContact(input: ContactInput): Promise<string> {
  const { firstname, lastname } = splitName(input.fullName);
  const path = `/crm/v3/objects/${CONTACTS_OBJECT}/batch/upsert`;
  const properties = {
    email: input.email,
    firstname,
    lastname,
    ...(input.phone ? { phone: input.phone } : {}),
  };

  console.log("[hubspot] upserting contact", { endpoint: `POST ${path}`, email: input.email });

  const { status, correlationId, bodyText, data } = await hubspotRequest<{ results: UpsertResult[] }>(path, {
    method: "POST",
    body: JSON.stringify({ inputs: [{ idProperty: "email", id: input.email, properties }] }),
  });

  console.log("[hubspot] upsert contact response", {
    status,
    correlationId,
    body: bodyText.slice(0, 500),
  });

  if (status < 200 || status >= 300) {
    throw new HubSpotError(
      `HubSpot POST ${path} failed (${status}, correlation ${correlationId ?? "n/a"}): ${bodyText.slice(0, 500)}`,
      status,
      correlationId
    );
  }

  const contactId = data?.results?.[0]?.id;
  if (!contactId) {
    throw new HubSpotError(
      `HubSpot upsert response for ${input.email} did not include a contact id (correlation ${correlationId ?? "n/a"}).`,
      status,
      correlationId
    );
  }
  return contactId;
}

/**
 * Looks up any contact already using this phone number, regardless of email
 * — used to block a second signup that reuses someone else's phone number.
 * Exact string match only (no formatting normalization yet — "0300..." and
 * "+92 300..." are treated as different numbers).
 */
export async function findContactByPhone(phone: string): Promise<{ id: string } | null> {
  const path = `/crm/v3/objects/${CONTACTS_OBJECT}/search`;
  const { status, correlationId, bodyText, data } = await hubspotRequest<{
    results: { id: string }[];
  }>(path, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: "phone", operator: "EQ", value: phone }] }],
      properties: ["email"],
      limit: 1,
    }),
  });

  if (status < 200 || status >= 300) {
    throw new HubSpotError(
      `HubSpot POST ${path} failed (${status}, correlation ${correlationId ?? "n/a"}): ${bodyText.slice(0, 500)}`,
      status,
      correlationId
    );
  }

  return data?.results?.[0] ? { id: data.results[0].id } : null;
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

/** Midnight UTC today, as the millisecond timestamp HubSpot's date-only properties require. */
function hubspotDateToday(): string {
  const now = new Date();
  return String(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * Writes a brand-new coupon onto the contact (by HubSpot contact ID — never
 * re-resolves by email): code, status, discount, and both timestamps. Only
 * ever called once per contact (see app/api/waitlist/route.ts) — call sites
 * are responsible for never overwriting an existing coupon. Logs the exact
 * property payload before sending and HubSpot's full response after,
 * including the correlation id, so a failure here is fully diagnosable from
 * server logs alone. Throws on any non-2xx response rather than swallowing
 * it — callers must not treat a failed coupon write as a successful signup.
 */
export async function updateCouponProperties(contactId: string, input: CouponPropertiesInput): Promise<void> {
  const { statusUnused } = await ensureHubSpotProperties();
  const today = hubspotDateToday();

  const properties: Record<string, string> = {
    coupon_code: input.couponCode,
    coupon_status: statusUnused,
    discount_percentage: String(input.discountPercentage),
    coupon_sent: "true",
    coupon_sent_date: today,
    waitlist_join_date: today,
  };

  const path = `/crm/v3/objects/${CONTACTS_OBJECT}/${encodeURIComponent(contactId)}`;

  console.log("[hubspot] updating coupon properties", {
    contactId,
    endpoint: `PATCH ${path}`,
    propertyNames: Object.keys(properties),
    properties,
  });

  const { status, correlationId, bodyText } = await hubspotRequest(path, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });

  console.log("[hubspot] coupon property update response", {
    contactId,
    status,
    correlationId,
    body: bodyText.slice(0, 1000),
  });

  if (status < 200 || status >= 300) {
    throw new HubSpotError(
      `HubSpot PATCH ${path} failed (${status}, correlation ${correlationId ?? "n/a"}): ${bodyText.slice(0, 500)}`,
      status,
      correlationId
    );
  }
}

/**
 * Re-fetches the contact and explicitly requests every coupon property back
 * from HubSpot, logging what actually landed. This is the only way to prove
 * a write really persisted — a 2xx from the PATCH call only proves HubSpot
 * accepted the request, not that the values read back as expected.
 */
export async function verifyCouponProperties(contactId: string): Promise<Record<string, string | null>> {
  const path =
    `/crm/v3/objects/${CONTACTS_OBJECT}/${encodeURIComponent(contactId)}` +
    `?properties=${COUPON_PROPERTY_NAMES.join(",")}`;

  const { status, correlationId, bodyText, data } = await hubspotRequest<{
    properties: Record<string, string | null>;
  }>(path);

  console.log("[hubspot] verify coupon properties after update", {
    contactId,
    endpoint: `GET ${path}`,
    status,
    correlationId,
    properties: data?.properties,
  });

  if (status < 200 || status >= 300) {
    throw new HubSpotError(
      `HubSpot GET ${path} failed (${status}, correlation ${correlationId ?? "n/a"}): ${bodyText.slice(0, 500)}`,
      status,
      correlationId
    );
  }

  return data?.properties ?? {};
}
