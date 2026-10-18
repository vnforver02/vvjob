# VVJOB rollout — 2026-10-18

## Result

VVJOB is served at http://bbs.cloudverify.vn/ through the existing aaPanel Nginx virtual host. The original NodeBB 1.19.7 container is stopped; its PostgreSQL database and configuration are retained. Other application containers and virtual hosts were not changed.

The user explicitly authorized server deployment and delegated the implementation decision. The chosen approach upgraded an isolated database copy rather than applying new code to the original installation.

## Verified runtime

- NodeBB 4.6.1, Harmony 2.1.21, Node.js 22.20.0.
- Image: `ghcr.io/nodebb/nodebb@sha256:244699c40f775eac5d513b66e95a6b816bf04943b9ed551c8011c4cdaf4719a9`.
- Separate Compose project `vvjob-v1`, PostgreSQL 18.1, independent database/dependency volumes.
- Web container `vvjob-v1-web-1`, database `vvjob-v1-db-1`; web binds only to `127.0.0.1:14567`.
- Runtime configuration: `/home/ucloud/vvjob-v1-runtime/compose.json` and `config/config.json`. These private files contain credentials and must never be committed.
- Initial plugin source: `/home/ucloud/vvjob-v1-source/extensions/nodebb-plugin-vvjob`, mounted read-only. The subsequent UI refresh uses `/home/ucloud/vvjob-ui-v2-source`; see UI_REFRESH.md for the current mounts and verification.
- Persistent build, uploads, configuration and dependency storage. `CONFIG` is explicitly set for the loader.

## Executed checks

- Six local unit/template tests pass; Sass and Benchpress compilation pass.
- Full native `nodebb build` succeeds against the release image, including client/admin bundles, templates and styles.
- Core and active plugin schema upgrades succeed on a restored PostgreSQL copy; search tables and indexes are initialized and existing content reindexed.
- Browser checks on the public homepage at widths 1440, 1024, 768, 390 and 320: HTTP 200, expected VVJOB heading, no document horizontal overflow, no JavaScript page errors.
- In the isolated rehearsal: guest compose redirects to login; a temporary member logs in and opens the native composer; native API posting/replying and searching succeed; notification/search/profile/category pages return 200; popular-tab state works.
- Guest and ordinary member feed/API checks exclude a private test category/topic, including the trending data.
- Before final cutover, the old web process is stopped, a fresh database snapshot is restored to the new stack, uploads are copied, and schema/configuration/search preparation is repeated. Temporary accounts, private fixtures, posts and replies are excluded from the final migration.
- The final public API contains the original discussion and real community categories, with no staging fixture titles.
- The existing Nginx virtual host is backed up, its single upstream is changed to 14567, and `nginx -t` passes before reload.

The first cutover check reached a retiring Nginx worker still pointing to the stopped old port and returned 502. Automatic rollback restored the original proxy and web container. The second cutover used bounded retries after reload and succeeded. Database synchronization was repeated before retrying.

## Backups and rollback

Protected server backup directory: `/home/ucloud/vvjob-backups/20261018-before-ui/`. It contains the original config/Compose/container metadata, compressed full database dump, uploads archive, final source database snapshot and original Nginx virtual-host config. The compressed dump passes gzip verification and contains the PostgreSQL completion marker.

The old web container is `nodebb_tw8h-nodebb-web-1`; the old database is `nodebb_tw8h-nodebb-db-1`. Do not delete either or their original data while the release is being accepted.

For an immediate rollback before new writes, restore the backed-up virtual-host configuration, validate/reload Nginx and start the old web container. After new users or posts enter the new database, first preserve and reconcile those writes; reverting to the old database without reconciliation would lose them. Do not rerun the one-time migration from the old database after cutover.

## Limits

The original English default categories and original discussion content are retained; the four Vietnamese workplace categories are placed first in the VVJOB navigation. Anonymous posting remains unavailable. Recruitment features remain excluded. Broader moderation, report, email delivery, browser/device matrix and security regression testing remain follow-up acceptance work. A bundled third-party emoji package reports a compatibility warning; VVJOB itself declares compatibility in its package metadata. Existing HTTP/domain/TLS settings were preserved.

## Global UI update — 2026-10-18

The v0.4 plugin applies a shared VVJOB shell and component styling beyond the homepage, including native popup/standalone composers, authentication and administrative components. Current UI mount paths and rollback instructions supersede the earlier homepage-only release: see [Global UI verification](GLOBAL_UI.md). The production database and existing account/content language choices are preserved.

## Route rebuild and default-category cleanup — 2026-10-18

Current release is v0.5, with 33 owned templates and route-specific discussion/reply layouts. Original default category IDs 1–4 were removed; topics 1 and 2 were moved to workplace category 5 and counts recalculated. Current plugin/build mounts and rollback are documented in [Deep UI](DEEP_UI.md).
