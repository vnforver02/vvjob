# Social interaction V2 — 2026-10-24

Owner approved integration and deployment of the local interaction preview. The static preview remains a design artifact; production uses existing NodeBB/Harmony/VVJOB services and existing data.

## Changes and limits
- Restored phone home/people/publish/messages/profile destinations, active states and native unread-chat count. Companies remain desktop navigation. Existing recommendations/new members/coworkers/follows and privacy checks retained; role/industry preference remains, no city ranking.
- Content-first feed with quieter titles, consistent avatar/body/action spacing; repeated generated title hidden when it exactly prefixes visible body. Independent handwritten titles retained. Detail uses a compact conversation header and original title near content, with repeated-title suppression. Native post/reply components, moderation, report, quote/edit and pagination remain intact.
- Native inline reply with real parent PID retained. Shared48-emoji picker for replies and native publisher; grouped Vietnamese labels, cursor insertion, input/change events, keyboard dismissal and draft updates. Native uploads and formatting retained.
- Hover reaction tray presents love/like/laugh/wow/sad/applause; mobile long press and keyboard choice retained. Existing care/angry records remain valid and visible on selected trigger; new tray does not offer them. New applause is persisted by existing permission-checked reaction service. Same selected choice removes reaction; quick click toggles default reaction. Tray follows scrolling anchor.
- Feed bookmarks project native viewer-specific batch state and write through native PUT/DELETE bookmark API. Private no-store feed and original native bookmark page retained; no separate bookmark database.
- No demo records imported, no genuine identity verification granted, no anonymous posting unlocked. Native chat, career/evidence and admin functions preserved.

## Changed production files
Under extensions/nodebb-plugin-vvjob: plugin.json; data/reactions.json; lib/social.js; public/{emoji-picker,reading-polish,reactions,topic-reply,vvjob}.js; scss/editor.scss; templates/{topic,partials/topic/post,partials/vvjob-post-body,partials/vvjob-social-actions,partials/mobile-footer}.tpl. Tests: reactions.test.js, social.test.js, blueprint-navigation.test.js. Prior unpublished changes retained.

## Verification
99 automated tests passed, including persisted applause switching and native viewer-specific bookmark projection. Six Sass entrypoints and57 templates compile. Runtime build and browser results recorded below once executed. Synthetic test accounts and mutations are confined to cloned database vvjob_social_v2_preview, never production.

## Deployment and rollback
Source `/home/ucloud/vvjob-social-v2-release`; build `/home/ucloud/vvjob-social-v2-build`; pre-update database/config/compose backup `/home/ucloud/vvjob-backups/20261024-social-v2`. Release byte-compared to tested source. Only web mounts change and web restarts. Roll back by restoring backup compose then recreating only web; previous blueprint release/build retained. No core or schema migration.

## Runtime acceptance
Native full build succeeded. Clone-member browser checks passed persisted applause after reload, six hover choices, native feed bookmark after reload,48-emoji reply/publisher insertion and Escape dismissal at1440/390/320. Actual body-only publish preserved full content and generated bounded title. Actual inline reply preserved toPid, refreshed its native child thread, stayed in place, retained failed403 draft and passed desktop/mobile layout. Guest feed/detail and restored people/messages bottom destinations passed1440/768/390/320 with no horizontal overflow or JavaScript page errors; guest people access redirects to login. Feed reading offset/query restoration passed1440/390/320. A final layout-only refinement moves publisher emoji below the editor and quiets forum statistics; rebuilding and final visual acceptance follow.

Final layout build passed. Repeated guest visual acceptance passed all four widths; expanded publisher picker left native close/submit usable and actual body-only publishing passed1440/390/320. The changes remain within existing plugin/theme contracts. Production deployment and read-only verification recorded below.

Production deployment completed with validated pre-update dump/config/compose backup. Read-only production checks passed1440/768/390/320 feed/detail, restored people/messages destinations, no overflow, guest people login gate and no page errors. Test accounts/posts/replies/reactions/bookmarks remained in cloned database only; clone container/database removed after acceptance. Existing tabs require one refresh for new versioned assets. No Git commit/push performed.

The combined legacy reading runner reported all three feed offset/query checks, then did not terminate its remaining hot-board segment and was stopped. Hot-board return is not reported as newly passed by this release; core ranking data/query paths were not changed.
