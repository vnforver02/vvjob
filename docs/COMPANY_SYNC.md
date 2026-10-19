# Company catalog synchronization — 2026-10-19

## Sources and scope

This update adds factual Vietnamese company references from public [Vietnam Report / VNR500](https://vnr500.vn/Charts/Index?chartId=1&year=2025) company directories for 2025 and supplementary 2024 entries. Source links and source year remain visible on cards; the source footer requests attribution to Vietnam Report. This is a company lookup directory, not a reproduced ranking, recruitment database, employer account claim or employment certification. No descriptions, executives, telephone numbers, email addresses, complete street addresses, reviews, CVs or member data are imported.

Names, English/ticker aliases, directory-listed website references, legal tax identifiers, normalized broad industry/city and source URLs are retained. Source retrieval date is not an assertion that the company is currently active or that website/domain ownership was independently verified. Listed HTTP website links are normalized to HTTPS, so some external sites may be unavailable. When no website is listed, leave website/domain empty and show a source link; never substitute the directory domain as a company's official site.

Logos are source-associated external references from the same company's public source record. The collector checks bounded image bytes/signatures and records SHA-256/byte length/date. Generic default/placeholder images are excluded. No guessed logo API, fabricated brand artwork, API keys or copied image archive is used. Logo URLs remain external and can change; a failed image falls back to the building icon. The website should not infer affiliation or enterprise verification from a logo. Manually reviewed logos are preserved. Corporate trademarks belong to their owners.

## Reproduce and review

```sh
python3 scripts/sync-company-sources.py --year 2025 --output /tmp/companies-2025.json
python3 scripts/sync-company-sources.py --year 2024 --exclude /tmp/companies-2025.json --output /tmp/companies-2024.json
python3 scripts/prepare-company-catalog.py /tmp/companies-2025.json /tmp/companies-2024.json
npm test
npm run build
```

Collection is manual, public/unauthenticated, bounded to three workers with timeouts and per-request byte limits; no challenge bypass is implemented. Public HTML is cached temporarily under `/tmp/vvjob-company-source-cache`; remove this transient cache after review. Review the resulting data diff and representative actual images before import. Prepared data are split into JSON parts loaded by `data/companies-vnr500.js`. The preparation command fails unless there are at least 500 distinct source entities and 500 non-placeholder checked logo references. Deduplication uses source ID, normalized name and legal tax ID; shared domains do not merge distinct subsidiaries. Explicit mappings retain existing FPT, ACB, VNPT, Masan, Hòa Phát and Vietcombank IDs and existing career bindings.

The generic administrator JSON importer retains its 200-row limit and ignores logo approval flags. The administrator's built-in catalog button separately previews/synchronizes the checked-in catalog. Whole input validation precedes writes, stable IDs make retries safe, hidden/merged/rejected companies remain untouched, manually reviewed logos and employer claims are retained. Missing tax/city/industry fields on mapped legacy records may be filled while retaining their existing names/websites and recording the source reference. Source-linked logos have `source-linked` status, not administrator-reviewed status. A transient missing logo does not erase a prior sourced image. Administrator authorization and native CSRF protection are unchanged. Plugin startup never silently imports catalog data.

The production operator script defaults to dry run. Inside the pinned NodeBB container, mount `scripts/import-company-catalog.js` read-only as `/opt/import-company-catalog.js` and invoke:

```sh
node /opt/import-company-catalog.js --config=/opt/config/config.json --expected-database=vvjob_companycatalog_preview
# Apply to the isolated clone after inspecting preview:
node /opt/import-company-catalog.js --config=/opt/config/config.json --expected-database=vvjob_companycatalog_preview --apply
# Production requires both explicit write flags and a prior verified backup:
node /opt/import-company-catalog.js --config=/opt/config/config.json --expected-database=nodebb --apply --allow-production
```

Reviewer UID 0 denotes the release operator; no member is impersonated. The source records are approved for directory selection only, with unclaimed status. No work-email policy, verified badge, career identity or evidence record is granted by import. Company selection stays name-only, with source-backed logos in suggestions and a safe fallback; additional filters are not added to onboarding.

## Deployment and rollback

Use the full native NodeBB build with the pinned NodeBB 4.6.1/Harmony 2.1.21 image and a cloned PostgreSQL database, disabled jobs/outgoing delivery and read-only production uploads. Source/build locations for this rollout are `/home/ucloud/vvjob-companycatalog-release` and `/home/ucloud/vvjob-companycatalog-build`; protected pre-update Compose/config/dump backup is `/home/ucloud/vvjob-backups/20261019-companycatalog` (directory 0700/files 0600). Verify the dump before code switch or production data import. Only recreate the VVJOB web service.

Previous source/build `/home/ucloud/vvjob-reactions-release` and `/home/ucloud/vvjob-reactions-build` remain available. Restore the previous plugin/build mounts from the Compose snapshot and recreate only web for a UI rollback. Newly imported catalog records are additive; keep them inert or hide only affected catalog IDs if a data rollback is necessary. Do not restore the full database over newer posts, accounts, careers or reactions. Existing six mapped legacy IDs must not be deleted. Preserve current writes and reconcile specific company fields from the protected dump if needed. Imports are resumable, not one cross-record transaction.

Validation counts, production acceptance and cleanup are recorded below once complete.

## Prepared catalog and local verification

The reviewed source snapshot contains 787 distinct source companies: 685 from 2025 and 102 additional 2024 references. There are 502 non-placeholder logo references, 735 directory-listed websites, 687 normalized cities and 691 broad industry classifications. 165 repeated source records from the two collections were discarded. Six source entities map to existing seed IDs, so a production database containing the original eight companies receives 781 new companies and totals 789.

85 automated tests pass; five Sass entrypoints and 54 templates compile. Tests cover the complete 787-entry source/URL/logo schema and minimum counts, dry-run/no-partial-validation writes, stable imports, source/name/tax uniqueness, claim isolation, preserved manual logos/moderation, empty website semantics, and retention of existing images on a missing-logo refresh.

## Isolated acceptance

A production PostgreSQL copy receives 781 new records, retaining all eight originals and totaling 789 companies, 502 logos and 737 website references. Repeating sync adds zero records. Existing reviewed FPT/ACB logos are retained; four other mapped legacy companies receive source-linked logos. The six mapped records receive missing tax references without changing their identity or employment links.

Chrome exercises all 33 API pages with unique IDs, tax/name/accent-insensitive search, existing `hoa-phat` resolution without a duplicate source ID, visible Vietnam Report attribution, actual loaded logo images and no horizontal overflow at 1440/390/320px. Native member company lookup includes logo suggestions, keyboard selection, private save/reload and successful selection of a new company. Built-in catalog preview reports zero additions on retry. Missing-CSRF import and guest career access are denied; public records exclude reviewer/submitter IDs. No browser page errors occur. A final visual correction anchors each logo over its fallback icon even next to long company names. All test members/career writes are confined to the cloned database.
