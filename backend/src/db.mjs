import { MongoClient } from "mongodb";
import { randomUUID } from "node:crypto";
import { runMigrations } from "./migrate.mjs";
import { searchFields } from "./pagination.mjs";

export const id = () => randomUUID();
export const collections = [
  "users",
  "sessions",
  "leads",
  "clients",
  "projects",
  "tasks",
  "activity",
  "jobs",
  "resumes",
  "applications",
  "application_events",
  "interviews",
  "scorecards",
  "messages",
  "message_events",
  "webhook_receipts",
  "discovery_links",
  "comments",
  "record_events",
  "notifications",
  "password_resets",
  "security_locks",
];
const hidden = { _id: 0, _revision: 0 };
function defaults(collection) {
  const now = new Date();
  return {
    created_at: now,
    updated_at: now,
    version: 1,
    ...({
      users: { profile: {}, profile_version: 1 },
      leads: {
        phone: "",
        value: 0,
        stage: "New",
        source: "Direct",
        owner: "",
        next_action: "",
        notes: "",
        whatsapp_consent: false,
        last_inbound_at: null,
        updated_at: now,
      },
      clients: { value: 0 },
      projects: { status: "Discovery", progress: 0, due_date: null, owner: "" },
      tasks: {
        done: false,
        due_date: null,
        owner: "",
        owner_id: null,
        status: "To do",
        priority: "Normal",
        description: "",
        remarks: "",
        assigned_date: now.toISOString().slice(0, 10),
        created_by: null,
      },
      jobs: {
        status: "Draft",
        employment_type: "Full-time",
        work_mode: "Hybrid",
        salary: "",
      },
      resumes: { extracted: {} },
      applications: {
        resume_id: null,
        cover_letter: "",
        stage: "Applied",
        consent_at: now,
        updated_at: now,
      },
      application_events: { note: "" },
      interviews: { location: "" },
      messages: {
        direction: "outbound",
        subject: "",
        template: "",
        status: "Draft",
      },
    }[collection] || {}),
  };
}
function repository(native, session) {
  const opts = (options = {}) => ({
    ...options,
    ...(session ? { session } : {}),
  });
  const project = (options = {}) => ({
    ...options,
    projection: options.projection ? { _id: 0, ...options.projection } : hidden,
  });
  return {
    find: (name, filter = {}, options = {}) =>
      native
        .collection(name)
        .find(filter, opts(project(options)))
        .toArray(),
    findOne: (name, filter = {}, options = {}) =>
      native.collection(name).findOne(filter, opts(project(options))),
    count: (name, filter = {}) =>
      native.collection(name).countDocuments(filter, opts({ maxTimeMS: 3000 })),
    aggregate: (name, pipeline) =>
      native
        .collection(name)
        .aggregate(
          [...pipeline, { $unset: ["_id", "_revision"] }],
          opts({ maxTimeMS: 5000 }),
        )
        .toArray(),
    insert: async (name, data) => {
      const doc = { ...defaults(name), ...data, ...searchFields(data) };
      await native.collection(name).insertOne(doc, opts());
      const { _id, _revision, ...result } = doc;
      return result;
    },
    insertOnce: async (name, filter, data) => {
      const doc = { ...defaults(name), ...data, ...searchFields(data) };
      const result = await native
        .collection(name)
        .updateOne(filter, { $setOnInsert: doc }, opts({ upsert: true }));
      return result.upsertedCount ? doc : null;
    },
    update: (name, filter, update) =>
      native.collection(name).findOneAndUpdate(
        filter,
        {
          ...update,
          ...(update.$set
            ? { $set: { ...update.$set, ...searchFields(update.$set) } }
            : {}),
        },
        opts({ returnDocument: "after", projection: hidden }),
      ),
    remove: (name, filter) =>
      native.collection(name).deleteMany(filter, opts()),
    // A real write obtains a transactional write conflict on concurrent state changes.
    // withTransaction then retries the complete business operation against fresh state.
    lock: (name, filter) => {
      if (!session) throw new Error("Record locks require a transaction.");
      return native
        .collection(name)
        .findOneAndUpdate(
          filter,
          { $inc: { _revision: 1 } },
          opts({ returnDocument: "after", projection: hidden }),
        );
    },
  };
}
export async function database({
  url = process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/?replicaSet=rs0&directConnection=true",
  name = process.env.MONGODB_DATABASE || "sleektech",
  migrate = true,
} = {}) {
  const client = new MongoClient(url, {
    maxPoolSize: 20,
    serverSelectionTimeoutMS: 10000,
  });
  try {
    await client.connect();
    const native = client.db(name);
    const hello = await native.admin().command({ hello: 1 });
    if (!hello.setName && hello.msg !== "isdbgrid")
      throw new Error(
        "MongoDB must be a replica set (make db) or a sharded cluster to protect multi-record workflows.",
      );
    if (migrate) await runMigrations(native);
    return {
      ...repository(native),
      native,
      name,
      url,
      close: () => client.close(),
      transaction: async (fn) => {
        const session = client.startSession();
        try {
          return await session.withTransaction(
            () => fn(repository(native, session)),
            {
              readConcern: { level: "snapshot" },
              writeConcern: { w: "majority" },
              readPreference: "primary",
              maxCommitTimeMS: 10000,
            },
          );
        } finally {
          await session.endSession();
        }
      },
    };
  } catch (error) {
    await client.close();
    throw error;
  }
}
export async function audit(db, domain, entity, actor, action) {
  await db.insert("activity", {
    id: id(),
    domain,
    entity_id: entity,
    actor_id: actor,
    action,
  });
}
// Flatten selected fields from related records without exposing private document fields.
export function lookup(from, localField, fields, optional = false) {
  return [
    { $lookup: { from, localField, foreignField: "id", as: "_related" } },
    { $unwind: { path: "$_related", preserveNullAndEmptyArrays: optional } },
    {
      $set: Object.fromEntries(
        Object.entries(fields).map(([out, field]) => [
          out,
          "$_related." + field,
        ]),
      ),
    },
    { $unset: "_related" },
  ];
}
