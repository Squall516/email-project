# Safe review demonstration

## 60-second outline

- 0–10 s: introduce a local Next.js/TypeScript/Prisma learning prototype, not a production email service.
- 10–20 s: show the real login screenshot and explain its limited authentication design.
- 20–40 s: walk through dashboard and API source: address registry, inventory and rental routes. Clearly label these as source walkthroughs until an isolated database run is verified.
- 40–50 s: show the successful type/lint/build checks and four HTTP checks in the validation record.
- 50–60 s: disclose API authorization, plaintext secret storage, incomplete migrations and absent integration tests; explain the next priorities.

## Screenshot provenance

`login-review.png` was captured from the actual production build at a loopback address on 3 November 2026. Environment settings overrode every existing database/mail/admin value with placeholders or empty values. No mailbox/database operation or successful login is represented. The screenshot has not been populated with invented data or altered UI.

## Safe future full demonstration (not yet validated)

Use the README setup in a separate disposable database. Use names such as “Demo User A”, addresses under `example.invalid`, and deliberately fake account secrets. Do not reuse existing databases, real mailbox history or personal contact fields. Use `prisma db push` only on that disposable database because the historical migrations are incomplete. Confirm displayed records are synthetic before recording.

Only a dedicated test mailbox should be used for IMAP/SMTP verification; sending messages requires the author's chosen recipient and permission. The dashboard does not display fetched mail and has no compose UI, so do not present an inbox/compose demo as implemented. Do not expose the service to the internet. Do not run `test-imap.mjs` with real mailbox credentials during a recorded demonstration: it prints message content.
