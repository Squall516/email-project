# Publication validation — 3 November 2026

## Scope

Checked the author-selected `email-project` development checkout. A separate review copy existed and was not selected or modified. This pass prepared source publication, not a production deployment or security certification. The original Git commit and migration files were preserved.

## Executed checks

Environment: macOS, Node.js v26.10.0, npm 11.19.1. Final Next.js version: 16.4.4.

| Check | Actual outcome |
|---|---|
| Initial TypeScript check | Failed: empty route module, missing MailParser types and optional IMAP fields |
| Initial ESLint | Failed: five errors and nine warnings |
| Final `npm run typecheck` | Passed, including Next route-type generation |
| Final `npm run lint` | Passed with no reported warnings/errors |
| Prisma client generation | Passed using a placeholder database URL; no migration/database query performed |
| Initial production build | Failed during type checking, then after fixes failed on Next's security-version guard |
| Final `npm run build` | Passed after updating Next.js and matching ESLint config from 16.4.0 to 16.4.4 |
| Production server | Started successfully on loopback with placeholder/empty service credentials |
| Isolated HTTP smoke checks | 4 passed, 0 failed; details below |
| Automated unit/E2E tests | No existing suite or `npm test` script; no automated-suite pass claim |
| Real IMAP/SMTP/PostgreSQL workflows | Not executed; no real credentials used for checks |

HTTP checks: `/login` returned 200; `/` redirected with 307; posting `{}` to `/api/login` without an administrator password returned 401; `/api/emails/fetch` with empty mailbox credentials returned 503. These validate startup and selected negative paths, not successful database operations, mailbox parsing or email delivery.

`test-imap.mjs` is a manual mailbox integration script that prints mail content. It was inspected but not run. No real user emails or customer records were collected.

## Bounded fixes

- Declared Nodemailer as a runtime dependency, moved Prisma Client to runtime dependencies, and added MailParser/Nodemailer type packages.
- Replaced unrelated `prisma skills sync` postinstall work with `prisma generate`.
- Completed the previously empty account-ID route by delegating to the existing account lookup.
- Guarded missing IMAP configuration/status/source fields and released mailbox resources in finally blocks; suppressed raw IMAP errors from logs.
- Corrected page initialization, stale polling guards and a rental-page type without disabling lint or strict TypeScript checks.
- Rejected missing administrator-password configuration rather than allowing an undefined-password comparison to succeed. This does not fix the broader authentication design.
- Updated Next.js and matching ESLint config to 16.4.4, Nodemailer to 10.3.1 and compatible mail-parser/address dependencies.
- Bound development/production start scripts to loopback.

## Dependency advisories

The configured npm mirror did not implement the audit endpoint. An audit against the official npm registry was therefore used.

Before compatible updates: 24 reported vulnerable package/dependency entries (1 critical, 4 high, 19 moderate).
After updates: **20 entries remain: 0 critical, 4 high, 16 moderate**. These are npm dependency-tree counts, not twenty independently validated exploits. The high entries include `prisma`, `@prisma/config`, `deepmerge-ts` and `zod`. npm suggested a major Prisma upgrade for part of this chain and inappropriate-looking major downgrades for some lint-tool chains; no forced audit fix or large migration was performed.

A successful build is not a clean security audit. Dependency advisories may change over time. Review and resolve these alongside the application-level security blockers before any real deployment.

## Privacy and Git checks

- A populated `.env` was found. Values were not printed or staged.
- `.env` was not tracked and did not appear in existing historical paths.
- Configured credential/address values were compared against selected source and all existing history blobs, without printing the values; no matches were found there.
- Personal agent directories, dependencies, generated output, logs, mailbox exports and database dumps are excluded. `.env.example` contains placeholders/empty passwords only.
- Migration SQL contains schema statements, not real data. No database dump or seed dataset is included.
- Sensitive-file exclusions and the final staged file list were checked before publication. These are targeted checks, not a guarantee that every possible vulnerability or private identifier has been detected.

## Remaining work

Secure sessions and API authorization, safer secret storage, transactional rental changes, input validation, complete migrations, rendered mailbox results, meaningful automated tests and independent end-to-end validation remain unfinished. Read SECURITY.md and the README limitations before running anything beyond a disposable local demo.
