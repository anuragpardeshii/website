import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(15, "Use at least 15 characters.")
  .max(128)
  .refine(
    (value) =>
      !["passwordpassword", "123456789012345", "qwertyuiopasdfgh"].includes(
        value.toLowerCase(),
      ),
    "Choose a less common password.",
  );
const text = (min = 0, max = 500) => z.string().trim().min(min).max(max);
export const leadSchema = z.object({
  name: text(2, 100),
  company: text(2, 160),
  email: z.email().max(254),
  phone: text(0, 24)
    .default("")
    .transform((value) => value.replace(/[ ()-]/g, ""))
    .refine(
      (value) => value === "" || /^\+[1-9]\d{7,14}$/.test(value),
      "Use an international phone number beginning with +.",
    ),
  value: z.coerce.number().min(0).max(1e12).default(0),
  stage: z
    .enum(["New", "Qualified", "Proposal", "Negotiation", "Lost"])
    .default("New"),
  source: text(1, 100).default("Direct"),
  owner: text(0, 100).default(""),
  next_action: text(0, 300).default(""),
  notes: text(0, 6000).default(""),
  whatsapp_consent: z.boolean().default(false),
});
export const profileSchema = z.object({
  name: text(2, 100),
  email: z.email().max(254),
  phone: text(0, 30).default(""),
  location: text(0, 150).default(""),
  headline: text(0, 180).default(""),
  experience: text(0, 100).default(""),
  skills: text(0, 2000).default(""),
  education: text(0, 3000).default(""),
  summary: text(0, 5000).default(""),
  linkedin: z
    .union([z.url().refine((v) => /^https?:/.test(v)), z.literal("")])
    .default(""),
  portfolio: z
    .union([z.url().refine((v) => /^https?:/.test(v)), z.literal("")])
    .default(""),
  availability: text(0, 100).default(""),
});
export const jobSchema = z.object({
  title: text(3, 160),
  department: text(2, 100),
  location: text(2, 150),
  employment_type: z
    .enum(["Full-time", "Part-time", "Contract", "Internship"])
    .default("Full-time"),
  work_mode: z.enum(["Remote", "Hybrid", "On-site"]).default("Hybrid"),
  salary: text(0, 100).default(""),
  description: text(40, 15000),
  requirements: text(20, 10000),
  status: z.enum(["Draft", "Published", "Closed"]).default("Draft"),
});
export const messageSchema = z.object({
  lead_id: z.uuid(),
  channel: z.enum(["email", "whatsapp"]),
  subject: text(0, 200).default(""),
  body: text(1, 10000),
  template: text(0, 100).default(""),
});
export const validate = (schema, body) => schema.parse(body);
// Zod defaults may materialize through partial(). Retain only explicitly supplied fields.
export const parsePatch = (schema, body) =>
  Object.fromEntries(
    Object.entries(schema.partial().parse(body)).filter(([key]) =>
      Object.hasOwn(body, key),
    ),
  );
export function fail(status, message) {
  const e = new Error(message);
  e.status = status;
  throw e;
}
