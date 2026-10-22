import { z } from "zod";

// Citizen registration rules. Change MIN_AGE / MAX_AGE if needed (keep same as the SQL function).
export const MIN_AGE = 13;
export const MAX_AGE = 110;

const DEVANAGARI_DIGITS = "०१२३४५६७८९";
export const toAsciiDigits = (s: string) =>
  s.replace(/[०-९]/g, (d) => String(DEVANAGARI_DIGITS.indexOf(d)));

function validDob(v: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return false; // e.g. 2026-02-31
  const now = new Date();
  if (d > now) return false;
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  const birthdayThisYear = Date.UTC(now.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  if (now.getTime() < birthdayThisYear) age--;
  return age >= MIN_AGE && age <= MAX_AGE;
}

export const registerSchema = z.object({
  name: z
    .string()
    .transform((s) => s.normalize("NFC").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(2, "required")
        .max(60, "nameInvalid")
        .regex(/^[A-Za-z\u0900-\u0965\u0970-\u097F][A-Za-z\u0900-\u0965\u0970-\u097F .'-]*$/, "nameInvalid"),
    ),
  mobile: z
    .string()
    .transform((s) => toAsciiDigits(s).replace(/\D/g, ""))
    .pipe(
      z
        .string()
        .regex(/^[6-9]\d{9}$/, "mobileInvalid")
        .refine((m) => !/^(\d)\1{9}$/.test(m), "mobileInvalid"),
    ),
  address: z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .min(10, "addressShort")
        .max(200, "addressShort")
        .regex(/[A-Za-z\u0900-\u097F]/, "addressShort")
        .refine((s) => !/[<>]/.test(s), "addressShort"),
    ),
  dob: z.string().refine(validDob, "dobInvalid"),
});

export type RegisterInput = z.infer<typeof registerSchema>;