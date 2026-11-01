# VVJOB0.11.1 — user journey polish,2026-11-01

User authorized implementation of the user-perspective recommendations, continuing the authorized tested production delivery. This release deliberately improves a coherent path without fabricating content, recommendations or verification, deleting user posts, or changing NodeBB core/schema.

## Implemented
- A small horizontally scrollable category selector in the feed, visible on mobile and desktop, built only from native privilege-filtered categories. Active category is announced with aria-current; real anchors retain native Ajaxify, keyboard and no-JavaScript navigation.
- Optional writing ideas are collapsed by default. Three Vietnamese questions seed a normal native composer body and retain the current category; nothing is auto-posted and the text remains editable. Logged-out actions still go through native login.
- Default feed is explicitly Đang thảo luận. Mới nhất now actually uses native create sorting; previously both views used recent activity. Existing popular/category permissions and pagination remain native.
- Root comments and directed replies use separate form caches and UID/topic-scoped draft keys. Switching forms or reloading retains each draft. Native topic/reply buttons submit a root comment without an accidental parent ID.
- Sending disables duplicate clicks and announces busy status. Failure retains text, restores editing and offers an explicit retry; translator failures cannot swallow the fallback. Successful replies clear their draft. Existing queued moderation handling is retained.
- Empty network/company feeds explain the bounded recent window rather than pretending no matching content exists anywhere. The empty network view links to peers for a useful next action.

## Changed files
library.js; public/{vvjob,topic-reply}.js; templates/vvjob.tpl; scss/editor.scss; root/plugin package metadata and lock; test/plugin.test.js; scripts/qa/journey-flows.cjs; this report. Existing rendering, navigation scroll restoration, people ranking, proof approval and privacy mechanisms retained.

## Verification
108/108 automated tests and Sass/template build passed (60 templates); diff whitespace check clean. Added native newest-sort assertion. Focused Chrome checks passed actual category selection, prompt-to-native-composer body/category,1440/768/390/320px overflow checks, distinct root/child drafts across reload, simulated503 send failure, retained editable text, and successful retry with the exact parent ID. Screenshots were visually inspected. These mutation tests use only the private loopback clone; no QA posts enter production.

Final regression:17/17 native end-to-end workflows passed on the isolated clone, including registration/logout, root/child publication, reactions/bookmarks, follow/search, career, private proof approval/revocation, chat, notification and reports.

## Limits
No automatic moderation/deletion of existing off-topic posts, no synthetic engagement, no personalized feed algorithm, no LinkedIn connection or SMTP enablement. Native public media/avatar uploads and physical mobile keyboard behavior are not covered by these tests. Drafts are sessionStorage-only and may be unavailable in restricted storage; they are not server-synchronized. Native API send retries do not provide a new idempotency guarantee; a genuinely ambiguous network failure still requires checking whether a reply already appeared. The topic-scoped drafts contain no cross-user key reuse and existing logout cleanup is retained.

Final pre-release guest layout audit:68/68 checks passed (17 routes ×4 widths), no document overflow or uncaught page errors. Full authenticated layout matrix from0.11.0 was not repeated; changed feed widths and actual authenticated workflows were exercised in this release.

Production cutover succeeded:0.11.1, only vvjob-v1-web-1 recreated. Source /home/ucloud/vvjob-release-20261101-0111/extensions/nodebb-plugin-vvjob, dedicated build /home/ucloud/vvjob-build-20261101-0111. Pre-release source manifest matched production0.11.0; database custom dump validated with pg_restore --list. Private backup /home/ucloud/vvjob-backups/20261101-journey-0111 holds database/config/Compose. Native health passed. Rollback: restore that saved Compose file to /home/ucloud/vvjob-v1-runtime/compose.json, retain0600, then run the existing vvjob-v1 Compose project up -d --no-deps --force-recreate web. Previous0.11.0 mounts remain available; do not restore an old database over newer user activity for UI rollback.

Post-release real Chrome check passed against https://bbs.cloudverify.vn: category Ajaxify navigation, latest-tab active state, guest writing-prompt login routing,1440/768/390/320px overflow/screenshots and no uncaught page errors. Served JS/CSS version ae852754839; fetched JS contains the retry code. No production content was created. Administrative and mutation checks remained isolated.

Header-label follow-up: removed only the global Dữ liệu thử nghiệm chip at the owner's request. The template/Sass build passed; native production templates rebuilt after backing up source/build under /home/ucloud/vvjob-backups/20261101-header-label. Account-specific synthetic provenance and actual verification records were not changed.
