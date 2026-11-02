export async function up(db) {
  await db
    .collection("leads")
    .createIndex({ stage: 1, updated_at: -1, id: -1 });
}
