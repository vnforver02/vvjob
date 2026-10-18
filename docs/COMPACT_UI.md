# VVJOB v0.6.1 — close controls and compact masthead

The popup composer now has a persistent desktop top-right **× Đóng** button. Mobile has a labeled close button in its top bar; standalone `/compose` also keeps a visible heading/close control at mobile widths. The buttons use the native `composer-discard` handler. Empty editors close immediately; modified editors show NodeBB's confirmation. Cancel keeps the content, and confirmation discards it. The existing minimize control remains available for keeping drafts. Native modals/backdrops are layered above the custom composer so confirmation and upload dialogs remain usable.

The homepage's two-line slogan and large decoration are replaced by one compact line, **Real Work. Real Talk.**, a smaller Vietnamese supporting line and a community-guide shortcut. The approved wording is unchanged. Intro height measured 135.6→63.3px at 1440px and 122.5→56.2px at 390/320px. The first post starts about 80px earlier on desktop and 77px earlier on mobile.

## Validation

Twelve local tests, Sass/template build, full NodeBB build and GitHub CI pass. Browser checks cover 1440/1024/768/720/390/320px: compact intro, no document overflow, visible/in-viewport close controls, empty close, cancel dirty close preserving text and confirmed dirty close. Standalone `/compose?cid=5` close is checked at 1440/390/320px. A private database/config/uploads copy and fixture account are used for authenticated checks; no production accounts or test posts are created.

## Deployment and rollback

Current plugin source: `/home/ucloud/vvjob-compact-source/extensions/nodebb-plugin-vvjob`; assets: `/home/ucloud/vvjob-compact-build`. Only those two mounts change in `/home/ucloud/vvjob-v1-runtime/compose.json`; production config/database/uploads remain unchanged. Previous UI Compose is kept in `/home/ucloud/vvjob-backups/20261018-compact-ui/compose-before-compact.json`. Restore it to the runtime path and run `docker compose -f /home/ucloud/vvjob-v1-runtime/compose.json up -d web` for visual rollback. The independent preview is removed after validation.
