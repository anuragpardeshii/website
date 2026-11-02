CREATE TABLE IF NOT EXISTS users (
 id text PRIMARY KEY, email text UNIQUE NOT NULL, name text NOT NULL, password_hash text NOT NULL,
 role text NOT NULL CHECK(role IN ('admin','sales','recruiter','candidate')), profile jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS leads (
 id text PRIMARY KEY, name text NOT NULL, company text NOT NULL, email text NOT NULL, phone text NOT NULL DEFAULT '',
 value numeric NOT NULL DEFAULT 0 CHECK(value>=0), stage text NOT NULL DEFAULT 'New' CHECK(stage IN ('New','Qualified','Proposal','Negotiation','Won','Lost')),
 source text NOT NULL DEFAULT 'Direct', owner text NOT NULL DEFAULT '', next_action text NOT NULL DEFAULT '', notes text NOT NULL DEFAULT '',
 whatsapp_consent boolean NOT NULL DEFAULT false, last_inbound_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS clients (id text PRIMARY KEY, lead_id text UNIQUE REFERENCES leads(id), name text NOT NULL, company text NOT NULL, email text NOT NULL, value numeric NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS projects (id text PRIMARY KEY, client_id text NOT NULL REFERENCES clients(id), name text NOT NULL, status text NOT NULL DEFAULT 'Discovery' CHECK(status IN ('Discovery','In progress','In review','Completed','On hold')), progress integer NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100), due_date date, owner text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS tasks (id text PRIMARY KEY, title text NOT NULL, due_date date, done boolean NOT NULL DEFAULT false, owner text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS activity (id text PRIMARY KEY, domain text NOT NULL, entity_id text, actor_id text REFERENCES users(id), action text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS jobs (id text PRIMARY KEY, slug text UNIQUE NOT NULL, title text NOT NULL, department text NOT NULL, location text NOT NULL, employment_type text NOT NULL DEFAULT 'Full-time', work_mode text NOT NULL DEFAULT 'Hybrid', salary text NOT NULL DEFAULT '', description text NOT NULL, requirements text NOT NULL, status text NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft','Published','Closed')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS resumes (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), filename text NOT NULL, mime text NOT NULL, storage_path text NOT NULL, extracted jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS applications (id text PRIMARY KEY, job_id text NOT NULL REFERENCES jobs(id), user_id text NOT NULL REFERENCES users(id), resume_id text REFERENCES resumes(id), profile jsonb NOT NULL, cover_letter text NOT NULL DEFAULT '', stage text NOT NULL DEFAULT 'Applied' CHECK(stage IN ('Applied','Screening','Interview','Offer','Hired','Rejected','Withdrawn')), consent_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(job_id,user_id));
CREATE TABLE IF NOT EXISTS application_events (id text PRIMARY KEY, application_id text NOT NULL REFERENCES applications(id) ON DELETE CASCADE, stage text NOT NULL, note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS interviews (id text PRIMARY KEY, application_id text NOT NULL REFERENCES applications(id), title text NOT NULL, starts_at timestamptz NOT NULL, duration integer NOT NULL CHECK(duration BETWEEN 15 AND 240), interviewer text NOT NULL, location text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS scorecards (id text PRIMARY KEY, application_id text NOT NULL REFERENCES applications(id), reviewer_id text NOT NULL REFERENCES users(id), craft integer NOT NULL CHECK(craft BETWEEN 1 AND 5), communication integer NOT NULL CHECK(communication BETWEEN 1 AND 5), problem_solving integer NOT NULL CHECK(problem_solving BETWEEN 1 AND 5), evidence text NOT NULL, recommendation text NOT NULL CHECK(recommendation IN ('Strong yes','Yes','Further review','No')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS messages (id text PRIMARY KEY, lead_id text NOT NULL REFERENCES leads(id), channel text NOT NULL CHECK(channel IN ('email','whatsapp')), direction text NOT NULL DEFAULT 'outbound', subject text NOT NULL DEFAULT '', body text NOT NULL, template text NOT NULL DEFAULT '', status text NOT NULL DEFAULT 'Draft', provider_id text UNIQUE, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS message_events (id text PRIMARY KEY, message_id text NOT NULL REFERENCES messages(id), event text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS webhook_receipts (id text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_application_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_application_job ON applications(job_id,stage);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_messages_lead ON messages(lead_id,created_at);
CREATE INDEX IF NOT EXISTS idx_activity_domain ON activity(domain,created_at);
