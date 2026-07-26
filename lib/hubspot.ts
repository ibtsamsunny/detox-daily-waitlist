function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstname: parts[0] ?? "",
    lastname: parts.slice(1).join(" "),
  };
}

type HubspotContactInput = {
  email: string;
  fullName: string;
  phone: string | null;
};

/**
 * Upserts a contact by email using HubSpot's batch/upsert endpoint (create
 * or update in one call). Best-effort: logs and returns rather than
 * throwing, so a CRM outage never blocks a visitor from getting their
 * discount code.
 */
export async function upsertHubspotContact(input: HubspotContactInput): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    console.warn(`[hubspot] HUBSPOT_ACCESS_TOKEN not set — skipping CRM sync for ${input.email}`);
    return;
  }

  const { firstname, lastname } = splitName(input.fullName);

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[hubspot] upsert failed (${res.status}): ${text}`);
  }
}
