# Feed, circles and labelled demo conversations — 2026-10-19

The user's latest direction replaces the previous inline-comment expansion with native thread navigation. Main feed cards use a compact Threads-inspired white stream, heart/comment/share icons and counts, retaining VVJOB's own branding. Clicking the heart immediately selects/removes a reaction; hover/long press still exposes the existing emotion choices as icons. Visible emotion instructions and the secondary native reputation score are removed. Accessible names and error feedback remain. Reputation data are retained and not rewritten.

At mobile widths the persistent discovery search form is removed, with a compact search icon linking to native search. Desktop search remains. The top navigation adds Đồng nghiệp (coworkers) and Vòng kết nối (network feed), distinct from the bottom Kết nối people-discovery page. Comment links use native Ajaxify navigation, preserve modified-click/new-tab links and normal browser Back, and position the native thread near replies without a full document reload. Native registration/login, composer, replies, reactions, reports and moderation remain in NodeBB.

Coworkers requires login and a saved company and only matches other authors whose company is explicitly public. This is a match of declared public profiles, not a proof that all participants are verified employees or a private company-only space. Network uses actual native followed-user IDs and their native-readable posts; there are no invented follows. Both use a bounded 500-recent-topic native visibility/block-filtered window and display up to 30 matching posts. Empty/guest/no-company states are truthful; this is not a complete company archive. Company/employee verification and anonymity are not newly granted.

The native `filter:topic.getPosts` hook adds the same identity projection already used by the feed. Real valid employment verification uses a blue circular check; demo identities remain labelled Minh họa with a distinct simulated-verification icon. The demo badge never reads or writes as a real evidence/email certificate. Private career details remain member-only and opt-in.

## Demo content and operator tool

`scripts/seed-demo-posts.js` is a manual, preview-first operator command. It asserts an explicit config/database, requires `--apply --allow-production` for the production `nodebb` database, and only posts through 72 pre-existing credential-free accounts from the original 500-user demo batch. It creates 24 distinct Vietnamese workplace discussions and 48 explicitly labelled illustrative replies, with 12 simulated-verified and 12 unverified topic authors. Titles include `[Minh họa]`, bodies explain that the content is simulated, and replies are marked too. No real employer experiences, salaries, credentials, certificates, follows or engagement votes are fabricated.

It uses native topic/reply creation and original public categories, leaving real account posting policy untouched. `fromQueue` is an internal operator-only flag for this bounded import, not a public endpoint. Native follower/category/tag notifications are suppressed only inside this one-off process; the live forum configuration/core files are unchanged. Jobs are disabled for the importer, no plugin federation hooks are initialized, and demo members receive no credentials. Stable batch mappings and deterministic author/title/reply checks allow retries without duplicate completed records; changed/deleted existing demo topics cause a stop instead of overwrite. Interrupted partial native writes require operator inspection rather than restoring the full production database.

Inside the pinned NodeBB container, mount the script read-only and run:

```sh
node /opt/seed-demo-posts.js --config=/opt/config/config.json --expected-database=vvjob_threads_preview
node /opt/seed-demo-posts.js --config=/opt/config/config.json --expected-database=vvjob_threads_preview --apply
# Only after verified backup and acceptance:
node /opt/seed-demo-posts.js --config=/opt/config/config.json --expected-database=nodebb --apply --allow-production
```

## Rollout

Use an isolated database/config/build with outgoing delivery/jobs disabled and production uploads read-only. Build and test before switching only VVJOB web's plugin/build mounts. This release uses `/home/ucloud/vvjob-threads-release` and `/home/ucloud/vvjob-threads-build`. Protected pre-update Compose/config/verified PostgreSQL dump: `/home/ucloud/vvjob-backups/20261019-threads`, directory 0700/files 0600.

Previous `/home/ucloud/vvjob-companycatalog-release` and `/home/ucloud/vvjob-companycatalog-build` remain for code rollback. Restore those mounts from the protected Compose snapshot and recreate only web. Do not restore the full database over newer real posts, careers, accounts or reactions. Demo topics can be moderated/hid individually using their batch map `vvjob:demo:posts:vvjob-demo-conversations-20261019`; never bulk-delete real posts or the 500 demo accounts for a UI rollback. Remove preview container/database/private config after acceptance, retain backups and active/rollback builds.

## Validation before release

89 automated tests pass, including coworker privacy, real native followed-user objects, guest/no-company states, bounded demo content and revised native thread links; five Sass entrypoints and 54 templates compile. Full native NodeBB build succeeds on the isolated clone. The operator creates 24 topics/48 replies, then a repeat import creates zero topics/zero replies and no genuine verification records.

Isolated Chrome acceptance passes: immediate heart add/remove without a popup or tooltip; no full document reload when entering a thread (an in-memory page marker survives); native replies and simulated badges present; browser Back returns to the feed after one navigation. Capture-only click observation avoids double handling by the native anchor delegate. Coworker results match only public company profiles; actual follow/unfollow changes the network feed. At 1440/390/320px there are no inline comment panels or horizontal overflow; mobile search forms are absent and the compact search icon/circle tabs remain. Guests receive truthful login prompts and no circle topic data. No page errors occur. All acceptance mutations are isolated.

## Production acceptance — 2026-10-19

Functional release `be492bb9af73b1cf3ddd5649998f0af76a79056c` was deployed from `dev` after complete local tracked-file comparison and tested/server plugin byte comparison. The protected verified pre-update backup is `/home/ucloud/vvjob-backups/20261019-threads`; only VVJOB web was recreated. The production operator reports exactly 24 new labelled topics and 48 labelled replies, with zero real verification records created. Existing company records, careers, real accounts/certificates and the original 500 demo identities are retained.

Read-only production Chrome acceptance passes at 1440/390/320px: mobile search forms and inline panels are absent; both simulated-verification states display; a page-memory marker survives comment navigation into native replies; a single browser Back returns to feed; simulated native topic badges remain distinct from real verification; guests receive no circle posts and see login prompts; hot ranking contains 15 titles. No page errors or horizontal overflow occur. Mutation/real-follow/company-match assertions were run on the isolated copy, not production accounts.

Native final build completed in 21.017 seconds and production reports Ready. Preview container/database/private config and the local tunnel were removed; active/rollback releases/builds and protected backups remain. Existing third-party emoji compatibility and browser-data-age warnings remain unchanged.

## Final badge consistency patch and workflow change

The user requested that subsequent work proceed locally without Git as a mandatory step. Stop automatic commits/pushes; prefer local editing and preview, then deploy when explicitly requested. The final shared badge CSS patch is intentionally a local change rather than a new Git commit. It gives native topic posts the same blue real-verification, purple simulated-verification and labelled demo styling as the feed. All 89 tests, local compilation and a separate native build pass; isolated browser computed-style checks verify the actual native topic badge colors.

This final local archive rollout uses `/home/ucloud/vvjob-threads-badge-release` and `/home/ucloud/vvjob-threads-badge-build`, with protected verified backup `/home/ucloud/vvjob-backups/20261019-threads-badge`. It changes only plugin/build mounts and does not seed further posts or change identity data. Restore the prior threads mounts from this Compose backup for code rollback. The previous Git release records above remain historical; the active runtime includes this uncommitted local CSS patch.

The final local badge archive is now live; read-only production computed-style checks pass for native topic simulated badges/demo labels and the shared blue real-verification rule. No new demo posts, certificates or Git commits/pushes were made by this patch.
