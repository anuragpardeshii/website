"use client";
import { useState } from "react";
import {
  Brand,
  Icon,
  Button,
  Field,
  Badge,
  Notice,
  Empty,
  Dialog,
  PageHeading,
  SearchBox,
  AuthGate,
  Avatar,
  Loading,
  api,
  date,
  useData,
  useAction,
  values,
  type Row,
} from "@sleektech/ui";

export function CareerLayout({ children }: any) {
  return (
    <div className="career-site">
      <a className="skip-link" href="#career-main">
        Skip to content
      </a>
      <header className="career-header">
        <Brand label="careers" />
        <nav aria-label="Careers navigation">
          <a href="/account">Candidate portal</a>
          <a href="/manage">Hiring team</a>
          <a href="/#open-roles" className="button">
            Explore roles <Icon name="arrow" size={14} />
          </a>
        </nav>
      </header>
      <main id="career-main">{children}</main>
      <footer className="career-footer">
        <Brand />
        <span>GOOD PEOPLE. MEANINGFUL WORK.</span>
        <div>
          <a href="/privacy">Candidate privacy</a>
          <a href="/manage">
            Hiring team <Icon name="arrow" size={11} />
          </a>
        </div>
      </footer>
    </div>
  );
}
export function CareersHome() {
  const { data, error, reload } = useData("/public/jobs");
  const [department, setDepartment] = useState("All teams");
  const [query, setQuery] = useState("");
  const jobs: Row[] = data?.jobs || [];
  const filtered = jobs.filter(
    (j) =>
      (department === "All teams" || j.department === department) &&
      [j.title, j.location, j.description]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <CareerLayout>
      <div className="career-container">
        <section className="career-hero">
          <div>
            <p className="eyebrow">CAREERS AT SLEEKTECH</p>
            <h1>
              Your perspective.
              <br />
              Our next <span className="blue-text">possibility.</span>
            </h1>
            <p>
              Bring your craft, your curiosity, and your point of view. Help us
              build thoughtful technology that makes a meaningful difference.
            </p>
            <a href="#open-roles" className="button" style={{ marginTop: 28 }}>
              Explore opportunities <Icon name="right" size={15} />
            </a>
          </div>
          <div className="career-hero-art">
            <div className="career-blocks" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p>
              Different perspectives.
              <br />
              One shared ambition.
            </p>
          </div>
        </section>
        <div className="career-values">
          {[
            {
              icon: "sparkles",
              title: "Space to do good work",
              text: "Meaningful problems, thoughtful decisions, and pride in the details.",
            },
            {
              icon: "clients",
              title: "Better, together",
              text: "Work across disciplines with people who share what they know.",
            },
            {
              icon: "pipeline",
              title: "Keep moving forward",
              text: "Stay curious, take ownership, and help shape what comes next.",
            },
          ].map((v) => (
            <div key={v.title}>
              <Icon name={v.icon} size={23} />
              <div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            </div>
          ))}
        </div>
        <section className="careers-jobs" id="open-roles">
          <div className="career-section-heading">
            <div>
              <p className="eyebrow">FIND YOUR NEXT CHAPTER</p>
              <h2>Good work starts here.</h2>
              <p>Explore the roles shaping what we build next.</p>
            </div>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Search roles or locations…"
            />
          </div>
          {data?.demo && (
            <Notice>
              Local preview · These are example roles, not active SleekTech
              vacancies.
            </Notice>
          )}
          <Notice error>{error}</Notice>
          {error && (
            <Button variant="secondary" onClick={reload}>
              Reload opportunities
            </Button>
          )}
          <div className="job-filters">
            {["All teams", ...new Set(jobs.map((j) => j.department))].map(
              (d) => (
                <button
                  className={department === d ? "active" : ""}
                  key={d}
                  onClick={() => setDepartment(d)}
                >
                  {d}
                  {d === "All teams" ? " · " + jobs.length : ""}
                </button>
              ),
            )}
          </div>
          {!data && !error ? (
            <Loading />
          ) : filtered.length ? (
            <div className="job-list">
              {filtered.map((job) => (
                <a className="job-row" href={"/jobs/" + job.slug} key={job.id}>
                  <div>
                    <p className="eyebrow">{job.department}</p>
                    <h3>{job.title}</h3>
                    <JobTags job={job} />
                  </div>
                  <span className="job-arrow">
                    <Icon name="arrow" size={20} />
                  </span>
                </a>
              ))}
            </div>
          ) : (
            !error && (
              <Empty
                title={
                  jobs.length
                    ? "No roles match your search"
                    : "A new chapter is on its way"
                }
                icon="projects"
              >
                {jobs.length
                  ? "Try another team or search term."
                  : "There are no published vacancies at the moment. Please check back for future opportunities."}
              </Empty>
            )
          )}
        </section>
      </div>
    </CareerLayout>
  );
}
function JobTags({ job }: any) {
  return (
    <div className="job-tags">
      <span>
        <Icon name="globe" size={12} />
        {job.location}
      </span>
      <span>
        <Icon name="company" size={12} />
        {job.work_mode}
      </span>
      <span>
        <Icon name="clock" size={12} />
        {job.employment_type}
      </span>
      {job.salary && <span>{job.salary}</span>}
    </div>
  );
}
export function JobDetail({ slug }: { slug: string }) {
  const { data, error } = useData("/public/jobs/" + slug);
  const job = data?.job;
  return (
    <CareerLayout>
      <div className="career-container job-detail">
        <a href="/#open-roles" className="back-link">
          <Icon name="back" size={14} />
          All opportunities
        </a>
        <Notice error>{error}</Notice>
        {!job ? (
          !error && <Loading />
        ) : (
          <>
            {data.demo && (
              <Notice>Example role · This is a local product preview.</Notice>
            )}
            <div className="job-detail-header">
              <p className="eyebrow">{job.department} / SLEEKTECH</p>
              <h1>{job.title}</h1>
              <JobTags job={job} />
            </div>
            <div className="job-detail-layout">
              <div>
                <h2>The opportunity</h2>
                <p className="prose">{job.description}</p>
                <h2>What you will bring</h2>
                <p className="prose">{job.requirements}</p>
                <h2>A thoughtful selection process</h2>
                <p className="prose">
                  Share your profile and the work you are proud of. Our team
                  reviews applications against the role requirements, then
                  invites selected candidates to a conversation. You can follow
                  your application in the candidate portal.
                </p>
              </div>
              <aside className="job-detail-aside">
                <p className="eyebrow">YOUR NEXT CHAPTER</p>
                <h3>Bring your perspective.</h3>
                <p>
                  Sign in, upload your résumé if you wish, and review your
                  details before submitting.
                </p>
                <a className="button full" href={"/apply/" + job.slug}>
                  Apply for this role <Icon name="arrow" size={15} />
                </a>
                <p style={{ fontSize: 10, marginTop: 15, marginBottom: 0 }}>
                  Already applied?{" "}
                  <a href="/account" className="blue-text">
                    Check your application
                  </a>
                </p>
              </aside>
            </div>
          </>
        )}
      </div>
    </CareerLayout>
  );
}
const profileFields = [
  ["name", "Full name"],
  ["email", "Email address"],
  ["phone", "Phone number"],
  ["location", "Location"],
  ["headline", "Professional headline"],
  ["experience", "Relevant experience"],
  ["linkedin", "LinkedIn URL"],
  ["portfolio", "Portfolio / website"],
  ["availability", "Availability / notice period"],
];
const blankProfile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
  experience: "",
  linkedin: "",
  portfolio: "",
  availability: "",
  skills: "",
  education: "",
  summary: "",
};
function ProfileFields({ profile, setProfile }: any) {
  return (
    <div className="form-grid">
      {profileFields.map(([name, label]) => (
        <Field
          key={name}
          label={label}
          type={
            name === "email"
              ? "email"
              : ["linkedin", "portfolio"].includes(name)
                ? "url"
                : "text"
          }
          required={["name", "email"].includes(name)}
          readOnly={name === "email"}
          value={profile[name] || ""}
          onChange={(e: any) =>
            setProfile((p: Row) => ({ ...p, [name]: e.target.value }))
          }
          hint={name === "email" ? "Your signed-in account email." : undefined}
        />
      ))}
      {[
        ["skills", "Skills & capabilities"],
        ["education", "Education & qualifications"],
        ["summary", "Professional summary"],
      ].map(([name, label]) => (
        <Field key={name} label={label} wide>
          <textarea
            rows={3}
            value={profile[name] || ""}
            onChange={(e) =>
              setProfile((p: Row) => ({ ...p, [name]: e.target.value }))
            }
          />
        </Field>
      ))}
    </div>
  );
}
export function ApplyPage({ slug }: { slug: string }) {
  return (
    <AuthGate
      candidate
      staffRedirect="/manage"
      title="Your next chapter starts here."
    >
      {(user, demo, logout) => (
        <ApplicationForm slug={slug} user={user} demo={demo} logout={logout} />
      )}
    </AuthGate>
  );
}
function ApplicationForm({ slug, user, demo, logout }: any) {
  const { data, error } = useData("/public/jobs/" + slug);
  const { data: meta } = useData("/meta");
  const [profile, setProfile] = useState<Row>({
    ...blankProfile,
    ...user.profile,
    name: user.profile.name || user.name,
    email: user.email,
  });
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [ai, setAI] = useState(false);
  const [parsed, setParsed] = useState<Row | null>(null);
  const [resume, setResume] = useState<Row | null>(null);
  const [cover, setCover] = useState("");
  const [submitted, setSubmitted] = useState<Row | null>(null);
  const [replace, setReplace] = useState(false);
  const action = useAction();
  const job = data?.job;
  async function extract() {
    if (!file) return;
    const form = new FormData();
    form.set("resume", file);
    form.set("consent", String(consent));
    form.set("use_ai", String(ai));
    const result = await action.run(() =>
      api("/candidate/resume", { method: "POST", body: form }),
    );
    if (result) {
      setParsed(result);
      setResume(result);
    }
  }
  function useExtracted() {
    if (!parsed) return;
    setProfile((p) => ({
      ...p,
      ...Object.fromEntries(
        Object.entries(parsed.extracted).filter(
          ([key, value]) =>
            key !== "email" && typeof value === "string" && value.trim(),
        ),
      ),
      email: user.email,
    }));
    setParsed(null);
    setReplace(false);
    action.setNotice(
      "Résumé details added to your form. Please review them before submitting.",
    );
  }
  return (
    <CareerLayout>
      <div className="career-container apply-wrap">
        <a href={"/jobs/" + slug} className="back-link">
          <Icon name="back" size={14} />
          Back to role
        </a>
        {demo && (
          <Notice>
            Local demo · Your application stays in this local demonstration
            workspace.
          </Notice>
        )}
        <Notice error>{error}</Notice>
        {submitted ? (
          <div
            className="application-section"
            style={{ marginTop: 40, padding: 40 }}
          >
            <div className="integration-icon">
              <Icon name="check" size={26} />
            </div>
            <p className="eyebrow">APPLICATION RECEIVED</p>
            <h1 style={{ margin: "15px 0" }}>
              Your next chapter is in motion.
            </h1>
            <p>
              Thank you, {profile.name.split(" ")[0]}. Your application for{" "}
              {job?.title} has been saved. You can follow its progress in your
              candidate portal.
            </p>
            <a className="button" href="/account">
              Track my application <Icon name="right" size={15} />
            </a>
            <small style={{ display: "block", marginTop: 20 }}>
              Reference: {submitted.id.slice(0, 8).toUpperCase()}
            </small>
          </div>
        ) : !job ? (
          !error && <Loading />
        ) : (
          <>
            <div className="apply-heading">
              <p className="eyebrow">APPLY / {job.department}</p>
              <h1>{job.title}</h1>
              <p>
                Signed in as {user.email} ·{" "}
                <button
                  className="text-button"
                  onClick={() => action.run(logout)}
                >
                  Switch account
                </button>
              </p>
            </div>
            <div className="application-layout">
              <div className="application-main">
                <Notice error>{action.error}</Notice>
                <Notice>{action.notice}</Notice>
                <section className="application-section">
                  <h2>Start with your résumé.</h2>
                  <p>
                    We will extract readable details so you can spend less time
                    filling in fields. You can also complete the form manually.
                  </p>
                  <label className="upload-zone">
                    <Icon name="upload" size={28} />
                    <strong>
                      {file ? file.name : "Choose a résumé to get started"}
                    </strong>
                    <small>
                      PDF or DOCX · Up to 5 MB · Text-based documents
                    </small>
                    <input
                      aria-label="Upload résumé"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={(e) => {
                        const chosen = e.target.files?.[0];
                        if (chosen && chosen.size > 5 * 1024 * 1024) {
                          action.setError("Choose a file smaller than 5 MB.");
                          return;
                        }
                        setFile(chosen || null);
                        setParsed(null);
                      }}
                    />
                  </label>
                  <label className="checkbox-field" style={{ marginTop: 15 }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    I consent to résumé processing for this application.
                  </label>
                  <label className="checkbox-field" style={{ marginTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={ai}
                      disabled={!meta?.ai}
                      onChange={(e) => setAI(e.target.checked)}
                    />
                    Enhance extraction with AI{" "}
                    {meta?.ai
                      ? "(sends résumé text to OpenAI)"
                      : "(available after AI setup)"}
                  </label>
                  <Button
                    type="button"
                    variant="secondary"
                    icon="sparkles"
                    disabled={!file || !consent || action.busy}
                    onClick={extract}
                    style={{ marginTop: 17 }}
                  >
                    {action.busy ? "Reading résumé…" : "Extract résumé details"}
                  </Button>
                  {resume && !parsed && (
                    <div className="notice">
                      <Icon name="check" size={13} />
                      Attached: {resume.filename}
                    </div>
                  )}
                  {parsed && (
                    <div className="resume-review">
                      <h3>Your résumé, ready to review.</h3>
                      <p>
                        {parsed.method}. {parsed.warning}
                      </p>
                      <div className="info-grid">
                        {[
                          ["Name", parsed.extracted.name],
                          ["Email", parsed.extracted.email],
                          ["Phone", parsed.extracted.phone],
                          ["Skills", parsed.extracted.skills],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <small>{label}</small>
                            <p>{value || "Not found"}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        icon="check"
                        onClick={() => {
                          const hasExisting = Object.entries(profile).some(
                            ([key, v]) => !["name", "email"].includes(key) && v,
                          );
                          if (hasExisting) setReplace(true);
                          else useExtracted();
                        }}
                      >
                        Use extracted details
                      </Button>
                      <p style={{ fontSize: 10, marginTop: 10 }}>
                        Your account email is retained even if the résumé
                        contains a different address.
                      </p>
                    </div>
                  )}
                </section>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    action.run(async () => {
                      const result = await api("/candidate/applications", {
                        method: "POST",
                        body: {
                          job_id: job.id,
                          resume_id: resume?.id || null,
                          profile,
                          cover_letter: cover,
                          consent: true,
                        },
                      });
                      setSubmitted(result);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    });
                  }}
                >
                  <section className="application-section">
                    <h2>The details that tell your story.</h2>
                    <p>
                      Review the extracted information and add anything we have
                      missed.
                    </p>
                    <ProfileFields profile={profile} setProfile={setProfile} />
                    <div className="form-actions">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={action.busy}
                        onClick={() =>
                          action.run(
                            () =>
                              api("/candidate/profile", {
                                method: "PATCH",
                                body: profile,
                              }),
                            "Profile saved for future applications.",
                          )
                        }
                      >
                        Save profile
                      </Button>
                    </div>
                  </section>
                  <section className="application-section">
                    <h2>A little more about you.</h2>
                    <p>
                      Share relevant work, what interests you about the role, or
                      any information you would like us to consider.
                    </p>
                    <Field label="Your introduction (optional)">
                      <textarea
                        rows={5}
                        maxLength={6000}
                        value={cover}
                        onChange={(e) => setCover(e.target.value)}
                        placeholder="Tell us what you would bring to this role…"
                      />
                    </Field>
                  </section>
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      name="application_consent"
                      required
                    />
                    I confirm these details are accurate and consent to their
                    use for this recruitment process.{" "}
                    <a href="/privacy">Candidate privacy notice</a>
                  </label>
                  <Notice error>{action.error}</Notice>
                  <div className="form-actions">
                    <Button type="submit" icon="right" disabled={action.busy}>
                      {action.busy ? "Submitting…" : "Submit application"}
                    </Button>
                  </div>
                </form>
              </div>
              <aside className="application-side">
                <p className="eyebrow">A THOUGHTFUL PROCESS</p>
                <ol>
                  <li>
                    <div>
                      Your profile
                      <small>
                        Upload a résumé or complete your details manually.
                      </small>
                    </div>
                  </li>
                  <li>
                    <div>
                      Review & submit
                      <small>
                        Make sure your application reflects your experience.
                      </small>
                    </div>
                  </li>
                  <li>
                    <div>
                      Stay in the loop
                      <small>
                        Track progress and upcoming interviews in your portal.
                      </small>
                    </div>
                  </li>
                </ol>
                <p>
                  Your application is reviewed by our team. AI helps extract
                  details; it does not decide who moves forward.
                </p>
              </aside>
            </div>
          </>
        )}
        {replace && (
          <Dialog
            title="Replace existing profile details?"
            subtitle="Non-empty extracted fields will replace the corresponding fields in this form. Your account email stays the same."
            onClose={() => setReplace(false)}
          >
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setReplace(false)}>
                Keep my details
              </Button>
              <Button onClick={useExtracted}>Use résumé details</Button>
            </div>
          </Dialog>
        )}
      </div>
    </CareerLayout>
  );
}
export function AccountPage() {
  return (
    <AuthGate candidate staffRedirect="/manage" title="Good to see you again.">
      {(user, demo, logout) => (
        <CandidateAccount user={user} demo={demo} logout={logout} />
      )}
    </AuthGate>
  );
}
function CandidateAccount({ user, demo, logout }: any) {
  const { data, error, reload } = useData("/candidate/applications");
  const [profile, setProfile] = useState<Row>({
    ...blankProfile,
    ...user.profile,
    name: user.profile.name || user.name,
    email: user.email,
  });
  const [editing, setEditing] = useState(false);
  const [withdraw, setWithdraw] = useState<Row | null>(null);
  const action = useAction();
  const applications: Row[] = Array.isArray(data) ? data : [];
  return (
    <CareerLayout>
      <div className="career-container account-layout">
        <PageHeading
          eyebrow="YOUR CANDIDATE PORTAL"
          title={"Welcome back, " + profile.name.split(" ")[0] + "."}
          description="Your applications, conversations, and next steps — all in one place."
        >
          <Button
            variant="secondary"
            onClick={() => action.run(logout)}
            icon="logout"
          >
            Sign out
          </Button>
          <a href="/" className="button">
            Explore roles <Icon name="arrow" size={15} />
          </a>
        </PageHeading>
        {demo && <Notice>Local demonstration workspace.</Notice>}
        <Notice error>{error || action.error}</Notice>
        <Notice>{action.notice}</Notice>
        <div className="grid-2">
          <section>
            <h2 style={{ fontSize: 22, marginBottom: 22 }}>
              Your applications{" "}
              <span className="muted">({applications.length})</span>
            </h2>
            {!data && !error ? (
              <Loading />
            ) : !applications.length ? (
              <div className="panel">
                <Empty title="Your next chapter is waiting" icon="projects">
                  Explore our open roles and apply to an opportunity that speaks
                  to you.
                </Empty>
              </div>
            ) : (
              applications.map((app) => (
                <article className="application-card" key={app.id}>
                  <div className="application-card-top">
                    <div>
                      <h2>{app.title}</h2>
                      <p>
                        {app.department} · Applied {date(app.created_at)}
                      </p>
                    </div>
                    <Badge>{app.stage}</Badge>
                  </div>
                  <div className="timeline">
                    {app.timeline.map((event: Row, i: number) => (
                      <div key={i}>
                        <b>{event.stage}</b>
                        <small>
                          {date(event.created_at, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    ))}
                  </div>
                  {app.interviews.map((interview: Row) => (
                    <div
                      className="callout"
                      key={interview.id}
                      style={{ marginBottom: 15 }}
                    >
                      <b>{interview.title}</b>
                      <p>
                        {date(interview.starts_at, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        · {interview.duration} minutes
                      </p>
                      <p>
                        {interview.location ||
                          "Meeting details will be shared by the recruiting team."}
                      </p>
                    </div>
                  ))}
                  {!["Hired", "Rejected", "Withdrawn"].includes(app.stage) && (
                    <button
                      className="text-button"
                      onClick={() => setWithdraw(app)}
                    >
                      Withdraw application
                    </button>
                  )}
                </article>
              ))
            )}
          </section>
          <aside className="profile-summary" style={{ height: "fit-content" }}>
            <Avatar name={profile.name} />
            <h2>{profile.name}</h2>
            <p>
              {profile.headline || "Your professional profile"}
              <br />
              {user.email}
            </p>
            <div className="prose" style={{ fontSize: 11, marginBottom: 20 }}>
              {profile.skills ||
                "Add skills, experience and a little about yourself to make your next application easier."}
            </div>
            <Button
              variant="secondary"
              icon="file"
              onClick={() => setEditing(true)}
            >
              Edit my profile
            </Button>
          </aside>
        </div>
        {editing && (
          <Dialog
            title="Your professional profile"
            onClose={() => setEditing(false)}
            wide
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                action.run(async () => {
                  await api("/candidate/profile", {
                    method: "PATCH",
                    body: profile,
                  });
                  setEditing(false);
                }, "Your profile has been updated. Existing applications retain the details you originally submitted.");
              }}
            >
              <Notice error>{action.error}</Notice>
              <ProfileFields profile={profile} setProfile={setProfile} />
              <div className="form-actions">
                <Button type="submit" disabled={action.busy}>
                  Save profile
                </Button>
              </div>
            </form>
          </Dialog>
        )}
        {withdraw && (
          <Dialog
            title="Withdraw this application?"
            subtitle={withdraw.title}
            onClose={() => setWithdraw(null)}
          >
            <p className="prose">
              Your application will be closed and the recruiting team will see
              that you have withdrawn. You cannot resubmit for this role in the
              current process.
            </p>
            <Notice error>{action.error}</Notice>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setWithdraw(null)}>
                Keep application
              </Button>
              <Button
                variant="danger"
                disabled={action.busy}
                onClick={() =>
                  action.run(async () => {
                    await api(
                      "/candidate/applications/" + withdraw.id + "/withdraw",
                      { method: "POST", body: {} },
                    );
                    await reload();
                    setWithdraw(null);
                  }, "Application withdrawn.")
                }
              >
                Withdraw application
              </Button>
            </div>
          </Dialog>
        )}
      </div>
    </CareerLayout>
  );
}
export function CandidatePrivacy() {
  return (
    <CareerLayout>
      <article className="career-container privacy-content">
        <p className="eyebrow" style={{ marginBottom: 18 }}>
          CANDIDATE INFORMATION
        </p>
        <h1>Your application. Handled with care.</h1>
        <p>
          This portal stores the account, profile, résumé and application
          information you choose to provide. Authorized recruiting staff use it
          to review applications, organize interviews and record selection
          decisions. Candidates can see only their own profiles and
          applications.
        </p>
        <h2>Résumé processing</h2>
        <p>
          Uploading a résumé is optional. Document extraction reads text from
          your PDF or DOCX to suggest form values. If you explicitly enable AI
          enhancement, the extracted résumé text is sent to OpenAI for
          structured extraction. Review all suggested information before
          submitting. AI does not rank candidates or make hiring decisions.
        </p>
        <h2>Your account and application</h2>
        <p>
          You can update your saved profile and withdraw an active application
          from the candidate portal. Submitted applications retain the
          information provided at submission so the recruiting team has an
          accurate record of the process. Résumé downloads require
          authentication and ownership or recruitment permissions.
        </p>
        <h2>Local preview and launch configuration</h2>
        <p>
          In local demonstration mode, records are stored on the computer
          running this application. Before public recruitment opens, the
          organization must publish its controller contact, retention periods,
          deletion process and any applicable regional privacy information.
          Avoid submitting real sensitive documents to a demonstration
          workspace.
        </p>
        <a href="/" className="button secondary" style={{ marginTop: 30 }}>
          Back to opportunities
        </a>
      </article>
    </CareerLayout>
  );
}
