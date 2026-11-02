import { id } from "./db.mjs";
export const crmRoles = ["super_admin", "admin", "sales"];
export const records = {
  leads: "leads",
  customers: "clients",
  projects: "projects",
  tasks: "tasks",
  briefs: "leads",
  messages: "messages",
};
export async function recordEvent(
  db,
  type,
  recordId,
  user,
  kind,
  summary,
  changes = [],
) {
  return db.insert("record_events", {
    id: id(),
    record_type: type,
    record_id: recordId,
    actor_id: user.id,
    actor_name: user.name,
    kind,
    summary,
    changes,
  });
}
export function differences(old, next, keys = Object.keys(next)) {
  return keys
    .filter(
      (key) =>
        JSON.stringify(old[key] ?? null) !== JSON.stringify(next[key] ?? null),
    )
    .map((field) => ({
      field,
      before: old[field] ?? null,
      after: next[field] ?? null,
    }));
}
export async function notify(
  db,
  recipient,
  user,
  type,
  recordType,
  recordId,
  title,
  commentId = null,
) {
  if (recipient === user.id) return;
  return db.insert("notifications", {
    id: id(),
    recipient_id: recipient,
    actor_id: user.id,
    actor_name: user.name,
    type,
    record_type: recordType,
    record_id: recordId,
    comment_id: commentId,
    title,
    read_at: null,
  });
}
