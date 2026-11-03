# Security status

This source repository is public for code review. The application is not safe for internet exposure or real customer/account data.

Known blockers include a forgeable login cookie, unauthenticated API routes, plaintext account-password storage/disclosure, incomplete input validation, no customer authorization, and non-transactional rental updates. The local-only bind is a precaution, not a substitute for fixing these issues. Do not reverse-proxy this application into a public service.

## Secrets and publication

The author's local `.env` contains configured mailbox/admin credentials and a database connection string. It remains ignored and was not uploaded. Those values were not printed in the preparation report. A scan compared configured values against selected source and existing Git history; see VALIDATION.md for scope.

If any credential has been exposed elsewhere, revoke or rotate the mailbox app password, database password and administrator password with their respective providers. Do not paste replacements into an issue, README or commit. Deleting a leaked file from the latest tree does not remove it from Git history; rotate exposed credentials first.

`.env.example` uses placeholders and empty passwords. Logs, `.next`, dependencies, personal agent folders, mailbox exports and database dumps are excluded. Historical migration SQL contains schema definitions only. New datasets must be inspected before inclusion.

No claim is made that static scans find every secret or vulnerability. Do not publish a vulnerability report containing real credentials or personal emails.

The latest final-review official npm audit reported 8 high and 16 moderate dependency-tree entries (0 critical). Earlier publication checks reported 4 high and 16 moderate; the historical results are retained. They remain unresolved; see VALIDATION.md. Do not interpret a successful build as evidence that these issues are fixed.
