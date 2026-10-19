# Avatars and emotion reactions — 2026-10-19

## Behavior

Feed composers, authors and inline replies use the same native user picture or letter/color fields as the NodeBB header. The current user's avatar follows header changes and Ajax navigation. Other authors are refreshed from native user records on page load, not from demo assumptions or cached profile snippets.

The main feed/comment/topic action opens seven Vietnamese emotion choices: Thích, Yêu thích, Quan tâm, Haha, Wow, Buồn and Phẫn nộ. Desktop hover or click, mobile tap or long press, and keyboard activation work. Moving a touch cancels a long press; Escape restores focus. Selection can be changed or explicitly removed. Own posts and comments can receive emotions.

## Persistence and compatibility

GET/PUT `/api/vvjob/posts/:pid/reaction` returns aggregate counts and the requesting member's selection, never voter identities. PUT accepts `{type}` with a catalog value or `none`. Native login, CSRF and category privileges apply; deleted, scheduled, hidden/blocked posts and banned accounts are rejected. Mutations are limited to 60/minute/member.

Emotions use native database objects `vvjob:reactions:post:<pid>` with atomic per-member fields. A per-member sorted set supports deletion cleanup. Repeating PUT is idempotent; switching never increments a separate optimistic counter. Deleted accounts are filtered from aggregates.

Existing native positive votes contribute one default like each; a member's explicit emotion replaces their legacy like in this UI. Removing it stores a `none` override. Native reputation/upvote records are retained, not migrated or modified. The topic's secondary “Điểm” disclosure preserves native reputation voting; it keeps native self-vote restrictions. Emotion notifications are not added. NodeBB core is unchanged. Native middleware may normalize authenticated API cache control to `private`.

## Validation before rollout

- 77 automated tests pass, including owner reactions, retries, switching/removal, legacy deduplication, distinct concurrent voters, account cleanup, deleted accounts, privilege checks, invalid payloads, banned/guest writes and throttling.
- Five Sass entrypoints and 54 templates compile; full native NodeBB 4.6.1 build succeeds on the pinned runtime image.
- Isolated PostgreSQL copy: two test members exercise persistence after reload, self reactions, inline comments and topic shared state/removal. The native header letter/color and a controlled header photo DOM change synchronize to composer/authors. This photo test is not an upload integration test.
- Chrome checks at 1440/390/320 pixels: picker remains inside viewport, no horizontal overflow or page errors, Escape, keyboard arrows/focus return, touch long press and movement cancellation pass. Guest login redirect and missing-CSRF mutation denial pass. Test mutations never target production.

## Deployment and rollback

Authorized rollout uses a fresh `dev` release checkout at `/home/ucloud/vvjob-reactions-release`, byte-compared with tested plugin source, and `/home/ucloud/vvjob-reactions-build`. Only the VVJOB web container's plugin/build mounts change; other services are retained.

Before switching, protect a database dump and runtime Compose/config copies under `/home/ucloud/vvjob-backups/20261019-reactions` with directory 0700/files 0600. Verify the dump's archive listing. Roll back by restoring the previous plugin/build mounts from that Compose copy and recreating only `web`. Preserve new database writes; code rollback does not require restoring the database. Retain `/home/ucloud/vvjob-conversations-release` and `/home/ucloud/vvjob-conversations-build` for this purpose.

After acceptance remove the isolated preview container, cloned database and private preview configuration. Keep production backups and active/rollback release/build directories. Production acceptance is recorded below after rollout.
