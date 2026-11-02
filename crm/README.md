# SleekTech Crm

Next.js with Tailwind CSS, local fonts, and the shared SleekTech UI package in `../shared/ui`.

Run `make install` once from `..`, then `make dev` from `..` for coordinated startup. The launcher chooses free ports and updates the shared API, portal URLs and CORS automatically; use the URLs printed in the terminal. Running `npm run dev` from this folder alone uses its configured fixed port and expects a separately running backend.

`npm run build` creates the production build; `npm start` serves it. Copy `.env.example` to `.env.local` to change API and public URLs.

`make docker` starts the complete Docker development stack with hot reload. See [workspace setup](../README.md) for configuration and release gates.
