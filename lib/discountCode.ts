import { randomInt } from "crypto";

// Excludes visually ambiguous characters (0/O, 1/I) so codes are easy to
// read and type back in from an email.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 6;

export function generateDiscountCode(prefix = "DD"): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${code}`;
}

// Alias matching the naming used by the HubSpot coupon-sync flow (lib/hubspot.ts).
export { generateDiscountCode as generateCoupon };
