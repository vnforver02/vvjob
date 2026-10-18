# Feed conversations, rankings and mobile navigation

The feed and ranked discussions expand comments inline. The read endpoint `/api/vvjob/topics/:tid/comments` checks native topic/category permissions, disabled/deleted/scheduled visibility, uses native parsing/block filtering, omits deleted comments and projects only public author fields. Pages scan five native reply positions; hidden replies can make a page shorter. Read responses are private/no-store.

Posting uses the native `POST /api/v3/topics/:tid` API and CSRF, including native anti-spam, category permissions, locked topics, targeted `toPid` replies and moderation queue. The UI preserves a failed draft, prevents double submission, deduplicates loaded comments and distinguishes queued from published replies. Six emoji shortcuts insert Unicode into the comment; they do not create reaction counters. “Chi tiết” retains access to the full post and native report/moderation actions.

Mobile navigation now opens the native `/chats` route and uses native `chat/count` unread updates. Notifications remain in the header. Topic navigation is hidden for single-post topics and becomes a compact index pill for longer discussions; native jump, paging and scroll controls remain intact.

`/vvjob?sort=popular` renders a ranked discussion board with 24-hour, 7-day, 30-day and all-time filters plus readable community filters. The default is seven days. Native NodeBB `posts` sorting ranks activity in that period (subject to its candidate limits); all-time uses total post count. Visible comment/view totals are lifetime totals. Pagination preserves filters and native ranking indices. No paid ranks, invented scores or fake trend arrows are generated.

# Demonstration members

The user explicitly authorized 500 fictional demonstration members in production. `scripts/seed-demo-users.js --apply` creates exactly 500 identities, 250 men/250 women, with 250 simulated verification states and 250 unverified states. Without `--apply` it only reports the existing batch.

Names, professional information and original SVG illustration avatars are synthetic. People cards and profiles explicitly say “Hồ sơ minh họa”; simulated verification is separately labelled “Xác minh mô phỏng”. Every avatar includes a DEMO label. These are not portraits or employment claims about real people. Native usernames also carry a Demo suffix. No posts, followers, messages, activity counts, passwords, emails or real verification records are fabricated. Accounts have no login credential and digest is disabled.

The batch map `vvjob:demo:batch:vvjob-demo-20261019` makes repeat execution idempotent. It refuses username/map collisions, uses native account creation, records dedicated `vvjob:demo:user:<uid>` metadata and never writes evidence/email verification status. Back up before applying. To remove the batch, inspect its mapped UIDs and confirm the matching demo marker before using native user deletion; do not delete arbitrary username matches or restore the entire database.

Real verification icons come from the existing evidence/email services, including validity, expiry and company binding, and respect career visibility. Demo markers cannot confer real verification.

Run inside the deployed NodeBB image with `NODEBB_CONFIG=/opt/config/config.json`, mounting the repository at `/opt/vvjob-source:ro`:

```sh
node /opt/vvjob-source/scripts/seed-demo-users.js           # inspect only
node /opt/vvjob-source/scripts/seed-demo-users.js --apply   # explicit operation
```

## Validation and production rollout — 2026-10-19

Release `806e3762ade7d3d65c8b11fa2288488f6fb80756` is deployed at https://bbs.cloudverify.vn/ on NodeBB 4.6.1 / Harmony 2.1.21. This changes only the VVJOB plugin, its compiled assets and the explicitly authorized demo batch; no NodeBB core files were edited.

- All 62 repository tests pass; all five Sass entry points and 49 templates compile. The native NodeBB production build completed in 20.371 seconds.
- Isolated browser checks passed at widths 1440, 390 and 320: inline replies, targeted replies, emoji insertion, pagination, duplicate prevention, failed-draft retention, locked topics, period/community ranking filters and compact topic navigation. Native chat creation, delivery and unread counts were exercised between test accounts. The chat composer remains above the mobile navigation.
- Demo cards and profiles were visually checked for explicit illustration/simulation labels, distinct simulated verification badges, avatar rendering and mobile layout. A second isolated seed run created zero users and found the same 500 existing users.
- The production import created exactly 500 demo users, including 250 simulated verification states and 250 unverified states. The importer checked unique mapped UIDs and absence of passwords, emails and real verification records. Incoming chats and digests are disabled for these accounts.
- After deployment and the final import/restart, production browser smoke checks passed for inline guest comments, ranked discussions and period APIs, 1440/390/320 layouts, single-post navigation, native chat login gating, guest profile/API restrictions and demo avatar endpoints. No JavaScript page errors were observed. Write interactions were tested in the isolated environment; the production smoke was read-only.

Current server paths:

- Plugin source: `/home/ucloud/vvjob-interactions-release/extensions/nodebb-plugin-vvjob` (read-only container mount).
- Compiled assets: `/home/ucloud/vvjob-interactions-build`.
- Compose/config: `/home/ucloud/vvjob-v1-runtime/compose.json` and `config/config.json` (private; never commit their contents).
- Protected rollback backup: `/home/ucloud/vvjob-backups/20261019-interactions`, containing the preceding Compose/config and a PostgreSQL custom-format dump verified with `pg_restore --list`.

Only `vvjob-v1-web-1` was recreated/restarted. Other services, the production database container, TLS/proxy settings and existing content were retained. The isolated preview container, cloned test database and private temporary configuration/dump were removed after acceptance.

For UI rollback, restore the preceding Compose file from that backup and recreate only the VVJOB `web` service. Its previous plugin/assets remain at `/home/ucloud/vvjob-network-source` and `/home/ucloud/vvjob-network-build`. Keep the current production database and guest privacy settings; restoring the whole database would discard subsequent legitimate writes. Demo removal is a separate explicit operation using the batch-map checks above. Keep backups and the previous assets until release acceptance.
