export async function up(db) {
  if (
    !(await db
      .listCollections({ name: "discovery_links" }, { nameOnly: true })
      .hasNext())
  ) {
    await db.createCollection("discovery_links", {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "lead_id", "token_hash", "answers", "expires_at"],
          properties: {
            id: { bsonType: "string" },
            lead_id: { bsonType: "string" },
            token_hash: { bsonType: "string" },
            answers: { bsonType: "object" },
            expires_at: { bsonType: "date" },
          },
        },
      },
    });
  }
  await db
    .collection("discovery_links")
    .createIndex({ id: 1 }, { unique: true });
  await db
    .collection("discovery_links")
    .createIndex({ token_hash: 1 }, { unique: true });
  await db
    .collection("discovery_links")
    .createIndex({ lead_id: 1, created_at: -1 });
  await db
    .collection("leads")
    .createIndex(
      { registration_id: 1 },
      {
        unique: true,
        partialFilterExpression: { registration_id: { $type: "string" } },
      },
    );
}
