// Store private file keys instead of host-specific absolute paths.
export async function up(db) {
  const cursor = db
    .collection("resumes")
    .find({}, { projection: { _id: 1, storage_path: 1 } });
  for await (const record of cursor) {
    const filename = String(record.storage_path).split(/[\\/]/).pop();
    if (!/^[0-9a-f-]+\.(pdf|docx)$/.test(filename))
      throw new Error(
        "Resume storage key requires manual review: " + record._id,
      );
    await db
      .collection("resumes")
      .updateOne(
        { _id: record._id },
        { $set: { storage_path: "resumes/" + filename } },
      );
  }
}
