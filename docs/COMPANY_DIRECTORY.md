# VVJOB 0.7 — company directory and career profiles

## Delivered behavior

- `/vvjob/companies`: public, paginated company directory with Vietnamese accent-insensitive search across names, aliases and domains. Only approved records are returned. Public API fields exclude submitter and reviewer IDs.
- `/vvjob/career`: logged-in member's optional career form, company picker, job status, position, industry and city. All career fields are private by default. The member can explicitly publish them on their profile, undo publication, clear a company, or skip the form. No other UID is accepted from the browser.
- Native `filter:register.complete` sends new registrations to the optional career page. Native account creation, email/consent completion, approval and login remain in NodeBB. Existing members use their profile's career link. Native profile-menu and user-data hooks add the link/card without core changes.
- Members may suggest a company using its name and HTTPS website. Proposals stay pending until an administrator approves them. A five-per-day submission limit reduces spam.
- `/vvjob/company-admin`: administrators alone can preview/import JSON, approve, reject/hide, merge duplicate records and review logo links. The career page links administrators to this screen. API checks administrator membership again; hiding the button is not the authorization control. Mutations require a logged-in session and native CSRF protection.
- Merged companies resolve to their approved target for existing career profiles. Website domains do not identify legal entities uniquely and are never automatically treated as employee verification domains.
- Deleting an account through NodeBB deletes its separate career record.

## Data and logos

`extensions/nodebb-plugin-vvjob/data/companies.json` starts with **8** manually checked official company/brand references: FPT, VNG, MoMo, Vietcombank, VNPT, ACB, Hòa Phát and Masan. These are directory entries, not claimed enterprise accounts, legal-registration verification or employee verification. The initial reviewed set is deliberately smaller than the proposed 100–200 company rollout; expanding it requires checking sources. No TopCV descriptions, CVs, reviews or image library are copied.

Each record stores a stable ID, name, aliases, website/domain, industry, optional city, source URL and check date. IDs distinguish brands/entities even when domains overlap. Existing IDs are skipped on import, preserving moderation decisions. A batch is validated before writes; imports default to dry run and accept at most 200 rows. Database writes are resumable by repeating the same IDs, not a single cross-record transaction. Search currently scans at most 5000 indexed records per request; replace this with an indexed search service before growing beyond that limit.

Run `node scripts/collect-company-logos.js` from the repository root to collect candidate image URLs from the reviewed seed homepages. It downloads only bounded homepage HTML, does not follow redirects, does not download images and does not publish the candidates. Unavailable sites retain placeholders. The generated JSON can be checked and imported; candidates appear only in the administrator screen. Review the exact image, its official source and applicable usage conditions, then save its HTTPS URL and source in the logo review form. The member-facing card uses a fallback icon for missing/broken images. Images use no-referrer and are loaded from the recorded external host, so availability still depends on that host. No third-party logo API account or key is required in this release. A future licensed provider or enterprise upload can replace these links.

Import example:

```json
[
  {
    "id": "example-vietnam",
    "name": "Example Vietnam",
    "aliases": "Example VN",
    "website": "https://example.com/",
    "industry": "Công nghệ",
    "city": "Hà Nội",
    "source": "https://example.com/about",
    "checkedAt": "2026-10-18"
  }
]
```

## Identity boundaries

Every career card says **Thông tin tự khai · Chưa xác minh nghề nghiệp**. Directory approval, company claim and employment verification are separate concepts. This release does not collect work emails, documents, government IDs, salaries or certificates, does not open enterprise claims and does not grant any verified badge. Production SMTP is still a separate prerequisite for future employer-email verification. Anonymous posting remains unavailable.

Private career records use `vvjob:career:<uid>`, not public user fields. They are excluded from the native user API serialization unless the member has opted in and the profile-data hook is running for that viewer. Hiding company data hides all career data from other users, including administrators viewing the ordinary profile. An administrator's direct database access is outside that UI privacy guarantee.

## Build, verify and deploy

Run `npm test && npm run build`. Full integration must use NodeBB 4.6.1 / Harmony 2.1.21 with PostgreSQL, a cloned configuration/database/uploads and disabled outgoing mail/jobs. Verify registration redirect, skip, picker, save/reload, private/public visibility via another user and guest, proposal privacy, administrator denial, missing CSRF denial, import preview/idempotency, review/merge and responsive layouts. Never populate test users in production.

Build into separate assets and switch only VVJOB plugin/build mounts after checks. Back up private Compose and the database before importing the starter catalog in production. Import explicitly from the administrator form; plugin activation never silently writes catalog data. UI rollback restores the previous plugin/build mounts. New `vvjob:*` objects are additive and can remain inert during rollback; do not restore the entire live database over posts created after deployment just to roll back this feature.
