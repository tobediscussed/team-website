# SDR Funnel — Open Work Agent Brief

> **Purpose:** standalone execution brief for an agent picking up where Sprint Groups A–C left off. Read this, then read `CLAUDE.md` for conventions. The full audit trail lives in [`sdr-funnel-guiding-light.md`](sdr-funnel-guiding-light.md) and [`sdr-funnel-remaining-work-plan.md`](sdr-funnel-remaining-work-plan.md).
>
> **Date generated:** 2026-05-06
>
> **Stack:** TypeScript · Express · tRPC v11 · Neon PostgreSQL · React 19 · Tailwind CSS 3 · Wouter · TanStack Query v5 · Zod v3 · pnpm

---

## What Is Already Done — Do Not Rebuild

Sprint Groups A, B, and C are fully shipped. Key surfaces already exist:

| Already live | Where it lives |
|---|---|
| Bidirectional deal ↔ proposal ↔ org pipeline sync | `server/modules/deals/` |
| Universal deliverability gate (`assertCanSend`) | `server/lib/emailSender.ts` → `deliverabilityGate.ts` |
| Per-mailbox warm-up + send caps | `server/modules/sendingIdentities/sendingCapService.ts` |
| Org-level cross-contact suppression | `server/modules/compliance/` |
| Reply auto-classification (BullMQ worker) | `server/modules/inbox/replyClassificationService.ts` |
| ICP definitions + outcome feedback loop | `server/modules/icpDefinitions/` + `server/modules/icpOutcomes/` |
| Field change history UI | `FieldHistoryTable.tsx` on Contact + Org detail pages |
| BullMQ failure dashboard | Settings → Background Jobs |
| Cockpit composite-score prioritization | `server/modules/sdrCockpit/sdrCockpitScoringService.ts` |
| A/B testing on email steps | `server/modules/playbooks/playbookAbRouter.ts` |
| Deliverability dashboard | `server/modules/deliverability/deliverabilityRepository.ts` |
| Journey rules (6/11 triggers live) | `server/modules/journey/journeyEngine.ts` |
| `crm_activity_events` emitter + `emitActivity` | `server/lib/activityEmitter.ts` |

---

## Locked Decisions

These are not open for debate unless explicitly reversed by the user.

1. `/events` stays as the external events/conferences route. The internal operational feed is `/activity`.
2. Record-level activities (`crm_activities` — notes, calls, meetings) are NOT the same as the operational activity stream. Do not merge them.
3. Notifications (`crm_notifications`) are conceptually separate from activity rows. Notifications may optionally reference an `activity_event_id` but are not a derived projection.
4. Social Suite v1 must include **LinkedIn, X, Facebook, and Instagram**. Build a platform adapter interface so TikTok/YouTube can be added later without redesign.
5. P1-2 (LinkedIn API) is folded into E2 (Social Suite). Do not ship a standalone LinkedIn integration.
6. Audit and extend the existing `server/modules/content/` module for the asset library — do not create a new bucket or parallel content module.

---

## Sprint Group D — Activity Foundation + Unified Inbox

Build the activity schema first. Every subsequent module (E1, E2, E3) should call `emitActivity` from day one.

### D-1 · Activity Schema Hardening + Source Catalog (E5-1/2/3)

> The `crm_activity_events` table and `emitActivity` helper already exist. This sprint wires the remaining sources and hardens the schema.

**Schema additions needed:**
- Confirm `dedup_key` partial unique index exists on `crm_activity_events` (`WHERE dedup_key IS NOT NULL`).
- Add `severity` enum if not present (`info`, `warning`, `critical`).

**Wire these additional emit sites** (check each callsite; add `emitActivity` where missing):

| Source | Event types to emit |
|---|---|
| `dealSyncService.ts` | `deal_created`, `deal_stage_changed`, `deal_closed_won`, `deal_closed_lost` |
| `signalsRepository.ts` | `signal_created` (on new signal row insert) |
| Playbook executor (`playbooksService.ts`) | `playbook_enrolled`, `playbook_step_completed`, `playbook_step_failed`, `playbook_paused`, `playbook_cancelled`, `playbook_completed` |
| `emailEventService.ts` | `email_opened`, `email_clicked`, `email_bounced`, `email_spam_reported`, `email_unsubscribed` |
| `broadcastService.ts` | `broadcast_scheduled`, `broadcast_completed`, `broadcast_failed` |
| `signeasyWebhookHandler.ts` | `contract_sent`, `contract_signed`, `contract_declined`, `contract_expired` |
| `calendlyWebhookHandler.ts` | `meeting_booked`, `meeting_cancelled` |
| `orgCrudRepository.ts` / `contactCrudRepository.ts` | `org_created`, `contact_created`, `org_enriched`, `contact_enriched` |
| `deliverabilityGate.ts` | `suppression_hit`, `cap_exceeded` |

**Done when:** `grep -r 'emitActivity' server/` shows coverage across deal, playbook, email-event, broadcast, contract, meeting, and enrichment paths.

---

### D-2 · Activity Prioritization (E5-4)

**Where:** `server/modules/activity/activityPrioritizationService.ts` (new file).

```
score = baseSeverity + recencyDecay + ownershipBoost + adminMultiplier
```

- `baseSeverity`: `critical=100`, `warning=50`, `info=10`.
- `recencyDecay`: linear decay to 0 over 72 h for info, 168 h for warning, 336 h for critical.
- `ownershipBoost`: +30 if `actor_user_id = viewer` or entity is owned/collaborating for viewer.
- `adminMultiplier`: per-`activity_type` float stored in a config table `crm_activity_type_config` (default 1.0); admins can tune via Settings.
- Store `base_priority` on the row at write time; compute viewer-specific boosts at read time.

---

### D-3 · `/activity` Page + Per-Record Feed (E5-5)

**New route:** `/admin/activity` added to Wouter + left nav between Inbox and Playbooks.

**tRPC procedures needed** (new `activity` router at `server/modules/activity/activityRouter.ts`):
- `activity.list({ entity_type?, entity_id?, activity_type?, severity?, since?, until?, search?, cursor, limit })` — paginated by `occurred_at DESC`, viewer-priority-boosted.
- `activity.listForRecord(entity_type, entity_id)` — per-record feed, max 50 most recent, used by Contact + Org detail Activity tabs.
- `activity.markRead(id)` / `activity.markAllRead()` — per-user read state (new `crm_activity_read_state(user_id, activity_event_id)` junction table).

**UI:**
- `ActivityPage.tsx` — timeline list with filter pills (severity, type, date range), free-text search, cursor pagination.
- Wire `activity.listForRecord` into both `ContactDetailPage` and `OrganizationDetailPage` Activity tabs as an additional "System activity" section (below existing manual activities).
- Header pill on Contact/Org cards: "N new" badge counting unread activity since last visit.

---

### D-4 · Notification Integration (E5-6/7/8)

**Schema:** add nullable `activity_event_id FK crm_activity_events(id) ON DELETE SET NULL` to `crm_notifications`.

**Notification preferences** (new `crm_notification_preferences` table):

| Column | Type | Notes |
|---|---|---|
| `user_id` | FK crm_users | |
| `activity_type` | text | NULL = applies to all |
| `channel` | enum `in_app`, `email`, `slack` | |
| `enabled` | boolean | |
| `severity_floor` | enum | min severity to notify |
| `digest_interval_hours` | int | NULL = real-time |

**Channels to implement:**
1. **In-app bell** — already exists (`crm_notifications`). Wire new preferences to filter what gets written here.
2. **Email** — use `sendEmail()` for critical + digest batches. Respect `digest_interval_hours`.
3. **Slack DM** — call Slack Incoming Webhook URL stored in `crm_integration_credentials WHERE platform = 'slack'`. Implement in `server/modules/notifications/slackNotifier.ts`.

**BullMQ:** route channel delivery through a `notification-dispatch` queue; failures visible in P1-7 dashboard (already wired via `RETRY_HANDLERS`).

**Settings UI:** Settings → Notifications tab — per-type toggle grid with channel column and severity floor dropdown.

---

### D-5 · External Events Linkbacks (E5-9)

**Schema:** add `crm_event_attendees(event_id FK crm_events, contact_id FK crm_contacts, org_id FK crm_organizations, role text, notes text)` via migration.

**tRPC:** `events.addAttendee`, `events.removeAttendee`, `events.listAttendees`.

**UI:** Attendees tab on EventDetailPage; "Events" chip in Contact + Org Activity tab showing linked event associations (labeled "External event — Music Biz 2026").

---

### D-6 · Unified Inbox — Remaining Items (E1-1/2/4–9)

> E1-3 (per-message actions) is already shipped (`125fb337`). Build the remaining sub-items.

**E1-1 — Inbox shell + view toggle:**
- New `/admin/inbox` route + left nav entry (hero section, above Outreach).
- Header dropdown: **My inbox** (current SDR's connected sending identity) vs **All inboxes** (collated across SDR-designated users from Settings). Persist last-used view per user in `localStorage`.

**E1-2 — Folder model:**
- Migration: add `folder enum('inbox','starred','sent','drafts','spam','trash','archive')`, `is_read boolean DEFAULT false`, `is_starred boolean DEFAULT false`, `moved_to_folder_at timestamptz` to `crm_inbound_emails` and `crm_outbound_emails`.
- All folder transitions reversible. Trash → Inbox restores. Archive → Inbox restores.

**E1-4 — Sent folder integrity:**
- `sendOneOff()` and `sendEmailFromDraft()` set `folder = 'sent'` on insert. No schema change if `crm_outbound_emails` already lands there; just ensure the query reads it.

**E1-5 — Reply threading:**
- Parse `In-Reply-To` and `References` headers during `/api/webhooks/sendgrid/inbound` ingest; link to `crm_email_threads` row (already exists — audit columns, extend if needed).
- Group inbox list view by thread; expand to see full chain.

**E1-6 — Compose / Reply:**
- Reuse `OneOffComposer`. When triggered from a thread, pre-fill To, Subject (`Re: …`), and quoted body.
- Auto-save drafts to `folder = 'drafts'` every 10 s via debounced `inbox.saveDraft` mutation.

**E1-7 — Search + pagination:**
- Cursor-paginated by `received_at`. Search across subject, body snippet, contact name, contact email.
- Filter pills: unread, starred, date range.

**E1-8 — Surfaces decision:** keep Inbox and Activity tab as separate surfaces. Both read same underlying email tables. No merge needed.

**E1-9 — Inline deliverability state:**
- Per-thread row in list view: badge if contact is suppressed (⛔ unsubscribed / ⛔ bounced / ⚠️ complained) — calls `deliverability.previewSendable` already shipped.
- Per-thread header (detail view): banner when any send to this contact would fail — reason + remediation.
- Per-sender identity pill at top of inbox header: `Today: 12/50 sends · bounce 0.3% · ✅ healthy` — uses `deliverability.getIdentitySummaries`.

**Inbox defaults for open questions:**
- Spam v1: use SendGrid `spam_report` events + P0-2 classifier.
- Storage: retain indefinitely; trash hard-deletes after 30 days.

---

## Sprint Group E — Asset Library + Social Suite

### E-1 · Content / Asset Library (E4)

**Step 1 — Audit first:** read `server/modules/content/` and `docs/modules/content.md` before touching anything. Map what already exists (storage bucket, metadata columns, CRUD router).

**Step 2 — Extend (not replace):**
- Add `mime_type`, `dimensions_px`, `duration_seconds`, `file_size_bytes`, `checksum_sha256` to the existing content table via migration.
- Add `crm_content_tags(id, name, color, workspace_id)` + `crm_content_tag_assignments(content_id, tag_id)`.
- Add `crm_content_usages(content_id, used_in_table, used_in_id, used_at)` — written whenever content is attached to a post, proposal, email, etc.

**Step 3 — Build library UI** (`ContentLibraryPage.tsx`):
- Tabular list: name, type pill, size, tags, last used, usage count.
- Sortable columns; filter by type/tag/date.
- Bulk tag, bulk delete (blocked if `usage_count > 0` with confirm), zip download.
- Free-text search + sidebar filters.

**Step 4 — Asset picker component** (`AssetPicker.tsx`):
- Two tabs: "Use existing" (searchable library grid) + "Upload new" (drag-drop, validates against caller-supplied constraints).
- Prop: `constraints: { platforms?: string[], maxSizeMb?: number, allowedMimeTypes?: string[] }`.
- Reused by social composer and future surfaces.

---

### E-2 · Social Account Connections (E2-1)

**Platform adapter interface** (`server/modules/social/adapters/PlatformAdapter.ts`):

```typescript
interface PlatformAdapter {
  platform: SocialPlatform; // 'linkedin' | 'x' | 'facebook' | 'instagram'
  exchangeOAuthCode(code: string, redirectUri: string): Promise<OAuthTokens>;
  refreshToken(tokens: OAuthTokens): Promise<OAuthTokens>;
  validateMedia(file: MediaFile): ValidationResult;
  publishPost(tokens: OAuthTokens, post: PostPayload): Promise<{ platform_post_id: string; url: string }>;
  fetchPostMetrics(tokens: OAuthTokens, platformPostId: string): Promise<PostMetrics>;
}
```

**Storage:** encrypt tokens in `crm_integration_credentials` (existing table, `platform = 'linkedin' | 'x' | 'facebook' | 'instagram'`). Store: `access_token` (encrypted), `refresh_token` (encrypted), `expires_at`, `account_handle`, `account_id`, `account_type` (`page` | `profile`), `connected_by_user_id`, `connected_at`.

**Settings UI:** Settings → Integrations → Social tab. Per-account card: platform logo, handle, type, health status, last refreshed, Disconnect button. "Connect" OAuth flow button per platform.

---

### E-3 · Social Composer (E2-2/3)

**Schema:** new tables via migration:

```sql
crm_social_posts(id, workspace_id, body, hashtags text[], status, scheduled_at, created_by, created_at, updated_at)
crm_social_post_targets(id, post_id, credential_id FK crm_integration_credentials, platform, override_body, override_hashtags, platform_post_id, platform_post_url, status, published_at, error_message)
```

**tRPC:** `social.createPost`, `social.updatePost`, `social.deletePost`, `social.list` (with status filter), `social.schedulePost`, `social.publishNow`.

**UI — Single-channel composer:** pick ONE connected account → write copy with per-channel char limits enforced inline (X=280, LinkedIn=3000, Instagram=2200, Facebook=63206). Hashtag field auto-prefixes `#`.

**UI — Cross-channel composer:** write once → fan out to multi-select of connected accounts. Per-channel preview cards. Per-channel overrides (shorter text for X, different hashtags for LinkedIn).

**Launcher:** top-level `/admin/social` route with Social left nav section. Composer accessible from the Social page and from playbook social step (CX-5 already handles the "Mark sent" path; this is for actually posting via API).

---

### E-4 · Media Upload + Validation (E2-4)

**Constraints config** (`server/modules/social/mediaConstraints.ts` — pure data, no DB):

| Platform | Image | Video |
|---|---|---|
| X | jpg/png/gif/webp ≤5 MB, ≤4 per post | mp4/mov ≤512 MB, ≤2:20 |
| LinkedIn | jpg/png ≤5 MB | mp4/mov ≤5 GB, ≤10 min; PDF carousel ≤100 MB ≤300 pp |
| Facebook | images ≤4 MB | video ≤4 GB, ≤240 min |
| Instagram | feed jpg/png ≤30 MB, 1:1/4:5/16:9 | reels mp4 ≤4 GB, ≤90 s |

**`validateMedia(file, platform)`** — pure function returning `{ valid: boolean, errors: string[] }`. Called at upload time (client-side pre-check + server-side enforce). Clear remediation messages explaining the constraint and how to fix it.

Use the `AssetPicker` from E-1 for the upload flow.

---

### E-5 · Scheduling, Publishing, Status (E2-5/6/7/10)

**Two send modes:**
- **Post now:** call platform adapter `publishPost` immediately; on success set `status = 'live'`, `published_at`, `platform_post_url`.
- **Schedule for…:** write `scheduled_at`, `status = 'scheduled'`; BullMQ `social-publish` queue picks up at the right time.

**Statuses:** `draft` → `scheduled` → `live` / `failed`. Tab UI: Drafts · Scheduled · Live · Failed.

**Failed posts:** surface platform API error message + Retry CTA (re-queues with same payload) + "Edit and reschedule" CTA.

**Activity emit:** `emitActivity` for `social_post_scheduled`, `social_post_published`, `social_post_failed`.

---

### E-6 · Social Metrics + Reshare (E2-8/9)

**Schema:** `crm_social_post_metrics(id, post_target_id FK, snapshot_at, impressions, likes, shares_or_retweets, replies, link_clicks, profile_clicks)`.

**Daily cron** (`socialMetricsCron.ts`): for each `status = 'live'` post target, call `adapter.fetchPostMetrics`, insert a snapshot row.

**UI:** per-post sparkline on Live tab. Per-account 30-day rollup card (impressions, engagement rate, top post).

**Reshare:** "Share" dropdown on Live post card seeds the cross-channel composer (E-3) from the existing post body + hashtags.

---

## Sprint Group F — Analytics + Intent Backlog

> These are longer-horizon items. Sequence after Sprint Groups D and E are stable.

### F-1 · Multi-Touch Attribution (P2-1)

**Models to implement:** time-weighted (exponential decay to first touch) and position-based (40% first, 40% last, 20% distributed).

**Touch sources:** email open/click (`crm_email_events`), playbook steps, social posts (when E2 lands), meetings (Calendly), proposals (sent + signed), ad clicks (when E3 lands).

**Schema:** `crm_attribution_touches(deal_id, touch_type, occurred_at, weight, model, source_table, source_id)`.

**Surfaces:** deal detail page (attribution breakdown), org detail page (influence timeline), playbook list (attributed revenue column).

---

### F-2 · Cohort Retention Dashboards (P2-2)

Define cohorts by: acquisition source, routing motion, market segment, playbook, close period.

Track over time: still active, churned, expanded, net revenue by cohort.

New `Analytics` left nav section with a Cohorts tab. Cohort comparison table + retention curve chart.

---

### F-3 · Third-Party Intent (P2-3)

**First provider:** evaluate Bombora vs G2 after user decision — do not assume either. Build a provider-adapter pattern so the data source can be swapped.

**Ingestion:** nightly import job, normalize to `crm_signals` with `signal_channel = 'intent_provider'`.

Match incoming company/domain to `crm_organizations` via domain normalization (`server/lib/domainUtils.ts` or equivalent).

Apply decay-weighted intent score contribution (same model already used for email events).

---

### F-4 · Web Tracking Pixel + Form Capture (P2-4)

**Pixel:** embed script at `/embed/tracker.js` (similar to `/embed/forms.js` already in `server/index.ts`). Capture page views with URL, referrer, anonymous session ID (first-party cookie). Server endpoint: `POST /api/track/pageview`.

**Form capture:** extend existing `/embed/forms/:slug` to emit signals on submit.

**Identity resolution:** match `email` from form submits to `crm_contacts`. Match anonymous session to contact when the same browser later submits a form with a known email.

**Consent:** gate pixel fire on `consent_status != 'unsubscribed'`; respect `localStorage` opt-out flag.

---

### F-5 · Lemlist Credit Audit (P2-5)

Log every Lemlist API call that consumes credits to a new `crm_lemlist_usage_log(operation, credits_consumed, org_id, contact_id, called_at)` table.

Daily balance snapshot from Lemlist `/api/me` endpoint → store in `crm_integration_health(platform='lemlist', metric='daily_credits_remaining', value, recorded_at)`.

Alert via in-app notification + email when balance drops below configurable threshold (default: 500 credits). Settings → Integrations → Lemlist: show usage chart + set alert threshold.

---

## Still-Open Follow-Up Items (Not Phase-Grouped)

### S6 Follow-Up — Journey Rules Completion

The S6 audit left four triggers DB-allowed but unwired. Build these when time permits:

| Trigger type | What needs wiring |
|---|---|
| `score_threshold` | `journeyEngine.ts` needs an `onScoreChange(orgId, newScore)` hook called from ICP scoring jobs |
| `task_completed` | hook into `sdrCockpitService.completeTask` |
| `enrollment_completed` | already emitted as `playbook_completed` — add journey check in `playbooksService.completeEnrollment` |
| `stale_record` | nightly BullMQ job scans `crm_organizations WHERE updated_at < NOW() - INTERVAL` and fires `onStaleRecord(orgId)` |

Also: implement `enroll_sequence → enroll_playbook` action (the old `enroll_sequence` action was dropped in S6 because Sequences sunset; replace it with `enroll_playbook` action type that calls `enrollOrganization`).

Add max-cascade guard: `journeyEngine.ts` should track recursion depth per `(entityId, triggerChain)` and bail at depth > 3 to prevent infinite loops from chained `deal_status_change → lifecycle_change → deal_status_change`.

### Playbook Builder — Drag-and-Drop Reorder

Currently deferred. Step reorder works via arrow buttons. If this becomes a priority: use `@dnd-kit/sortable` on the step list in `PlaybookBuilder.tsx`. The `swapStepNumbers` mutation is already wired and handles gaps — DnD just needs to call it in sequence.

### Pause/Resume Lifecycle Visibility

`crm_playbook_enrollments` currently lacks `paused_at` / `resumed_at` timestamps so Activity timeline can't show these events. Migration: add the two timestamptz columns; write them in `pauseEnrollment` / `resumeEnrollment` in `playbooksService.ts`; emit `playbook_paused` / `playbook_resumed` activity events.

---

## Key Conventions Reminder

- **Router → Service (optional) → Repository → DB.** Never skip the pattern.
- **`sql` tagged template** from `server/db.ts` everywhere — no raw `pg`.
- **Array params:** `WHERE id = ANY($1::int[])` syntax.
- **Migrations:** sequential numbered SQL files in `db/migrations/`. Idempotent where possible.
- **Zod v3 syntax** (not v4): `z.string().optional()`, not `.optional()` chained at end.
- **Procedure tiers:** `readProcedure` (crm.read), `writeProcedure` (crm.write), `adminProcedure` (users.manage).
- **`emitActivity`** for every new state transition — one canonical emit helper, not ad-hoc SQL writes.
- **`pnpm gates`** (= `check && lint && test`) before every push.
- **Doc sync before every commit:** update `docs/modules/<name>.md` for every touched module, `docs/database.md` for every migration. See `CLAUDE.md` "Documentation Sync Policy."
