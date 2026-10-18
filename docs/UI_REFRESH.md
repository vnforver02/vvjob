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
