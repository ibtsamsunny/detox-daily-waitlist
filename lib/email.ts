import { render } from "@react-email/render";
import type { ReactElement } from "react";

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
