import { useEffect, useRef, useState } from "react";
import { allServices as services } from "../data/content";
import { Button, Eyebrow, Icon, TextLink } from "../components/ui";
import { publicApi } from "../lib/public-api";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    interest: "",
    website: "",
    consent: false,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const registration = useRef(null);
  const success = useRef(null);
  const submitting = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = services.find((s) => s.slug === params.get("service"));
    const interest =
      service?.title ||
      (params.get("project")
        ? `Project: ${params.get("project")}`
        : params.get("industry")
          ? `Industry: ${params.get("industry")}`
          : "");
    setForm((current) => ({ ...current, interest: interest.slice(0, 160) }));
  }, []);
  useEffect(() => {
    if (status === "success") success.current?.focus();
  }, [status]);
  function update(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setStatus("submitting");
    setError("");
    try {
      registration.current ||= crypto.randomUUID();
      await publicApi("/public/leads", {
        ...form,
        registration_id: registration.current,
      });
      setStatus("success");
    } catch (error) {
      setError(error.message);
      setStatus("idle");
    } finally {
      submitting.current = false;
    }
  }
  return (
    <section className="contact-page">
      <div className="container contact-layout">
        <div className="contact-intro">
          <Eyebrow>A GOOD PLACE TO START</Eyebrow>
          <h1>
            Let’s make
            <br />
            your next
            <br />
            <span className="blue-text">move count.</span>
          </h1>
          <p>
            Introduce yourself. We’ll bring the right people to the
            conversation.
          </p>
          <div className="contact-next registration-next">
            <h2>A conversation. Then a clear plan.</h2>
            <div>
              <div>
                <h3>Make the introduction</h3>
                <p>Just your contact details to get started.</p>
              </div>
            </div>
            <div>
              <div>
                <h3>Talk it through</h3>
                <p>Our team gets to know your goals and the way you work.</p>
              </div>
            </div>
            <div>
              <div>
                <h3>Shape the brief together</h3>
                <p>
                  Review a shared discovery form before we define the next step.
                </p>
              </div>
            </div>
          </div>
          <TextLink href="/careers">Looking for your next role?</TextLink>
        </div>
        <div className="contact-form-panel">
          {status === "success" ? (
            <div className="brief-success" tabIndex={-1} ref={success}>
              <span className="success-icon">
                <Icon name="success" size={38} />
              </span>
              <Eyebrow>INTRODUCTION RECEIVED</Eyebrow>
              <h2>You’re on our radar.</h2>
              <p>
                Thanks, {form.name.split(" ")[0]}. Our team will use your
                contact details to arrange a conversation. We’ll work through
                your requirements together and share a discovery brief for your
                review.
              </p>
              <Button href="/work">Explore our work</Button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <h2>First, a little about you.</h2>
                <p>No lengthy brief. Just a hello.</p>
              </div>
              <form onSubmit={submit} aria-busy={status === "submitting"}>
                <div className="form-row">
                  <label>
                    Your name <span>*</span>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      minLength={2}
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
                      maxLength={254}
                      value={form.email}
                      onChange={update}
                      placeholder="alex@company.com"
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Company <small className="field-help">Optional</small>
                    <input
                      name="company"
                      autoComplete="organization"
                      maxLength={160}
                      value={form.company}
                      onChange={update}
                      placeholder="Your company"
                    />
                  </label>
                  <label>
                    Phone <small className="field-help">Optional</small>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={30}
                      value={form.phone}
                      onChange={update}
                      placeholder="+91 98765 43210"
                    />
                  </label>
                </div>
                <label>
                  I’m exploring <small className="field-help">Optional</small>
                  <select
                    name="interest"
                    value={form.interest}
                    onChange={update}
                  >
                    <option value="">Let’s figure it out together</option>
                    {services.map((s) => (
                      <option key={s.slug}>{s.title}</option>
                    ))}
                    <option>AI & automation</option>
                    <option>A partnership</option>
                    {form.interest &&
                      !services.some((s) => s.title === form.interest) &&
                      !["AI & automation", "A partnership"].includes(
                        form.interest,
                      ) && <option>{form.interest}</option>}
                  </select>
                </label>
                <div className="registration-trap" aria-hidden="true">
                  <label>
                    Website
                    <input
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={update}
                    />
                  </label>
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    checked={form.consent}
                    onChange={update}
                  />
                  <span>
                    I agree to Sleektech contacting me about my enquiry.{" "}
                    <a href="/privacy">Privacy details</a>.
                  </span>
                </label>
                {error && (
                  <p className="form-notice" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="form-submit"
                  disabled={status === "submitting"}
                >
                  {status === "submitting"
                    ? "Sending your introduction…"
                    : "Let’s start a conversation"}
                </Button>
                <p className="form-privacy">
                  Your details go directly to our team. No account or password
                  needed.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
