# VVJOB community concept — 2026-10-18

The supplied desktop/mobile reference informs the cobalt and white palette, wordmark with inline tagline, pale blue quotation masthead, desktop community/feed/trending columns, compact composer, ranked real discussions, white post cards and circular mobile publish action. Shared navigation, buttons, forms and composer styling also apply to existing native routes. No sample posts, counts or certification claims are introduced.

Implementation is isolated in `extensions/nodebb-plugin-vvjob/scss/concept.scss`, loaded after existing plugin styles. Homepage markup and the shared brand partial are updated; NodeBB core is unchanged. Mobile community navigation scrolls horizontally; the banner stays compact and the right rail disappears at tablet widths. Existing native member menus, posting, moderation and authentication remain in use.

Validation: 52 repository tests; all four Sass entry points and 44 templates compile. Native NodeBB 4.6.1 full asset build completed successfully in 20.566 seconds. Browser preview passed at 1440, 390 and 320 CSS pixels without page overflow.

Deployment: fresh source `/home/ucloud/vvjob-concept-source` and build `/home/ucloud/vvjob-concept-build`; private Compose and verified PostgreSQL dump saved in `/home/ucloud/vvjob-backups/20261018-concept`. Only the VVJOB web service was recreated. To roll back, restore the previous plugin/build mount paths from the saved Compose and recreate the web service. Keep HTTPS and current database data; a visual rollback does not require a database restore.

The same deployment removes the manually entered document date, including backend validation and the queue display. Reviewers inspect dates directly in the private images. Existing applications remain intact.

Post-deploy browser checks passed at all three widths, with no client errors. Login, registration, categories and company pages also fit at 320px. The served evidence template contains no date field, and the guest publish action opens native login. Authenticated material uploads and review decisions were not repeated against real production documents for this presentation update.
