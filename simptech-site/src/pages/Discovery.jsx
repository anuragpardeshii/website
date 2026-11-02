import { useEffect, useRef, useState } from "react";
import { Button, Eyebrow, TextLink } from "../components/ui";
import { publicApi } from "../lib/public-api";

const fields = [
  [
    "objectives",
    "What would you like to achieve?",
    "The business challenge and the change you want to see.",
    true,
  ],
  [
    "scope",
    "What should we build?",
    "Key features, workflows, or deliverables.",
    true,
  ],
  [
    "audience",
    "Who will use it?",
    "Your customers, teams, and their priorities.",
  ],
  [
    "current_process",
    "How does it work today?",
    "Existing tools, manual steps, and friction.",
  ],
  [
    "integrations",
    "What needs to connect?",
    "Platforms, data sources, and business systems.",
  ],
  [
    "success_metrics",
    "What would success look like?",
    "The outcomes that matter to your team.",
  ],
  [
    "timeline",
    "Do you have a timeline?",
    "Target dates, milestones, or dependencies.",
  ],
  [
    "budget",
    "Do you have an investment range?",
    "An indication is helpful. It’s fine if this is still open.",
  ],
  [
    "stakeholders",
    "Who should be involved?",
    "Decision makers and the people we’ll collaborate with.",
  ],
];
export function Discovery() {
  const token = useRef("");
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const success = useRef(null);
  useEffect(() => {
    token.current =
      new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    if (!token.current) {
      setError(
        "Open the invitation shared by your Sleektech representative to access your discovery form.",
      );
      setStatus("unavailable");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setError("");
    publicApi(
      "/public/discovery/read",
      { token: token.current },
      controller.signal,
    )
      .then((result) => {
        setData(result);
        setAnswers(result.answers);
        setStatus(result.submitted ? "success" : "ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setError(error.message);
          setStatus("unavailable");
        }
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (status === "success") success.current?.focus();
  }, [status]);
  async function submit(event) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = new FormData(event.currentTarget);
    setStatus("submitting");
    setError("");
    try {
      await publicApi("/public/discovery/submit", {
        token: token.current,
        answers,
        name: form.get("name"),
        consent: form.get("consent") === "on",
      });
      setStatus("success");
    } catch (error) {
      setError(error.message);
      setStatus("ready");
    }
  }
  return (
    <section className="contact-page discovery-page">
      <div className="container">
        <div className="discovery-heading">
          <Eyebrow>YOUR DISCOVERY BRIEF</Eyebrow>
          <h1>
            A shared vision.
            <br />
            <span className="blue-text">A clearer next step.</span>
          </h1>
          <p>
            Review what we’ve discussed. Add your perspective. We’ll take it
            from here.
          </p>
        </div>
        <div className="contact-form-panel discovery-form">
          {status === "loading" ? (
            <p role="status">Opening your invitation…</p>
          ) : status === "unavailable" ? (
            <>
              <h2>Your discovery invitation</h2>
              <p role="alert">{error}</p>
              {token.current && (
                <Button onClick={() => setRetry((value) => value + 1)}>
                  Try again
                </Button>
              )}
              <TextLink href="/contact">Contact our team</TextLink>
            </>
          ) : status === "success" ? (
            <div className="brief-success" ref={success} tabIndex={-1}>
              <Eyebrow>THANK YOU</Eyebrow>
              <h2>Your perspective is in the picture.</h2>
              <p>
                Your discovery response has been received. Our team will review
                it and connect with you about the next step.
              </p>
              <TextLink href="/">Back to Sleektech</TextLink>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <h2>{data.company}</h2>
                <p>
                  Shared by your Sleektech team · Invitation expires{" "}
                  {new Date(data.expires_at).toLocaleDateString()}
                </p>
              </div>
              <form onSubmit={submit} aria-busy={status === "submitting"}>
                {fields.map(([key, label, hint, required]) => (
                  <label key={key}>
                    {label} {required && <span>*</span>}
                    <textarea
                      name={key}
                      rows={3}
                      required={!!required}
                      minLength={required ? 10 : undefined}
                      maxLength={3000}
                      value={answers[key] || ""}
                      onChange={(event) =>
                        setAnswers((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      placeholder={hint}
                    />
                  </label>
                ))}
                <label>
                  Your name <span>*</span>
                  <input
                    name="name"
                    required
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                  />
                </label>
                <label className="checkbox-label">
                  <input name="consent" type="checkbox" required />
                  <span>
                    I’m happy to share these details with Sleektech for project
                    discovery. <a href="/privacy">Privacy details</a>.
                  </span>
                </label>
                {error && (
                  <p role="alert" className="form-notice">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting"
                    ? "Sharing your response…"
                    : "Share with the team"}
                </Button>
                <p className="form-privacy">
                  Please keep this invitation private. For changes after
                  submission, contact your representative.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
