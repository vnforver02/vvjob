# Slim publisher and responsive review — 2026-10-24

Status: initially reviewed locally/in isolation; owner explicitly approved production deployment on2026-10-24. Release and rollback details below.

## Scope
Align real NodeBB publisher with the approved prototype: body-first, actual avatar, native privilege-filtered category selector next to identity, image upload and48-emoji picker. Hide free tags and redundant reply title by default; native formatting, attachments and preview remain under More. Editing can expose existing title/tags without losing saved values. Native drafts, validation, CSRF, upload and submit hooks retained.

Feed comment anchors no longer target native quick-reply hash. An explicit transient click intent opens the small inline root-comment form after native detail navigation. The root form sends content without a parent PID; replying to a particular comment still sends its exact toPid. Native quick reply remains mounted but visually replaced by the simpler entry, preserving core initialization. Pagination cannot accidentally assign a root comment to the first visible reply. No production data is rewritten.

Local4175 preview now places the four existing community choices beside identity. Its image picker accepts up to4 JPG/PNG/WebP/GIF files under5MB each, kept as browser blob previews only; no real upload. Images are not restored across reload. Other prototype actions remain synthetic, disclosed preview state.

## Changes
Production plugin: templates/composer.tpl, compose.tpl, partials/vvjob-editor-heading.tpl, partials/vvjob-social-actions.tpl, topic.tpl; public/composer-ui.js, topic-reply.js, reading.js; scss/editor.scss. Prototype: preview/interaction/{index.html,app.js,style.css}. Native thread-link test updated for intentional removal of the quick-reply hash. Previous simple-comments correction remains staged and is not yet deployed.

## Initial verification
99 automated tests passed; six Sass entrypoints and57 templates compiled. Local publisher browser flow passed1440/768/390/320 with four categories, emoji insertion, footer publish hit target and no horizontal overflow. Native isolated testing and route matrix outcomes will be recorded below.

## Audit method and limits
Check guest/member routes at1440/768/390/320, including error/empty/private onboarding states. Inspect horizontal overflow, actual visible route, JavaScript errors and selected interactive flows. Keyboard-sized viewport is a layout simulation, not physical-device keyboard certification. Passing geometry does not certify every data length, native admin setting, upload format or all authentication providers. Do not label unimplemented company evaluation or anonymous posting as passed.

## Initial full route audit
39 route/state variants ×1440/768/390/320 =156 checks across guest, authenticated and administrator contexts. All successful routes returned200; intentional missing-page route returned404. Guest search redirects to login and was recorded as an authentication state; authenticated search was tested separately. One failure found: `/me/topics` overflow at320 due to a native nonwrapping filter row. Fix: wrap the profile list header and keep filter labels intact; verification of all related profile variants follows.

Other initial routes showed no document horizontal overflow or uncaught page errors. Routes include home/hot/categories/category/topic/company directory/guide/login/register/reset/search/404, people recommendation/new/coworker/following, own profile/posts/topics/bookmarks/edit/settings/followers/following/uploads, another profile, private messages/notifications, career/email verification/evidence, plugin admin pages and core admin dashboard/users/categories. These are layout checks under the cloned fixture state, not claims that every business action or private onboarding state has been exercised.

Native functional flow passed: feed comment click opens a small root form without native quick-reply hash jump; root POST has no toPid; body-only publication succeeded; native category selector is beside identity; extra tools toggle; title/tags hidden by default; footer action usable at1440/768/390 and320×568. Final compact-height and icon/category refinements are pending final isolated rebuild below.

## Audit corrections and refinements
- Profile topics filter header wraps at phone widths; button labels stay on one line instead of increasing document width. Scope includes equivalent profile list controls.
- Root reply recipient label is generic rather than the first visible reply author's name on paginated topics. Transient feed reply intent clears on navigation completion.
- Publisher reduced to420px maximum (72dvh on mobile, capped by visualViewport) with80px minimum editing area. Image and emoji tools sit together; neutral stroke icons replace duplicate emoji/tool glyphs.
- Native category menu was inspected: exactly existing IDs5–8, still filtered by native topics:create permission. Redundant category-search field and selected-category colour badge hidden; no free-form topic creation or new anonymous category.
- Parent-context disclosure uses the longest existing safe author-link label, avoiding an avatar initial being mistaken for the recipient name.

The upload hook remains native; full media writes are not exercised because cloned preview uploads are read-only to protect production files. The prototype alone accepts local blob images. Exact physical mobile keyboard behavior remains a device-test limitation; the native composer is exercised in a320×568 layout.

Popup review caught a second layout risk beyond static-page geometry: the native category bottom sheet could extend under the mobile publisher. The composer now projects its existing native permission-filtered category rows into a native HTML select; changing it dispatches the original category-row action, so the original composer category state and server validation remain authoritative. The original selector remains as a fallback until its allowed rows have loaded. Emoji picker is a floating panel over the editor body rather than an extra row that can push Send out of the compact sheet. Final functional checks include selecting category8, publishing to it, and emoji-open send-button bounds at each tested size.

Profile/search extras were rechecked after the wrapping fix:24 checks, zero document overflow or uncaught page errors, including the previously failing320px topics page. Guest48 and member84 results remain as the initial broader coverage; the final pass targets changed profile and composer/interaction surfaces rather than claiming an exhaustive retest of every business state. Raw initial/final audit JSON retained under ignored artifacts/responsive-review for this workspace.

## Final targeted acceptance
The isolated native rebuild passed the final browser flow at1440×950,768×950,390×850 and320×568. The native category list is loaded through its existing lazy dropdown handler, without opening a second visual popup. All four allowed options appeared; selecting category8 and publishing persisted cid8. Emoji insertion and the unobstructed Send target passed with the picker open at all four sizes. Feed-to-detail root comment submission passed with no hash jump and no toPid. No production write was made. Final390 screenshot: artifacts/responsive-review/native-publisher-390.png.

Final automated result:99/99 tests, Sass/template build, JavaScript syntax and diff whitespace checks passed. Local4175 returned HTTP200. This closed local and isolated acceptance before the separately approved production release below.

## Production release — 2026-10-24
Owner explicitly approved deploying the local version. Pre-switch database dump was validated with pg_restore --list; config/compose backups are in /home/ucloud/vvjob-backups/20261024-slim-editor (restricted permissions). Tested plugin was byte-compared against isolated source. Release: /home/ucloud/vvjob-simple-comments-release/extensions/nodebb-plugin-vvjob; dedicated production build: /home/ucloud/vvjob-slim-editor-build. Only vvjob-v1-web-1 was recreated; database, uploads and unrelated services were retained. No preview records were imported. Initial copy stopped before switching mounts because container font symlinks are unresolved on the host; copying with symlinks preserved resolved this without modifying runtime libraries.

Rollback: restore the backed-up compose.json to /home/ucloud/vvjob-v1-runtime/compose.json, then docker compose --project-directory /home/ucloud/vvjob-v1-runtime -p vvjob-v1 -f /home/ucloud/vvjob-v1-runtime/compose.json up -d --no-deps --force-recreate web. Previous release/build remain available. No schema migration or content rewrite requires a database restore for this UI rollback.

Production read-only acceptance: home/hot/topic/people gate/company pages passed at1440/768/390/320, with no horizontal overflow. Topic shows compact discussion options and no visible native quick-reply panel. Actual page uses /assets/nodebb.min.js; curl fetched that bundle and confirmed the new compact-category loader and inline-root reply markers. The initial runner incorrectly checked /assets/client.js; corrected the resource path. A subsequent runner completed all20 route checks but stalled in its final asset/screenshot phase and was stopped; resource validation was performed independently by curl. Authenticated mutations were tested on the isolated clone only. No production test posts or accounts created.99 tests/build/diff checks passed before release. Physical device keyboard and production media writes remain untested.
