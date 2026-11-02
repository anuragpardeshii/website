const string = { bsonType: "string" };
const states = (...values) => ({ enum: values });
export async function up(db) {
  const definitions = {
    users: {
      required: ["id", "email", "name", "password_hash", "role"],
      properties: {
        email: string,
        name: string,
        password_hash: string,
        role: states("admin", "sales", "recruiter", "candidate"),
        profile: { bsonType: "object" },
      },
    },
    sessions: {
      required: ["token_hash", "user_id", "expires_at"],
      properties: {
        token_hash: string,
        user_id: string,
        expires_at: { bsonType: "date" },
      },
    },
    leads: {
      required: ["id", "name", "company", "email", "stage"],
      properties: {
        stage: states(
          "New",
          "Qualified",
          "Proposal",
          "Negotiation",
          "Won",
          "Lost",
        ),
        value: { bsonType: "number", minimum: 0 },
        whatsapp_consent: { bsonType: "bool" },
      },
    },
    clients: { required: ["id", "lead_id", "name", "company", "email"] },
    projects: {
      required: ["id", "client_id", "name"],
      properties: {
        status: states(
          "Discovery",
          "In progress",
          "In review",
          "Completed",
          "On hold",
        ),
        progress: { bsonType: "number", minimum: 0, maximum: 100 },
      },
    },
    tasks: {
      required: ["id", "title"],
      properties: { done: { bsonType: "bool" } },
    },
    activity: { required: ["id", "domain", "action"] },
    jobs: {
      required: ["id", "slug", "title", "department", "status"],
      properties: { status: states("Draft", "Published", "Closed") },
    },
    resumes: {
      required: ["id", "user_id", "storage_path"],
      properties: { extracted: { bsonType: "object" } },
    },
    applications: {
      required: ["id", "job_id", "user_id", "profile", "stage"],
      properties: {
        profile: { bsonType: "object" },
        stage: states(
          "Applied",
          "Screening",
          "Interview",
          "Offer",
          "Hired",
          "Rejected",
          "Withdrawn",
        ),
      },
    },
    application_events: { required: ["id", "application_id", "stage"] },
    interviews: {
      required: ["id", "application_id", "title", "starts_at"],
      properties: {
        starts_at: { bsonType: "date" },
        duration: { bsonType: "number", minimum: 15, maximum: 240 },
      },
    },
    scorecards: {
      required: ["id", "application_id", "reviewer_id", "evidence"],
      properties: Object.fromEntries(
        ["craft", "communication", "problem_solving"].map((k) => [
          k,
          { bsonType: "number", minimum: 1, maximum: 5 },
        ]),
      ),
    },
    messages: {
      required: ["id", "lead_id", "body", "channel"],
      properties: { channel: states("email", "whatsapp") },
    },
    message_events: { required: ["id", "message_id", "event"] },
    webhook_receipts: { required: ["id"] },
  };
  for (const [name, definition] of Object.entries(definitions)) {
    const validator = {
      $jsonSchema: {
        bsonType: "object",
        ...definition,
        properties: {
          id: string,
          created_at: { bsonType: "date" },
          ...definition.properties,
        },
      },
    };
    if (!(await db.listCollections({ name }, { nameOnly: true }).hasNext()))
      await db.createCollection(name, { validator });
    else
      await db.command({ collMod: name, validator, validationLevel: "strict" });
    if (name !== "sessions")
      await db.collection(name).createIndex({ id: 1 }, { unique: true });
  }
  for (const [name, keys, options] of [
    ["users", { email: 1 }, { unique: true }],
    ["sessions", { token_hash: 1 }, { unique: true }],
    ["sessions", { expires_at: 1 }, { expireAfterSeconds: 0 }],
    ["clients", { lead_id: 1 }, { unique: true }],
    ["jobs", { slug: 1 }, { unique: true }],
    ["jobs", { status: 1, created_at: -1 }],
    ["applications", { job_id: 1, user_id: 1 }, { unique: true }],
    ["applications", { user_id: 1, created_at: -1 }],
    ["applications", { job_id: 1, stage: 1 }],
    ["leads", { stage: 1, created_at: -1 }],
    ["leads", { phone: 1 }],
    [
      "messages",
      { provider_id: 1 },
      {
        unique: true,
        partialFilterExpression: { provider_id: { $type: "string" } },
      },
    ],
    ["messages", { lead_id: 1, created_at: -1 }],
    ["activity", { domain: 1, created_at: -1 }],
    ["application_events", { application_id: 1, created_at: 1 }],
    ["scorecards", { application_id: 1 }],
    ["interviews", { application_id: 1, starts_at: 1 }],
    ["message_events", { message_id: 1, created_at: -1 }],
  ])
    await db.collection(name).createIndex(keys, options || {});
}
