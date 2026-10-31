# Local visual parity correction — 2026-10-24

The owner rejected the earlier partial integration and designated preview/interaction as the visual source of truth. This change aligns the existing NodeBB UI to that approved layout; it does not publish a standalone static prototype or replace live data.

## Scope
- Shared header matches the local wordmark/tagline/quiet account controls. Redundant header destination/search rows removed visually; native authenticated menus, guest login/register and search routes retained. Trial data disclosure moved from a full-width strip to an explicit compact label with explanatory tooltip.
- Feed left rail: home, people, discovery, companies, saved posts; line SVG icon family; rounded publish button; compact note and real account identity. Existing people recommendation/new/coworker/following logic unchanged. No city ranking or fake connections.
- Feed: approved heading, compact real-avatar publisher, local tabs and continuous flat posts with matching spacing, career/time metadata and category chip. Titles remain in DOM/accessibility and stored records, while body-first display follows the preview. Existing ranking, public visibility, native bookmark and reaction APIs retained.
- Topic uses the same three-column shell at desktop and single column on mobile. Comments are borderless with compact inline replies; native quote/edit/moderation controls remain accessible in menus. Thread options moved to the corner; reaction actions remain visible without hover. Guest reply leads to login. Share uses real permalink. Native parent IDs, event handlers and pagination retained.
- Mobile bottom destinations remain home/people/publish/chats/profile, with local line icons and accessible labels. Actual unread badge retained. Compact native publisher header now matches local wording and Cancel action.
- Removed the obsolete second comment-click scrolling handler; reading.js remains the single source of feed-return/reply intent.

## Files
extensions/nodebb-plugin-vvjob/templates/{vvjob,topic,partials/vvjob-feed-card,partials/header/brand,partials/vvjob-editor-heading,partials/topic/post,partials/mobile-footer}.tpl; new partials/vvjob-local-{rail,context}.tpl; public/vvjob.js; scss/editor.scss. No NodeBB core, database or verification changes.

## Validation and release
99 tests passed; six Sass entrypoints and59 templates compile; diff whitespace validation passed. Initial isolated screenshot checks passed feed/detail at1440/768/390/320; screenshot inspection identified inherited post-tools opacity and missing mobile heading, corrected before final acceptance. Final functional and deployment results follow.

Known limits: real content/avatar/account state differs from synthetic prototype fixtures; data labels remain explicit. Actual phone keyboard and production media writes are not certified by desktop viewport tests. Preview mock accounts/posts are not imported.

## Isolated acceptance
Final interaction suite passed actual root comment creation without a parent ID; reply-to-comment creation with the exact parent ID, no separate composer; folded parent/quote content; native advanced tools; category8 selection and persisted body-only publication; emoji picker and Send visibility at1440/768/390/320. A final presentation refinement removes native list borders, tightens comment spacing and inserts the comment heading using the actual native data-index rather than template loop index. Revalidation follows before production switch.

## Final verification and deployment
Final four-size feed/detail screenshot suite passed, including visible mobile heading, people rail, absent legacy header/search strip, flat feed cards, no horizontal overflow and always-visible topic action opacity. Real native comment reply/menu/quote suite passed again after the final presentation refinement. The publisher/root-comment suite passed on the same implementation before that final comment-only refinement.

Production source /home/ucloud/vvjob-local-parity-release/extensions/nodebb-plugin-vvjob was byte-compared to tested stage source. Build was copied with container font symlinks preserved into a dedicated /home/ucloud/vvjob-local-parity-build. Validated pg_dump and restricted config/compose backup: /home/ucloud/vvjob-backups/20261024-local-parity. Only vvjob-v1-web-1 recreated; database, uploads, staging and unrelated services retained. No mock fixtures imported, no production test mutations and no Git push.

Rollback: restore backup compose.json to /home/ucloud/vvjob-v1-runtime/compose.json and recreate only web via docker compose --project-directory /home/ucloud/vvjob-v1-runtime -p vvjob-v1 -f /home/ucloud/vvjob-v1-runtime/compose.json up -d --no-deps --force-recreate web. Prior slim-editor source/build retained. No schema migration.

Production read-only screenshot acceptance passed feed/detail at1440/768/390/320 after the actual switch, with zero uncaught page errors and no horizontal overflow. Visually inspected the actual production desktop feed against the local layout, including the five-item quiet right list and saved-post action placement. Captures retained at artifacts/local-visual-parity/production-feed-desktop.png and production-detail-mobile.png. Actual user content and privacy-filtered career fields naturally differ from preview fixtures.
