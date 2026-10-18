# Conversation-first UI refresh

The first release retained too much Harmony chrome and used large promotional panels. This refresh follows the user's preference for a compact workplace discussion feed, with the lighter framing of Threads.

- A single VVJOB header replaces duplicate homepage branding and sidebars.
- The homepage centers authors, readable post excerpts and native discussion links.
- Workplace community shortcuts remain visible; the large promotional banner is removed.
- Mobile gets compact category chips and a dedicated five-action bottom navigation, including native compose.
- Search uses the native search form. Member/guest navigation reflects authentication state.
- Harmony chrome is suppressed only under `body.template-vvjob`; native topic, account, moderation and search screens retain their original controls.
- No suggested people, activity numbers, unread badges or anonymous identities are fabricated.

Local checks: seven unit/template tests and Sass/Benchpress compilation pass. Browser previews use real public site data at 1440, 1024, 768, 390 and 320 pixels; no document overflow. Preview rendering uses the same escape helper behavior as the NodeBB host.

Deploy by building into a separate asset directory, keeping the previous plugin checkout and build directory available. Switch only the plugin/build mounts and recreate the web container after verification. No database migration or settings change is needed for this UI-only release.

## Deployed validation

The refresh was deployed to http://bbs.cloudverify.vn/ from code commit `7fa45bfc1276bc9e3a1e652de7b9799d6bafda1f`. [GitHub validation](https://github.com/vnforver02/vvjob/actions/runs/39105043810) succeeded.

- Complete NodeBB compilation into the separate build directory succeeded in 20.244 seconds.
- An isolated preview container used the new plugin/build mounts with scheduled jobs disabled; it was removed after testing.
- Public-domain browser checks passed at 1440, 1024, 768, 390 and 320 pixels: HTTP 200, no document overflow, expected VVJOB heading, duplicate native homepage chrome hidden, no page errors.
- Latest/popular tab state, guest compose-to-login, native login controls, restoration of native topic controls, and search form submission were checked. Guest search follows the existing NodeBB access policy and redirects to login.
- No database migration or content modification was performed for the refresh. Existing topics are shown as-is.

Current plugin checkout: `/home/ucloud/vvjob-ui-v2-source`. Current build directory: `/home/ucloud/vvjob-ui-v2-build`. The private runtime Compose remains `/home/ucloud/vvjob-v1-runtime/compose.json`. The previous Compose mount configuration is backed up at `/home/ucloud/vvjob-backups/20261018-ui-refresh/compose-before-ui.json`; the original plugin checkout and build directory remain available. Reverting these two mounts restores the previous UI without reverting the database.
