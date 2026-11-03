# Email Project

## Project Overview

Email Project is a local full-stack prototype combining an email-address registry, mailbox-reading endpoints, and a dashboard for account inventory and rental records. It uses Next.js App Router, TypeScript and Prisma/PostgreSQL.

This repository is a portfolio code sample, **not a production email service or a commercially deployed product**. No user counts, customer feedback or real business outcomes are claimed. The interface is primarily Chinese. The development history is preserved, including the original Create Next App commit.

> **Local demonstration only.** Authentication and data handling are incomplete. Do not expose this application to the internet or configure it with real customer records or valuable account credentials. Publishing source code is not a deployment or a security certification.

## Motivation

The prototype brings related workflows—email registration, mailbox access, account inventory and rental status—into one interface to explore client/server integration and relational data modeling. The code illustrates a learning project with incomplete parts, rather than claiming a finished operational business. Any personal motivation or application narrative should be supplied and confirmed by the author.

## Main Features

The following are implemented in source; implementation is distinguished from end-to-end verification:

| Area | Implemented behavior | Status |
|---|---|---|
| Dashboard | Email count, rental/order metrics, account and order lists; creation/return/cleanup actions | UI and API code present; database-backed workflows not end-to-end verified in this publication pass |
| Email-address registry | List, add and delete addresses through Prisma | Requires a configured PostgreSQL database |
| IMAP reader | Fetch up to the newest five messages and extract the first 4–6 digit sequence | Code present; no real mailbox accessed during preparation |
| SMTP endpoint | Send a message using Nodemailer and local credentials | Backend only; no compose interface or real sending verified |
| Account inventory | Add/list/delete records and retrieve an individual record | Prototype stores a plaintext password field; use synthetic data only |
| Rental records | Create/complete orders, mark expired orders and show a rental page | Incomplete security and concurrency handling; no payment processing |
| Login screen | Compare an administrator password and set a cookie | Demonstration gate only, not secure authentication |

The dashboard requests IMAP data, but does **not render the retrieved message list**. Navigation links are mostly placeholders. The `/rent/[id]` page exists, but does not have a secure customer-identity or access-control design. Email addresses in the registry do not configure separate IMAP mailboxes: IMAP reads the single mailbox configured in the environment.

## Tech Stack

- Next.js 16.4.4 App Router and React 19.3.0
- TypeScript in strict mode
- Prisma 6.19.3 and PostgreSQL
- ImapFlow, MailParser and Nodemailer
- Tailwind CSS 4 and ESLint 9

Exact resolved dependencies are captured in `package-lock.json`. Prisma Client is generated during installation; it is not committed. Models cover `Email`, `SteamAccount` and `RentalOrder`.

```text
app/page.tsx                     Dashboard
app/login/page.tsx               Administrator login UI
app/rent/[id]/page.tsx           Rental-page prototype
app/api/emails/                  Registry, IMAP fetch and SMTP send routes
app/api/steam-accounts/          Inventory routes
app/api/rentals/                 Rental and expiration-cleanup routes
prisma/schema.prisma            Current relational model
prisma/migrations/               Historical, incomplete migrations
proxy.ts                        Demonstration page-login gate
.env.example                    Non-secret configuration placeholders
VALIDATION.md                   Checks actually performed for publication
SECURITY.md                     Known deployment blockers
```

## Local Setup

Use a local test environment and a disposable PostgreSQL database. Never point setup commands at an existing database containing important records. No database export or mailbox content is included.

```bash
npm ci
```

Copy `.env.example` to `.env` **only if `.env` does not already exist**, then replace its placeholders locally. Never commit the populated file. `DATABASE_URL` must point to an isolated test database. A typical example has the form:

```dotenv
DATABASE_URL="postgresql://example:replace_me@127.0.0.1:5432/email_project_demo?schema=public"
```

Generate the client and initialize only that disposable database:

```bash
npx prisma generate
npx prisma db push
```

The committed historical migrations do not create the complete current schema (including rental records and all relationships). They are retained for provenance. Do not assume `prisma migrate deploy` alone provisions this prototype correctly. No migration was run against the author's database during publication preparation.

Set a local `ADMIN_PASSWORD`. IMAP/SMTP fields may remain empty for source review, but mail functions require a dedicated test mailbox you own. `IMAP_USER` / `IMAP_PASS` are also used by SMTP in the current implementation. An application password may be required by your provider. SMTP configuration assumes TLS; arbitrary provider configurations are not validated.

```bash
npm run dev
```

Open http://127.0.0.1:3000/login. Development and start scripts bind to loopback. If you have not configured PostgreSQL, registry/inventory/rental actions will fail; there is no offline demo database or mock mode.

Checks and production commands:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

`next/font/google` can require network access during a cold build. A successful build does not make public deployment safe. See the recorded results in [VALIDATION.md](VALIDATION.md).

## Current Status

Final TypeScript, ESLint and production-build checks passed; four isolated startup/negative-path HTTP checks passed. There is no unit/E2E suite, and real mail/database operations were not tested. The final official dependency audit still reports 4 high and 16 moderate entries; this is not a security-clean release.

The source has been inspected and small compilation/runtime fixes were made for publication: missing dependency declarations/types, an empty account route, optional IMAP results, connection cleanup, React initialization and a missing-password login edge case. No large redesign or complete security implementation was attempted.

There is **no automated unit or end-to-end test suite** and no `npm test` script. `test-imap.mjs` is a manual integration script that connects to a mailbox and prints message details; it was not run against the author's real credentials. It is not a privacy-safe automated test.

The repository includes only source, schema/migrations and placeholder configuration, not real emails, customer records, database dumps, model weights or local agent settings. Build/type/lint results and unverified functionality are documented separately, without inventing success claims.

## Limitations

- The page gate trusts the presence of a cookie; it is forgeable. API routes are excluded from that gate and have no equivalent authorization. HTTP-only cookies alone do not solve this.
- Account passwords are stored in plaintext and returned by inventory/rental APIs. Rental pages can disclose them without adequate ownership checks. Use fake accounts only.
- Customer names/contact fields lack an appropriate privacy and retention design. No real records are included in this repository.
- Rental creation and inventory changes are not atomic; concurrent requests may double-book an account. No payment or deposit settlement exists.
- A cleanup GET request changes records. There is no background scheduler, reliable job execution, CSRF protection or audit trail.
- Input validation, error recovery, rate limits, session expiry/revocation and configuration validation are incomplete.
- IMAP code extraction uses a generic digit regex; numbers are not reliably verified as authentication codes. The fetched list is not shown in the dashboard.
- The historical migrations are incomplete, and real PostgreSQL/SMTP/IMAP workflows were not validated during this preparation.

## Future Improvements

These are plans, **not implemented features**:

1. Replace the login gate with secure sessions and server-side authorization on every sensitive route.
2. Redesign account-secret handling and customer access before storing anything valuable.
3. Add disposable database/mail fixtures and meaningful unit/integration/end-to-end tests.
4. Complete migrations, use transactions for rental changes and add server-side input validation.
5. Display fetched messages safely, complete navigation and build an explicit mail composer if needed.
6. Review dependency advisories, accessibility, logging and deployment controls before any public service deployment.

The author should personally confirm all descriptions and application claims. The project is suitable for review as a transparent learning prototype, not as evidence of an already secure or commercially mature system.
