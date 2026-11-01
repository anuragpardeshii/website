# SimpTech

A React + TypeScript + Vite company website with 34 prerendered pages, reusable software interface concepts, and accessible browser interactions.

Version 2 pairs deep indigo surfaces with electric-blue and violet light, a glossy original chrome sculpture, and contrasting pearl editorial sections. It presents SimpTech’s business offering: websites, dashboards, analytics, chatbots, AI engines, CRM, ERP, and connected operations. React components use strict TypeScript; Tailwind CSS provides compositional utilities alongside shared styles.

All changes remain on the `version-2` branch. The latest art direction follows the user-provided references: sculptural editorial typography, illuminated product interfaces, and rounded light/dark compositions. The former connection diagram and orange particle artwork have been replaced. The composition, copy, interfaces, and generated artwork are original to SimpTech.

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

`npm run build` runs strict TypeScript checks, builds the browser bundle, renders every route to its own directory index and clean-URL HTML alias, and writes `dist/sitemap.xml`, `dist/robots.txt`, and `dist/404.html`. Every page has an individual title, description, canonical URL, social metadata, and readable HTML before JavaScript runs. A route marker prevents hydration mismatches on static hosts that fall back to the homepage. The application hydrates matching pages to activate filters, menus, forms, and saved drafts. Navigation uses ordinary URLs and browser history.

## Edit the website

| What to change                                                   | Where                                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Company name, description, deployed origin, public contact email | `src/data/content.js` → `site`                                                                                                |
| Services and their detail pages                                  | `src/data/solutions.js` → `solutions`                                                                                         |
| Project concepts and detail stories                              | `src/data/content.js` → `projects`                                                                                            |
| Articles and full article text                                   | `src/data/content.js` → `articles`                                                                                            |
| Approved client testimonials                                     | `src/data/content.js` → `testimonials`                                                                                        |
| FAQs, process steps, and industry content                        | `src/data/content.js`                                                                                                         |
| Homepage composition and main headline                           | `src/pages/Home.tsx`                                                                                                          |
| Navbar, footer, and shared contact CTA                           | `src/components/Layout.tsx`                                                                                                   |
| Buttons, headings, icons, and accordion                          | `src/components/ui.tsx`                                                                                                       |
| Product interfaces and journal covers                            | `src/components/WorkspacePreview.tsx`, `src/components/EnterpriseVisuals.tsx`, `src/components/ProductVisuals.tsx`            |
| Colors, typography, spacing, and responsive rules                | `src/business.css` (design tokens, hero, dashboard), `src/cinematic.css` (compositions), `src/styles.css` (shared components) |
| Routing and page search metadata                                 | `src/App.tsx`                                                                                                                 |
| Production pre-rendering                                         | `scripts/prerender.mjs`                                                                                                       |

The content arrays generate their corresponding detail routes automatically. To add a service, project, or article, copy an existing object, choose a unique slug, and update its content. Rebuild to generate the new HTML and sitemap entry. For a new standalone page, add a React component and register it in `basePages` in `src/App.tsx`.

The `site.origin` value must match your production domain before a public launch. It is used in canonical links, structured data, the XML sitemap, and social cards. The current site is hosted privately through Sites; public indexing is dependent on hosting access, not just SEO markup.

### Contact behavior

The project form is functional without a backend. It validates required fields, accepts service-specific links, prepares a project brief, downloads a UTF-8 text file, and optionally saves/restores a draft in local storage. Draft storage requires checking the opt-in box; a clear-draft action removes it. Submitted details are not transmitted to a server.

Set `site.contactEmail` to your verified public email to enable the email handoff and show the email in the contact page and footer. The email button opens the visitor’s email application with the brief populated. It does not claim that an inquiry was automatically sent. For direct submissions, connect a real backend or form service, add pending/success/failure states, and update the privacy page to reflect its data handling.

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

The reusable `PartnershipSection` supports approved testimonials. It is not mounted on the current homepage; add it deliberately when verified material is available.

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

Rightfit was reviewed again on desktop and mobile for the cinematic revision. Its quiet navigation, typography, spacing, and large dashboard compositions informed the art direction. The latest revision follows the supplied violet, blue, and pearl visual references. SimpTech uses its own content, layouts, original interfaces, and generated artwork. No video is downloaded by the current site. Earlier research for the original site is retained below for context.

Comparable sites reviewed on 29 October 2026:

- [thoughtbot services](https://thoughtbot.com/services): separate capability pages, industries, an approach page, and resource navigation. [Their case studies](https://thoughtbot.com/case-studies) show the usefulness of detailed project narratives.
- [Netguru](https://www.netguru.com/): service, technology, industry, and client navigation. [Their resources](https://www.netguru.com/resources) add practical guides and insights beyond a brochure homepage.
- [Atlassian company](https://www.atlassian.com/company): company storytelling and pathways into solutions, resources, and customer stories.

Award-winning and agency references reviewed for the redesign:

- [Active Theory v5 on Awwwards](https://www.awwwards.com/sites/active-theory-v5): real-time environments and full-screen interaction informed the idea of an original animated technology scene.
- [Unseen Studio on Awwwards](https://www.awwwards.com/sites/unseen-studio): immersive visual storytelling informed the stronger art direction and deliberate transitions.
- [Instrument](https://www.instrument.com/): the agency’s use of large typography, visual project narratives, and technology-focused storytelling informed the editorial page rhythm.

SimpTech’s layout, copy, artwork, product concepts, and animation implementation are original. This site does not claim an award or reuse those studios’ assets.

Those observations informed the additional approach, industries, technology toolkit, careers, insights, FAQ, and detailed project pages. Security certifications, customer proof, and hiring claims were omitted because no substantiating company information was supplied.

## Verification

After building, run:

```bash
npm test
```

The browser verification script checks all 34 routes, page metadata, a single main heading, internal links, desktop/mobile overflow, and automated WCAG A/AA rules. It also checks image loading, solution-tab keyboard controls, connected-system selection, global motion pause/resume, reduced-motion preferences, keyboard navigation, the mobile services menu, project filtering, insight search and reset, FAQs, form validation, download contents, saved draft lifecycle, query parameter preselection, and the custom 404.

The script uses Google Chrome at `/usr/bin/google-chrome` by default. Set `SIMPTECH_CHROME` to another Chromium-compatible executable when needed. It starts a temporary localhost server and closes both the server and browser when complete. Reports and screenshots are written to ignored `test-results/`. Automated accessibility checks complement, rather than replace, assistive-technology and human review.

## Hosting

The deployable output is `dist/`; the Sites identity and static directory are in `.openai/hosting.json`. Keep the project ID unchanged when updating this existing Site. The source is kept independently of the built output.

For another static host, serve extensionless routes from the corresponding `dist/<route>/index.html` and use `dist/404.html` for missing pages. Set the production origin in the content file and rebuild. No runtime environment variables or server secrets are needed.

## Assets and licenses

The product interfaces, journal covers, logo, and animated signal field are built with HTML, CSS, and SVG in this repository. The hero uses an original generated chrome sculpture, served as responsive transparent WebP artwork. The architectural and silver filament images elsewhere on the site are original AI-generated artwork, served as optimized WebP files. The new sculpture's complete generation prompt and asset details are recorded in `public/media/CREDITS.txt`. `public/social-card.png` is the matching original share image. Lucide supplies interface icons. Inter is served locally from `public/fonts/`; its SIL Open Font License is included there. Third-party names on the technology page identify possible tools and do not imply endorsement.

## Version 2 design and interaction

- `src/components/WorkspacePreview.tsx` supplies the homepage’s Business overview, Sales pipeline, and Operations tabs. Arrow keys, Home, and End update the selected interface and corresponding service link.
- `src/components/SolutionExperiences.tsx` supplies the eight-service explorer and project previews. `src/components/BusinessHub.tsx` replaces the former systems diagram with an interactive business dashboard: six areas, weekly/monthly sample data, keyboard-accessible tabs, and contextual service links.
- `src/components/EnterpriseVisuals.tsx` contains the original website, CRM, ERP, analytics, commerce, and logistics concepts. All names, figures, and records are illustrative. Mobile previews prioritize readable key metrics and records.
- `src/business.css` defines the shared color tokens, luminous hero, pearl capability index, business dashboard, and AI service previews. `src/intelligence.css` supplies responsive AI scenes, signal artwork, and interaction styling. `src/cinematic.css` supplies the editorial composition; `src/styles.css` retains shared inner-page components. Violet and indigo surfaces carry the design through the inner pages.
- `src/components/MotionSystem.tsx` provides motion preferences and pause controls. Content remains available in prerendered HTML; reduced-motion preferences and the pause control disable nonessential motion.
- `src/components/CinematicHero.tsx` pairs staggered typography with scroll-linked sculpture depth, gentle floating motion, and drifting blue-violet light. `MotionSurface.tsx` adds spring-driven pointer depth and lighting to the AI workspace and assistant console.
- `src/components/BusinessStory.tsx` presents four business practice areas in a contrasting pearl editorial section. All capability links point to working service pages.
- `src/components/AIServicePreview.tsx` provides original AI-engine and customer-support interfaces. `src/data/solutions.js` includes dedicated chatbot and AI-engine services; navigation, the explorer, contact preselection, prerendering, and sitemap include them automatically.
- `src/components/AIJourney.tsx` presents Connect, Understand, and Review chapters. On sufficiently large desktop viewports, native scrolling advances the chapters inside a sticky composition. Tabs and keyboard navigation remain available. Small screens, paused motion, and reduced motion use the same content without the extended scroll scene.
- `src/components/SignalField.tsx` draws the original SVG connection artwork. Scroll progress reveals the filaments; particles and ambient motion run only while the scene is nearby and motion is enabled.
- `src/components/CinematicMotion.tsx` lazily loads GSAP and ScrollTrigger for staggered headline reveals, scroll-linked interface perspective and masking, and project-preview parallax. Context cleanup handles navigation, pause, and preference changes. Motion (formerly Framer Motion) handles scroll scenes, spring interactions, interface transitions, and reveals without a duplicate animation dependency. Native scrolling is retained.
- `src/components/IntelligenceStudio.tsx` contains three scripted, local-only AI interface explorations with accessible tabs and expandable sample action plans. Neither AI interface calls a model or executes business actions.
- `scripts/social-card.mjs` generates the matching social image from the original chrome artwork, HTML, CSS, and the bundled Inter font. Run `npm run social-card` before building when changing the social design.

The hero artwork is approximately 136 KB on desktop and 65 KB on mobile, with alpha preserved. It loads eagerly; supporting images are lazy-loaded. Ambient hero motion pauses offscreen and all nonessential motion respects the global pause control and reduced-motion preferences. Hover tilt runs only for a mouse pointer. Native scrolling is retained. GSAP is lazy-loaded; React and Motion use separate cacheable chunks. No video or 3D engine dependency is required.

The existing contact flow still validates the brief, supports an optional local draft, and downloads the brief. It does not submit inquiries to a backend. Existing service URLs, legacy routes, project and article URLs, metadata, and prerendering are retained.

Verification includes visible sculpture motion, complete pause/resume, offscreen suspension, six dashboard systems, reporting-period updates, both new service destinations, desktop scroll chapters, keyboard and touch-accessible chapter tabs, sample review/reset, hover depth, offscreen particle suspension, motion pause/resume, mobile interface containment, and AI accessibility. It also covers existing route metadata, navigation, filtering, contact downloads, and local drafts. Screenshots and the JSON report are in ignored `test-results/`.

### Original artwork

The built-in image generation tool created the current chrome artwork in `public/media/violet-sculpture.webp` (1024 × 1024) and `violet-sculpture-mobile.webp` (640 × 640). The previous silver filament illustration is retained for existing project concepts. See `public/media/CREDITS.txt` for the exact prompt. Earlier original architectural artwork is also retained:

| Asset                                       | Creation prompt / direction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/connected-architecture.webp` | Wide 16:9 premium editorial architectural artwork. A refined photorealistic modular sculpture made from translucent cobalt glass, matte ultramarine blocks, clear optical glass fins, and brushed aluminium connection bridges. Three tiers with an open rectangular portal, pale blue-white ground, long directional afternoon shadows, elevated three-quarter 70 mm perspective. High-end industrial photography. No people, text, logos, screens, dashboards, floating icons, spheres, purple gradients, or sci-fi neon. |
| `public/images/logistics-architecture.webp` | Original premium editorial architectural photograph of a modern, spacious fulfillment center. Tall blue steel shelving, beige cartons, a blue autonomous mobile robot in the foreground, strong daylight through clerestory windows, and an elevated view down a long central aisle. Cobalt, white, charcoal, and beige palette. No people, text, logos, or brand marks. Leave space in the upper left for an editorial overlay.                                                                                            |

These assets are approximately 178 KB and 301 KB. `public/social-card.png` is generated locally from the version 2 typography and original interface illustration using `npm run social-card`. The original full-resolution generated PNGs remain in the local image-generation output directory; the site serves only the optimized WebP files.
