# Simple comments correction — 2026-10-24

Reason: production retained forum parent excerpts, quote blocks, multiple toolbar actions and large post spacing despite the simpler approved local preview.

Scope: plugin templates/CSS and reading polish only; no post edits, database schema changes or custom comment renderer. Native permissions, lazy replies, reaction persistence, parent PID, moderation/report/edit menus and pagination remain.

Changes:
- Native parent context stays in a closed details disclosure, labelled with the existing safe parent's name when available. Full parent text no longer appears by default.
- Existing authored blockquotes stay unmodified in storage and parsed HTML; display wraps them in an accessible closed disclosure. Users can still read the complete quote.
- Post actions show reaction and plain Vietnamese reply. Native tools move to the author's header; advanced quote/vote controls move into the populated native dropdown, rather than remaining on the comment action row. Core dropdown refresh is handled using per-post WeakMap storage.
- Topic-level watch/sort/admin/reply toolbar is collapsed behind Tùy chọn; no permissions removed.
- Comment avatars34px/30px, smaller typography and padding; child containers use a single visual indentation. Post indices, status dots, signatures and mobile floor pill hidden in this discussion layout.

Files: templates/partials/topic/post.tpl; templates/partials/post_bar.tpl; public/reading-polish.js; scss/editor.scss under extensions/nodebb-plugin-vvjob. Prior release work preserved. Duplicate historical quote text is folded, not deleted. Native flat chronological list and lazy child threads remain; this release does not migrate comment relationships or rewrite stored content.

Validation:99 automated tests and local six-Sass/57-template compilation passed. Isolated native build, browser acceptance and production outcome recorded after execution below.

Deployment target: /home/ucloud/vvjob-simple-comments-release and /home/ucloud/vvjob-simple-comments-build. Pre-update backup: /home/ucloud/vvjob-backups/20261024-simple-comments. Only VVJOB web is recreated; prior social-v2 source/build and database backup retained for rollback. No production test comments are posted.

Initial isolated native build and browser acceptance passed real comment send/toPid, menu access, collapsed quotes with expansion, and1440/768/390/320 layouts. Screenshot review caught intrinsic shrink-to-fit on discussion flex item; explicit width100% corrects it. Header menu button reduced to28px; original-title heading condition now requires actual index0 to avoid empty headings in lazy child posts. Final build and repeated visual acceptance follow.

Final isolated build and browser acceptance passed: actual native reply with correct toPid, native child refresh, no composer popup, quote folding/expansion, header tools with advanced controls, no visible footer quote/vote clutter, four widths including explicit mobile discussion width. Screenshot inspected at390px. Syntax/diff checks clean.

Production deployment NOT executed. Automatic approval rejected the web-recreation command because it requires explicit confirmation for this specific comment-layout correction under the project's production-change rule. Preview/source/build remain available for review; the pre-update production backup is a planned path and has not been created by this rejected command. Current production remains social-v2. After approval, run byte-compared backup/deploy script, read-only production checks and isolated-preview cleanup. No attempt to bypass rejection.
