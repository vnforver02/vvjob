# Blueprint V1 — first delivery

2026-10-24, Asia/Ho_Chi_Minh. Scope approved by product owner: first navigation and presentation batch in VVJOB_BLUEPRINT_IMPLEMENTATION_REVIEW.md.

## Changes
- Shared desktop header and mobile bottom navigation use Trang chủ / Khám phá / Công ty / Cá nhân, retaining central native publishing action on mobile.
- Header no longer repeats coworker/network circles. Existing routes and data remain available; self profile has secondary people/chat links. Native notifications, drafts and user menu remain.
- Home has a four-destination desktop rail, compact publisher and Dành cho bạn / Mới nhất / Nổi bật links. Recommended view explicitly describes chronological community content; no personalised recommendation claim. Latest selection is query-based and category links retain category context.
- Discovery uses existing privilege-filtered categories, with clearer Vietnamese introduction and truthful unpublished-anonymity notice. Native categories are not deleted or renamed in storage.
- Unified navigation touch targets, focusable real links, accessible icon labels, compact spacing; blue brand retained as approved.

## Files in this batch
`library.js`, `public/vvjob.js`, `scss/editor.scss`, `templates/vvjob.tpl`, `templates/categories.tpl`, `templates/partials/header/brand.tpl`, `templates/partials/mobile-footer.tpl`, `templates/partials/account/sidebar-left.tpl`, `test/template.test.js`, `test/blueprint-navigation.test.js`. All plugin paths under extensions/nodebb-plugin-vvjob. PR's six documentation/skill files copied into local workspace; prior unpublished local fixes preserved.

## Verification
97 automated tests passed; six Sass entrypoints and57 templates compiled locally. Native full build and browser acceptance recorded below after completion. No production test posts, accounts, evidence or evaluations are created by this delivery.

## Limits and rollback
This is the approved first batch, not completion of every blueprint business module. Topic following, structured company reviews and safe anonymous posting remain separate work. Test identities remain test identities. Existing chats and people are secondary rather than removed. Restore the pre-update compose file and recreate only web to roll back; keep both previous release/build and the validated database backup. No NodeBB core or schema migration.

## Acceptance and deployment record
Native NodeBB4.6.1 full asset compilation passed. Isolated browser checks passed at320/390/768/1440: four real destinations, chronological feed selection, discovery heading/privacy notice, company active state, guest profile login gate, no horizontal overflow,15 hot titles, no JavaScript page errors. Desktop and mobile screenshots inspected. No new authenticated mutation paths introduced in this batch.

Release source: `/home/ucloud/vvjob-blueprint-v1-release`.
Build: `/home/ucloud/vvjob-blueprint-v1-build`.
Pre-update backup: `/home/ucloud/vvjob-backups/20261024-blueprint-v1`.
Rollback: restore backup compose and recreate only web; prior body-composer source/build retained. Deployment outcome recorded after live verification below.

Production deployment completed and read-only browser acceptance passed for all four widths, including15-title hot board and no page errors. Database dump validated before recreation of web only. Existing tabs require one refresh to load versioned assets. No Git commit/push or PR merge performed in this delivery.
