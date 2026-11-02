export async function up(db) {
  await db.command({
    collMod: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["id", "email", "name", "password_hash", "role"],
        properties: {
          id: { bsonType: "string" },
          email: { bsonType: "string" },
          name: { bsonType: "string" },
          password_hash: { bsonType: "string" },
          role: {
            enum: ["super_admin", "admin", "sales", "recruiter", "candidate"],
          },
          disabled: { bsonType: "bool" },
        },
      },
    },
    validationLevel: "strict",
  });
  for (const name of [
    "comments",
    "record_events",
    "notifications",
    "password_resets",
    "security_locks",
  ]) {
    if (!(await db.listCollections({ name }, { nameOnly: true }).hasNext()))
      await db.createCollection(name);
    await db.collection(name).createIndex({ id: 1 }, { unique: true });
  }
  await db
    .collection("security_locks")
    .updateOne(
      { id: "user-administration" },
      { $setOnInsert: { revision: 0 } },
      { upsert: true },
    );
  for (const [name, keys, options] of [
    [
      "comments",
      { record_type: 1, record_id: 1, parent_id: 1, created_at: 1, id: 1 },
    ],
    ["comments", { author_id: 1, request_id: 1 }, { unique: true }],
    ["record_events", { record_type: 1, record_id: 1, created_at: -1, id: -1 }],
    ["notifications", { recipient_id: 1, read_at: 1, created_at: -1, id: -1 }],
    ["notifications", { recipient_id: 1, created_at: -1, id: -1 }],
    ["password_resets", { token_hash: 1 }, { unique: true }],
    ["password_resets", { user_id: 1 }],
    ["password_resets", { expires_at: 1 }, { expireAfterSeconds: 0 }],
    ["sessions", { user_id: 1 }],
    ["projects", { client_id: 1, created_at: -1, id: -1 }],
    ["tasks", { owner_id: 1, status: 1, created_at: -1, id: -1 }],
    ["tasks", { status: 1, priority: 1, due_date: 1 }],
  ])
    await db.collection(name).createIndex(keys, options || {});
  for (const name of [
    "users",
    "leads",
    "clients",
    "projects",
    "tasks",
    "messages",
  ]) {
    for await (const record of db.collection(name).find({})) {
      const update = {
        version: record.version || 1,
        updated_at: record.updated_at || record.created_at || new Date(),
      };
      for (const key of ["name", "company", "email", "title", "subject"])
        if (typeof record[key] === "string")
          update["search_" + key] = record[key]
            .normalize("NFKC")
            .trim()
            .toLowerCase();
      if (name === "tasks")
        Object.assign(update, {
          status: record.status || (record.done ? "Completed" : "To do"),
          priority: record.priority || "Normal",
          description: record.description || "",
          remarks: record.remarks || "",
          owner_id: record.owner_id || null,
          assigned_date:
            record.assigned_date ||
            (record.created_at || new Date()).toISOString().slice(0, 10),
          created_by: record.created_by || null,
        });
      await db
        .collection(name)
        .updateOne({ _id: record._id }, { $set: update });
    }
    await db.collection(name).createIndex({ created_at: -1, id: -1 });
    for (const key of name === "users"
      ? ["name", "email"]
      : name === "tasks"
        ? ["title"]
        : name === "messages"
          ? ["subject"]
          : ["name", "company", "email"])
      await db.collection(name).createIndex({ ["search_" + key]: 1 });
  }
  await db
    .collection("users")
    .createIndex({ role: 1, disabled: 1, search_name: 1 });
}
