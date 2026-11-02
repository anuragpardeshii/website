import { id, audit } from "./db.mjs";
import { createUser } from "./auth.mjs";
import { randomBytes } from "node:crypto";
export async function seedDemo(db) {
  if (
    await db.findOne(
      "users",
      { email: "team@demo.sleektech.test" },
      { projection: { id: 1 } },
    )
  )
    return;
  const team = await createUser(db, {
    name: "SleekTech team",
    email: "team@demo.sleektech.test",
    password: randomBytes(32).toString("hex"),
    role: "admin",
  });
  const records = [
    [
      "Maya Kapoor",
      "Northstar Labs",
      "Qualified",
      840000,
      "Discovery workshop",
      "Referral",
    ],
    [
      "Arjun Mehta",
      "Forma Studio",
      "Proposal",
      620000,
      "Review project proposal",
      "Website",
    ],
    [
      "Ella Chen",
      "Meridian Group",
      "Negotiation",
      1250000,
      "Confirm delivery scope",
      "Partner",
    ],
    [
      "Rohan Shah",
      "Orbit Commerce",
      "New",
      480000,
      "Schedule introduction",
      "Website",
    ],
    [
      "Sofia Reed",
      "Aster Health",
      "Qualified",
      920000,
      "Share technical approach",
      "LinkedIn",
    ],
    [
      "Noah Wilson",
      "Atlas Logistics",
      "Won",
      1450000,
      "Project kickoff",
      "Referral",
    ],
    ["Leena Rao", "Arc Ventures", "Won", 760000, "Sprint review", "Partner"],
  ];
  for (const [name, company, stage, value, next, source] of records) {
    const leadId = id();
    const email = company.toLowerCase().replaceAll(" ", "") + "@example.test";
    await db.insert("leads", {
      id: leadId,
      name: name,
      company: company,
      email: email,
      value: value,
      stage: stage,
      source: source,
      owner: "SleekTech team",
      next_action: next,
      notes: "Example opportunity for exploring the CRM.",
    });
    if (stage === "Won") {
      const clientId = id();
      await db.insert("clients", {
        id: clientId,
        lead_id: leadId,
        name: name,
        company: company,
        email: email,
        value: value,
      });
      await db.insert("projects", {
        id: id(),
        client_id: clientId,
        name:
          company === "Atlas Logistics"
            ? "Connected operations platform"
            : "Customer experience portal",
        status: "In progress",
        progress: company === "Atlas Logistics" ? 64 : 38,
        due_date: new Date(Date.now() + 21 * 86400000)
          .toISOString()
          .slice(0, 10),
        owner: "Delivery team",
      });
    }
  }
  for (const title of [
    "Prepare Northstar discovery agenda",
    "Follow up on Forma proposal",
    "Review Atlas delivery milestones",
  ])
    await db.insert("tasks", {
      id: id(),
      title: title,
      due_date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      owner: "SleekTech team",
    });
  const jobs = [];
  for (const [title, department, mode] of [
    ["Senior Frontend Engineer", "Engineering", "Remote"],
    ["Product Designer", "Design", "Hybrid"],
    ["Full Stack Engineer", "Engineering", "Remote"],
    ["Business Development Associate", "Growth", "Hybrid"],
  ]) {
    const jobId = id();
    const slug = title.toLowerCase().replaceAll(" ", "-");
    await db.insert("jobs", {
      id: jobId,
      slug: slug,
      title: title,
      department: department,
      location: "India",
      work_mode: mode,
      description:
        "Build thoughtful digital experiences with a team that values craft, clarity and collaboration. You will work closely with product, design and engineering to turn complex business needs into useful software. Own meaningful outcomes, contribute to technical decisions and help the team improve every week.",
      requirements:
        "Demonstrated experience in your discipline.\nClear written and verbal communication.\nA portfolio of considered work and a collaborative approach.\nComfort working with cross-functional teams.",
      status:
        title === "Business Development Associate" ? "Draft" : "Published",
    });
    jobs.push(jobId);
  }
  for (const [i, name, stage] of [
    [0, "Ananya Rao", "Interview"],
    [1, "Daniel Kim", "Screening"],
    [2, "Priya Nair", "Applied"],
    [0, "Alex Morgan", "Offer"],
  ]) {
    const user = await createUser(db, {
      email: name.toLowerCase().replaceAll(" ", ".") + "@example.test",
      name,
      password: randomBytes(32).toString("hex"),
    });
    const appId = id();
    await db.insert("applications", {
      id: appId,
      job_id: jobs[i],
      user_id: user.id,
      profile: {
        name,
        email: user.email,
        headline: i === 1 ? "Product designer" : "Software engineer",
        location: "India",
        skills:
          i === 1
            ? "Figma, Research, Interaction design"
            : "React, TypeScript, Node.js",
        experience: "5 years",
        summary: "Example candidate profile for exploring the hiring workflow.",
      },
      stage: stage,
      cover_letter: "I care about thoughtful products and collaborative teams.",
    });
    await db.insert("application_events", {
      id: id(),
      application_id: appId,
      stage: "Applied",
    });
    if (stage !== "Applied")
      await db.insert("application_events", {
        id: id(),
        application_id: appId,
        stage: stage,
      });
    if (stage === "Interview")
      await db.insert("interviews", {
        id: id(),
        application_id: appId,
        title: "Engineering conversation",
        starts_at: new Date(new Date(Date.now() + 2 * 86400000)),
        duration: 45,
        interviewer: "Engineering team",
        location: "Video call · meeting link to follow",
      });
  }
  await audit(db, "crm", null, team.id, "Demo workspace prepared");
  await audit(db, "talent", null, team.id, "Example hiring pipeline prepared");
}
