# Syncy — Judge Evaluation & Business Case

- **Prepared:** 25 October 2026
- **Source brief:** *BCBT_Hackathon_Field_Notes.pdf*, especially “WHERE THE POINTS ARE” (pp. 2–3)
- **Scope:** Business case, customer, market, competition, pricing, cost, funding, risks, and judge Q&A. The user reports the live demo is working; live-demo scoring and demo walkthrough are intentionally skipped.

> **Use this as the current answer sheet.** Separate verified product behavior from hypotheses. The demo being live does not validate customer demand, price, retention, or a market-size claim.

## 1. The short pitch

> **Syncy turns a post-event voice memo into an editable, project-aware follow-up.** Scan a contact’s QR profile link, dictate what you discussed, and Syncy transcribes it, summarizes the context, matches it against projects you imported from your own Notion workspace, and drafts a next step for you to review.

**One-sentence problem:** Independent B2B consultants meet potential clients at events, but afterwards must reconstruct who they met, what mattered, and what to do next from scattered profile links, notes, and memory.

**Product category:** A lightweight post-event contact-capture and follow-up assistant. Syncy is not a full CRM replacement, a LinkedIn scraper, or an automatic message sender.

## 2. Judge rubric coverage

| Field Notes criterion | Weight | Answer in this document |
|---|---:|---|
| Does it work live? | 30% | Skipped as requested; user reports the demo is working live. |
| Does it solve a real problem for a real user? | 20% | Sections 3–5. The problem is plausible, but customer evidence is missing from the repository. |
| Who pays, how much, and why switch? | 20% | Sections 6–9. €9.99/month is a price hypothesis, not a validated or implemented subscription. |
| What does it cost to run and what does it depend on? | 15% | Sections 10–12. Model usage is estimated from current listed rates and explicit token assumptions. |
| How good is the demo? | 15% | Skipped with the live-demo evaluation. |

The three business criteria total **55%**, as the Field Notes emphasize. The answers below focus on those points and the other likely business questions; they do not grade the live presentation.

## 3. What the product does today

These details are based on the current README, data model, TODO, architecture, and deployed-function source—not older pitch copy.

1. The user selects or creates an event, then scans a QR code containing a profile URL. Syncy saves the URL and a name derived from its slug; it does not scrape LinkedIn or Xing.
2. The user adds a typed note or records a short voice memo. When recording stops, the audio is sent to the server-side transcription function and the transcript appears in the editable note field. Syncy does not save the audio file. The transcript is saved with the contact when the user processes it.
3. On **Process**, two text-model calls extract a structured summary and compare the contact note with the user’s active project names and descriptions. The output includes a suggested project, a reason/confidence, a next step, and a follow-up draft.
4. The user can edit the AI output and manually choose a project. A user-selected project is preserved through processing. The user reviews and saves; Syncy does not send the drafted follow-up.
5. Contacts, events, project copies, and transcript text live in Supabase. Auth and row-level ownership checks separate user workspaces.
6. Each user can connect their own Notion workspace and choose a shared projects database. Syncy copies project names and descriptions into that user’s Syncy project list. Import again to refresh. **Notion is an input for projects; contacts and edits stay in Syncy.** There is no contact write-back, automatic refresh, or two-way sync today.

### Important setup detail for the cost answer

The function reads `OPENROUTER_MODEL` and `WHISPER_MODEL` from Supabase secrets. The cost estimate below assumes `OPENROUTER_MODEL=openai/gpt-6-luna` and `WHISPER_MODEL=openai/whisper-large-v3-turbo`, as specified for this product. In the code, Whisper falls back to `openai/whisper-1` if `WHISPER_MODEL` is absent. Confirm the deployed secret before presenting Turbo-based costs.

### Documentation mismatch to fix before reusing old slides

Some older material is superseded:

- `IDEA_PITCH.md` and `SLIDES_BRIEF.md` still say contacts go into Notion or that Notion import is a future phase. Current implementation copies **projects from each user’s Notion into Syncy**; it does not write contacts back.
- Older cost estimates in the PRD and slide brief say roughly €0.01–€0.02 per contact. Current listed model rates imply a much smaller inference estimate under the assumptions in §10. Actual usage has not yet been aggregated from live calls.
- The pitch has variants of €9 and €9.99, while the current slide brief uses €9.99. Use **€9.99/month as the current hypothesis**, and say clearly that willingness to pay is unvalidated and billing is not built.

Current implementation references: [README](../README.md), [TODO](../TODO.md), [data model](DATA_MODEL.md), [architecture](ARCHITECTURE.md), [processing function](../supabase/functions/process-note/index.ts), and [AI prompts](../supabase/functions/process-note/prompts.ts). Earlier pitch documents to update: [IDEA_PITCH](../IDEA_PITCH.md), [SLIDES_BRIEF](../SLIDES_BRIEF.md), and [PRD](../PRD.md).

## 4. The problem and the evidence we have

### Problem statement

After a networking or industry event, the contact’s profile may preserve their name and job title, but not the conversation, why the contact mattered, or the agreed follow-up. The user has to bridge that gap manually between the event, a notes app, LinkedIn, project documents, and a CRM or spreadsheet.

### What is known versus unproven

| Statement | Evidence status |
|---|---|
| Syncy implements a working capture → transcription → summary/project match → review flow. | Verified in current implementation documentation and code; live demo reported working by the user. |
| People forget useful context after meeting prospects and spend time cleaning up notes. | Plausible problem hypothesis; no completed customer-interview log or measured time baseline was found in the repository. |
| Users lose a specific percentage of follow-ups or revenue. | Not established. Do not quote a percentage or lost-euro figure. |
| The workflow saves one hour per event, or one recovered client pays for years of Syncy. | Earlier pitch assumptions only; not measured. Do not present as results. |
| Freelancers will pay €9.99/month. | Pricing hypothesis only; no payment or willingness-to-pay evidence is recorded. |
| AI project matching is useful enough to make people return. | Product hypothesis to test through acceptance, override, and repeat-use data. |

The [business research checklist](BUSINESS_TASKS.md) calls for at least eight interviews and asks about recent events, current tools, time spent, missed follow-ups, and prior spending. The [PM plan](../PM_PLAN.md) has no completed interview rows. Therefore the honest claim is **“we have a working product and a testable problem hypothesis,”** not “we have proven product-market fit.”

### Best initial customer

**Beachhead user:** an independent B2B consultant in Germany who attends recurring events to find client projects, manages several engagements, and already keeps project descriptions in Notion.

- **User:** the consultant doing the networking and follow-up.
- **Buyer:** the same person, paying from their own business-software budget.
- **Trigger:** they leave a conversation and have a short window to capture useful context before the next meeting or the end of the event.
- **Current alternatives:** LinkedIn connection plus memory; a phone Notes/voice-memo app; a spreadsheet; a personal CRM; or a company CRM.
- **Why this segment first:** the current product is organized around an individual’s own projects and own Notion connection. Shared team inboxes, team permissions, CRM integrations, and event-level reporting are not the product’s current strength.

Small B2B exhibitor teams are a possible later segment, but Syncy should not pitch itself as an enterprise event-lead platform until it has shared workspaces, team controls, and the integrations those buyers expect.

## 5. Market and positioning

### What the market data supports

- AUMA reports **304 trade fairs in Germany in 2025**, about **191,990 exhibitor participations**, and around **12.75 million visitors**. It reports that 73% of surveyed exhibiting companies planned the same number or more trade-fair participations in 2026. These are event-industry context and distribution evidence; exhibitor participations across fairs are **not** a deduplicated count of unique Syncy customers. [AUMA, German trade-fair figures](https://www.auma.de/en/trade-fair-venue-germany/key-figures/)
- Destatis reports **3.2 million German SMEs in 2024**, 99.3% of businesses in the statistical sectors covered. This is broad economic context, not Syncy’s addressable market; it includes many businesses with no event-led sales workflow. [Destatis, SMEs](https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Kleine-Unternehmen-Mittlere-Unternehmen/_inhalt.html)
- Germany’s average employer labour cost was **€45 per hour in 2025**. At that rate, a €9.99 subscription equals about **13.3 minutes of labour cost per month**. This is only a value sanity-check—not a claim that Syncy currently saves that time, and not a proxy for every freelancer’s billable rate. [Destatis, labour costs](https://www.destatis.de/DE/Themen/Arbeit/Arbeitskosten-Lohnnebenkosten/_inhalt.html)

### Market size: answer honestly

There is not enough evidence to give a defensible numeric SAM or TAM for Syncy today. Do not multiply all German SMEs or all fair visitors by a subscription price and call it the market.

Use a bottom-up calculation after choosing the first events and validating the buyer:

> **Reachable companies from selected event rosters** × **eligible users/seats per company** × **tested annual price per seat** = a serviceable revenue estimate.

The next market-sizing task is to select 10–20 relevant German B2B events, collect and deduplicate exhibitor/company lists, then filter for small service businesses and event-active consultants whose workflow fits Syncy. After that, calculate a reachable first-year SOM from actual outreach and conversion. AUMA’s data shows there is an event channel; it does not prove how many attendees fit the ICP.

At the current €9.99/month hypothesis, revenue arithmetic—not a forecast—is:

| Paying users | MRR | ARR |
|---:|---:|---:|
| 100 | €999 | €11,988 |
| 1,000 | €9,990 | €119,880 |

These figures exclude VAT, payment fees, churn, discounts, support, and customer-acquisition costs. Billing is not implemented.

### Positioning and USP

**Positioning:** Syncy sits between the conversation and the existing project workflow. It is a small capture-and-follow-up layer for solo professionals who want to keep their project list in Notion but need each new contact’s context organized around those projects.

**Candidate USP to test:** *Project-aware follow-up from a quick post-event memo, using the user’s own imported Notion project descriptions.*

Transcription, AI summaries, voice notes, contact scanning, and follow-up suggestions are already offered by competitors. **Do not claim those features are unique.** The differentiator to test is the specific chain from a QR-scanned contact to the user’s own project context, with an editable assignment and a reviewable next step. This desk research did not establish global uniqueness or a defensible moat.

### Why a user might choose or switch to Syncy

The credible switch case is narrow:

1. Keep using LinkedIn or the user’s existing network tool; Syncy does not replace it.
2. Replace the manual step of saving a profile, recording context somewhere else, then later figuring out what project it relates to.
3. Let Syncy turn that memo into a reviewable contact brief and project suggestion, with the user still deciding what is correct and what to send.

For a user satisfied with a notes app, the value must show up as less cleanup and more relevant follow-ups. For a user already paying for folk, Popl, Blinq, HubSpot, or a CRM, the case is weaker unless Syncy demonstrates better project matching or fits into that existing workflow. Syncy currently keeps contact records in its own database and does not write them back to Notion; that is a real adoption cost to disclose.

## 6. Competitors and alternatives

Research checked official product/pricing pages on 25 October 2026. Pricing is shown as advertised on those pages and may change; this was a desk review, not hands-on product testing.

| Alternative | What it already does | Public price / implication |
|---|---|---|
| **LinkedIn + phone notes + memory** | Free, familiar, and already where many users connect. Notes and profile links can be saved, but the user has to join them up and decide what to do next. | $0. This is Syncy’s most important alternative because switching costs are low and users may tolerate the manual workflow. |
| **Popl** | Event capture, badge/profile scanning, CRM sync, and AI Recorder. The official guide says AI Recorder can return a transcript, summary, insights, next steps, and feedback. Its “Recap Notes” flow captures the rep’s own post-conversation recollection without recording the lead. | AI Recorder requires Popl’s Event Lead Capture plan; the feature guide describes it as beta during the period reviewed. Team price is sales-led/custom. This is a very close competitor. [AI Recorder guide](https://support.popl.co/en/articles/17005320-using-ai-recorder-to-capture-event-conversations), [pricing](https://popl.co/pages/pricing) |
| **folk** | Personal/team relationship CRM with business-card scanning, transcribed voice notes, recap and follow-up assistants, and broader contact/activity context. | Standard lists **€22/member/month billed yearly** or **€27 monthly**. It already covers much of the voice-note and follow-up workflow. [Pricing](https://www.folk.app/pricing), [voice notes](https://help.folk.app/en/articles/15899229-record-a-voice-note), [Recap Assistant](https://help.folk.app/en/articles/12893225-recap-assistant) |
| **Blinq** | Digital cards, universal contact scanning, AI Notetaker, enrichment, exports, and team/event lead-capture features. | Premium lists **$9.99/month**; Business lists **$6.99/user/month billed monthly** on the page reviewed. AI notes and contact capture are not a unique Syncy advantage. [Blinq pricing](https://blinq.me/pricing) |
| **HubSpot** | Free CRM/contact management plus a free business-card scanner that creates CRM contacts and supports follow-up workflows. | Free tools list up to two users and 1,000 contacts; the scanner is advertised as free. A buyer may prefer the broader established CRM. [Free tools/pricing](https://www.hubspot.com/pricing/crm?tier=starter), [business-card scanner](https://www.hubspot.com/products/business-card-scanner-app) |
| **Cvent LeadCapture** | Event-focused lead capture and qualification, CRM export, post-event follow-up, and event ROI reporting. | No standard price was displayed on the product page reviewed; it is a more event-team-oriented comparison than Syncy’s current solo workflow. [Cvent LeadCapture](https://www.cvent.com/en/event-marketing-management/lead-capture) |
| **Notion itself** | A project workspace and, on Business, AI Meeting Notes and AI workspace features. A Notion user may already use these for meeting context. | Notion Free is €0 for an individual; Business lists €19.50/member/month. Syncy’s case is QR contact capture plus matching to the user’s project list, not replacing Notion’s notes or AI. [Notion pricing](https://www.notion.com/pricing) |
| **Attio / Dex** | Broader relationship CRMs. Attio emphasizes contact syncing, enrichment, call intelligence, and automation; Dex emphasizes personal relationship management, integrations, voice mode, and notetaker integrations. | Attio is free up to three seats, with paid tiers; Dex lists Professional at $20/month. They are adjacent alternatives and demonstrate the crowded personal-CRM space. [Attio pricing](https://attio.com/pricing), [Dex pricing](https://getdex.com/pricing/) |

**Competitive conclusion:** Syncy is not first to AI voice notes or event lead capture. It should compete on a focused solo workflow, lower setup overhead, and matching each user’s post-event contact context against their own project descriptions. That is a *candidate* distinction, not a proven moat. The closest tests are against a user’s real workflow in folk/Popl/Blinq and against free Notes + LinkedIn.

## 7. Buyer, price, and why switch

### Who pays?

- **Initial buyer:** the independent consultant who is also the user; likely paid from their own software/tools budget.
- **Later team buyer:** a founder or sales/BD lead, potentially from sales, marketing, or event budget. That is a future segment; team controls and CRM integration are not complete today.

### How much?

Use **€9.99 per user/month** as the current pitch hypothesis. The existing project tasks also mention a free tier and a €19/seat team tier, but those are future ideas, not current plans or features. No billing system or paid customer evidence was found in the repo. Competitor prices help set a test range; they do not establish Syncy’s willingness to pay.

### Why switch?

> “We are not asking people to abandon LinkedIn or their CRM. We are testing whether they want one quick post-conversation capture flow that turns a memo into a contact brief connected to their active projects and a next step they can review.”

The buyer should switch only if a pilot proves that this flow saves enough follow-up work or improves follow-up quality compared with their current stack. Do not claim one client will pay for years unless customer evidence supports that claim.

### How to validate willingness to pay

Ask people to show the last event’s actual notes and workflow before showing Syncy. Then run a paid pilot or ask for a real commitment at the proposed price. Measure repeat use across at least two events. “That sounds useful” is not willingness-to-pay evidence.

## 8. Go-to-market and what to measure

### First customer acquisition hypothesis

Start in Berlin and then expand to Germany through:

- Independent-consultant communities where people already attend in-person events.
- Relevant B2B meetups and trade-fair exhibitor networks.
- Referrals from early users and event organizers.
- Notion/user communities where project databases are already part of the workflow.

These are channels to test, not proven acquisition channels. Make a list of named events and communities after choosing the ICP and deduplicating the exhibitor/user base.

### Pilot design

Recruit 8–10 target users for interviews, then 5–10 for a real-data pilot. Ask each to use Syncy after multiple actual conversations. Compare with their existing method. The research checklist in `docs/BUSINESS_TASKS.md` already has a past-behavior interview script; use it before pitching the app.

Track:

- Time from scan to saved, reviewed contact.
- Contacts captured per event and share with a completed note.
- Number of AI fields the user edits.
- Project match accepted versus manually changed or cleared.
- Follow-up drafts edited, copied, and actually sent (Syncy does not send them).
- Repeat use at the next event and week-four retention.
- Paid conversion at €9.99, churn, support time, and acquisition cost.

The highest-value evidence is repeat use and a paid commitment, not a positive demo reaction.

## 9. What AI does, and why it belongs

The current flow makes three model requests for a voice contact:

1. Whisper transcribes the user’s post-conversation memo when recording stops.
2. GPT extracts only supported facts into a structured summary, discussed points, needs, and next step.
3. GPT compares the memo with the user’s active project titles/descriptions and proposes one project (or none), a reason, confidence, and a short follow-up draft.

The prompts tell the model not to invent missing facts, use empty values for unknowns, limit discussed points, ground project reasons in the note, and keep the draft short. The user can edit the transcript and generated fields before saving. These constraints reduce the risk; they do not eliminate model errors. The next step is to measure correction rates and inspect bad matches.

For a typed note, Whisper is not called; the workflow uses the two text calls. The system does not send messages automatically.

## 10. Cost to run: variable AI cost per contact

**Rates checked 25 October 2026:** OpenRouter lists GPT-6 Luna at **$0.10 per million input tokens** and **$0.50 per million output tokens**. Whisper Large V3 Turbo lists **$0.000003 per audio second**. OpenRouter Standard charges a **5.5% fee when buying credits**, rather than marking up each inference request. [GPT-6 Luna](https://openrouter.ai/openai/gpt-6-luna?view=api), [Whisper Large V3 Turbo](https://openrouter.ai/openai/whisper-large-v3-turbo), [OpenRouter pricing and credit fees](https://openrouter.ai/pricing)

### Planning assumptions

- Two GPT calls together use **2,000 input tokens and 300 output tokens**. This is an estimate for a short memo and a small project list, not a measured average. Longer notes and more/larger Notion project descriptions increase input tokens.
- The voice scenarios use a **20-second typical memo** and a **60-second maximum-length memo**. The product currently caps recording at 60 seconds.
- The 5.5% OpenRouter credit-purchase fee is applied to the modeled inference cost. Taxes, exchange costs, retries, and other fees are excluded.

| Contact type | Calculation before OpenRouter credit fee | Estimated cost including 5.5% fee |
|---|---:|---:|
| Typed note | 2,000 input × $0.10/M + 300 output × $0.50/M = $0.00035 | **$0.00037/contact** |
| Voice, 20 seconds | $0.00035 GPT + 20 × $0.000003 Whisper = $0.00041 | **$0.00043/contact** |
| Voice, 60 seconds | $0.00035 GPT + 60 × $0.000003 Whisper = $0.00053 | **$0.00056/contact** |

At the 60-second scenario, 1,000 voice contacts cost about **$0.56** in model inference and credit fees; 10,000 cost about **$5.59**. At the 20-second scenario, 1,000 cost about **$0.43**. These are model-only estimates, not total operating cost. The function logs provider usage/cost fields; collect several real requests and replace the token assumption with observed usage before making a measured-cost claim.

## 11. Annual software operating budget: 1,000 monthly active users

This is a lean production baseline for one Supabase project and one Vercel developer seat. Prices are USD before tax and usage overages; the AI scenarios assume every modeled contact is a voice contact of up to 60 seconds.

| Service | Planning plan | Annual estimate | Notes |
|---|---|---:|---|
| Supabase | Pro, one production project | $300 | $25/month starting price. Includes 100,000 MAU in the current plan; 1,000 MAU is below that included limit. Monitor database, egress, compute, storage, and function usage. [Pricing](https://supabase.com/pricing) |
| Vercel | Pro, one developer seat | $240 | $20/month with $20 included usage credit on the current plan. Additional developer seats and overages can raise the bill. [Pricing](https://vercel.com/pricing) |
| `.com` domain | Cloudflare Registrar example | $10.46 | Current listed registration/renewal price; domain availability and tax can differ. [Price table](https://pricing.registrar.cloudflare.com/) |
| Auth email | Resend Free | $0 | 3,000 emails/month and 100/day. Use a verified sender domain. [Pricing](https://resend.com/pricing) |
| Google OAuth | No per-login line item assumed | $0 | OAuth setup/maintenance is still required; this is an estimate, not a contractual price quote. |
| Notion | User connects their own workspace | $0 to Syncy | No central Notion seat is budgeted. The user’s own Notion plan, if any, remains their cost. [Notion pricing](https://www.notion.com/pricing) |
| **Fixed software baseline** |  | **$550.46/year** | Before AI usage, taxes, and overages. |

| Usage case, 1,000 MAU | Annual AI estimate | Total annual estimate |
|---|---:|---:|
| 1 max-length voice contact/user/month (12,000/year) | $6.71 | **$557.17/year** |
| 10 max-length voice contacts/user/month (120,000/year) | $67.10 | **$617.56/year** |

If the free email plan is not adequate, Resend Pro currently lists $20/month and 50,000 emails/month. That adds **$240/year**, taking these totals to approximately **$797.17/year** or **$857.56/year**. A signup burst can also be constrained by Supabase Auth’s rate limit: its default SMTP service is currently 2 emails/hour and is intended for non-production; after custom SMTP is set, the initial rate limit is 30/hour and can be adjusted. [Resend pricing](https://resend.com/pricing), [Supabase custom SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp)

### What this estimate excludes

Founder/staff time, paid customer acquisition, payment processing, legal/security review, customer support, analytics, backups beyond the selected plan, extra Vercel seats, production email beyond quotas, and provider/model price changes. It assumes the OpenRouter Standard credit path; the credit fee treatment differs if using provider keys directly. Supabase and Vercel plan/usage details can change, so recheck before submitting a formal budget.

## 12. “How much money do you need?” — separate hosting from runway

These are different answers:

1. **To operate the current product at small scale:** about **$46/month fixed software spend**, then roughly **$0.00043–$0.00056 per voice contact** under the stated model/token assumptions. At 1,000 monthly active users and 1–10 max-length voice contacts each per month, the modeled total is about **$557–$618/year** on free auth email, or **$797–$858/year** with Resend Pro.
2. **To fund a 12-month validation and product-hardening phase:** a reasonable *planning scenario* is **€120,000**, with a deliberately lean team assumption. This is not money raised, an audited forecast, or the cost to keep the servers online.

| 12-month planning use | Amount | Assumption |
|---|---:|---|
| Founder living-cost allocation | €36,000 | One founder at €3,000/month; assumes the rest of the founding team defers compensation or contributes time. |
| Product/engineering contractor | €42,000 | Roughly half-time for a year. Planning rate only; obtain actual quotes. |
| User pilots, events, and acquisition | €12,000 | Travel, pilot support, event presence, and early channel tests. |
| Privacy, legal, security, accounting | €10,000 | Allowance, not a provider quote. |
| Hosting and software | €5,000 | Includes a buffer above today’s small-scale infrastructure estimate as usage grows. |
| Contingency | €15,000 | Covers slippage and unknowns. |
| **Illustrative 12-month total** | **€120,000** | **A planning case for validation and hardening, not a finalized funding ask.** |

**Suggested judge wording:** “Our current server and AI bill is not the funding problem: at 1,000 monthly active users we estimate roughly $557–$858 a year depending on email volume and usage. If we raise, the planning case is €120,000 for twelve months to validate paid demand, harden privacy and reliability, and run pilots. That assumes one founder’s basic runway and half-time engineering; paying all five founders would require a larger plan. We have not yet validated the ask with customer revenue or signed commitments.”

If eligible through a university or research institution, EXIST may be a non-dilutive route: the current program lists 12 months of support, monthly stipends that vary by founder status, up to €10,000 in material costs for a solo founder or €30,000 for a team, and €5,000 for coaching. Eligibility and approval are required; do not present it as secured. [EXIST Startup Grant](https://exist.de/programm/gruendungsstipendium/)

## 13. Privacy, trust, and dependencies

### Data flow and honest privacy statement

- Syncy does not scrape profile data. The QR contains a profile URL; users add their own notes.
- The recording is a **memo by the Syncy user after the conversation**, not a feature intended to record the other person’s speech. The audio is sent to the Edge Function and then to OpenRouter for transcription; Syncy does not persist the audio file. The transcript and contact data are stored in the user’s Supabase workspace.
- OpenRouter’s current policy says audio inputs are forwarded to the selected model provider and are not persisted by OpenRouter beyond routing except for abuse, security, billing, or legal needs. Its policy also says model providers’ retention/training practices vary. Do not tell users “the audio never leaves our system” or “no provider sees it.” Review the actual provider route and terms before production. [OpenRouter privacy policy](https://openrouter.ai/privacy)
- Supabase can host the primary project in Frankfurt, but region selection is a data-location control, not proof of GDPR compliance; some operational processing can occur outside that region. [Supabase regions](https://supabase.com/docs/guides/platform/regions), [data residency FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq)
- Contact details and notes can be personal data. Before opening broadly, document purpose/legal basis, privacy notice, retention/deletion handling, data-subject request process, vendor DPAs/subprocessors, and transfers. Do not claim “GDPR compliant” solely because RLS or a Frankfurt region is configured. The GDPR principles include purpose limitation and data minimization. [GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- German law criminalizes, subject to the statutory elements, unauthorized recording of another person’s non-public spoken words. Keep the product’s capture model as the user’s post-chat recollection; do not record the other person’s conversation without the required permission and legal review. [German Criminal Code §201](https://www.gesetze-im-internet.de/stgb/__201.html)
- The hackathon Field Notes say to avoid real personal data in the demo. Use fictional personas and synthetic notes for judge-facing demonstrations.

### Main dependencies and failure modes

| Dependency | What depends on it | Risk / response |
|---|---|---|
| Supabase | Auth, Postgres, RLS, Edge Functions, Notion connection state | Monitor quota, backups, rate limits, and account recovery; keep provider secrets server-side. |
| OpenRouter + chosen model providers | Whisper transcript and both GPT outputs | Model prices, routing, retention rules, latency, or availability can change. Keep manual editing/retry and spend controls; measure cost and failures. |
| Vercel | Web hosting and deployment | Usage/seat costs can rise; keep a deploy rollback path and monitor spend. |
| SMTP/email provider | Email confirmation and password reset | Verified sender/domain and deliverability matter. Supabase’s default sender is testing-only and rate-limited. |
| Notion OAuth/API | Per-user project import | User must authorize and share the source database; import is manual, one-way, and limited to available title/description fields. Notion outages or schema variation can interrupt imports. |
| User-provided project quality | Match quality | Sparse/ambiguous descriptions make project matching weak; ask users for clear descriptions and allow “no project” or manual assignment. |

## 14. “Why us?” and defensibility

The team brief identifies Nodir (PM/frontend/demo), Utkarsh (backend/AI), Bhuvanesh (data/dashboard/cost tracking), Anastasiya (user research/positioning/GTM), and Sadaf (economics/pricing/slides). Together, those roles cover product, engineering, research, and business validation. The repository does not establish prior founder expertise in event sales, customer traction, or a proprietary data advantage; do not invent a founder-market-fit story.

**There is no demonstrated moat yet.** Transcription and summarization use commodity APIs. Notion import and matching can be copied. A future advantage could come from a trusted workflow habit, integrations users rely on, better project-fit feedback, and measurable follow-up outcomes—but only if usage and retention prove it. Say “we are testing this wedge,” not “we have a moat.”

## 15. Likely judge questions — concise answer scripts

### What problem are you solving?

“After meeting a potential client, people often save a name or profile link but lose the context: what they discussed, why the person matters, and what to do next. Syncy is built to capture that context while it is fresh.”

### Who is the first user?

“An independent B2B consultant in Germany who attends events to find project work and already tracks engagements in Notion. The first buyer is that same person.”

### What does the product do?

“Scan a contact’s QR profile link, dictate a post-chat memo, review the transcript, then get an editable summary, a suggested match to one of your imported projects, and a follow-up draft.”

### What does AI do that a normal form cannot?

“It turns a short, unstructured memo into structured contact context, compares the note against the user’s own project descriptions, and drafts a next step. The user reviews the output; AI does not send messages.”

### Why not just use Notes and LinkedIn?

“Those are free and remain valid choices. Syncy is testing whether it can remove the manual link between the profile, the conversation memo, and the user’s own project list. If it does not save time or improve follow-up, there is no reason to switch.”

### Who are your competitors?

“The current workflow—LinkedIn plus Notes—is the biggest alternative. Direct products include Popl, folk, and Blinq; HubSpot and Cvent serve broader CRM and event-lead workflows. Their features overlap with capture and AI notes, so our test is whether project-aware follow-up is useful enough for a solo Notion user.”

### What is your USP?

“Project-aware follow-up: Syncy takes a post-event contact memo and compares it with project descriptions the user imports from their own Notion. That is our candidate differentiator, not a claim that nobody else can do it.”

### Why will people switch?

“We will not ask them to replace LinkedIn or a CRM. We are testing whether they will add Syncy to cut the manual after-event cleanup and produce more relevant next steps. We have to prove that in paid pilots.”

### How big is the market?

“Germany had 304 trade fairs and about 192,000 exhibitor participations in 2025, and 3.2 million SMEs in 2024. Those are broad context numbers, not our TAM. We are building a bottom-up estimate from deduplicated event lists and the number of target users who actually match our workflow.”

### How much will it cost?

“At the current listed rates, a short 20-second voice contact is estimated around $0.00043 for the two GPT calls plus transcription, and a full 60 seconds around $0.00056, including OpenRouter’s credit fee. That uses an assumed 2,000 input and 300 output tokens; we will replace it with measured usage. At 1,000 MAU, the modeled software total is about $557–$618/year with free auth email, or about $797–$858 with Resend Pro.”

### What do you charge?

“Our current price hypothesis is €9.99 per user per month. Billing is not built and we have not validated willingness to pay. We’ll test the price with paid pilots rather than rely on survey answers.”

### How much funding do you need?

“The software bill is small; a lean 12-month validation and hardening plan is about €120,000 under our assumptions. That funds one founder’s basic runway, half-time engineering, pilots, legal/privacy work, software, and contingency. It is a planning scenario—not money raised—and it assumes the other founders defer compensation.”

### Is the product GDPR compliant?

“We have per-user data isolation and don’t scrape profiles, and Syncy does not store the audio file. The audio and notes still pass through third-party AI providers, and contact data is personal data. We need a formal review of legal basis, notices, vendor terms, retention/deletion, and international transfers before claiming compliance.”

### Is the other person recorded?

“No. The intended flow is that the Syncy user dictates a memo after the conversation. We are not building covert recording of the other person. We will keep that boundary clear in product copy and user guidance.”

### What if AI gets the person or project wrong?

“The prompts ask it to use only facts in the note and allow unknown fields or no project. The user can edit the transcript, summary, and project before saving. We still need to measure correction and match-override rates.”

### Why does Notion import projects only?

“The user’s project descriptions give the matcher context. Today the user imports them into Syncy, and contacts remain in Syncy. Contact write-back and automatic two-way sync are not implemented.”

### What is the moat?

“We do not have a proven moat today. The hypothesis is that the repeated post-event workflow, project context, and accumulated user feedback create a useful habit. We need repeat-use data and a better integration story to support that.”

### What will you prove next?

“We will observe target users handling their last real event, run paid pilots across multiple events, measure time-to-follow-up and repeat usage, and test whether project matching changes what users actually do. Then we can make a credible SAM, price, and funding case.”

## 16. Sources and checked material

### Hackathon and repository sources

- User-provided *BCBT_Hackathon_Field_Notes.pdf*, pp. 2–3 for scoring weights, judge prompts, and interview guidance.
- [Current setup and integration behavior](../README.md)
- [Current product TODO and deferred billing](../TODO.md)
- [Current schema and Notion import direction](DATA_MODEL.md)
- [Current runtime flow and dependencies](ARCHITECTURE.md)
- [Business interview / pricing / market checklist](BUSINESS_TASKS.md)
- [Team roles and earlier slide assumptions](../SLIDES_BRIEF.md)
- [Current AI extraction and project-match prompts](../supabase/functions/process-note/prompts.ts)
- [Model calls, environment variables, and voice transcription behavior](../supabase/functions/process-note/index.ts)

### Market, competitor, and cost sources

- [AUMA, key figures for German trade fairs](https://www.auma.de/en/trade-fair-venue-germany/key-figures/)
- [Destatis, German SMEs](https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/Kleine-Unternehmen-Mittlere-Unternehmen/_inhalt.html)
- [Destatis, labour costs](https://www.destatis.de/DE/Themen/Arbeit/Arbeitskosten-Lohnnebenkosten/_inhalt.html)
- [OpenRouter, GPT-6 Luna rate](https://openrouter.ai/openai/gpt-6-luna?view=api)
- [OpenRouter, Whisper Large V3 Turbo rate](https://openrouter.ai/openai/whisper-large-v3-turbo)
- [OpenRouter, pricing and credit fees](https://openrouter.ai/pricing)
- [Supabase, pricing](https://supabase.com/pricing)
- [Supabase, Auth SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp)
- [Vercel, pricing](https://vercel.com/pricing)
- [Resend, pricing](https://resend.com/pricing)
- [Cloudflare Registrar, domain prices](https://pricing.registrar.cloudflare.com/)
- [Popl, AI Recorder](https://support.popl.co/en/articles/17005320-using-ai-recorder-to-capture-event-conversations) and [pricing](https://popl.co/pages/pricing)
- [folk, pricing](https://www.folk.app/pricing), [voice notes](https://help.folk.app/en/articles/15899229-record-a-voice-note), and [Recap Assistant](https://help.folk.app/en/articles/12893225-recap-assistant)
- [Blinq, pricing and features](https://blinq.me/pricing)
- [HubSpot, pricing](https://www.hubspot.com/pricing/crm?tier=starter) and [business-card scanner](https://www.hubspot.com/products/business-card-scanner-app)
- [Cvent, LeadCapture](https://www.cvent.com/en/event-marketing-management/lead-capture)
- [Notion, pricing](https://www.notion.com/pricing)
- [Attio, pricing](https://attio.com/pricing)
- [Dex, pricing](https://getdex.com/pricing/)
- [EXIST Startup Grant](https://exist.de/programm/gruendungsstipendium/)
- [OpenRouter, privacy policy](https://openrouter.ai/privacy)
- [Supabase, available regions](https://supabase.com/docs/guides/platform/regions) and [data-residency FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq)
- [EU GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [German Criminal Code §201](https://www.gesetze-im-internet.de/stgb/__201.html)

