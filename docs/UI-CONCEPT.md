# VVJOB community concept — 2026-10-18

The supplied desktop/mobile reference informs the cobalt and white palette, wordmark with inline tagline, pale blue quotation masthead, desktop community/feed/trending columns, compact composer, ranked real discussions, white post cards and circular mobile publish action. Shared navigation, buttons, forms and composer styling also apply to existing native routes. No sample posts, counts or certification claims are introduced.

Implementation is isolated in `extensions/nodebb-plugin-vvjob/scss/concept.scss`, loaded after existing plugin styles. Homepage markup and the shared brand partial are updated; NodeBB core is unchanged. Mobile community navigation scrolls horizontally; the banner stays compact and the right rail disappears at tablet widths. Existing native member menus, posting, moderation and authentication remain in use.

Validation: 52 repository tests; all four Sass entry points and 44 templates compile. Native NodeBB 4.6.1 full asset build completed successfully in 20.566 seconds. Browser preview passed at 1440, 390 and 320 CSS pixels without page overflow.

Deployment: fresh source `/home/ucloud/vvjob-concept-source` and build `/home/ucloud/vvjob-concept-build`; private Compose and verified PostgreSQL dump saved in `/home/ucloud/vvjob-backups/20261018-concept`. Only the VVJOB web service was recreated. To roll back, restore the previous plugin/build mount paths from the saved Compose and recreate the web service. Keep HTTPS and current database data; a visual rollback does not require a database restore.

The same deployment removes the manually entered document date, including backend validation and the queue display. Reviewers inspect dates directly in the private images. Existing applications remain intact.

Post-deploy browser checks passed at all three widths, with no client errors. Login, registration, categories and company pages also fit at 320px. The served evidence template contains no date field, and the guest publish action opens native login. Authenticated material uploads and review decisions were not repeated against real production documents for this presentation update.

## Compact community feed follow-up

Removed the large homepage masthead and replaced it with a short contextual title and description. Sidebar links now use `/vvjob?cid=<id>` and keep the same feed layout and selected community highlight. Recent/popular sorting retains the selected community; native recent-controller filtering, permission checks and pagination remain authoritative. Unavailable community IDs pass to the native not-found handler. The composer receives the selected community ID through its existing native `newTopic` API.

53 tests and all Sass/template builds passed. Native NodeBB full asset build passed in 20.76 seconds. Live browser checks at 1440/390/320px exercised all four community links, matched titles and active navigation, confirmed that displayed posts belong to the selected community, preserved category filtering when sorting, and found no horizontal overflow or client errors. Large masthead is absent. No production posts or materials were created during QA.

Fresh deployed mounts: `/home/ucloud/vvjob-community-source/extensions/nodebb-plugin-vvjob` and `/home/ucloud/vvjob-community-build`. Previous source/build remain for rollback. Private Compose and verified PostgreSQL dump: `/home/ucloud/vvjob-backups/20261018-community`. Only the VVJOB web service was recreated; no core changes or database restore occurred.
