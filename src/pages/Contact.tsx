import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { allServices as services, site } from "../data/content";
import { Button, Eyebrow, Icon, TextLink } from "../components/ui";

const emptyForm = {
  name: "",
  email: "",
  company: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
};
export function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [ready, setReady] = useState(false);
  const [saveDraft, setSaveDraft] = useState(false);
  const [notice, setNotice] = useState("");
  const [inquiry, setInquiry] = useState("project");
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service && services.some((s) => s.slug === service))
      setForm((v) => ({ ...v, service }));
    if (params.get("industry"))
      setForm((v) => ({
        ...v,
        message: `We’re exploring a project for ${params.get("industry")}. `,
      }));
    if (params.get("project"))
      setForm((v) => ({
        ...v,
        message: `I’m interested in an experience similar to the ${params.get("project")?.split("-")[0]} concept. `,
      }));
    if (params.get("interest") === "careers") {
      setInquiry("careers");
      setForm((v) => ({ ...v, service: "career-introduction" }));
    }
  }, []);
  useEffect(() => {
    if (ready) successRef.current?.focus();
  }, [ready]);
  function update(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((v) => ({ ...v, [name]: value }));
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    if (saveDraft) {
      try {
        localStorage.setItem("simptech-project-draft", JSON.stringify(form));
        setNotice("Your draft is saved on this device.");
      } catch {
        setNotice(
          "This browser could not save the draft. You can still download your brief.",
        );
      }
    }
    setReady(true);
  }
  function restore() {
    try {
      const saved = JSON.parse(
        localStorage.getItem("simptech-project-draft") || "null",
      );
      if (saved && typeof saved === "object") {
        setForm({
          ...emptyForm,
          ...Object.fromEntries(
            Object.keys(emptyForm).map((k) => [
              k,
              typeof saved[k] === "string" ? saved[k] : "",
            ]),
          ),
        });
        setNotice("Your saved draft has been restored.");
      } else setNotice("There is no saved draft on this device.");
    } catch {
      setNotice("Your saved draft could not be read.");
    }
  }
  function clear() {
    try {
      localStorage.removeItem("simptech-project-draft");
      setNotice("Any saved draft has been removed from this device.");
    } catch {
      setNotice("This browser could not access local storage.");
    }
  }
  const serviceName =
    services.find((s) => s.slug === form.service)?.title ||
    form.service ||
    "Let’s discuss";
  const brief = `SIMPTECH — ${inquiry === "careers" ? "INTRODUCTION" : "PROJECT BRIEF"}\n\nName: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company || "Not specified"}\nInterested in: ${serviceName}\nBudget: ${form.budget || "To discuss"}\nTimeline: ${form.timeline || "To discuss"}\n\n${form.message}\n\nPrepared locally at ${site.name}. This brief has not been sent.\n`;
  function download() {
    const url = URL.createObjectURL(
      new Blob([brief], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "simptech-project-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="contact-page">
      <div className="container contact-layout">
        <div className="contact-intro">
          <Eyebrow>LET’S MAKE SOMETHING GREAT</Eyebrow>
          <h1>
            Big idea?
            <br />
            Small question?
            <br />
            <span className="accent-text">We’re all ears.</span>
          </h1>
          <p>
            Tell us a little about what you have in mind. A clear brief is the
            first step toward a better digital experience.
          </p>
          <div className="contact-next">
            <h2>A little clarity on what’s next.</h2>
            {[
              [
                "01",
                "Tell us about your idea",
                "A few details help put your challenge into context.",
              ],
              [
                "02",
                "Shape the conversation",
                "Prepare a brief you can share with your team.",
              ],
              [
                "03",
                "Find the right next step",
                "A focused discussion can turn ambition into a plan.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          {site.contactEmail && (
            <a className="contact-email" href={`mailto:${site.contactEmail}`}>
              <Icon name="mail" />
              {site.contactEmail}
              <Icon name="diagonal" />
            </a>
          )}
          <div className="contact-side-note">
            <Icon name="handshake" size={25} />
            <p>
              Early idea or detailed plan.
              <br />
              Both are a good place to start.
            </p>
          </div>
        </div>
        <div className="contact-form-panel">
          {!ready ? (
            <>
              <div className="form-heading">
                <h2>
                  {inquiry === "careers"
                    ? "Make an introduction."
                    : "Let’s hear your idea."}
                </h2>
                <p>A few details. A world of possibilities.</p>
              </div>
              <form onSubmit={submit}>
                <div className="form-row">
                  <label>
                    Your name <span>*</span>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={100}
                      value={form.name}
                      onChange={update}
                      placeholder="Alex Morgan"
                    />
                  </label>
                  <label>
                    Email address <span>*</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      maxLength={200}
                      value={form.email}
                      onChange={update}
                      placeholder="alex@yourcompany.com"
                    />
                  </label>
                </div>
                <label>
                  Company
                  <input
                    name="company"
                    autoComplete="organization"
                    maxLength={150}
                    value={form.company}
                    onChange={update}
                    placeholder="Where do you do your best work?"
                  />
                </label>
                <label>
                  I’m interested in <span>*</span>
                  <select
                    name="service"
                    required
                    value={form.service}
                    onChange={update}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {services.map((s) => (
                      <option value={s.slug} key={s.slug}>
                        {s.title}
                      </option>
                    ))}
                    <option value="not-sure">I’d like some guidance</option>
                    <option value="career-introduction">
                      Careers / an introduction
                    </option>
                    <option value="partnership">A partnership</option>
                  </select>
                </label>
                <div className="form-row">
                  <label>
                    Budget range
                    <select name="budget" value={form.budget} onChange={update}>
                      <option value="">Let’s discuss</option>
                      <option>Under $5,000 USD</option>
                      <option>$5,000–$15,000 USD</option>
                      <option>$15,000–$50,000 USD</option>
                      <option>$50,000+ USD</option>
                    </select>
                  </label>
                  <label>
                    Ideal timeline
                    <select
                      name="timeline"
                      value={form.timeline}
                      onChange={update}
                    >
                      <option value="">Let’s discuss</option>
                      <option>As soon as possible</option>
                      <option>Within 1–3 months</option>
                      <option>Within 3–6 months</option>
                      <option>Just exploring</option>
                    </select>
                  </label>
                </div>
                <label>
                  A little about your project <span>*</span>
                  <textarea
                    name="message"
                    required
                    minLength={20}
                    maxLength={5000}
                    rows={5}
                    value={form.message}
                    onChange={update}
                    placeholder="What are you working on? What would you like to make better?"
                  />
                  <small className="field-help">
                    A few sentences about your goals, challenges, or idea. At
                    least 20 characters.
                  </small>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={saveDraft}
                    onChange={(e) => setSaveDraft(e.target.checked)}
                  />
                  <span>
                    Save a draft on this device so I can return to it.
                  </span>
                </label>
                <Button type="submit" className="form-submit" icon="diagonal">
                  Prepare my project brief
                </Button>
                <p className="form-privacy">
                  Your information stays in your browser. This creates a brief;
                  it does not send an inquiry.{" "}
                  <a href="/privacy">Privacy details</a>.
                </p>
                <div className="draft-actions">
                  <button type="button" onClick={restore}>
                    Restore a saved draft
                  </button>
                  <button type="button" onClick={clear}>
                    Clear saved draft
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="brief-success" ref={successRef} tabIndex={-1}>
              <span className="success-icon">
                <Icon name="success" size={38} />
              </span>
              <Eyebrow>A GREAT START</Eyebrow>
              <h2>Your brief is ready.</h2>
              <p>
                You’ve put the important details in one place. Download your
                brief to review and share.
              </p>
              <div className="brief-preview">
                <span>PROJECT BRIEF</span>
                <h3>{form.company || form.name}</h3>
                <dl>
                  <dt>Interested in</dt>
                  <dd>{serviceName}</dd>
                  <dt>Timeline</dt>
                  <dd>{form.timeline || "To discuss"}</dd>
                  <dt>Budget</dt>
                  <dd>{form.budget || "To discuss"}</dd>
                </dl>
                <p>{form.message}</p>
              </div>
              <Button onClick={download} icon="download">
                Download your brief
              </Button>
              {site.contactEmail && (
                <Button
                  variant="secondary"
                  href={`mailto:${site.contactEmail}?subject=${encodeURIComponent("A new project with SimpTech")}&body=${encodeURIComponent(brief)}`}
                  icon="mail"
                >
                  Open email with your brief
                </Button>
              )}
              <p className="form-privacy">
                Your brief has not been sent.{" "}
                {site.contactEmail
                  ? "The email button opens your email application, where you can review and send it."
                  : "Download a copy to share when you’re ready."}
              </p>
              <button className="text-link" onClick={() => setReady(false)}>
                <Icon name="back" size={16} />
                Edit your details
              </button>
            </div>
          )}
          <p className="form-notice" role="status">
            {notice}
          </p>
        </div>
      </div>
    </section>
  );
}
