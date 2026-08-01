"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, ArrowRight, Check } from "lucide-react";
import { LeafBadgeIcon } from "./icons";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "dd-field flex h-12 items-center gap-[11px] rounded-[14px] border-[1.5px] border-field-border bg-field px-4 transition-[border-color,box-shadow,background] duration-[250ms] hover:border-field-border-hover";

export function WaitlistForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const submitted = status === "success";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone }),
      });
      if (!res.ok) {
        // Show the API's actual reason (e.g. "This phone number is already
        // registered.") rather than a generic message, when it sends one.
        const body: { error?: string } | null = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <motion.div
      className="dd-form-card mt-5 max-w-[470px] rounded-[28px] border border-[rgba(183,190,149,0.45)] p-[24px_30px_22px] transition-[transform,box-shadow] duration-[400ms]"
      style={{
        boxShadow: "0 30px 70px -34px rgba(11,79,55,0.35), 0 2px 8px rgba(11,79,55,0.04)",
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -2 }}
    >
      {/*
        Plain conditional render rather than AnimatePresence: the success
        message must never depend on an exit animation completing to appear.
        Framer Motion's exit animations rely on requestAnimationFrame, which
        browsers can throttle or pause (a backgrounded tab during submission,
        reduced-motion edge cases, etc.) — if that happens under
        AnimatePresence, the swap can hang indefinitely with the old content
        stuck on screen even though the signup already succeeded. A plain
        ternary swaps instantly and correctly no matter what; the incoming
        content still gets a fade-in via its own initial/animate.
      */}
      {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="px-1.5 py-[18px] pb-3 text-center"
          >
            <div className="mx-auto mb-4 flex h-[62px] w-[62px] items-center justify-center rounded-full bg-success-chip">
              <Check size={30} strokeWidth={2.4} color="#0B4F37" />
            </div>
            <h3 className="mb-2 font-display text-[26px] text-heading">You&apos;re on the list.</h3>
            <p className="text-[15px] text-body-secondary" style={{ lineHeight: 1.55 }}>
              Your <strong className="font-semibold text-forest">20% founding member offer</strong>{" "}
              is reserved. We&apos;ll email you the moment we launch in Lahore.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <LeafBadgeIcon size={26} />
              <h2 className="mt-1.5 mb-1 font-display text-[25px] font-semibold text-heading">
                Unlock Your Launch Offer
              </h2>
              <p
                className="mx-auto max-w-[320px] text-[14.5px] text-body-secondary"
                style={{ lineHeight: 1.55 }}
              >
                Reserve your spot before launch and activate your exclusive rewards.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2.5">
              <label className={fieldClass}>
                <User size={18} color="#8C9280" strokeWidth={1.8} />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  required
                  aria-label="Full name"
                  placeholder="Full Name"
                  className="flex-1 border-none bg-transparent text-[15px] text-heading outline-none placeholder:text-placeholder"
                />
              </label>
              <label className={fieldClass}>
                <Mail size={18} color="#8C9280" strokeWidth={1.8} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  aria-label="Email address"
                  placeholder="Email Address"
                  className="flex-1 border-none bg-transparent text-[15px] text-heading outline-none placeholder:text-placeholder"
                />
              </label>
              <label className={fieldClass}>
                <Phone size={18} color="#8C9280" strokeWidth={1.8} />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  aria-label="Phone number"
                  placeholder="Phone Number"
                  className="flex-1 border-none bg-transparent text-[15px] text-heading outline-none placeholder:text-placeholder"
                />
              </label>

              <motion.button
                type="submit"
                disabled={status === "submitting"}
                className="group relative mt-1.5 flex min-h-[52px] items-center justify-center gap-2.5 overflow-hidden rounded-[15px] px-5 py-3 text-center text-[15.5px] font-semibold text-warm-white disabled:opacity-70"
                style={{
                  background: "linear-gradient(180deg, #0F5E42 0%, #0B4F37 100%)",
                  letterSpacing: "0.2px",
                  boxShadow: "0 14px 28px -12px rgba(11,79,55,0.6)",
                }}
                whileHover={{
                  y: -3,
                  filter: "brightness(1.12)",
                  boxShadow:
                    "0 22px 40px -14px rgba(11,79,55,0.7), 0 0 0 4px rgba(183,190,149,0.35)",
                }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <span className="relative z-10">
                  {status === "submitting" ? "Reserving…" : "Reserve My Spot & Unlock 20% OFF"}
                </span>
                <ArrowRight
                  size={19}
                  strokeWidth={2.1}
                  className="relative z-10 transition-transform duration-[280ms] group-hover:translate-x-1"
                />
              </motion.button>
            </form>

            {error && <p className="mt-3 text-center text-[13px] text-red-600">{error}</p>}

            <p className="mt-4 text-center text-sm font-semibold text-offer-text">
              <span className="text-offer-mid">✦</span> FREE delivery for your first week
            </p>
            <p className="mt-1.5 text-center text-[12.5px] text-muted">No payment required today.</p>
          </motion.div>
        )}
    </motion.div>
  );
}
