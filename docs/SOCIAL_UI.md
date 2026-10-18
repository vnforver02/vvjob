# Compact social feed and 15-title discussion ranking

This release replaces the repeated desktop home link with a small community heading, keeps useful community/personal navigation, and uses the current member's native picture in the feed composer. The prompt itself opens the native composer; the duplicate “Viết bài” toolbar is removed. Anonymous visitors retain a neutral avatar and native login routing.

Feed titles, excerpts and the chevron expand the original post in place through `/api/vvjob/topics/:tid/content`; the heading/chevron can collapse it again. This endpoint rechecks native topic/category privileges, deleted/scheduled/disabled state and the viewer's block filter on every read, uses native parsed content, returns a small explicit projection, and sets private/no-store. Previews use the original post rather than the last reply. Full discussion links remain available for native moderation/report tools.

Interaction controls use icon buttons with Vietnamese accessible names. Heart buttons use real NodeBB upvotes, persist through reload and can be undone. They do not create a parallel reaction/reputation system or fictitious totals. Vote reads are permission checked and omit voter identities; writes retain native authentication, CSRF, self-vote protection, permissions and rate rules. Comment forms retain six Unicode emoji shortcuts. The share icon opens the native share sheet or copies the real permalink.

A targeted reply moves the same draft-preserving form below the selected comment. Replies appear in a compact nested list when their parent is loaded; otherwise the existing parent label remains until pagination loads the parent. Nesting is visually flattened to keep mobile replies readable. Cancellation restores the main comment form. Submission continues to use the native topic API and moderation queue.

The frontend no longer imposes a comment character counter, minimum or maximum. Empty comments remain disallowed. `scripts/configure-social.js --apply` changes the shared native post/comment minimum to one character and raises its infrastructure ceiling to at least 1,000,000 characters; HTTP request size, anti-spam, permissions and moderation limits still apply. This is a deliberate shared NodeBB setting, not a core patch. Without `--apply`, the script reports settings without changing them. Run inside the configured NodeBB image with `NODEBB_CONFIG=/opt/config/config.json` and the repository mounted read-only.

The hot board requests native ranks 1–15 for the selected time/community, independent of feed pagination or member page-size preferences. It shows only ranked titles until a title is expanded. “Đang được bàn luận” also identifies the home sidebar's title-only discussions. With fewer than 15 accessible discussions it displays the actual count; no filler topics or invented heat scores are added.

## Validation

- 66 repository tests pass, including private/deleted/scheduled/blocked content, vote projections, original previews, native viewer avatars and top-15 selection.
- Five Sass entry points and 51 owned templates compile locally.
- Full NodeBB 4.6.1 production-image build, including webpack, passed in 20.949 seconds.
- Isolated browser checks passed: original body expansion without navigation, current avatar, one-character and emoji comments, compact targeted replies, native like persistence/unlike, title-only top 15 and expansion, guest login gating, and layouts at 1440/390/320 pixels without horizontal overflow.

The additional isolated check accepted a 39,000-character comment, retained the draft after reply cancellation and transport failure, and confirmed that previews contain text without exposed HTML tags.

## Rollout and rollback

Source: `/home/ucloud/vvjob-social-refine-release/extensions/nodebb-plugin-vvjob` (read-only mount). Assets: `/home/ucloud/vvjob-social-refine-build`. The active Compose/config remain under `/home/ucloud/vvjob-v1-runtime` and are private.

Before rollout, back up the preceding Compose/config and a verified PostgreSQL dump under `/home/ucloud/vvjob-backups/20261019-social-refine`. Record the previous native length settings before applying the explicit configuration script. Compare the release plugin byte-for-byte against the isolated tested source, switch only the VVJOB plugin/build mounts, and recreate only the `web` service.

For UI rollback, restore the saved Compose file and recreate only VVJOB `web`. Keep the current database and its legitimate new writes. The prior plugin/build remain at `/home/ucloud/vvjob-interactions-release` and `/home/ucloud/vvjob-interactions-build`. If the length policy also needs reverting, restore only the two saved settings through native configuration and restart web; do not restore the entire database for a UI rollback. Keep guest profile restrictions, demo labels and real verification semantics intact.

## Production acceptance — 2026-10-19

Code release `5c214d3ed9a93134930186d8e297c7e38d959cd9` is live at https://bbs.cloudverify.vn/. The release plugin matched the tested source byte-for-byte before cutover. The verified private backup and previous native settings were saved at the path above, the explicit length-policy configuration completed, and only `vvjob-v1-web-1` was recreated. Existing users, verification records, demo labels and other services were retained.

Read-only production browser acceptance passed at 1440/390/320 pixels: compact composer, icon actions, in-place original content and comments, collapsed title-only rankings, all four time-filter APIs capped at fifteen topics, guest profile/API restrictions and native login gating. The public native configuration reports a one-character minimum and a 1,000,000-character infrastructure ceiling. No JavaScript page errors were observed. Production acceptance created no test posts, likes or users.

The isolated preview container, cloned database and temporary private configuration/dump were removed after acceptance. The live release/build, previous assets and protected backup remain available.
