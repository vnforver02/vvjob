# Workplace conversations and image feed

This refinement adapts the supplied mobile reference to VVJOB's independent Vietnamese/blue interface. The native NodeBB account, composer, moderation, report, notification, chat and post APIs remain in use; no NodeBB core files are changed.

## Behavior

- Feed cards show the original post's parsed images immediately: one-image thumbnails, two/four-image layouts or a grid capped at nine thumbnails. Extra-image counts expand the original post in place. Thumbnail viewing uses a keyboard-accessible native dialog with previous/next, Escape and close controls. Emoji images are excluded from the gallery; executable/data/protocol-relative URLs and URL credentials are not accepted. Parsed native content and native viewer/block filtering remain the source.
- Share, comment and real thumbs-up controls are evenly arranged with icon/count presentation. Selected likes use VVJOB blue and still use native upvote/unvote permissions and persistence.
- Inline comments use a white list, relative timestamps and a small author label. Targeted replies retain the compact local form. The first two loaded nested replies are visible; a disclosure button expands/collapses additional loaded replies. The existing native-position pagination loads further comments. Publishing a new nested reply reveals it, while cancellation/failure preserves the draft.
- Career captions are shown only to signed-in viewers, only for explicitly public careers. Private company/position fields, company bindings and raw user records are never added to the feed. Real evidence/email validity determines real badges; simulated badges and demo labels remain distinct. Dynamic feed responses are explicitly private. NodeBB normalizes authenticated render/API responses to `Cache-Control: private`; anonymous read responses additionally request `no-store`. Shared caches must not cache these responses.
- The hot board keeps its fifteen-title maximum and period/community filters. Up to six of those same permission-filtered discussions appear below as “Đang được bàn luận”. A highlighted comment is shown only when the native vote-sorted, viewer-filtered reply data contains a visible reply with an actual positive upvote count. No synthetic topics, reactions or heat scores are inserted.
- On mobile feed routes, the header stays available while scrolling; beyond the threshold, it becomes a smaller fixed navigation bar with a search icon. A spacer and hysteresis avoid scroll jumps. Other routes retain their existing shell. Native topic replies also use a lighter list presentation, retaining native controls and menu overflow.

## Validation

71 repository tests pass, covering existing verification/privacy contracts, author privacy, parsed-image URL selection, real reply highlights, and distinct control IDs for ranked and ongoing cards. Five Sass entry points and 53 templates compile. The final full NodeBB 4.6.1 image build, including webpack, passed in 20.791 seconds.

Isolated browser coverage includes four-image viewing and keyboard navigation; more-than-nine images expanding to the original; public career captions with no fabricated certification; guest career privacy; native thumbs-up persistence; two-reply disclosure and newly sent reply reveal; fifteen ranked titles plus six discussion cards and real highlight data; unique control IDs; desktop/390/320 overflow checks; compact scrolling and restoration; and native topic rendering. All QA accounts, topics, images and replies are confined to the cloned test database. The gallery fixture uses already-existing illustration assets, without altering production uploads.

## Deployment and rollback

The tested plugin is compared byte-for-byte with the `dev` release before cutover. Current release mount: `/home/ucloud/vvjob-conversations-release/extensions/nodebb-plugin-vvjob`; assets: `/home/ucloud/vvjob-conversations-build`. Private runtime Compose/config remain in `/home/ucloud/vvjob-v1-runtime`.

Before switching only the plugin/build mounts, save Compose/config and a PostgreSQL dump verified with `pg_restore --list` under `/home/ucloud/vvjob-backups/20261019-conversations`. Recreate only VVJOB `web`. This release does not modify company/verification records, demo accounts or the previously configured native length policy.

For UI rollback, restore the saved Compose file and recreate only VVJOB `web`. Previous plugin/build paths remain `/home/ucloud/vvjob-social-refine-release` and `/home/ucloud/vvjob-social-refine-build`. Keep the current database and legitimate new writes; do not restore the full database merely to roll back UI. Keep backups and previous assets until acceptance.

## Production acceptance — 2026-10-19

Code release `9799a2368a89db2b28a0dce209eaefefea8100b4` is deployed at https://bbs.cloudverify.vn/. The plugin file set and bytes matched the tested source before switching mounts. The private backup was verified and only `vvjob-v1-web-1` was recreated. Other services, the production database container, uploads, existing members and verification records remain intact.

Read-only production browser checks passed at 1440/390/320 pixels: white comment presentation, native thumbs controls and login gating, fifteen-title maximum plus actual ongoing cards, distinct control IDs, original content expansion, all four ranking filters, mobile compact scroll/restoration, private cache headers, no guest career captions, restricted guest profile APIs and the existing one-character reply policy. No JavaScript page errors were observed. All gallery and write interactions were tested in the isolated clone; production acceptance created no test accounts, posts, votes or messages.

After acceptance, the isolated preview container, cloned database, temporary configuration/dump and fixture/archive files were removed. Live release/build, the protected backup and previous UI assets are retained for rollback.
