# SleekTech backend

Shared Node.js/Express API for CRM, careers, and the marketing job feed. Native MongoDB driver with replica-set transactions, collection validation, unique indexes, and versioned migrations.

From the parent `SleekTech` folder run `make install` and `make db`. Then run `npm run dev` here for debounced hot reload with graceful API restarts, or `npm start` for normal execution. Copy `.env.example` to `.env.local` to configure providers and origins. Runtime data and private résumés live in `.data/`.

- `npm test`: integration tests in a randomly named, isolated MongoDB database, removed afterward.
- `npm run migrate`: apply pending migrations.
- `npm run migrate:status`: show applied and pending versions.
- `npm run admin`: provision a staff account with a hidden password prompt.
- `npm run import:legacy`: copy preserved PostgreSQL records into an empty MongoDB database, keeping a recovery snapshot. Stop the old backend first.

Migrations live in `migrations/V1__initial_collections.mjs`, `V2__profile_changes.mjs`, and subsequent versions. Use `make migration-new NAME=profile_changes` in the parent folder for a new file. MongoDB migrations are JavaScript, not SQL. Applied migration checksums are immutable. Migrations must be idempotent because a process interruption can occur before its history record is saved. A schema lock prevents concurrent migrators; after a crash, inspect `_migration_locks`, confirm no migrator is running, and clear the stale lock manually. No automatic destructive rollback is provided.

PGlite is only a development dependency for the one-time legacy import. The runtime uses MongoDB exclusively. See [workspace setup](../README.md) for production requirements and provider limitations.
