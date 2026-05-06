# Team Website — TODO

Outstanding items for the Webflow staging site (`go.teamrollouts.com`) before going live on `teamrollouts.com`.

## Pending — CRM lead capture
- Lifecycle Stage / Lead Status defaults — aligned with CRM canonical enums (`client/src/lib/statusConstants.ts`):
  - newsletter  → `subscriber` / `new`
  - contact     → `lead` / `new`
  - demo        → `sql` / `new`
  - onboarding  → `trial_customer` / `new`
  Lifecycle is upgrade-only (won't downgrade a trial_customer to subscriber on later submissions). All lead statuses start `new` so SDRs can progress through `in_progress` → `connected` etc. manually. Edit `LEAD_DEFAULTS` + `STAGE_RANK` in `server/api/routes/websiteLeads.ts` to change.
- [ ] Decide whether website leads should land in a review queue (pending SDR enrichment) or straight into a pipeline stage. Pipeline stage currently not touched on submission.
- [ ] Add Cloudflare Turnstile to demo + contact + onboarding forms once we see any spam volume. (Honeypot only for now.)
- [ ] Replace the temporary `simon@teamrollouts.com` notification address with a shared inbox or distribution list once we know who needs to see new leads. Configurable via `WEBSITE_LEADS_NOTIFY_EMAIL` env var on the CRM Render service.

## Pending — Tracking / SEO / launch
- [ ] **GTM** site-wide install (carries GA4, Meta Pixel) — pull existing container ID from old landing pages
- [ ] **Search Console** verification + sitemap submission
- [ ] **sitemap.xml + robots.txt**
- [ ] **301 redirect map** for legacy `*.html` URLs once we cut over to `teamrollouts.com`
- [ ] **OG images / favicons** per page review
- [ ] Cross-browser + mobile QA pass
- [ ] **404 + 500 pages** (Webflow-built)

## Pending — Content / pages
- [ ] Insights blog articles — kept on GH Pages for now (option A); migrate to per-page Webflow embeds later if we want them under `go.teamrollouts.com/insights/<slug>`
- [ ] Replace `data-hubspot-form` attributes on contact / demo / onboarding forms once CRM-only is verified working

## Done
- [x] Migrate every page to Webflow + GH Pages CDN architecture
- [x] Site-wide nav, footer, cookie consent
- [x] Site-wide form validation (brand pill style)
- [x] Universal embed pattern
- [x] Onboarding plan tier cleanup (drop Team tier, vertical stack)
- [x] All migrated pages serve correctly (no broken redirects)
- [x] All 4 site forms (contact / demo / onboarding / newsletter) POST to in-house CRM at admin.getteamnow.com
- [x] Email upsert on submit — match by lower(email), update existing or create new
- [x] Org auto-create from email domain when no match exists
- [x] Lifecycle stage + lead status set per form (placeholder values, see above)
- [x] Internal team notification email on every submission
