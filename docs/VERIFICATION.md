# VVJOB 0.9 — voluntary workplace verification

## Product model

The [Maimai certification agreement](https://maimai.cn/static/html/certification_protocol.html) describes a separate application with several evidence methods, review, badges and periodic reassessment. VVJOB uses a method-choice center at `/vvjob/verification`, accessible from the member's profile and career page, without adding registration steps or blocking native posting/replies.

This release implements **work-email access verification**, not government-ID verification or proof of a job title/current employment. The member selects and saves a company, explicitly consents to an email challenge, receives a six-digit code and enters it. The resulting label is `Đã xác minh email công ty`; the job title remains self-reported. The badge is only public if the member opts into a public career profile. The mailbox itself is never public, and does not replace the account's login/recovery email.

The second method card (employment certificate/contract) is clearly unavailable. There is no evidence upload endpoint and members are asked not to send documents through posts/messages. WeChat, DingTalk, Chinese tax-app and recruiting-authorization entries from the reference are not represented as functional Vietnamese integrations. No invented certified-colleague counts, points or recruiting privileges are shown. Private evidence storage/review/deletion must be implemented before enabling document review.

## Preconditions and operator flow

Production is **closed by default**: no code can be requested without explicit service enablement, confirmed delivery for the current SMTP settings and an approved company-domain rule. No starter company website automatically becomes a verified email domain.

1. Configure SMTP and sender through protected NodeBB server/ACP settings; never put credentials in Git. Production transport must use TLS. `NONE` is accepted only in the jobs-disabled loopback-URL preview for a local capture server.
2. Actually test inbox delivery. In `/vvjob/verification-admin`, confirm the delivery checkbox and enable the service. A fingerprint binds this confirmation to the current sender/SMTP configuration; changing it closes sending until reconfirmed. This checkbox records an operator's test, it does not itself test delivery.
3. Independently check the exact employer email domain, its company ID and reference URL. Save the rule with an explicit ownership-check acknowledgement and note. Personal providers/shared default domains are rejected. Subdomains are not implicitly allowed. Domain-rule revision changes invalidate earlier proofs issued under that rule.
4. Only an administrator can configure domains/service or revoke another account's proof. Both page and mutation routes enforce role checks, and mutations use native CSRF/auth/banned-account middleware. Members can withdraw their own challenge/proof.

The current production SMTP/sender has not been configured or validated. Shipping a disabled center/admin flow does not mean production inbox delivery or employee certification is already available. Do not auto-enable the service, approve unverified domains or grant real users badges to make the UI appear complete.

## State and security

- States: unverified, sending, pending, verified, expired, locked, failed and derived invalidated. Server-derived state controls badges, not browser-supplied flags.
- OTP: cryptographic random six digits, 10-minute validity, at most five incorrect entries, one-time challenge bound to member/company/binding/email hash. Resends replace prior challenges, wait 60 seconds and are limited to five per member/mailbox per UTC day and twenty per hashed IP per hour.
- Codes are HMAC digests under the existing private NodeBB secret, never plaintext in database, HTML, JSON responses or audit logs. Full corporate addresses are used only in memory to send mail; persisted state contains an HMAC address hash and an owner-only masked display. Shared mailbox names such as info/admin/hr/support are rejected.
- A separate claim prevents a verified normalized email address from certifying two member accounts at the same time. This is mailbox uniqueness, not a guarantee of unique humans or mailbox aliases. Withdraw/revoke frees the claim.
- Successful SMTP submission activates a pending code. Transport failure clears its digest and returns a generic message without SMTP credentials or recipient details. SMTP acceptance still is not a delivery receipt; actual delivery is an operator prerequisite.
- Proof validity is 180 days maximum. Changing company away and back changes a server-generated binding and cannot revive the old proof. Hidden/merged companies, revoked/reassigned domain policies, expired proofs or a rotated NodeBB secret also invalidate the visible badge.
- Public career serialization is a whitelist. It excludes company-binding/internal reminder fields, OTP/hash/email details and unsupported legacy industry data. Native account fields and account email stay separate.
- Account deletion serializes proof removal, mailbox-claim release and a 190-day deletion guard against in-flight sends/confirmations. Existing core career/account deletion remains native.

## Storage and supported runtime

Uses separate `vvjob:verification:*` objects/indexes and an additive `companyBinding` field on career records when they are explicitly saved. No automatic user/company migration occurs. State retention is one day for pending attempts and at most 190 days for verified records/claims/deletion guards; proofs stop being valid after 180 days. Audit records retain minimal UID/action/company/time data for 365 days and never contain full email/OTP. Administrators see only the most recent 50 events; domain listing is capped at 1000 rules. Index lifecycle/archival should be maintained before substantially larger scale.

This security-sensitive flow is supported on the inspected **PostgreSQL / NodeBB 4.6.1** deployment. A dedicated one-connection PostgreSQL pool holds a transaction-scoped advisory lock across all verification mutations. It avoids consuming NodeBB pool connections while lock waiters block its holder. The same lock works across NodeBB processes; there is no in-memory-only production lock fallback. Native object operations each commit normally; the advisory transaction serializes them, it is not a single multi-object transaction. Partial crashes can consume a quota or leave a same-member mailbox claim to retry/withdraw/expire, but do not make an invalid code confer a badge. Unsupported database engines keep the feature closed.

## Validation and deployment

Run `npm test && npm run build`, full native build and isolated PostgreSQL/config/uploads checks. Use a local SMTP capture, jobs disabled and synthetic users/domains, with no mail routed to real employers. Exercise request/confirm/withdraw/revoke, replay, wrong codes, expiry, cross-account claims, privacy, domain revisions, company switches, permission/CSRF denial, account deletion and concurrent confirmations. Include actual SMTP template delivery to the capture and an independent process test of the advisory lock. Production delivery remains unverified until an approved sender is configured and a real inbox test succeeds.

Build into fresh plugin/assets mounts, back up private Compose/database and preserve prior mounts. Do not enable service or seed real domain rules during a UI rollout. Roll back mounts only; leave additive objects inert rather than restoring an old whole database over new posts. Keep verification closed if checks fail.
