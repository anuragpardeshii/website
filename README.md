# SleekTech platform

The marketing website, CRM and careers portal live in one repository. Two Next.js 16.4 applications share an Express 5 Node.js API and a MongoDB replica set. This is a working local product implementation with persistent core workflows. It has not been deployed or validated with live messaging or AI credentials.

## Run and review

Requires Node.js 24+, npm and Docker. Run the commands from the repository root (the `SleekTech` folder in the existing local checkout):

```bash
make install
make dev
```

`make dev` starts MongoDB in Docker and all four applications locally with hot reload. `make up` runs everything in Docker with Compose Watch; `make down` stops containers without deleting database volumes. Docker Compose 2.32+ is required. The checked-in Docker configuration is for local development, with ports bound to loopback. Docker mode uses normal staff accounts (`docker compose exec backend npm run admin`); local `make dev` uses normal role-based staff sign-in.

The addresses below are defaults. `make dev` / `npm run dev` checks availability and selects the next free port for each app when necessary. Use the **selected URLs printed by the launcher**. It synchronizes the backend origins, frontend API proxies, cross-portal links, marketing careers links and WebSocket origin policy for that run. Both `localhost` and `127.0.0.1` work on the selected ports. Unconfigured ports and origins remain denied; production origin rules stay exact.

Set preferred starting ports with `API_PORT`, `CRM_PORT`, `CAREERS_PORT` and `WEBSITE_PORT` (for example, `CRM_PORT=3101 CAREERS_PORT=3102 make dev`). `PORT` remains the backend fallback when `API_PORT` is unset. The launcher changes the child-process environment, not your saved `.env.local` files. Each Next dev instance has its own ignored `.next-local-<port>` directory, so a second local stack can run without sharing a Next lock. Ctrl+C stops only that launcher's children and waits for their listeners to close.

| Application | Local address                | Entry                                       |
| ----------- | ---------------------------- | ------------------------------------------- |
| CRM         | http://localhost:3001        | Staff sign-in                        |
| Careers     | http://localhost:3002        | Browse roles and create a candidate account |
| Recruitment | http://localhost:3002/manage | Staff sign-in                        |
| Shared API  | http://127.0.0.1:4000        | `/api/health`                               |

`npm run dev` defaults to `ENABLE_DEMO=false`. Explicitly enabling demo access is only effective before any personal staff account exists. Demo access is loopback-only and unavailable in production. Demo workspaces block all outbound email and WhatsApp sends. Example roles are labeled on the public careers surface. MongoDB data persists in the Docker `mongo_data` volume; résumés are private files in `backend/.data/resumes`. Keep this directory backed up for local work and never commit it.

To create an empty workspace, use a separate database and upload directory: `MONGODB_DATABASE=sleektech_real DATA_DIR=.data/real ENABLE_DEMO=false npm run dev`. Use the same settings when running `MONGODB_DATABASE=sleektech_real DATA_DIR=.data/real npm run admin` to provision staff. The CLI prompts for an email, name, role and hidden password. Start the same workspace again afterward. Candidate registration never creates staff users. Staff roles are `admin`, `sales`, and `recruiter`; candidate accounts cannot access either administrative workspace.

The plan and sources are in [plan.html](plan.html). The marketing site’s careers integration lives in `sleektech-site/src/components/CareerOpportunities.jsx`.

## Implemented workflows

- CRM: dedicated, bookmarkable pages for leads, client briefs, customers, projects, tasks and communications; create/edit/search leads, qualify opportunities, preserve stage activity, convert a lead exactly once to a customer, list converted customers, create and update delivery projects, and manage follow-up tasks.
- Communications: persistent editable email/WhatsApp drafts, AI-assisted email generation, explicit send review, provider readiness, server-side Resend and Meta Cloud API adapters, signed delivery webhooks, replay deduplication, inbound WhatsApp text, opt-in and reply-window enforcement. Approved WhatsApp templates without variable parameters are supported.
- Talent: draft/edit/publish/close jobs; public department/search filters; candidate registration/sign-in; PDF/DOCX uploads; optional AI extraction; reviewable autofill; saved profiles; applications with immutable submission snapshots; duplicate prevention; private downloads; candidate timelines, scheduled interviews and withdrawal.
- Recruitment: role directory, candidate board/list, job filtering, application review, interview scheduling, structured scorecards, recorded stage decisions and activity history. An offer requires a scorecard. Terminal applications cannot be moved forward. AI does not rank, score or reject candidates.
- Shared: scrypt password hashes, hashed revocable sessions in HttpOnly cookies, server-side roles, approved-origin/custom-header CSRF checks, validation, rate limiting, transaction-safe conversion and selection, accessible dialogs, reduced motion and mobile layouts.

## Layout

The repository root contains `crm/`, `careers/`, `backend/`, `shared/` and `sleektech-site/`. The existing website history is preserved. For marketing-only development or static hosting, use `sleektech-site` as the project directory, run `npm ci` and `npm run build` there, and publish `sleektech-site/dist` relative to the repository root. Set the marketing project's Vercel Root Directory to `sleektech-site` and its Output Directory to `dist`. The existing Sites identity stays in `sleektech-site/.openai/hosting.json`.

```text
crm/                      Next.js revenue workspace
careers/                  Next.js public careers, candidate portal and recruitment
backend/src/              Node.js API modules; MongoDB access
shared/ui/                Shared SleekTech components and styles
backend/migrations/       Versioned collection, profile, and upload migrations
sleektech-site/            Existing Vite marketing website
scripts/                  Local orchestration and build commands
backend/tests/            MongoDB API and migration checks
tests/                    Browser journey checks
plan.html                 Research, product scope, architecture and design
```

The API is a modular monolith serving one SleekTech organization. The schema covers users, sessions, leads, clients, projects, tasks, jobs, applications, résumés, interview scorecards, conversations, delivery events and audit activity. MongoDB collections have validators and indexes; multi-document workflows use replica-set transactions. Versioned JavaScript migrations run on startup and through `make migrate`. See `backend/README.md` for checksums, locks, and recovery.

## Configuration and integrations

Non-secret settings are documented in `.env.example`. The dev/build scripts load an ignored `.env.local` at the workspace root if present. Only `NEXT_PUBLIC_*` values are embedded in browser bundles. Never put provider secrets in a `NEXT_PUBLIC_*` or `VITE_*` variable.

| Connection         | Backend configuration                                                                                           | Activation requirements                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAI             | `OPENAI_API_KEY`, optional `OPENAI_MODEL`                                                                       | Complete the secure project/key selection flow. No key has been created or written by this implementation. Default model is `gpt-4.1-mini`; Responses API uses Structured Outputs and `store:false`. |
| Resend             | `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`                                                         | Verified sender domain; tracking settings enabled in the provider; signed webhook routed to `/api/webhooks/resend`.                                                                                  |
| WhatsApp Cloud API | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `WHATSAPP_GRAPH_VERSION`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` | Approved business phone and templates; a supported Graph API version; webhook at `/api/webhooks/whatsapp`. Optional `WHATSAPP_TEMPLATE_LANGUAGE` defaults to `en`.                                   |
| MongoDB            | `MONGODB_URI`, `MONGODB_DATABASE`                                                                               | Required for `NODE_ENV=production`; provision TLS, access controls, backups and restore verification in infrastructure.                                                                              |
| Malware scanning   | `CLAMAV_HOST`, optional `CLAMAV_PORT`                                                                           | clamd INSTREAM protocol; production résumé uploads fail closed if scanning is unavailable.                                                                                                           |

AI email generation returns an editable draft; it never sends automatically. Resume AI enhancement requires the candidate’s explicit opt-in. Text extraction remains functional without an AI account. Scanned image PDFs need OCR, which is not included; candidates can enter their details manually. Files are limited to 5 MB, PDFs to 30 pages, DOCX archives to bounded entry counts and expanded sizes. Parsing runs in a time-limited child process. Production should move this to a dedicated sandboxed worker and private object storage.

Open/click events are labeled as signals because privacy proxies and security scanners can generate them. Email replies and inbox synchronization are not implemented. WhatsApp inbound messages attach to an existing lead with a matching international phone number; unmatched inbound senders are not automatically turned into contacts. Templates with parameters, media messages and a full omnichannel inbox are follow-up work.

Interview scheduling records the meeting in both portals; it does not send calendar invitations. Job publication updates the shared API immediately. The existing marketing site fetches its published role list from that API when configured.

Provider requests use bounded timeouts. Email sends include an idempotency key. An ambiguous send timeout becomes `Unconfirmed` and is not silently retried. Operators must reconcile that state with the provider before creating another send; a durable outbox/reconciliation worker is a production milestone.

## Build and verification

```bash
npm run build
npm test
# With npm run dev running:
npm run test:browser
# Page navigation checks with the CRM dev server running; isolated API/database
npm run test:crm-pages
# With the marketing Vite preview on port 5175 and the shared API running:
npm run test:marketing
```

The API suite uses an randomly named, isolated MongoDB database and a temporary upload directory. It exercises authentication, roles, origin checks, lead conversion concurrency, projects, job visibility, résumé parsing/ownership, application snapshots, selection transitions, withdrawal, mocked AI/provider adapters and signed webhook replay handling. Provider tests are mocked and do not contact external services.

`npm run test:crm-pages` verifies direct URLs, list filters and browser Back, lead conversion, saved briefs, project progress, message drafts and delivery history, mobile layouts, and staff permissions. It uses a temporary database and intercepts browser API traffic, leaving the running workspace untouched. Screenshots are saved to `/tmp/sleektech-crm-pages-results/` by default.

The original `test:browser` checks create explicitly named QA records in the local demo workspace. They exercise lead-to-project conversion, messaging drafts, candidate sign-up, PDF autofill, application submission, scorecards, interviews, job publication, responsive layouts and axe accessibility. Screenshots and reports are written to ignored `test-results/`. The marketing site retains `npm run build` and `npm test` inside `sleektech-site/`.

## Deployment and remaining release gates

Deploy two Next.js Node services and the shared API, with a secured MongoDB replica set or Atlas cluster and private file/object storage. Configure `API_URL` for each Next.js build/server and public `NEXT_PUBLIC_CRM_URL`, `NEXT_PUBLIC_TALENT_URL`, and `NEXT_PUBLIC_MARKETING_URL` for cross-application links. Set backend `CRM_ORIGIN`, `TALENT_ORIGIN`, and `MARKETING_ORIGIN` to the exact HTTPS origins. The API defaults to `0.0.0.0` in production and loopback in development; an explicit `HOST` overrides this default. On Render, set `NODE_ENV=production` and `HOST=0.0.0.0`, and let Render provide `PORT`. Cookie sessions are host-only, so separate production subdomains sign in independently while sharing the same accounts and backend.

Production requires an explicit MongoDB URI and HTTPS configured origins. Demo login is omitted and sample data is not seeded. Public candidate registration is off by default in production; do not enable `ENABLE_CANDIDATE_REGISTRATION` until the following launch gates are satisfied:

1. Email verification, staff MFA/SSO policy, verified reset-link delivery and session administration. Administrator-issued password recovery is implemented; self-service email recovery is not yet enabled.
2. Provider credential setup and staging validation for real AI output, sender verification, WhatsApp approvals, webhook delivery and failure reconciliation.
3. Organization-specific privacy contact, retention periods, candidate export/deletion procedures and a scheduled cleanup policy for unattached résumés.
4. Managed backups and restore drills, dedicated upload scanning/parsing workers, object storage, durable background jobs, distributed rate limits and monitoring.
5. Security review, load testing, accessibility review with assistive technology, and user acceptance testing with the actual sales and hiring teams.

Advanced forecasting, configurable pipelines, CSV import review, mailbox OAuth/synchronization, calendar integrations, requisition/offer approvals, referrals, talent pools, onboarding, e-signatures and multi-tenant SaaS are explicitly planned follow-up capabilities. This local release is not represented as a finished enterprise production deployment.

## Development stack and references

All three frontends use Tailwind CSS v4 with SleekTech theme tokens. The existing bespoke CSS remains as the component layer so the visual identity is preserved; utility classes handle shared layout and interaction details. The backend has no rendered UI.

`make build`, `make test`, `make migrate`, `make migration-status`, and `make migration-new NAME=profile_changes` are the primary commands. Frontend changes use Next Fast Refresh and Vite HMR. Local backend changes use a debounced Chokidar supervisor that gracefully restarts the API; Docker syncs the source and restarts the backend process. Compose Watch syncs application/shared UI source and rebuilds dependency changes.

Existing PostgreSQL files are retained under `backend/.data/postgres`. `make import-legacy` imports into an empty MongoDB database in a transaction and creates a recovery copy before opening the old database. No original records are deleted. Existing sessions are not copied.

Implementation references: [MongoDB transactions](https://www.mongodb.com/docs/drivers/node/current/crud/transactions/), [Tailwind for Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [Tailwind for Vite](https://tailwindcss.com/docs/installation/using-vite), and [Docker Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/).

If the website is already running locally, use `WEBSITE_PORT=5176 make up` for the Docker stack. The original local site can keep running. Private résumé storage uses portable file keys so the same uploads work from the host and Docker.

Verified locally: all three frontend builds; 19 MongoDB API/migration tests; CRM and candidate/recruiter browser journeys; and all 32 marketing routes with responsive, keyboard, animation, and accessibility checks. Provider calls remain mocked. Docker development origins explicitly allow localhost and 127.0.0.1; source polling and initial synchronization support Docker Desktop.

## Role-based access

| Role | CRM and discovery | Recruitment management | Candidate portal |
| --- | --- | --- | --- |
| Super admin | Full access plus users, roles and password recovery | Full access | Use a separate candidate account to apply |
| Admin | CRM administration; no user/role administration | Full access | Use a separate candidate account to apply |
| Sales / marketing | Leads, customers, projects, tasks, messages, discovery | No access | No access |
| Recruiter | No access | Jobs, applicants, interviews, decisions | No access |
| Candidate | No access | No access | Own profile, applications and résumés only |

Portal gates and API routes both enforce the role. Public registration always creates a candidate, regardless of submitted role fields. Staff accounts are provisioned through `make admin`; credentials are hashed and never placed in source files. Demo sign-in is hidden and rejected once a personal staff account exists, including when demo mode was explicitly enabled. Public job listings and contact registration remain accessible without staff sign-in.


## Record details, collaboration and account security

CRM lead, customer, project, task, brief and communication URLs open as readable detail pages. Select **Edit**, save or cancel to return to the record. Task fields include owner, description, status, priority, assigned date, deadline, last updated time and remarks. Staff can view tasks; only the creator, assigned owner, admin or super admin can edit them. Saved edits carry a version to reject stale updates instead of overwriting another teammate's work.

Comments and one-level threaded replies are available on these record pages. Type `@` and at least two letters, then select an active CRM teammate with the keyboard or pointer. Mentions and task assignments create recipient-only in-app notifications. Notifications use an authenticated WebSocket at `/api/collaboration/notifications/socket`, proxied through the CRM's existing Next.js `/api` rewrite. One MongoDB change stream per backend instance broadcasts committed notification changes only to the signed-in recipient. The bell and open notification list refresh on socket events; there is no notification polling timer. Reconnect uses exponential backoff and reloads persisted state, including changes missed offline. Marking read synchronizes across tabs. Clicking a notification opens the associated detail page; mentions load the correct comment/reply page, open the thread, and highlight the target.

The socket validates the exact CRM origin, existing HttpOnly session and CRM role, checks session validity before delivery and every 25 seconds without extending idle expiry, and bounds connection attempts, per-user connections, payloads and buffered output. Client messages cannot select recipients or mutate records. Configure `CRM_ORIGIN` to the public CRM URL; production uses `wss:` through HTTPS. Any reverse proxy in front of Next.js must forward WebSocket `Upgrade` and `Connection` headers and allow idle connections for more than 25 seconds. MongoDB replica-set requirements are unchanged. Operational references: [ws authentication and heartbeat examples](https://github.com/websockets/ws), [MongoDB change streams](https://www.mongodb.com/docs/drivers/node/current/monitoring-and-logging/change-streams/), and [OWASP WebSocket guidance](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).

Recruitment-only staff and candidates are excluded from CRM mention suggestions. Activity history records actor, time and changed values, with comments and replies in the same ordered timeline. Historical actions before this release are not reconstructed.

Super admins use **Users & access** to search users, open profiles, change roles or disable accounts. Sensitive account actions require the super admin's current password. An administrator cannot remove their own super-admin access; concurrent administration is serialized and the last active super admin is protected. Role/status changes revoke the affected account's sessions and outstanding reset links. The account owner requested super-admin access for the existing personal account; its password was preserved.

**Password recovery:** open a user, confirm your own password and select **Generate reset link**. Copy the link and provide it through your established verified support channel; the app does not automatically send an email. Tokens are random, stored only as SHA-256 hashes, expire after 30 minutes, and are single-use even with concurrent submissions. Generating another link replaces the previous link. Successful recovery signs out all sessions and requires a fresh sign-in. The reset token is kept in the URL fragment and removed from browser history when the reset page opens. Both portals have a `/reset-password` page and show/hide password controls.

New and reset passwords require 15–128 characters, reject a small list of obvious passwords and cannot equal the account email. Existing passwords continue to work; legacy hashes upgrade to scrypt (N=32768, r=8, p=3) after successful sign-in. Sessions have a seven-day absolute lifetime and a one-hour idle limit. Browser mutation requests require the approved Origin and custom request header. API schemas constrain types, lengths, enum values, dates and IDs; unknown mutation fields are rejected on the new CRM/account endpoints. Responses do not expose password hashes or reset tokens in user directories. The frontends add anti-framing, nosniff, referrer and permissions headers; the CSP currently constrains frames, objects, base URLs and form targets, not application scripts.

Tables in CRM, user administration, notifications, comments, activity, delivery events and brief invitation history use server-side pagination. The default is 20 records, maximum 50, maximum page 500. CRM text search uses normalized, escaped, indexed **prefix** matching; search by the beginning of a name, company, email, task title or message subject. Inputs debounce for 300 ms, stale fetches are cancelled, and relationship/mention suggestions are capped at eight. Overview endpoints return aggregate counts and small previews. MongoDB connection pooling and bounded query timeouts apply; counts remain exact, so large deployments should load-test their own data and indexes.

Apply `V5__collaboration_access_and_task_details.mjs` before starting the new API (`make migrate`, also run automatically at backend startup). It adds collaboration, reset and notification collections/indexes, extends the user-role validator, and backfills task/search/version fields without changing passwords. Applied migration checksums remain immutable.

`npm test` now includes the collaboration/security suite: role restrictions, reauthentication, session revocation, task edit ownership, concurrent stale updates, cross-record reply rejection, recipient-only notification access, literal query handling, pagination and concurrent password recovery. `npm run test:crm-pages` uses isolated test accounts to check read-only details, edit/cancel/save, mentions/replies, notifications, user administration, reset pages, debounce, pagination, mobile overflow, careers super-admin access and axe critical/serious accessibility violations.

Security design references: [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), and [Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html). These are implemented controls, not an OWASP certification or a substitute for a production penetration test. MFA/SSO, verified email delivery, breached-password screening, a full script CSP and distributed rate-limit storage remain production work.


Every CRM and careers table now has an **Actions → View** link for each row. The action stays visible when wide tables scroll horizontally. CRM links preserve pagination/search filters; careers links preserve role filters, search and board/list selection. Candidate applications and roles (including draft and closed roles) open private, role-protected detail pages at `/manage/applications/:id` and `/manage/jobs/:id`. Role details are read-only until **Edit role** is selected. Public vacancies remain limited to published roles. `npm run test:table-actions` verifies row destinations, return navigation, private role access, candidate decisions and mobile actions against an isolated database.

`npm run test:notifications` starts an isolated Next.js instance and MongoDB test database. It checks actual WebSocket upgrades through the Next rewrite, live bell/list updates, recipient isolation, cross-tab read status, paginated reply redirects, offline/server-restart recovery, mobile accessibility and the absence of periodic notification polling. Artifacts are written to `/tmp/sleektech-notifications-results`. The backend notification suite also checks transaction rollback, multiple API instances, session revocation/expiry, role restrictions, payload limits and connection limits.

`npm run test:dev` verifies allocation, reservations and synchronized URLs. `npm run test:dev-startup` starts two temporary stacks with occupied default ports and an isolated database, then checks API proxies, CORS/CSRF, socket delivery, portal links, hot reload and clean shutdown. The test leaves unrelated servers running and writes its results to `/tmp/sleektech-port-tests`.


## Compact CRM and opportunity board

The CRM uses compact page headings, shared table and form spacing, three-column desktop record summaries, and comments alongside record details. Smaller screens show labelled facts, account context and then discussion. Read-only detail pages retain explicit Edit actions.

The sales pipeline keeps all six stages in one horizontal row. Drag the grip on a card with a mouse or touch device, or use its stage selector with the keyboard. Changes save immediately, with optimistic feedback, version-conflict handling and a persisted activity trail. Moving to Won runs customer conversion in the same transaction; converted opportunities remain Won. Reopen a Lost opportunity before moving it to Won.

Stage totals and values cover all matches, even when only the first 12 cards are loaded. Load more fetches the next batch for that stage. Search is debounced; board payloads exclude notes and contact email. Cards are ordered by latest update. Refreshing or saving a move reloads the first batch in each stage. `V6__pipeline_stage_pagination.mjs` adds the stage/update index and runs automatically when the backend starts (or with `make migrate`).

Run `npm run test:crm-ui` for the isolated desktop/mobile browser journey, including actual API persistence, keyboard/touch interactions, errors and accessibility checks. It creates a temporary Next instance and database, then removes both. Screenshots are written to `/tmp/sleektech-crm-ui-results`. `npm test` includes pipeline pagination, role, transaction and version-conflict regressions.

Design references: [Carbon data table density](https://carbondesignsystem.com/components/data-table/usage/) informed consistent row and toolbar spacing; [Atlassian accessible drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines/) informed the alternative stage selector, announcements and focus restoration. Pointer handling uses [dnd-kit sensors](https://dndkit.com/legacy/api-documentation/sensors/).
