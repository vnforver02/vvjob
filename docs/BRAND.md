# VVJOB — Brand direction (V1)

## Approved positioning

VVJOB is a Vietnamese workplace social community inspired by workplace discussion networks, not a recruitment platform in V1.

**Brand promise:** Authentic workplace conversations and greater transparency.

**Official English slogan:** **Real Work. Real Talk.**

**Vietnamese supporting line:** **Chuyện thật nơi công sở.**

**Chinese interpretation:** 真实职场，真实交流。

**Core proposition (Chinese):** 真实，让职场更透明。

## V1 product priorities

- Workplace discussions and professional experiences
- Anonymous discussion with strong identity separation and privacy safeguards
- Company discussion and employee reviews
- Salary and benefits sharing
- Professional networks and community interactions

**Not in V1:** job listings, recruitment workflows, job applications or CV delivery.

## Visual and editorial direction

- VVJOB as the master brand, blue/white with clean, trustworthy, modern presentation
- Vietnamese-first UI; English is for the brand slogan
- Social feed first rather than a traditional category-index forum landing page
- Real conversations, transparent information and respectful discussion
- Do not use or revive “We Win Job” or explanations forcing VV initials to mean anything
- Keep NodeBB core upgradeable: implement branding and layout through theme/plugin extensions

## Responsible use of “Real”

“Real” is an aspiration, not a guarantee that every user submission is verified. Include reporting and moderation, distinguish verified facts from unverified experiences, avoid defamatory or doxxing content, and ensure pseudonymous posters cannot be identified through public APIs or notifications.

## Codex implementation brief

Implement V1 branding on the `dev` branch. Show VVJOB and **Real Work. Real Talk.** on the homepage hero and relevant meta/brand surfaces, with **Chuyện thật nơi công sở.** as the Vietnamese support line. Keep copy succinct, implement responsive desktop/mobile UI, verify NodeBB Harmony compatibility and avoid changing live deployments until tested and approved.
