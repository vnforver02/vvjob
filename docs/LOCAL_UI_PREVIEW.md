# Local composer, identity and people preview

Work remains local at the user's request: no automatic Git commit/push or production deployment. Run `npm run build`, then `node scripts/preview-ui.js --serve`; open http://127.0.0.1:4173. The server listens only on loopback and serves generated files from `artifacts/ui-preview`. This is an interactive visual preview of the owned templates with clearly labelled fictional profiles, not a running/authenticated local NodeBB backend. Preview publish/follow/tab interactions are illustrative and never send forum requests. Native runtime integration remains a pre-release check when publication is requested.

Composer: compact Threads-inspired header, native avatar/name synchronization, editable native title and body, lower attachment/formatting toolbar, bottom publish control and full-screen phone layout. Keep native post/discard/upload/formatting/category/form-CSRF hooks. Default preview uses the native preview module to close the split pane on composer open; the normal preview toggle remains. Edit mode omits the current-viewer identity so it does not mislabel an administrator editing another author's post. Vector verification seals are shared by feed/topic/profile/people surfaces, with separate blue real and violet simulated forms; no certification rules change.

People: recommend/new/coworkers/following plus retained followers. Recommendations omit already followed members. Weights: exact role 150, same professional family 100 (not double-counted with exact role), same public company industry 70, same public company 60, public career completeness 5, genuine valid verification 3. Recommendation explanations show up to two actual matching reasons. Simulated certification gives no boost. City/location never affects matching, scores or ordering. Unknown `other` industry/role IDs do not create a match. Profession matches use only explicitly public candidate careers; industry comes from the public employer directory, not private candidate fields. Own private career can inform one's own matching without being exposed to others.

Curated views consider at most 500 recent accounts, filter self/banned/both directions of blocks before public projection/scoring and paginate at 12 after filtering. New means joined within 30 days. Coworkers requires a saved company and public matching company profiles; otherwise show completion or empty states. Native follow/unfollow and username-only search remain. There are no invented mutual connections, contacts or employee verification grants.

93 automated tests and six Sass/56 template builds pass. Local Chrome visual/input checks cover 1440/390/320px and ensure no document horizontal overflow, editable composer fields and recommendation reasons/tabs. This is not a production NodeBB composer-post/upload integration claim. Production remains on the earlier deployed version.

## 2026-10-19 production rollout: editor and network

Deployed the local plugin archive without committing or pushing Git. Active source:
`/home/ucloud/vvjob-editor-network-release/extensions/nodebb-plugin-vvjob`;
active build: `/home/ucloud/vvjob-editor-network-build`.

Validation: 93 automated tests passed; all six Sass entrypoints and 56 templates
compiled locally; full NodeBB 4.6.1 build passed against an isolated database copy.
Browser integration verified the native composer identity, visible close/submit
controls at 1440/390/320 widths, and publishing using the new footer with a valid
category. Recommendation/new/coworker/following pages rendered without browser
errors; recommendation and new-member pages each returned 12 cards. Empty
coworker/following states were checked for the isolated test account. Tests did
not exhaustively exercise standalone compose, scheduling or draft cancellation.

Production read-only regression passed for responsive feeds, native Ajax comment
navigation and Back, replies, 15-title hot list, new SVG simulated badges,
deployed composer template and guest people access protection. Test accounts and
posts existed only in the database copy, not production.

Before switching only the VVJOB plugin/build mounts, compose/config and a
validated PostgreSQL archive were backed up to
`/home/ucloud/vvjob-backups/20261019-editor-network`. Prior
`vvjob-threads-badge-release` and `vvjob-threads-badge-build` remain available for
rollback. Restore the backed-up compose and recreate only the `web` service to
roll back the UI; this rollout did not alter production database records.

## Interaction polish (local, not yet deployed)

Replaced the angular real-verification seal with a compact circular blue check;
simulation remains distinct and explicitly labelled. Demo labels remain readable
but no longer use a competing filled pill in feed/topic author rows. Comment and
share actions now use matching vector icons, 44px targets, focus/pressed/hover
feedback and reduced-motion support. Content expansion reuses the fetched content
within the current card, preserves text selection, displays busy feedback and
clears an earlier error after successful retry. Cached content is discarded with
the card on navigation, and is not shared across accounts or browser sessions.

Validation: 93 tests, six Sass entrypoints and 56 templates passed. Native runtime
integration and production rollout of this additional polish remain pending.

### Interaction polish deployed 2026-10-19

The additional polish above is now deployed. Active source/build:
`/home/ucloud/vvjob-interaction-polish-release/extensions/nodebb-plugin-vvjob`
and `/home/ucloud/vvjob-interaction-polish-build`. Verified backup:
`/home/ucloud/vvjob-backups/20261019-interaction-polish`. The previous
editor-network source/build remain intact for rollback.

93 tests and full native NodeBB build passed before cutover. Isolated and
production browser checks passed for matching vector actions, expansion cache
(one request across collapse/re-expand), explicit demo disclosure and no horizontal
overflow at 1440/390/320. Production regression also passed native topic Ajax
navigation/Back/replies, guest circle privacy and the 15-title hot board. No Git
commit/push or production content/identity changes were performed.

## 2026-10-20 content-first redesign (local)

Implemented a visible structural redesign in `_product.scss`, loaded by the
existing editor Sass entrypoint, plus owned feed/topic templates. Desktop uses a
single continuous white reading surface with quieter side navigation and a compact
stream heading. Mobile uses edge-to-edge conversation rows with avatar-aligned
content, consistent actions and no extra search form. Topic detail gains an
explicit return-to-feed link, a restrained title panel and a continuous reply
surface. The feed's misleading ellipsis/open-topic link is now an explicit diagonal
open arrow. Existing native component/action hooks remain intact. Demo disclosure
and certification status are unchanged.

Validation: 93 tests and full local Sass/template compilation passed. Browser
visual checks used production guest content with locally injected compiled styles
and matching new markup; no production state was changed. Feed and topic were
checked at 1440, 390 and 320px with no horizontal overflow. Screenshots are in
`artifacts/product-{feed,topic}-{1440,390,320}.png`. These are visual checks, not a
complete isolated native deployment or authenticated interaction test. This
redesign has not been deployed or committed/pushed to Git.

## 200-profile local final-appearance preview

Run `npm run preview:people`, then open http://127.0.0.1:4174.
The generator creates 200 unique Vietnamese-style names, 100 male and 100 female
fictional profiles, 200 owned SVG character portraits and 100 visual badge states.
Artifacts are written under `artifacts/local-people/`, including `users.json`.
Every source record retains `fixture.synthetic` and `verification: visual-only`.
Only this standalone localhost view omits per-card demo labels and renders final
badge appearance. A single LOCAL TEST notice identifies the entire preview.
It never imports NodeBB, accesses production, registers accounts, grants actual
verification or sends messages. Follow/search/paging/profile interactions are
browser-local simulations and reset on reload. The native templates and production
identity checks are unchanged. Browser checks passed 200 unique names, 100 badges,
12-card pagination, search, coworker tab, profile dialog and widths1440/390/320.

### Online standalone viewing copy — 2026-10-20

Published the 200-profile visual preview at
https://bbs.cloudverify.vn/assets/uploads/vvjob-preview-200-20261020/index.html
in a new directory under VVJOB uploads. The page's top bar identifies the whole
page as a synthetic preview; per-card names use the final appearance and 100
badges demonstrate the visual verified state. This standalone HTML does not write
accounts, follow relationships or verification records. Its mock interactions
reset on reload. No app restart, Git operation or database modification occurred.
Online browser checks passed paging, search, coworker filtering, profile dialog,
100 badge states and 1440/390/320 layouts. Screenshots: artifacts/online-people-*.png.

## Native database import and full-effect rollout — 2026-10-20

At explicit user request, imported batch `vvjob-fixture-200-20261020` into native
NodeBB production database: 200 accounts, 100 simulated badge states, 24 native
topics and 48 native replies. Existing 500 demo accounts and real users were not
overwritten or deleted. New usernames are natural synthetic names, without Demo
suffixes. Avatars reuse the 200 owned vector assets in the standalone preview
uploads directory. New post titles/bodies omit repeated fixture prefixes; a shared
site-wide test notice discloses synthetic profiles/posts and visual test badges.

Identity still returns `isDemo: true`, `previewFixture: true`, `verified: false`.
Real evidence/email verification records remain absent. Blue visual badges are
rendered from `simulatedVerified` only for this explicitly marked test batch;
recommendation scoring does not grant genuine-verification boosts. Accounts have
no passwords/email/session credentials and incoming chats are disabled. Native
follow, post, reply and profile functionality remains available to actual members;
fixture accounts do not autonomously reply. No fake likes/follows were seeded.

Importer: `scripts/seed-fixture-people.js`, requires explicit config, matching
expected database, --apply, and --allow-production for nodebb. It preflights all
names/company IDs, refuses collisions, retains batch maps, and resumes native
post/reply writes without duplication. Mapping keys:
`vvjob:demo:batch:vvjob-fixture-200-20261020` and
`vvjob:demo:posts:vvjob-fixture-200-20261020`.

94 tests and full native build passed. Isolated database rehearsal produced exact
counts and passed native guest feed/avatar, fixture badges, responsive widths and
topic replies; member checks passed directory, follow/unfollow and profile badge.
Active source/build: `/home/ucloud/vvjob-fixture-200-release` and
`/home/ucloud/vvjob-fixture-200-build`. Verified pre-import backup:
`/home/ucloud/vvjob-backups/20261020-fixture-200`. Previous source/build retained.
The content-first redesign above is included in this rollout. No Git commit/push.

Production read-only acceptance passed after import: native fixture feed and
avatars, blue visual test badges without per-person demo pills, shared test
notice, native topic replies and 1440/390/320 layouts. Avatar asset dependency:
keep uploads/vvjob-preview-200-20261020/avatars while imported accounts use it.

## 2026-10-21 hot-board and native private-message refresh

Removed the hot-board date-range navigation and range-dependent empty text. The
existing native ranking backend and old query links remain supported. Category
filtering, 15-title ranking, and ongoing discussions remain available.

Private messages retain NodeBB room creation, uploads, reactions, moderation,
read state, message search and send hooks. Updated native message-window template,
conversation list, active/unread styling, own/incoming message bubbles and empty
state. Added client-side all/unread and search filters for loaded private rooms;
these do not query all historical chats. Header ResizeObserver positions the chat
workspace below the real shared header and test notice. Native mobile room/back
behavior is retained. Search labels explicitly indicate the loaded-room scope.

Validation: 94 tests passed; six Sass entrypoints and 57 templates compiled with
available core imports. Full native NodeBB build passed in a cloned database.
Two temporary rooms in that clone verified native sending, all/unread switching,
loaded-room search and no-match state, mobile Back, and widths1440/390/320 with no
horizontal overflow. Hot-board date controls absent and 15 titles present. Native
email-warning toast was dismissed to allow the send-button test. No production
private messages were sent; clone test accounts/rooms are not deployed.

Deployed source/build: `/home/ucloud/vvjob-chat-ui-release` and
`/home/ucloud/vvjob-chat-ui-build`. Pre-update backup validated at
`/home/ucloud/vvjob-backups/20261021-chat-ui`; prior fixture-200 source/build kept.
Production read-only checks passed absent date controls, 15-title ranking, new
native chat templates and guest login gating. Existing production user/message
records were not modified and no Git commit/push was made.

## Source publication — 2026-10-22

This source snapshot includes all local changes through the chat-ui deployment:
content-first feed/topic layouts, native composer, verification/fixture badge
presentation, occupation/industry recommendation ranking, 200-profile fixture and
preview tools, hot-board date-control removal and native private-message refresh.
94 tests and the local six-entrypoint Sass / 57-template build passed before Git
publication. Generated artifacts, installed dependencies, runtime configuration,
credentials and database backups remain excluded by `.gitignore`.
