# VVJOB global UI

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
