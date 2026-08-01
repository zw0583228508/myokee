---
name: Karaoke-app feature flags
description: How social/gamification features are hidden (not deleted) in the karaoke-app frontend
---

The rule: optional product areas (party, challenges, socialFeed, leaderboard, gamification, vocalCoach) are toggled in `artifacts/karaoke-app/src/config/features.ts`. All code is intact — flipping a flag to `true` restores routes (App.tsx), nav links (Navbar), home/lang-landing hero chips + feature cards (index-based: cards 0-2 and chips 1-2 are the social ones), SEO feature pages (feature-seo.ts filter), prerendered SEO pages (scripts/prerender.ts HIDDEN_SEO_PAGES), and commented-out blocks in public/sitemap.xml.

**Why:** user asked to hide all social features reversibly (Aug 2026), keeping only karaoke creation/singing/recording.

**How to apply:** to restore a feature, flip its flag AND un-comment its sitemap.xml entries. Backend routes were intentionally left running.
