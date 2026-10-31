# VVJOB release browser review

Use Node20+, Google Chrome and an external `playwright-core` installation (tested1.56.1). `VVJOB_PLAYWRIGHT` can point to its absolute module directory; `VVJOB_CHROME` overrides the browser executable. This keeps browser dependencies out of the production plugin.

`delivery-audit.cjs` checks guest, member or admin routes at1440/768/390/320px. Supply `VVJOB_QA_BASE`, `VVJOB_QA_ROLE`, `VVJOB_QA_USER`, `VVJOB_QA_PASSWORD`, and optional `VVJOB_QA_OUTPUT`. Production guest auditing is read-only; authenticated audit and mutation flows refuse non-loopback hosts.

`delivery-flows.cjs` runs real registration/logout, publishing/category/tags, inline root/child replies, reactions/bookmarks, following, Ajaxify directory searches, career, private proof approval/withdrawal, chat, notification and moderation workflows. Use only an isolated current database clone with jobs and outbound mail disabled. Supply QA administrator/member accounts through `VVJOB_QA_ADMIN`, `VVJOB_QA_MEMBER`, and `VVJOB_QA_PASSWORD`. `VVJOB_QA_ONLY` filters by test-name substring for a focused rerun. Material submission is quota limited; do not weaken production limits for tests. Test documents explicitly say they are not real documents.

`privacy-flows.cjs` checks guest bodyless username existence, private profile API denial and login return paths. It expects the isolated review account `vvjob-member-20261031`; use environment credentials. `local-tls-proxy.cjs` provides loopback TLS/Socket.IO forwarding for native forms with a temporary certificate outside the repository. See the file's environment variables. Never commit private certificates, passwords, cloned database/configuration, screenshots of administrative data or runtime artifacts.

Results and screenshots are written under ignored `artifacts/`. A layout check alone does not prove submission, mail delivery, physical phone keyboard behavior or every possible privilege combination. See docs/DELIVERY_REVIEW_20261031.md for the performed release review and limits.
