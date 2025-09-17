import { z } from "zod";

const Email = z.string().trim().toLowerCase().email();
const Phone = z.string().trim().regex(/^\+?[\d\s-]{10,}$/);
const SafeShort = z.string().trim().min(1).max(200);
const SafeLong = z.string().trim().min(1).max(2000);

export const SendEmailSchema = z
  .object({
    name: SafeShort,
    email: Email,
    phone: Phone,
    message: SafeLong,
    company: z.string().optional(), // honeypot
  })
  .strict();

export const BrochureSchema = z
  .object({
    name: SafeShort,
    email: Email.optional(),
    phone: Phone,
    lookingFor: SafeLong,
  })
  .strict();

export const PopupLeadSchema = z
  .object({
    name: SafeShort,
    phone: Phone,
    type: z.enum(["quick-quote", "brochure"]).optional(),
    productName: z.string().trim().max(200).optional(),
    lookingFor: z.string().trim().max(2000).optional(),
    email: Email.optional(),
  })
  .strict();
