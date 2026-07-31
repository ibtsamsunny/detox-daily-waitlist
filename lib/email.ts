import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { DiscountCodeEmail } from "@/emails/templates/DiscountCodeEmail";

function resendApiKey() {
  return process.env.RESEND_API_KEY;
}

function fromAddress() {
  return process.env.NOTIFY_FROM || "Detox Daily <onboarding@resend.dev>";
}

type SendEmailOptions = {
  to: string;
  subject: string;
  react: ReactElement;
};

/**
 * Sends an email via Resend if RESEND_API_KEY is configured; otherwise logs
 * the rendered text to the console so the waitlist flow still works
 * end-to-end locally with zero account setup.
 */
export async function sendEmail({ to, subject, react }: SendEmailOptions): Promise<boolean> {
  const apiKey = resendApiKey();

  if (!apiKey) {
    const text = await render(react, { plainText: true });
    console.log(`[email:dev] Would send "${subject}" to ${to}\n${text}`);
    return true;
  }

  const html = await render(react);
  const text = await render(react, { plainText: true });

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[email] send failed", error);
    return false;
  }
  return true;
}

export type SendCouponEmailInput = {
  to: string;
  fullName: string;
  couponCode: string;
};

/** Sends the waitlist discount-code email using the shared template. */
export function sendCouponEmail(input: SendCouponEmailInput): Promise<boolean> {
  return sendEmail({
    to: input.to,
    subject: "Your 20% founding member offer is reserved",
    react: DiscountCodeEmail({ fullName: input.fullName, discountCode: input.couponCode }),
  });
}
