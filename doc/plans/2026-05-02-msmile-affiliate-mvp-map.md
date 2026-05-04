# MSMile Affiliate MVP Map v2.0

Date: 2026-05-02
Project: MSMile Affiliate AI Company

## 1. Identity & Team Org

MSmile Affiliate — AI company 1 người
Operator: Human CEO (bạn)

Team Accountability Matrix:

| Role | Owner | Primary Responsibility | Escalation |
| --- | --- | --- | --- |
| Architect & Pipeline | Lucky Dev | Design, maintain, debug agents; approve prompts; update scripts | CEO → Slack/Telegram |
| QA & Audit | Victor Dev | Test flows, verify outputs, block bad releases, fix integration | Lucky Dev → CEO |
| Revenue & Tracking | Dev Money | UTM setup, tracking schema, affiliate link mgmt, KPI dashboards | CEO → Victor |
| Operator & CEO | Human CEO | Final approval (PASS), strategic decisions, Telegram commands, revenue targets | Escalate externally |

## 2. MVP Map v2.0

**Critical Path (Deployment Order)**
1. Paperclip server must be UP → `npm start` in `paperclip/` folder
2. Orchestrator agent must be hired and listening for issues
3. Intake → Creative → Veo pipeline must be wired and tested
4. Telegram command service must be active and listening for `/msmile_*`
5. UTM + revenue_log schema must be live before any ad/affiliate push

Input: 1 Product URL / SKU MSmile

Pipeline with Error Handling:
1. Intake Agent (`run-intake.mjs`)
   - scrape msmile.shop + Apify
   - multi-key rotation, multi-thread
   - output: `normalized_product_json`
   - ❌ Error: scraper fails → retry with backup Apify key OR fallback to manual data entry
   - ❌ Error: JSON malformed → Victor reviews and fixes; Intake re-runs

2. Creative Agent (`run-creative.mjs`)
   - create 3 creative angles: sale / editorial / emotional
   - output: `creative_bundle_json` with banners + hero_section_json
   - ❌ Error: tone off-brand → Lucky updates system prompt; re-run Creative
   - ❌ Error: GPT/Gemini unavailable → queue and retry after 5 min

3. Veo Agent (`run-veo.mjs`)
   - Veo3 image-to-video + text-to-video
   - output: `veo_payload_json` (9:16, 8s hook)
   - ❌ Error: video generation timeout → resubmit with reduced resolution
   - ❌ Error: Veo3 quota exceeded → check Gen AI credits and escalate to CEO

4. Orchestrator Agent (`orchestrator.AGENTS.md`)
   - coordinate CHECK–FIX–PASS
   - summarize and post results to Paperclip issue
   - ❌ Error: Paperclip API down → Telegram bot notifies CEO, retry on wake
   - ❌ Error: Issue comment post fails → check PAPERCLIP_API_KEY and company auth

5. Scout Agent (daily cron)
   - competitor scraping on TikTok / FB / YT / IG
   - output: `trend_insights`
   - ❌ Error: platform rate limit → stagger requests, use cached data until reset
   - ❌ Error: no new trends detected → revert to previous day's insights

Output: 1 SKU → 3 angles × (banners + hero + video hook) → push TikTok Shop / Meta Ads / Shopee Affiliate → track UTM → measure CTR / orders / revenue

## 3. Current Architecture Stack & Deployment Prerequisites

**Services & Status:**
- Backend: Express 5 / Node.js — ✅ Done
- Workflow UI: React Flow + Vite — 🔄 In progress
- Control Plane: Paperclip — ✅ Done
- Scraper: Apify multi-platform + key rotation — ✅ Done
- AI Image: GPT Image / Gemini — ✅ Done
- AI Video: Veo3 — ✅ Done
- Automation: N8N workflows — ✅ Done
- Deploy: Cloudflare Pages + Vercel — ✅ Done
- Command Center: Telegram Bot ↔ Paperclip — 🔄 In progress
- Analytics: UTM tracking + revenue log — ⏳ Pending

**Startup Checklist (before any /msmile_* command):**
- [ ] Paperclip server: `cd paperclip && npm start` (port 3100 or auto-detect 3101+)
- [ ] Environment: `.env.paperclip` configured with `PAPERCLIP_API_KEY`, `AGENT_NAME=MSmile Orchestrator`
- [ ] MSmile Affiliate: `npm install` in `d:\AI_2026\MSmile Affiliate\` completed
- [ ] Apify keys rotated and tested (check `.env`)
- [ ] Telegram bot token valid and listening on Telegram server
- [ ] Shopee Affiliate API creds or manual UTM template ready
- [ ] Database: local PGlite for Paperclip or external DB configured

## 4. Completed Files and Assets

**Location: `d:\AI_2026\MSmile Affiliate\` folder (separate from Paperclip repo)**

Core documentation:
- `docs/AGENTS.md` — Company-level org and governance
- `docs/agents/orchestrator.AGENTS.md` — Orchestrator system prompt
- `docs/agents/intake.AGENTS.md` — Intake agent prompt
- `docs/agents/creative.AGENTS.md` — Creative agent prompt
- `docs/agents/veo.AGENTS.md` — Veo agent prompt
- `docs/ISSUE_TEMPLATE_MSMILE_JOB.md` — Issue template for jobs
- `docs/MASTER_HANDOFF_FOR_VICTOR.md` — A-Z setup guide
- `docs/VICTOR_OPERATOR_COMMAND.md` — Victor's audit commands
- `docs/RULER.md` — Team operating rules
- `docs/GOAL.md` — Vision and goals
- `docs/PROJECT_BRIEF.md` — README for stakeholders

Pipeline scripts:
- `scripts/run-intake.mjs` — Intake agent
- `scripts/run-creative.mjs` — Creative agent
- `scripts/run-veo.mjs` — Veo agent
- `scripts/hire-orchestrator.mjs` — Hire orchestrator in Paperclip
- `scripts/create-demo-issue.mjs` — Create test issue
- `scripts/check-issue-comments.mjs` — Poll issue for agent responses
- `scripts/test-multi-scraper.mjs` — Scraper QA tests
- `scripts/run-scout.mjs` — Scout agent (trend insights)
- `scripts/run-daily-content.mjs` — Daily content generation

UI & Config:
- `workflowSchema.json` — React Flow workflow diagram
- `.env.paperclip` — Paperclip integration config
- `src/` React + Vite app (migration in progress)

**Location: `d:\AI_2026\paperclip\doc\plans\` (Paperclip repo)**
- `2026-05-02-msmile-affiliate-mvp-map.md` — This document

## 5. Ruler — Team Operating Rules

Key rules for MSMile Affiliate operations:
1. All work flows through Paperclip issue or Telegram `/msmile_*`
2. Every output must include a CHECK–FIX–PASS block
3. Human CEO must approve PASS; no self-approval
4. Keep comments short, clear, and action-oriented
5. Use wakeOnDemand heartbeats to save token usage
6. Final report format:
   - ✅ CHECK: [what was done]
   - 🔧 FIX: [what was fixed / how]
   - ✅ PASS: [final output / link / JSON]
7. Ping Victor immediately if blocked — max 15 min wait for escalation
8. Revenue first: every asset must include UTM and tracking

**Escalation & Penalty:**
- Missing PASS tag → task auto-blocked until Victor verifies
- SELF-APPROVED (without CEO review) → task rejected, redo required
- Blocker unresolved > 30 min → CEO escalates externally
- Failed revenue tracking → task cannot move to ads/affiliate push

## 6. 30-Day MVP KPI & Acceptance Criteria

| Week | Goal | Acceptance Criteria | KPI Target |
| --- | --- | --- | --- |
| W1 | Hire + Demo issue | 1 issue end-to-end PASS with CHECK–FIX–PASS report | 1 PASS |
| W2 | 1 SKU full funnel | generate normalized_json + 3 banners + 1 veo in single run | 100% pipeline completion |
| W3 | 5–10 SKUs, angles | run 5–10 SKUs; track which angle (sale/editorial/emotional) has best engagement | ≥ 3 creative angles tested |
| W4 | Launch ads + revenue | push assets to Ads/Affiliate; measure click-through rate (CTR) + conversion rate (CR) | ≥ 1 affiliate order OR 100+ clicks |

**Long-term target:** Sản × Triệu Views × Triệu Orders × Triệu $ (millions in revenue)

## 7. Next Actions & Task Rollout

**Rollout Order (Blocking Dependencies):**

1. **Victor Dev — BLOCKER (must complete first)**
   - Task: Start Paperclip server `npm start` (port 3100/3101+)
   - Deadline: TODAY (2026-05-03 before 10:00 ICT)
   - Verification: curl http://localhost:3100/api/health returns 200
   - Report: CHECK–FIX–PASS in Telegram

2. **Lucky Dev — (parallel with Victor)**
   - Task: Hire Orchestrator in Paperclip (run `scripts/hire-orchestrator.mjs`)
   - Task: Verify all agent prompts loaded and responding
   - Deadline: TODAY (2026-05-03 before 11:00 ICT)
   - Report: Agent names and status in CHECK–FIX–PASS

3. **Dev Money — (after Victor & Lucky)**
   - Task: run `scripts/run-veo.mjs` for bd266 SKU
   - Task: create `utm_template_bd266.json` with all affiliate links
   - Task: Define `revenue_log.json` schema and init first entry
   - Deadline: TODAY (2026-05-03 by 14:00 ICT)
   - Report: Veo payload + UTM JSON in CHECK–FIX–PASS

4. **CEO Approval — (final gate)**
   - Task: Review Dev Money's output and approve PASS
   - Task: Send `/msmile_approve [issue_id]` on Telegram
   - Deadline: TODAY (2026-05-03 by 15:00 ICT) or next morning
   - Output: bd266 DONE ✅

**Ongoing Tasks (Lucky Dev):**
- Maintain pipeline scripts and monitor agent health
- Update Veo3 prompt templates weekly (follow trend changes)
- Daily CHECK–FIX–PASS audit of all issues
- Upgrade Scout Agent for daily cron scheduling

## 8. Telegram Command Center Integration

**Implementation Architecture:**
- Approach: Long-polling from Telegram API (simpler, no webhook setup needed)
- Service: standalone Node.js listener or integrated into `paperclip/server`
- Config: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`
- Auth: only CEO chat_id can execute `/msmile_*` commands

**Integration with Paperclip API:**
- `/msmile_sku [URL]` calls Paperclip `POST /api/issues` to create a new job
- `/msmile_status` calls Paperclip `GET /api/issues` to fetch current state
- `/msmile_report` calls Paperclip `GET /api/issues/{id}/comments` to summarize
- `/msmile_trend` runs local `scripts/run-scout.mjs` and reports back
- `/msmile_approve [issue_id]` calls Paperclip `PATCH /api/issues/{id}` to mark PASS-ready

Current audit:
- `paperclip/.env` has Telegram placeholders (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)
- `paperclip/scratch/send_telegram.sh` is only a message sender helper
- there is no active Telegram bot listener / command parser in this repo
- no command wiring exists yet for `/msmile_sku`, `/msmile_status`, `/msmile_report`, `/msmile_trend`, or `/msmile_approve`

Required completion:
1. implement a Telegram command service to receive updates and parse `/msmile_*`
2. wire `/msmile_sku [URL]` to the pipeline trigger or issue creation flow
3. wire `/msmile_status` to fetch current pipeline/issue health
4. wire `/msmile_report` to publish daily summary from current run state
5. wire `/msmile_trend` to run Scout trend refresh and report back
6. wire `/msmile_approve [issue_id]` to mark issue PASS-ready and notify the CEO
7. protect bot actions so only the Human CEO chat or authorized group can execute commands

Commands to support:
- `/msmile_sku [URL]` → trigger full pipeline for 1 SKU
- `/msmile_status` → report pipeline status
- `/msmile_report` → output daily report
- `/msmile_trend` → pull new Scout trends
- `/msmile_approve [issue_id]` → Human CEO approves PASS

## 8.1 Telegram Command Execution Template

Use this format for each Telegram command and follow the RULER CHECK–FIX–PASS convention in issue comments and bot responses.

Example: trigger the next job
- Command: `/msmile_sku https://msmile.shop/bd513-bo-lua-satin/`
- Expected flow:
  - create or assign a new Paperclip issue for the SKU
  - wake the Orchestrator and Intake agents
  - return a status message with job ID and current step

CHECK–FIX–PASS for next job:
- ✅ CHECK: Sent `/msmile_sku [URL]` and confirmed the pipeline trigger created a new issue or task.
- 🔧 FIX: If the command failed, identify whether the bot listener, command parser, or issue creation API was missing and patch it.
- ✅ PASS: The next job is accepted, issue created with ID, and pipeline is now running in `ready_for_human_approval` or equivalent status.

Suggested operator command list:
- `/msmile_sku [URL]` — start a new SKU pipeline and return the issue/job reference
- `/msmile_status` — check current pipeline/issue health and return the latest step
- `/msmile_report` — generate today’s summary for active job(s) and return metrics or story state
- `/msmile_trend` — refresh Scout trend intelligence and return the latest trendinsights output
- `/msmile_approve [issue_id]` — mark the issue as PASS-ready and notify the CEO or board for final approval

## 8.2 Latest Dev Money Report

Dev Money has reported following RULER CHECK–FIX–PASS results:

| JOB | Command | Status |
| --- | --- | --- |
| JOB 1 | `/msmile_sku [URL]` | ✅ PASS — `bd266.json` generated |
| JOB 2 | `/msmile_status` | ✅ PASS — detected Paperclip server is not UP |
| JOB 3 | `/msmile_report` | ✅ PASS — pipeline 60%, missing Veo + UTM |
| JOB 4 | `/msmile_trend` | ✅ PASS — trend "sáng thức dậy tự tin" |
| JOB 5 | `/msmile_approve [issue_id]` | ⏳ HOLD — waiting for Veo + UTM + CEO approval |

Blocker: Paperclip server not UP — Victor must run `npm start` first.

Next job pipeline:
- Victor: start Paperclip → PASS
- Dev Money: run `scripts/run-veo.mjs` + `utm_template_bd266.json` → PASS
- CEO: `/msmile_approve [issue_id]` → `bd266` DONE ✅

## 9. Brand Positioning

MSmile is premium loungewear for modern Vietnamese women.
Tone: “Ở nhà vẫn đẹp” — elegant, comfortable, café-ready.
Target: women 30+, clean minimalist taste.
Do not use cheap sleepwear or bargain-sale messaging.

## 10. Pre-Ads Integration Testing Checklist

Before any asset is pushed to TikTok Shop, Meta Ads, or Shopee Affiliate, verify:

- [ ] Intake output: `normalized_product_json` has all required fields (SKU, title, price, description, images)
- [ ] Creative output: 3 banners generated, 1 hero section, tones match brand guidelines
- [ ] Veo output: 1 video (9:16, 8s, hook tested) returns valid URL
- [ ] Orchestrator: issue comment posted with CHECK–FIX–PASS summary
- [ ] UTM: all links tagged with `utm_source=msmile_aff&utm_medium=telegram&utm_campaign=[SKU]`
- [ ] Revenue log: new entry created with SKU, asset IDs, link URLs, timestamp
- [ ] CEO approval: `/msmile_approve [issue_id]` command executed
- [ ] Final status: issue marked as `ready_for_human_approval` or equivalent

**Sign-off**: Issue must have green checkmark in Paperclip before ads push.

## 11. Status & Health Check

**Current Phase:** W1 — Hire + Demo (3 days in)

**Active Blockers:**
- Paperclip server not started (Victor must run `npm start`)
- Telegram bot listener not yet wired (stub implementation exists)
- Veo agent not yet tested with bd266 SKU

**Current Task Status:**
- ✅ Intake + Creative agents working (bd266.json generated)
- ✅ Scout agent trend detection working
- ⏳ Veo agent pending Paperclip server UP
- ⏳ Telegram command center partially ready
- ⏳ UTM + revenue_log.json pending Dev Money

**Team Health:**
- Lucky Dev: ON TRACK (architecture complete, waiting on Victor for server)
- Victor Dev: ACTION ITEM (start Paperclip server TODAY)
- Dev Money: ACTION ITEM (run Veo + UTM TODAY after Victor UP)
- CEO: ON STANDBY (waiting for PASS to approve)

**Risk Tracking:**
- Risk: Veo3 quota exhaustion → monitor Gen AI credits daily, escalate if <20% remaining
- Risk: Paperclip API downtime → have manual fallback to store results in local JSON
- Risk: Telegram command service crashes → auto-restart via systemd or supervisor
- Risk: UTM links not tracked → verify Shopee Affiliate dashboard before ads push

**Next 24h Checklist:**
- [ ] Victor: Paperclip server UP and responding
- [ ] Lucky: Orchestrator hired and responding to issues
- [ ] Dev Money: Veo generated + UTM JSON complete
- [ ] CEO: Review output and `/msmile_approve` sent
- [ ] Status: bd266 DONE ✅

## 12. Brand Positioning (Reference)

MSmile is premium loungewear for modern Vietnamese women.
Tone: "Ở nhà vẫn đẹp" — elegant, comfortable, café-ready.
Target: women 30+, clean minimalist taste.
Do not use cheap sleepwear or bargain-sale messaging.

---

## EXECUTIVE SUMMARY

**MVP Contract:** 1 SKU (bd266) through complete pipeline → issue with CHECK–FIX–PASS → CEO approval → DONE ✅

**W1 Goal:** Achieve 1 complete PASS by 2026-05-06

**Critical Path:** Victor starts Paperclip → Lucky hires Orchestrator → Dev Money runs Veo + UTM → CEO approves

**Operational Model:** Issue-driven + Telegram-assisted, all decisions logged via CHECK–FIX–PASS format

**Quality Gate:** No SKU pushed to ads without Pre-Ads Integration Testing Checklist ✅

**Document Updated:** 2026-05-03 (comprehensive QA audit + improvements applied)
