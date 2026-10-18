# VVJOB global UI

This records v0.4. The deployed v0.5 route rebuild and current runtime mounts supersede the paths below; see [Deep UI](DEEP_UI.md).

Version 0.4 adds a shared visual system across the site rather than styling only the feed.

## Coverage

- Shared header and mobile navigation on every Harmony route; native account, notifications, chats and draft menus remain in the header.
- Shared type, forms, buttons, cards, tables, tabs, pagination, alerts, dropdowns and modal styling, including the admin bundle.
- New desktop composer workspace and mobile editor surface; native title/category/formatting/upload/preview/tag/draft/scheduling/submit hooks are retained.
- Native login and registration templates retain CSRF, extension fields and validation while using the VVJOB layout.
- Categories, topic lists, topic/replies/quick reply, search, notifications, profiles, member lists, settings and chats use the global style layer.
- Admin navigation and information architecture are retained; its components use the shared design tokens.

Template overrides live entirely in the VVJOB plugin. NodeBB core and the installed Harmony/composer packages are not edited. The mobile navigation supports either Harmony mobile-bar placement preference. Composer styling applies to both the dynamically attached popup and the standalone `/compose` route.

## Local validation

`npm test` checks native template contracts, header authentication branches and existing route/data behavior. `npm run build` compiles both stylesheets and every owned template, expanding available Harmony/composer imports. Set `NODEBB_ROOT` to a NodeBB source checkout to also resolve core-only imports locally. The host's full `nodebb build` remains required before rollout.

## Deployment

Build against the verified image into a new build directory with a new plugin checkout. Use an isolated database copy for authenticated/editor regression checks, disable jobs/outgoing mail there, and remove test users/content with the copy. Switch only the production plugin and build mounts after browser checks; no production database migration or account changes are needed for this UI update. Keep the old mounts for rollback.

## Verification record — 2026-10-18

- Nine local tests pass; plugin Sass/template build and full NodeBB asset build pass.
- Browser checks at 1440, 390 and 320 pixels: feed, categories, existing topic, members, profile, login, registration and password reset; one shared header and no horizontal document overflow. No uncaught page errors during this matrix and editor checks.
- Authenticated checks in an isolated database clone: notifications, search, profile edit/settings, chats, standalone compose and admin dashboard/category/settings routes return 200 without document overflow.
- Native browser interactions pass in the clone: category selection, topic publish, reply, post edit, preview toggle, draft hide/restore and PNG upload. Mobile editor fits 390×844 and 320×740 viewports.
- Native Vietnamese locale renders composer actions. Existing user language preferences and existing English content are preserved.
- These checks do not constitute exhaustive moderation, email, every admin operation, accessibility or device testing. Report hooks and backend privileges remain native; anonymous identity protection remains unavailable.

## Runtime mounts and rollback

Production plugin source: `/home/ucloud/vvjob-global-source/extensions/nodebb-plugin-vvjob`; compiled assets: `/home/ucloud/vvjob-global-build-final`.

The production Compose file remains `/home/ucloud/vvjob-v1-runtime/compose.json`. Only the plugin/build mounts change. Production configuration, uploads, PostgreSQL database and other services are preserved. The pre-change Compose backup is `/home/ucloud/vvjob-backups/20261018-global-ui/compose-before-global.json`; restore that file to the runtime Compose path and run `docker compose -f /home/ucloud/vvjob-v1-runtime/compose.json up -d web` to return to the previous UI without reverting data. Do not restore the test database over production.

Production guest pages were also checked at 1440/390/320 pixels. A narrow Vietnamese category-card/time-label overflow found during rollout was fixed with shrinking grid items and wrapping badges. The temporary preview container, cloned database and private fixture directory were removed after validation.
