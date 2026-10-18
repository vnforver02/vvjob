# VVJOB v0.6 community and onboarding polish

## Changes

The concurrent approved brand document is preserved. The homepage hero, header caption and feed title use **Real Work. Real Talk.**; the hero includes **Chuyện thật nơi công sở.**. Real is positioning, not a verification guarantee; guidance still distinguishes firsthand experience from verified information and does not claim anonymous identity protection.

- 146 reviewed Vietnamese strings across 12 namespaces: login, registration, email/password reset, composer, reporting, notifications and common labels. Overrides live in the VVJOB plugin's `languages/vi`; other language preferences retain native translations. Interpolation placeholders and the live registration username hint hook are checked in tests. Core language files are untouched.
- Four differentiated community descriptions, icons and colors; stable category IDs/names remain 5–8. The manifest lives in `extensions/nodebb-plugin-vvjob/content/communities.json`.
- New public `/vvjob/guide` route describes category choices, writing guidance, privacy, reporting and account access. Navigation remains permission-aware and excludes NodeBB's synthetic uncategorized/federation bucket. Links are available from the feed and composer.
- Branded registration completion page, with native email/consent extension sections, actions and CSRF token preserved. Native consent policy is not replaced.
- Report dialog now uses natural Vietnamese for the target type, larger radio-label hit areas and a named accessible dialog/close button. Native report permissions and submit handlers remain intact.
- A guarded content script updates categories using NodeBB's update API and replaces only the unedited default welcome topic using native post editing. It refuses unexpected category identities and skips a welcome post that has already been edited. It never deletes user posts.

## Content update

Run `scripts/community-content.js` from a configured NodeBB host (with the VVJOB plugin installed). `NODEBB_ROOT` selects the host checkout and `NODEBB_CONFIG` selects its config. Without `--apply` it prints a plan only. Applying requires `--apply --backup /absolute/private/file.json`; the preimage is written with exclusive creation and mode 0600 before any mutation. Back up the database separately first. Do not run this script from the extension-only repository without a NodeBB host.

Production content backup: `/home/ucloud/vvjob-backups/20261018-quality/content/content-before.json`. A full PostgreSQL custom-format backup is kept alongside it as `nodebb-before.dump`.

## Acceptance checks

- Twelve local tests pass, including translation placeholder contracts, native template hooks, permission-aware navigation and live-reply deduplication. Plugin Sass/templates and full NodeBB asset compilation pass.
- Public browser matrix covers feed, guide, categories/category, welcome topic, login, registration, reset, invalid confirmation and invalid reset links at 1440/390/320px (30 checks), without document overflow or uncaught page errors.
- Isolated clone: native registration and email/consent completion creates a real test account; a locally captured verification link confirms its email. Native logout, password-reset request, the captured reset link and login with the new password are verified. A successful native password change redirects to `/login`.
- New member publishes through the native composer. A different regular test member reports it through the mobile dialog. The normal report response deliberately does not disclose the report object to ordinary members. An administrator finds the report in `/flags`, assigns it, resolves it and verifies the persisted state. All of these operations remain in the clone.
- Multi-image content, long prose, quotes, a wide table, code and a long URL fit 1440/768/390/320px. A 390×450 reduced viewport keeps the mobile editor and submit button reachable. This simulates reduced space; it is not a physical-device keyboard/IME test.
- Preview mail goes only to a disposable local SMTP capture service, which rejects recipients outside `@example.invalid`; there is no external mail relay. Preview jobs are disabled.

## Remaining external configuration

The live site has no configured SMTP transport/host/credentials. Clone checks verify the application's email flow, not delivery from the production domain to real inboxes. Production email confirmation and recovery delivery cannot be declared ready until a sender/SMTP service is configured and delivery checked. Do not disable confirmation or mark real users' email verified to work around missing SMTP. SMTP secrets belong only in protected server configuration, never Git.

## Deployment and rollback

The runtime Compose path remains `/home/ucloud/vvjob-v1-runtime/compose.json`. New plugin/build mount targets are `/home/ucloud/vvjob-quality-source/extensions/nodebb-plugin-vvjob` and `/home/ucloud/vvjob-quality-build`. Production config, uploads and database identity stay unchanged. The previous UI Compose is backed up to `/home/ucloud/vvjob-backups/20261018-quality/compose-before-quality.json`.

For visual rollback restore the backed-up Compose and run `docker compose -f /home/ucloud/vvjob-v1-runtime/compose.json up -d web`. Content edits are separate: use the protected JSON preimage to restore only the changed category fields and welcome title/content through native category update/post edit methods. Do not restore a full old database over new user writes just to revert copy or UI.
