# SimpTech

A complete React + Vite company website with 27 pre-rendered pages, original product illustrations, and reusable components. The visual direction uses a white canvas, restrained blue accents, Inter typography, and generous space. No stock template, copied brand artwork, external font request, or AI API is required.

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

`npm run build` builds the browser bundle, renders every route to its own HTML file, and writes `dist/sitemap.xml`, `dist/robots.txt`, and `dist/404.html`. Every page has an individual title, description, canonical URL, social metadata, and readable HTML before JavaScript runs. The application hydrates those pages to activate filters, menus, forms, and saved drafts. Navigation uses ordinary URLs and browser history.

## Edit the website

| What to change                                                   | Where                                  |
| ---------------------------------------------------------------- | -------------------------------------- |
| Company name, description, deployed origin, public contact email | `src/data/content.js` → `site`         |
| Services and their detail pages                                  | `src/data/content.js` → `services`     |
| Project concepts and detail stories                              | `src/data/content.js` → `projects`     |
| Articles and full article text                                   | `src/data/content.js` → `articles`     |
| Approved client testimonials                                     | `src/data/content.js` → `testimonials` |
| FAQs, process steps, and industry content                        | `src/data/content.js`                  |
| Homepage composition and main headline                           | `src/pages/Home.jsx`                   |
| Navbar, footer, and shared contact CTA                           | `src/components/Layout.jsx`            |
| Buttons, headings, icons, and accordion                          | `src/components/ui.jsx`                |
| Original dashboard, board, storefront, and article illustrations | `src/components/ProductVisuals.jsx`    |
| Colors, typography, spacing, and responsive rules                | `src/styles.css`                       |
| Routing and page search metadata                                 | `src/App.jsx`                          |
| Production pre-rendering                                         | `scripts/prerender.mjs`                |

The content arrays generate their corresponding detail routes automatically. To add a service, project, or article, copy an existing object, choose a unique slug, and update its content. Rebuild to generate the new HTML and sitemap entry. For a new standalone page, add a React component and register it in `basePages` in `src/App.jsx`.

The `site.origin` value must match your production domain before a public launch. It is used in canonical links, structured data, the XML sitemap, and social cards. The current site is hosted privately through Sites; public indexing is dependent on hosting access, not just SEO markup.

### Contact behavior

The project form is functional without a backend. It validates required fields, accepts service-specific links, prepares a project brief, downloads a UTF-8 text file, and optionally saves/restores a draft in local storage. Draft storage requires checking the opt-in box; a clear-draft action removes it. Submitted details are not transmitted to a server.

Set `site.contactEmail` to your verified public email to enable the email handoff and show the email in the contact page and footer. The email button opens the visitor’s email application with the brief populated. It does not claim that an inquiry was automatically sent. For direct submissions, connect a real backend or form service, add pending/success/failure states, and update the privacy page to reflect its data handling.

### Project stories and testimonials

The Meridian, Orbit, and Aster projects are explicitly labeled as original concepts. Their UI names, customers, transactions, and metrics are illustrative. Replace them with approved project details as real work becomes available; do not relabel concept work as delivered client work.

No customer quotes, client logos, statistics, or endorsements have been invented. A reusable testimonial section is implemented. Add approved entries to the `testimonials` array:

```js
{
  quote: 'The exact, approved client quote.',
  name: 'Client name',
  role: 'Role',
  company: 'Company'
}
```

The homepage automatically displays the testimonial section when the array contains entries, with accessible controls when there is more than one quote. Until then, it displays SimpTech’s own partnership commitment.

## Included pages

| Page family         | Routes                                                                                                                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage            | `/`                                                                                                                                                                                     |
| Services            | `/services`                                                                                                                                                                             |
| Service details     | `/services/website-development`, `/services/web-applications`, `/services/admin-dashboards`, `/services/business-analytics`, `/services/saas-products`, `/services/workflow-automation` |
| Work                | `/work`                                                                                                                                                                                 |
| Project concepts    | `/work/meridian-analytics`, `/work/orbit-workspace`, `/work/aster-commerce`                                                                                                             |
| Company             | `/about`, `/approach`, `/industries`, `/technologies`, `/careers`                                                                                                                       |
| Insights            | `/insights`                                                                                                                                                                             |
| Articles            | `/insights/before-you-build-your-mvp`, `/insights/dashboards-that-drive-decisions`, `/insights/automate-the-right-things`                                                               |
| Contact and help    | `/contact`, `/faq`                                                                                                                                                                      |
| Website information | `/privacy`, `/terms`, `/accessibility`, `/sitemap`                                                                                                                                      |
| Missing page        | `/404.html`                                                                                                                                                                             |

## Design research

The supplied Atlassian, Kyndryl, and editorial layout references informed the use of spacious composition, strong type, purposeful blue, clear navigation, and substantial storytelling. All site copy, brand treatment, layout implementation, and product artwork are original.

Comparable sites reviewed on 29 October 2026:

- [thoughtbot services](https://thoughtbot.com/services): separate capability pages, industries, an approach page, and resource navigation. [Their case studies](https://thoughtbot.com/case-studies) show the usefulness of detailed project narratives.
- [Netguru](https://www.netguru.com/): service, technology, industry, and client navigation. [Their resources](https://www.netguru.com/resources) add practical guides and insights beyond a brochure homepage.
- [Atlassian company](https://www.atlassian.com/company): company storytelling and pathways into solutions, resources, and customer stories.

Those observations informed the additional approach, industries, technology toolkit, careers, insights, FAQ, and detailed project pages. Security certifications, customer proof, and hiring claims were omitted because no substantiating company information was supplied.

## Verification

After building, run:

```bash
npm test
```

The browser verification script checks all 27 routes, page metadata, a single main heading, internal links, desktop/mobile overflow, and automated WCAG A/AA rules. It also checks keyboard navigation, the mobile services menu, project filtering, insight search and reset, FAQs, form validation, download contents, saved draft lifecycle, query parameter preselection, and the custom 404.

The script uses Google Chrome at `/usr/bin/google-chrome` by default. Set `SIMPTECH_CHROME` to another Chromium-compatible executable when needed. It starts a temporary localhost server and closes both the server and browser when complete. Reports and screenshots are written to ignored `test-results/`. Automated accessibility checks complement, rather than replace, assistive-technology and human review.

## Hosting

The deployable output is `dist/`; the Sites identity and static directory are in `.openai/hosting.json`. Keep the project ID unchanged when updating this existing Site. The source is kept independently of the built output.

For another static host, serve extensionless routes from the corresponding `dist/<route>/index.html` and use `dist/404.html` for missing pages. Set the production origin in the content file and rebuild. No runtime environment variables or server secrets are needed.

## Assets and licenses

The product interfaces, article art, logo, and abstract company artwork are built with HTML, CSS, and SVG in this repository. `public/social-card.png` is the original share image. Lucide supplies the interface icons. Inter is served locally from `public/fonts/`; its SIL Open Font License is included there. Third-party names on the technology page identify possible tools and do not imply endorsement.
