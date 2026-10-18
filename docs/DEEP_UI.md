# VVJOB v0.5 route layout rebuild

The v0.4 shared stylesheet was insufficient for Harmony's topic structure. Its inherited timeline margins and competing flex widths shrank the post column and displaced reply controls. Version 0.5 owns the topic and post templates, removes the timeline class, and uses an explicit main-column/sidebar grid. Every post has a bounded avatar/header/content/footer layout. Quoted parents and expanded replies have their own containers. Dynamically loaded posts use the same native template blocks.

## Changed routes and components

33 owned templates cover the feed/shared shell/composer/authentication plus discussion, category/category index, users and user cards, account header/navigation, notifications, search, recent/popular/unread, tags, chat workspace, groups, password reset and error pages. `scss/pages.scss` provides route-specific layouts alongside shared tokens. Mobile account navigation collapses behind an accessible button rather than taking a full screen above settings. Desktop discussion tools occupy a fixed rail; mobile tools remain above the posts. Native controls, permissions, CSRF and plugin extension slots remain intact.

A plugin-side guard ignores live post events only when every supplied post already exists in the main discussion. This avoids NodeBB 4.6's empty-array scroll callback on duplicate quick-reply/live events. New posts and nested-only posts still pass to the native handler. No NodeBB core/package source is patched.

## Category cleanup

The user requested removal of the original NodeBB categories. Category IDs 1–4 (Announcements, General Discussion, Blogs, Comments & Feedback) were removed after moving their two topics (1 and 2) into workplace discussion (5). Native move/purge methods were used and destination counts refreshed with `onTopicsMoved`. Four Vietnamese workplace categories remain (5–8). No user post was deleted. A PostgreSQL custom-format backup precedes this operation at `/home/ucloud/vvjob-backups/20261018-category-cleanup/nodebb-before.dump`.

## Validation

- Ten local tests, Sass/33-template compilation and full NodeBB asset build pass.
- Main browser matrix: 16 routes at 1440/768/390/320px (64 checks), no document overflow or uncaught page errors. Discussion checks measure each loaded floor's boundaries and ensure the next floor starts below it; content/actions remain inside its card.
- Additional final-build matrix: groups/details, 404, invalid password reset, profile edit/settings/posts/bookmarks, notifications, chats and four admin routes at 1440/390/320px (42 checks). Expected 404 is preserved; no overflow or uncaught errors. Mobile account navigation opens/closes correctly.
- Isolated database fixtures contain multiple floors, Markdown headings/lists, quoted/linked replies and long URLs. Expanded nested replies fit 1440/390/320px. Native desktop reply, mobile quote/submit and quick reply are exercised; the duplicate live-event regression is reproduced and fixed. Native reading-position restoration is retained; tests start at `/topic/<tid>/1` when checking the first floor.
- No test account/content is deployed to the production database. Preview jobs and outgoing SMTP are disabled/loopback-only. This is a route and interaction regression matrix, not an exhaustive test of every admin setting, moderation scenario, device or third-party plugin.

## Deployment and rollback

Production runtime remains `/home/ucloud/vvjob-v1-runtime/compose.json`, with the existing production database/configuration/uploads unchanged. The new plugin/build mount targets are `/home/ucloud/vvjob-deep-source/extensions/nodebb-plugin-vvjob` and `/home/ucloud/vvjob-deep-build`. The pre-release Compose backup is `/home/ucloud/vvjob-backups/20261018-deep-ui/compose-before-deep.json`. To roll back the visual release, restore that file to the runtime Compose path and run `docker compose -f /home/ucloud/vvjob-v1-runtime/compose.json up -d web`. Do not restore an old database just to roll back UI. The earlier category cleanup is a separate requested content change and remains in place.

## Production verification

After cutover, 15 public routes were checked at 1440/390/320px (45 checks): feed, categories, workplace category, existing topics 1/2/3, members/profile, login/register, recent/popular/tags/groups and reset. All returned 200 with no document overflow or uncaught browser errors. Existing topic content stays inside the new post column (884px desktop, 362px at 390px viewport, 292px at 320px viewport). The category API returns only IDs 5–8; workplace count is three preserved topics. The staging administrator URL returns 404 in production. Preview container/database/private fixture directory were removed. The category backup is readable by `pg_restore -l`.
