import { useEffect, useState } from "react";
import { Eyebrow, Icon } from "./ui";

const apiUrl =
  import.meta.env.VITE_CAREERS_API_URL ||
  (import.meta.env.DEV ? "/api/public/jobs" : "");
const portalUrl =
  import.meta.env.VITE_CAREERS_PORTAL_URL ||
  (import.meta.env.DEV ? "http://localhost:3002" : "");

export function CareerOpportunities() {
  const [jobs, setJobs] = useState([]);
  const [team, setTeam] = useState("All teams");
  const [state, setState] = useState(apiUrl ? "loading" : "unconfigured");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    if (!apiUrl) return;
    const controller = new AbortController();
    fetch(apiUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        const data = await response.json();
        if (!Array.isArray(data.jobs)) throw new Error("Invalid response");
        setJobs(data.jobs);
        setDemo(Boolean(data.demo));
        setState("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState("error");
      });
    return () => controller.abort();
  }, []);
  const visible = jobs.filter(
    (job) => team === "All teams" || job.department === team,
  );
  return (
    <section className="section soft-section" id="open-roles">
      <div className="container">
        <div className="career-openings-heading">
          <div>
            <Eyebrow>YOUR NEXT CHAPTER</Eyebrow>
            <h2>
              Good work
              <br />
              <span className="blue-text">starts here.</span>
            </h2>
          </div>
          <div>
            <p>
              Find an opportunity that brings your perspective into the work. A
              thoughtful application. A clear selection process. Room to make a
              difference.
            </p>
            {portalUrl && (
              <a className="career-portal-link" href={portalUrl + "/account"}>
                Your candidate portal <Icon name="diagonal" size={17} />
              </a>
            )}
          </div>
        </div>
        {demo && (
          <p className="career-openings-note">
            Local preview · The roles below are example vacancies for exploring
            the recruitment platform.
          </p>
        )}
        {jobs.length > 0 && (
          <div
            className="career-team-filters"
            role="group"
            aria-label="Filter roles by team"
          >
            {["All teams", ...new Set(jobs.map((job) => job.department))].map(
              (name) => (
                <button
                  key={name}
                  aria-pressed={team === name}
                  onClick={() => setTeam(name)}
                >
                  {name}
                </button>
              ),
            )}
          </div>
        )}
        {state === "loading" && (
          <p className="career-openings-empty" role="status">
            Loading opportunities…
          </p>
        )}
        {state === "error" && (
          <p className="career-openings-empty" role="status">
            We couldn’t load the current openings. Please try again later.
            {portalUrl && (
              <>
                {" "}
                You can also <a href={portalUrl}>visit our careers portal</a>.
              </>
            )}
          </p>
        )}
        {(state === "unconfigured" || (state === "ready" && !jobs.length)) && (
          <div className="career-openings-empty">
            <h3>A new chapter is on its way.</h3>
            <p>
              There are no open roles listed right now. Check back for
              opportunities to build with us.
            </p>
          </div>
        )}
        <div className="career-opening-list">
          {visible.map((job) => (
            <a
              href={portalUrl + "/jobs/" + encodeURIComponent(job.slug)}
              className="career-opening"
              key={job.id}
            >
              <div>
                <span>{job.department}</span>
                <h3>{job.title}</h3>
                <p>
                  {job.location} <i>·</i> {job.work_mode} <i>·</i>{" "}
                  {job.employment_type}
                </p>
              </div>
              <span className="career-opening-arrow">
                <Icon name="diagonal" size={23} />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
