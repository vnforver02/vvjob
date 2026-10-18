# VVJOB 0.8 — structured selectors and optional onboarding

## Interaction and scope

Company directory combines keyword, industry, province/city and A–Z/recent sorting. Filters use GET parameters, persist across refresh and pagination and can be cleared together. Matching happens before pagination in the model, so the public JSON API and HTML page use the same rules. Company picker has independent optional industry/location filters; these are not inferred from the member's own workplace location or profession. Unknown company locations remain unknown and have their own filter. Existing company records are normalized when read without a database migration.

Career fields use searchable single-select controls for work status, job family, specific position, seniority, industry and province/city. Search supports Vietnamese accents, unaccented text and curated English aliases. Job family narrows the position options and changing it clears an incompatible selected role. Native select elements remain the submitted value; enhanced comboboxes support arrows, Enter, Escape, labels and listbox semantics. Nonstandard roles/locations remain possible through an explicit Other option and an additional text field. Old free-text values are preserved as Other instead of being deleted or silently reassigned. Structured IDs are validated on the server; role/family mismatches are rejected. This is a VVJOB-owned starter taxonomy, not an exported proprietary Maimai/TopCV catalog.

The taxonomy contains 23 industries, 15 job families, 82 positions, 9 seniority choices and 34 current Vietnamese provinces/cities. Province names follow the [government's published 34-province list](https://baochinhphu.vn/bang-danh-muc-va-ma-so-cua-34-tinh-thanh-moi-3321-don-vi-hanh-chinh-cap-xa-moi-102250704153652947.htm). IDs are VVJOB slugs, not government administrative codes. Province-level only; no outdated district picker is introduced. Remote/overseas/nonstandard locations can use Other. All selections are optional.

Reference patterns: [TopCV company search](https://www.topcv.vn/cong-ty/tim-kiem?keyword=c%C3%B4ng+ty), [TopCV's public filter guide](https://faq.topcv.vn/faqs/find-job-and-apply/quy-trinh-ung-tuyen-tren-topcv.html) and [Maimai's separate certification flow](https://maimai.cn/static/html/certification_protocol.html). Recruitment, applications and CVs are excluded from VVJOB's current scope.

## Registration correction

Supersedes 0.7's automatic career-page redirect. Registration retains NodeBB's original destination. The registration-complete hook only sets a nonessential reminder flag; a failed reminder write does not fail registration. New members can immediately read, post or reply using native permissions. The feed shows a compact, dismissible career reminder only when the flag is set and no completed/skipped career record exists. Dismissal persists across refresh. Existing members are not forced through onboarding. Saving or skipping suppresses the reminder. The full form remains under the profile's career link.

Employment verification is a separate, currently unavailable capability. Filling fields grants no badge, never implies verified employment and does not unlock anonymous posting. This release does not add a registration requirement, collect verification documents or alter native email/consent/account permissions. Private career data is not used to expose searchable employee lists.

## Verification and release

Run `npm test && npm run build`, then a full NodeBB build and browser checks in a private database/config/uploads clone. Check combination filters, empty/unknown results, URL persistence, dropdown keyboard operation and phone layout, linked family/role reset, structured save/reload, Other and legacy preservation, private/public profile behavior, and registration-to-feed plus reminder dismissal. Back up Compose before switching plugin/build mounts; no production career/company migration is required. Old mounts can be restored for visual rollback. Existing 0.7 career keys and flags remain additive during rollback.
