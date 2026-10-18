# Phase 1 changes and validation

## Delivered

- Plugin-owned `/vvjob` and `/api/vvjob`, plus selectable native homepage hook.
- Blue/white independent VVJOB visual identity on Harmony, three-column desktop feed, single-column mobile feed and scrollable community navigation.
- Vietnamese copy, recent and most-discussed sorting, native pagination, weekly discussion rail, real category links and honest empty states.
- Native composer, topic/user/search/notification routes. Full discussion pages remain under Harmony, including replies and reports.
- Permission-aware native queries, no custom authentication or post writes. Explicit unavailable-anonymity notice; no recruiting modules.
- Locked local build dependencies, GitHub CI, standalone Docker development stack, installation and rollback instructions.

## Executed locally

- Node.js 24.21.0, npm 11.19.0.
- `npm test`: 6/6 passed. Route/homepage registration; forwarding viewer and query to native controller; category privilege request; sorting and weekly trending parameters; pagination preservation; invalid request fallthrough; error forwarding. Template rendering checks cover populated/empty feeds, Vietnamese privacy copy, sort state, and subdirectory links.
- `npm run build`: Sass 1.93.2 and Benchpress 2.5.5 compiled successfully, including Harmony 2.1.21 paginator.
- Inspected NodeBB 4.6.1 source for homepage hooks, page middleware, recent controller and privilege-aware topic/category queries.

These are extension unit/build checks, not end-to-end security certification. Docker is unavailable in the implementation environment. Full NodeBB asset build, live Redis integration, real browser layout and interaction checks, and runtime server version are **not yet verified**. No production deployment was performed. Do not mark the phase fully accepted until the staging checks below pass.

## Required staging acceptance

Record actual image digest, core/theme/plugin versions, commit, date, viewport and result:

- At 1440, 1024, 768, 390 and 320 px: no page overflow; readable cards/navigation; functional keyboard focus, zoom to 200%; no clipped composer actions.
- Homepage opens VVJOB rather than default category list, through direct load and Ajax navigation. Test subdirectory installation as well.
- Empty feed and long Vietnamese titles, Unicode, links, images and sanitized malicious content render safely.
- Guest: register/login/search work; compose opens native login. Member: compose opens native composer and category selector, submit/reply/edit/report work, profile links and notification links work.
- Native composer selects only allowed categories. A read-only member cannot post through it. Validate guests with posting enabled against the chosen product policy.
- Recent/popular change actual ordering; pagination preserves sort and works on desktop/mobile; weekly rail reflects posts from the last week.
- Private/deleted/scheduled topics and blocked users obey native visibility, in feed and rail, with guest/member/moderator accounts. Verify API responses too.
- ACP, bans, maintenance mode, search plugin, reports and moderation remain usable. No user-facing claim of anonymous identity.
- Newly created categories appear only for authorized viewers. No category IDs are hardcoded.
- Restart/recreate staging container: plugin persists and compiled assets remain usable. Verify rollback.

## Remaining scope

Independent anonymous identity protection requires a separate threat model, storage/access design, auditing and security tests. It is not implemented. Recruitment and applications are excluded. Dark Harmony skins need a separate visual pass; the V1 feed intentionally targets the requested light blue/white skin.
