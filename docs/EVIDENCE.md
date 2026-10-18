# VVJOB 0.10 — private work-document review

The second method is `Giấy tờ chứng minh công việc`: employment certificate, employment contract, or BHXH/VssID participation record. A member saves their company, selects a type and document date, redacts unrelated personal data, attests ownership and consents to private manual review. No recruitment or CV submission module is introduced. Email verification remains independent and closed until its existing delivery prerequisites are met.

## Scope and privacy

- This is manual document comparison, not government identity verification or an official BHXH/VssID integration. An uploaded screenshot is not authenticated by the government. The badge says `Đã đối chiếu giấy tờ công tác`, explicitly does not attest current employment or job title. No automatic OCR/AI approval.
- Members can submit 1–2 JPEG/PNG images, maximum 4 MiB each. PDFs, SVG, animated and malformed images are rejected. Sharp validates/decodes at most 16 million pixels, auto-orients and re-encodes to JPEG <=2 MiB/image without original EXIF metadata. Four concurrent in-memory upload slots bound per-process intake.
- The dedicated multipart route authenticates and validates native CSRF **before** memory-only multipart parsing. It bypasses the native API helper's unbounded temporary disk uploader for this route only. No file is written to NodeBB public uploads or a public URL.
- Processed images use AES-256-GCM with random IV and file-ID associated data; the key derives from the existing private NodeBB secret with a separate purpose prefix. Ciphertext is stored under private `vvjob:evidence:file:*` database objects with 7-day expiry. Full documents are not in profile JSON, logs or templates. Do not rotate the NodeBB secret casually; pending documents then become unreadable and prior proofs invalid.
- Production uploads and image reads require HTTPS. The intake form is hidden on insecure connections; only a jobs-disabled loopback preview may use HTTP.
- Only native administrators may read decrypted images or review/revoke another user's application. Every view is audited. Image responses are authenticated, no-store, nosniff and have a restrictive CSP. No owner/public download API. Administrators must not retain or redistribute copies; browser screenshots cannot be technically prevented.
- Members must redact ID numbers, home addresses, salary, social-insurance numbers, QR codes and unrelated third-party details, keeping name/company/dates legible. Never request VssID credentials, OTP, full account exports or messaging-based submissions.

## Review, retention and integrity

Member page `/vvjob/evidence`; administrator queue `/vvjob/evidence-admin`, linked from verification management. Statuses: pending, needs-more, approved, rejected, expired/invalidated and none after withdrawal. Members revisit the page for results; there is no promised automatic notification or review SLA.

Administrators inspect the member profile and private images, select a decision and confirm comparison. Approval requires the same administrator to have opened every current image; missing or expired originals cannot be approved. Self-review is forbidden; application IDs prevent stale decisions. Needs-more/rejection uses predefined safe reasons. Every decision deletes original image objects before updating the status. A failed deletion cannot confer a badge. Needs-more allows a fresh submission. Withdrawal/revocation/account deletion deletes current images/proof and removes the queue entry; account deletion installs a guard against an in-flight submission. Changes serialize with the existing PostgreSQL advisory lock across processes.

Images are inaccessible after seven days even if unreviewed. Database expiry removes ciphertext; pending queue entries are pruned during queue reads. Proof metadata expires within 190 days, approvals are valid at most 180 days and are bound to the saved company/binding and secret version. Changing company away and back cannot revive the proof. Only public career profiles expose the boolean document label; no type, document date, file ID, reviewer or reason is published. Pending resubmission replaces an earlier document proof; email proof is independent. Three submit reservations per UTC day/member survive withdrawals and failures. Audit records (UID/actor/action/time only) expire after 365 days; sorted-set indexes require eventual housekeeping at larger scale.

Native object writes are serialized, not a single multi-object transaction. A crash can leave an orphan encrypted image with its seven-day TTL or a consumed quota. There is no invalid-code or client-supplied approval path. Database/config backup operators can recover historical encrypted material using the secret; backup retention must also follow the service's private-data retention policy. Current image deletion is not a claim of retroactive deletion from existing backups.

## Build, verify, deploy

Run `npm test && npm run build`, then a complete NodeBB 4.6.1 build with the plugin mounted: `node nodebb --config /opt/config/config.json build` (webpack enabled by default). Do not substitute `node app.js --build`, which omits the final webpack bundle on this runtime. Validate on a cloned PostgreSQL/config/uploads runtime: real multipart upload with Sharp, authentication/CSRF before parsing, MIME spoofing/SVG/oversize denial, per-account isolation, admin-only image access, no-store headers, all review decisions, expired/stale requests, withdrawal, public profile privacy and responsive desktop/mobile pages. No real user documents should be used for QA.

Deploy from dev using fresh plugin/build mounts; back up the private Compose file and PostgreSQL dump first. Do not copy preview accounts or database to production. Rollback to previous mounts; retain additive objects inert with their TTLs rather than overwriting new posts with an old whole-database restore. This feature uses existing PostgreSQL and native Sharp/multer dependencies; unsupported runtimes stay unavailable. No NodeBB core edits or new public storage mounts.

## Validation record — 2026-10-18

- 44/44 repository tests passed; Sass and 44 templates compiled.
- Full native `node nodebb --config /opt/config/config.json build` passed, including webpack (20.403 seconds).
- Cloned PostgreSQL/config/uploads, synthetic documents only: real multipart upload and Sharp re-encoding passed; SVG disguised as PNG, guest upload and missing-CSRF upload were denied.
- Image access was allowed for an administrator only, with JPEG content and no-store headers; owner, other member and guest were denied.
- Needs-more → resubmission → approval → revocation passed through native browser forms. All original image URLs returned 404 after a decision; public profiles exposed only the document-proof boolean and label, not application details.
- Member form and approved states checked at 1440/390/320 pixels with no horizontal overflow and no browser JavaScript errors in the completed flow.

- Two-image native upload passed after accounting for the closing multipart boundary; approval was denied until the reviewer opened both images. Rejection and owner withdrawal deleted both originals.
- [GitHub validation](https://github.com/vnforver02/vvjob/actions/runs/39129957112) passed for code commit `0078314` on `dev`.

## Approved production rollout — 2026-10-18

The user explicitly approved opening work-document intake. Production is now canonical **https://bbs.cloudverify.vn**, with a matching trusted certificate, HTTP → HTTPS redirects and Secure session cookies. The ACME HTTP challenge prefix is served separately so certificate renewal remains possible. No client should send private documents through HTTP or bypass certificate validation.

Final mounts: `/home/ucloud/vvjob-binding-source` and `/home/ucloud/vvjob-evidence-final-build`. The previous `/home/ucloud/vvjob-verify-source` and `/home/ucloud/vvjob-verify-build` remain for plugin rollback; retain HTTPS when rolling back. Private Compose, verified PostgreSQL dump, previous Nginx vhost and pre-HTTPS NodeBB config are backed up under `/home/ucloud/vvjob-backups/20261018-evidence`, root-only. No other domain's vhost or service was changed. Existing Nginx body limit is 50 MiB, sufficient for the bounded request.

Certificate issuance used the installed aaPanel ACME client for this domain only. Certificates/private key remain server-side under `/www/server/panel/vhost/cert/bbs.cloudverify.vn`; no keys are in Git. The scoped renewal implementation is [renew-vvjob-tls.py](../scripts/renew-vvjob-tls.py), installed root-only as `/usr/local/sbin/vvjob-renew-tls.py`. `/etc/cron.d/vvjob-tls-renew` checks daily at 11:17 Asia/Ho_Chi_Minh (04:17 UTC server time), renews only when <=30 days remain, validates the hostname and Nginx config, and reloads Nginx. The initial check passed without issuing another certificate; actual future renewal depends on DNS/port 80/aaPanel ACME availability. Root-private renewal log: `/var/log/vvjob-tls-renew.log`.

Post-deploy checks passed for trusted HTTPS, HTTP redirects, Secure cookies, homepage layouts at 1440/1024/768/430/390/320 pixels, guest login protection and denial of private image access. Email-code sending remains disabled. Document intake works independently of SMTP. No QA accounts or files were copied into production; cloned test DB/config/uploads and temporary preview/build-installer containers were removed. Existing unrelated containers remain unchanged.

Final HTTPS hardening validation: 44/44 tests and 44 templates passed; the fresh secure asset build completed in 19.322 seconds. [GitHub checks](https://github.com/vnforver02/vvjob/actions/runs/39130473132) passed for code commit `31317be`. Trusted HTTPS and HTTP redirects were checked externally without disabling certificate validation, Secure session cookies were verified, and the HTTPS browser smoke passed at all six widths without JavaScript errors. TLS/private-key material and aaPanel configuration were never committed.

Career-editor/save copy now remains neutral about proof status; it no longer falsely says an already verified member is unverified. The profile and verification center continue to derive actual flags server-side.

The final career-copy commit `d5d41e0` also passed [GitHub validation](https://github.com/vnforver02/vvjob/actions/runs/39130888916). Final deployment continues to use HTTPS and the same private review flow; no proof data migration occurred.

## Legacy saved-company compatibility fix

Profiles saved before 0.9 may have a valid approved company but no internal `companyBinding`. The intake page recognized the company, while submission rejected it as unsaved. Document and email request flows now lazily create a fresh private binding under their existing shared PostgreSQL lock. They preserve all saved profile fields and privacy settings, never choose an absent/unapproved company, and do not grant a proof. Read-only profile/status requests do not write data. Company changes still invalidate prior proofs.

47 repository tests and the 44-template build passed. An isolated clone using native PostgreSQL/Sharp reproduced a legacy profile without a binding: submission succeeded, field/privacy values were preserved, no badge appeared before explicit administrator review, and changing company invalidated the proof. [GitHub checks](https://github.com/vnforver02/vvjob/actions/runs/39131646492) passed for `d8756dc`. No front-end assets changed; production keeps the previously validated final asset mount. Private Compose and verified DB backups are in `/home/ucloud/vvjob-backups/20261018-legacy-binding`. Repair occurs only when the member retries a verification request; no bulk user migration or automatic certification is performed.

Post-fix production checks: HTTPS homepage returned 200, unauthenticated evidence entry retained its login redirect (302), and the running container resolved the new shared legacy-context helper. The isolated compatibility database/config and test script were removed. Production careers are not bulk-written by deployment; missing bindings are repaired only on an authenticated member's next request.
