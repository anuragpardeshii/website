# SleekTech

## CRM and careers platform

The `SimpTech` workspace has three sibling projects beside this website: `../crm`, `../careers`, and `../backend`: SleekTech CRM for leads, customers, delivery projects and communications; and SleekTech Talent for role publishing, candidate applications and recruitment. They use the existing brand and a shared UI package. The marketing website remains a separate Vite application.

Read the [research, product plan and design specification](../plan.html) and [platform setup and release notes](../README.md). From this repository root:

```bash
make -C .. install
make -C .. dev
```

Open CRM at `http://localhost:3001`, careers at `http://localhost:3002`, and recruitment at `http://localhost:3002/manage`. The default local command enables clearly labeled example data and a staff demo sign-in. It never sends outbound messages. Candidate accounts are created through the candidate sign-in screen.

The existing `/careers` page fetches published jobs through the Vite `/api` proxy during development. `make -C .. dev` includes the marketing site on port 5173. For deployed marketing builds, configure `VITE_CAREERS_API_URL` to the API's `/api/public/jobs` endpoint and `VITE_CAREERS_PORTAL_URL` to the Talent application's public origin. Without these settings, the existing static site continues to show its honest no-vacancies state.

The platform has a separate dependency lockfile and build. It is not included in the marketing site's static Sites deployment. Provider integrations need account configuration before live use; see the platform release notes for the remaining production launch gates.

A complete React + Vite company website with 32 pre-rendered pages, original generated artwork and product interfaces, and reusable components. The redesigned visual direction uses a white canvas, electric cobalt, oversized Inter typography, original architectural imagery, editorial layouts, and a dark interactive systems section. Motion for React (Framer Motion) drives scroll reveals, parallax, magnetic links, and animated capability transitions. No stock template, copied brand artwork, external font request, or AI API is required.

## Run locally

Requires Node.js 20.19+ or 22.12+ and npm.

```bash
npm ci
npm run dev
```

Open the Local URL printed by Vite. For a production build:

```bash
npm run build
npm run preview
```

`npm run build` builds the browser bundle, renders every route to its own directory index and clean-URL HTML alias, and writes `dist/sitemap.xml`, `dist/robots.txt`, and `dist/404.html`. Every page has an individual title, description, canonical URL, social metadata, and readable HTML before JavaScript runs. A route marker prevents hydration mismatches on static hosts that fall back to the homepage. The application hydrates matching pages to activate filters, menus, forms, and saved drafts. Navigation uses ordinary URLs and browser history.

## Edit the website

| What to change                                                   | Where                                                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Company name, description, deployed origin, public contact email | `src/data/content.js` → `site`                                              |
| Services and their detail pages                                  | `src/data/solutions.js` → `solutions`                                       |
| Project concepts and detail stories                              | `src/data/content.js` → `projects`                                          |
| Articles and full article text                                   | `src/data/content.js` → `articles`                                          |
| Approved client testimonials                                     | `src/data/content.js` → `testimonials`                                      |
| FAQs, process steps, and industry content                        | `src/data/content.js`                                                       |
| Homepage composition and main headline                           | `src/pages/Home.jsx`                                                        |
| Navbar, footer, and shared contact CTA                           | `src/components/Layout.jsx`                                                 |
| Buttons, headings, icons, and accordion                          | `src/components/ui.jsx`                                                     |
| Product interfaces and journal covers                            | `src/components/EnterpriseVisuals.jsx`, `src/components/ProductVisuals.jsx` |
| Colors, typography, spacing, and responsive rules                | `src/redesign.css` (new visual system), `src/styles.css` (base styles)      |
| Routing and page search metadata                                 | `src/App.jsx`                                                               |
| Production pre-rendering                                         | `scripts/prerender.mjs`                                                     |

The content arrays generate their corresponding detail routes automatically. To add a service, project, or article, copy an existing object, choose a unique slug, and update its content. Rebuild to generate the new HTML and sitemap entry. For a new standalone page, add a React component and register it in `basePages` in `src/App.jsx`.

The `site.origin` value must match your production domain before a public launch. It is used in canonical links, structured data, the XML sitemap, and social cards. The current site is hosted privately through Sites; public indexing is dependent on hosting access, not just SEO markup.

### Contact registration and discovery

`/contact` collects a name, email, optional company/phone and service interest, plus contact consent. It posts to the shared Node API and creates a New lead with source Website and a discovery follow-up task. Retries reuse a registration ID to avoid duplicate records. The form reports success only after the API confirms storage; failed requests retain the entered details.

The CRM’s All leads table has an **Open brief** action. Sales and admin staff can capture objectives, scope, audience, existing processes, integrations, success measures, timeline, budget, and stakeholders. Internal notes stay private. Save the brief, choose **Create client invitation**, then copy the link or **Prepare email draft**. The email remains unsent until staff review and send it in Communications through a configured provider.

Invitations open `/discovery#token=…`, expire after seven days, and can be revoked. A new invitation replaces earlier open invitations. Shared content is a snapshot; later working-draft changes are not exposed automatically. Client submissions appear in the CRM’s invitation history without overwriting the team’s draft. Link secrets are stored only as hashes. The page is excluded from the generated sitemap and marked noindex.

The website uses `/api` by default. Vite proxies it to `API_URL` (default `http://127.0.0.1:4000`). For production, proxy `/api` to the Node backend or set `VITE_API_BASE_URL` to the public API base, including `/api`, at build time. Set backend `MARKETING_ORIGIN` to the website origin for CORS and invitation links. Apply `V4__lead_discovery.mjs` with `make migrate` from the parent workspace (startup also applies pending migrations). CRM and backend remain in their separate sibling folders.

With MongoDB and the CRM UI running, `node scripts/verify-lead-journey.mjs` checks registration → CRM brief → invitation → client response against an isolated temporary database. It never sends email and deletes the temporary database afterward. Override `CRM_TEST_URL` if the CRM uses another local URL.

### Project stories and testimonials

The Meridian, Orbit, Aster, and Atlas projects are explicitly labeled as original concepts. Their UI names, customers, transactions, and metrics are illustrative. Replace them with approved project details as real work becomes available; do not relabel concept work as delivered client work.

No customer quotes, client logos, statistics, or endorsements have been invented. A reusable testimonial section is implemented. Add approved entries to the `testimonials` array:

```js
{
  quote: 'The exact, approved client quote.',
  name: 'Client name',
  role: 'Role',
  company: 'Company'
}
```

The homepage automatically displays the testimonial section when the array contains entries, with accessible controls when there is more than one quote. Until then, it displays SleekTech’s own partnership commitment.

## Included pages

| Page family         | Routes                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage            | `/`                                                                                                                                                                                           |
| Services            | `/services`                                                                                                                                                                                   |
| Service details     | `/services/website-development`, `/services/crm-development`, `/services/erp-development`, `/services/business-analytics`, `/services/ecommerce-development`, `/services/inventory-logistics` |
| Work                | `/work`                                                                                                                                                                                       |
| Project concepts    | `/work/meridian-analytics`, `/work/orbit-workspace`, `/work/aster-commerce`, `/work/atlas-logistics`                                                                                          |
| Company             | `/about`, `/approach`, `/industries`, `/technologies`, `/careers`                                                                                                                             |
| Insights            | `/insights`                                                                                                                                                                                   |
| Articles            | `/insights/before-you-build-your-mvp`, `/insights/dashboards-that-drive-decisions`, `/insights/automate-the-right-things`                                                                     |
| Contact and help    | `/contact`, `/faq`                                                                                                                                                                            |
| Website information | `/privacy`, `/terms`, `/accessibility`, `/sitemap`                                                                                                                                            |
| Missing page        | `/404.html`                                                                                                                                                                                   |

## Design research

The supplied Atlassian, Kyndryl, and editorial layout references informed the use of spacious composition, strong type, purposeful blue, clear navigation, and substantial storytelling. All site copy, brand treatment, layout implementation, and product artwork are original.

Comparable sites reviewed on 29 October 2026:

- [thoughtbot services](https://thoughtbot.com/services): separate capability pages, industries, an approach page, and resource navigation. [Their case studies](https://thoughtbot.com/case-studies) show the usefulness of detailed project narratives.
- [Netguru](https://www.netguru.com/): service, technology, industry, and client navigation. [Their resources](https://www.netguru.com/resources) add practical guides and insights beyond a brochure homepage.
- [Atlassian company](https://www.atlassian.com/company): company storytelling and pathways into solutions, resources, and customer stories.

Award-winning and agency references reviewed for the redesign:

- [Active Theory v5 on Awwwards](https://www.awwwards.com/sites/active-theory-v5): real-time environments and full-screen interaction informed the idea of an original animated technology scene.
- [Unseen Studio on Awwwards](https://www.awwwards.com/sites/unseen-studio): immersive visual storytelling informed the stronger art direction and deliberate transitions.
- [Instrument](https://www.instrument.com/): the agency’s use of large typography, visual project narratives, and technology-focused storytelling informed the editorial page rhythm.

SleekTech’s layout, copy, artwork, product concepts, and animation implementation are original. This site does not claim an award or reuse those studios’ assets.

Those observations informed the additional approach, industries, technology toolkit, careers, insights, FAQ, and detailed project pages. Security certifications, customer proof, and hiring claims were omitted because no substantiating company information was supplied.

## Verification

After building, run:

```bash
npm test
```

The browser verification script checks all 33 routes, page metadata, a single main heading, internal links, desktop/mobile overflow, and automated WCAG A/AA rules. It also checks image loading, solution-tab keyboard controls, connected-system selection, device reduced-motion preferences, keyboard navigation, the mobile services menu, project filtering, insight search and reset, FAQs, registration validation, request payload, success focus, query parameter preselection, and the custom 404.

The script uses Google Chrome at `/usr/bin/google-chrome` by default. Set `SLEEKTECH_CHROME` to another Chromium-compatible executable when needed. It starts a temporary localhost server and closes both the server and browser when complete. Reports and screenshots are written to ignored `test-results/`. Automated accessibility checks complement, rather than replace, assistive-technology and human review.

## Hosting

The deployable output is `dist/`; the Sites identity and static directory are in `.openai/hosting.json`. Keep the project ID unchanged when updating this existing Site. The source is kept independently of the built output.

For another static host, serve extensionless routes from the corresponding `dist/<route>/index.html` and use `dist/404.html` for missing pages. Set the production origin in the content file and rebuild. The marketing pages are static. Contact registration and discovery require the shared Node backend; configure the API proxy and backend origins before deployment. Provider credentials stay on the backend.

## Assets and licenses

The product interfaces, journal covers, and logo are built with HTML, CSS, and SVG in this repository. The connected-systems wireframe is drawn with Canvas. The two architectural images are original AI-generated artwork, converted to WebP without visual edits. `public/social-card.png` is the original share image. Lucide supplies the interface icons. Inter is served locally from `public/fonts/`; its SIL Open Font License is included there. Third-party names on the technology page identify possible tools and do not imply endorsement.

## Brand assets

SleekTech uses a custom geometric S symbol and an Inter wordmark in cobalt and charcoal. The shared geometry is in `src/data/brand.js`; `src/components/BrandMark.jsx` renders it in the site logo. Downloadable, self-contained SVG wordmarks and symbols, including white variants, are in `public/brand/`. The wordmark SVGs embed the locally licensed Inter font.

Run `npm run brand-assets` to regenerate the SVGs, SVG/ICO/PNG favicons, Apple touch icon, and web manifest. Run `npm run social-card` to regenerate the sharing image. These scripts render local vectors and fonts with Chrome. The existing hosting origin and browser draft-storage key are retained so links and previously saved briefs keep working. The old `SIMPTECH_CHROME` environment variable is also accepted for compatibility.

## Redesigned experience

The six primary solution pages are Website Development; CRM; ERP; Dashboards & Business Analytics; E-commerce & Order Management; and Inventory & Logistics Management. The earlier `/services/web-applications`, `/services/admin-dashboards`, `/services/saas-products`, and `/services/workflow-automation` pages remain available, including existing contact deep links.

- `src/components/SolutionExperiences.jsx` contains the keyboard-accessible six-tab explorer and the interactive connected-systems story.
- `src/components/MotionSystem.jsx` contains the shared motion provider, scroll progress, viewport reveals, magnetic links, parallax media, and real-time wireframe renderer.
- `src/components/DevelopmentJourney.jsx` and its stylesheet replace the homepage hero image with an animated, five-stage software development story: request, planning, design, code, and production. Forma is an illustrative project; the `.example` address in its final browser preview is a mock URL. The former process navigation has been removed. Playback follows device motion preferences and suspends offscreen and in hidden tabs. Reduced motion presents a complete, static booking request. `scripts/verify-journey.mjs` checks the sequence, editing and terminal states, responsive layouts, and device preferences as part of `npm test`.
- `src/components/WhatWeBuild.jsx`, `BuildDemos.jsx`, `build-capabilities.js`, and `what-we-build.css` adapt the supplied “What we build” HTML reference into a native, themed React showcase on the homepage and `/work`. Six selectable capabilities demonstrate AI support, enterprise knowledge, CRM, SaaS and mobile, voice scheduling, and data workflows, with three delivery workstreams per category. Each selection plays a fast, finite 4.6-second sequence. Mouse hover previews a category; click and keyboard selection work as well. The navigation is text-only and long explanatory copy is replaced by concise delivery labels. Keyboard navigation, hover selection, finite playback, reduced motion, viewport suspension, and responsive final states are covered by `scripts/verify-builds.mjs`. All interactions are local illustrations; no AI, phone, billing, or customer-data service is contacted. The existing four project concepts remain available on `/work`.
- `src/components/EnterpriseVisuals.jsx` contains reusable website, CRM, ERP, analytics, commerce, and logistics interface concepts. All data is illustrative.
- `src/redesign.css` is the new design layer. Its sections cover the homepage, product interfaces, editorial content, inner pages, and responsive breakpoints.

All core content is present in the rendered HTML. The operating-system reduced-motion preference disables continuous animation and parallax; the navigation no longer displays a motion control. The canvas suspends animation outside the viewport and when the document is hidden. The interactive solution tabs do not auto-advance. Page transitions use native links so URLs, history, open-in-new-tab, and pre-rendered SEO remain predictable.

### Original artwork

The built-in image generation tool created two original images for this redesign:

| Asset                                       | Creation prompt / direction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/connected-architecture.webp` | Wide 16:9 premium editorial architectural artwork. A refined photorealistic modular sculpture made from translucent cobalt glass, matte ultramarine blocks, clear optical glass fins, and brushed aluminium connection bridges. Three tiers with an open rectangular portal, pale blue-white ground, long directional afternoon shadows, elevated three-quarter 70 mm perspective. High-end industrial photography. No people, text, logos, screens, dashboards, floating icons, spheres, purple gradients, or sci-fi neon. |
| `public/images/logistics-architecture.webp` | Original premium editorial architectural photograph of a modern, spacious fulfillment center. Tall blue steel shelving, beige cartons, a blue autonomous mobile robot in the foreground, strong daylight through clerestory windows, and an elevated view down a long central aisle. Cobalt, white, charcoal, and beige palette. No people, text, logos, or brand marks. Leave space in the upper left for an editorial overlay.                                                                                            |

These assets are approximately 178 KB and 301 KB. `public/social-card.png` is generated locally from the architectural artwork and typography using `npm run social-card`. The original full-resolution generated PNGs remain in the local image-generation output directory; the site serves only the optimized WebP files.
