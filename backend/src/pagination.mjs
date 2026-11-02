import { z } from "zod";
export const normalize = (value) =>
  String(value || "")
    .normalize("NFKC")
    .trim()
    .toLowerCase();
export const searchFields = (record) =>
  Object.fromEntries(
    ["name", "company", "email", "title", "subject"]
      .filter((key) => typeof record[key] === "string")
      .map((key) => ["search_" + key, normalize(record[key])]),
  );
export function paging(query) {
  z.array(z.string().regex(/^[a-z_]+$/, "Invalid query parameter.")).parse(
    Object.keys(query),
  );
  const { page, limit, q } = z
    .object({
      page: z.coerce.number().int().min(1).max(500).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
      q: z.string().trim().max(80).default(""),
    })
    .parse(query);
  return { page, limit, q, skip: (page - 1) * limit };
}
export function searchFilter(q, fields) {
  if (!q) return {};
  const prefix = "^" + normalize(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: fields.map((field) => ({ ["search_" + field]: { $regex: prefix } })),
  };
}
export async function pageOf(
  db,
  name,
  filter,
  page,
  { projection, sort = { created_at: -1, id: -1 } } = {},
) {
  const [items, total] = await Promise.all([
    db.find(name, filter, {
      projection,
      sort,
      skip: page.skip,
      limit: page.limit,
      maxTimeMS: 3000,
    }),
    db.count(name, filter),
  ]);
  return {
    items,
    pagination: {
      page: page.page,
      limit: page.limit,
      total,
      pages: Math.max(1, Math.ceil(total / page.limit)),
    },
  };
}
