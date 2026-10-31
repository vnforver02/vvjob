# Interaction design preview — 2026-10-24

Run `npm run preview:interaction`, then open http://127.0.0.1:4175.

Design review only: independent HTML/CSS/JS under preview/interaction. Local loopback server uses the existing owned SVG portrait generator. No NodeBB database, real authentication, external APIs or production deployment. Data and verification visuals are synthetic, disclosed in the header and badge accessible text.

## Review flow
Read a feed post → open original in same column → expand child replies → reply to a named person in a compact form → return to feed. Includes local heart toggle, bookmark toggle and saved feed, copy preview URL, new body-only publication and cancel/reopen draft. Desktop is three columns; tablet two; mobile single column with five bottom controls. SVG stroke icons are shared. Child replies flatten to one level with explicit recipient. Keyboard activation, Escape/back, Ctrl/Cmd+Enter, dialog focus handling and reduced motion supported.

## What to assess
Content-first hierarchy, author/context placement, action spacing, reading rhythm, comment indentation, reply recipient clarity, composer size and contextual return. Production integration should reuse native privilege-filtered posts, composer and comment APIs rather than this in-memory model.

## Boundaries
New comments/posts/likes/bookmarks live only in current browser memory. New-post draft uses per-tab sessionStorage. Refresh resets fixture mutations. Recommended/new tabs share fixture order; popular sorts local likes. Relative timestamps are display fixtures. Company/profile/notification/report controls explicitly describe preview scope; they are not implemented services. Trend titles are sample navigation demonstrations, not a real ranking. No anonymous posting, real verification, media upload, identity review or company evaluation is implemented here.

## Validation
Browser walkthrough passed1440/768/390/320: no horizontal overflow, open detail, expand nested replies, targeted reply insertion, like/save state, back to feed, composer cancellation with draft restoration, body-only local publish, no JS page errors. JavaScript syntax checks passed. Screenshot review performed for desktop feed and mobile comment thread. This validates the design prototype, not production functionality.

Final check after layout refinement: mobile detail toolbar remains below the shared header while scrolling; returning restores feed scroll position within3px. Preview left running on local loopback4175 for review.

## Emoji refinement
Post and comment reaction buttons now open a compact six-choice tray (love, agree, laugh, surprise, empathy, applause). Switching reaction preserves one vote; selecting the same reaction removes it. This is local prototype state only. The publisher and reply form share48 text emoji across Thường dùng / Tâm trạng / Động viên / Ăn mừng, inserted at the cursor with draft updates. Escape dismisses the picker before leaving the detail or composer. Emoji tray is clamped to the viewport and dismisses on outside click and follows its anchor while scrolling. No external emoji asset or tracking service is used.
Emoji browser checks passed at1440/390/320: post and comment reaction selection, grouped reply/publisher emoji insertion, draft updates, no horizontal overflow, Escape closes the picker before the enclosing view. Mobile auto-scroll now repositions the reaction tray instead of dismissing it.

Reaction tray now opens on desktop pointer hover (also keyboard focus), with240ms leave grace to move into the tray. Quick click toggles the default heart. Touch holds430ms to choose a reaction; quick tap toggles heart. This supersedes the initial click-to-open interaction.

## Product-owner correction: people remain primary
Mobile navigation returns to home / people / publish / messages / profile. Companies remain a desktop destination. Prototype directory supports recommendation reasons, newest join order, same-company filtering and follow/unfollow with a following tab, all synthetic session state. Role/industry similarity is prioritised; city is not used. Production people-ranking and privacy/auth checks are preserved. Plugin mobile navigation source restores `/users` and `/chats`, native unread-chat count, and active destination detection. Source changes tested locally; no deployment in this preview follow-up. This overrides the earlier blueprint's company-in-bottom-bar choice per direct user direction.
