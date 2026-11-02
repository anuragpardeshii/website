// Forward-only, idempotent profile backfill. Never replace a candidate's existing data.
export async function up(db) {
  await db
    .collection("users")
    .updateMany({ profile: { $exists: false } }, { $set: { profile: {} } });
  await db
    .collection("users")
    .updateMany(
      { profile_version: { $exists: false } },
      { $set: { profile_version: 1 } },
    );
}
