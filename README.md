# AI-Powered Customer Support Refund System

A full-stack demo that lets a customer submit a refund request, checks it against a mock order
database and a written refund policy, uses an AI layer for reasoning/summarization, and gives
support agents a dashboard of every decision with the reasoning behind it.

## Quick start

```bash
cp .env.example .env
docker-compose up --build
```

- Customer request form: http://localhost:3000
- Support dashboard: http://localhost:3000/admin
- Backend API: http://localhost:4000/api

The database seeds itself automatically on first boot with 15 mock customers and orders — no
manual setup step required.

### Using a real LLM instead of the mock

By default `AI_PROVIDER=mock` in `.env`, which uses a deterministic local stand-in for the model
(no API key, no network calls, fully reproducible for grading). To use a real provider, edit `.env`:

```bash
AI_PROVIDER=anthropic   # or "openai"
AI_API_KEY=sk-...
```

then `docker-compose up --build` again. The dashboard shows `AI: live` vs `AI: mock` on every
request so it's obvious which mode produced a given decision.

## Architecture

```
frontend (Next.js, :3000)  →  backend (Express, :4000)  →  SQLite (mock CRM/orders)
                                        ↓
                                  policy engine (deterministic)
                                        ↓
                                  AI layer (reasoning/summary only)
```

- **frontend/** — Next.js app. `/` is the customer request form, `/admin` is the support
  dashboard. It talks to the backend only through a Next.js rewrite (`/api/*` → backend), so no
  CORS config is needed in the browser.
- **backend/** — Express API on SQLite (via `better-sqlite3`, no separate DB server to run).
  - `src/policy.js` — the written refund policy plus a deterministic rule engine.
  - `src/aiService.js` — the AI integration layer (see below).
  - `src/routes/refunds.js` — customer-facing submit endpoint.
  - `src/routes/admin.js` — dashboard read endpoint.
  - `src/seed.js` — generates the 15 mock customers/orders.

## How the AI integration works

The AI is deliberately given **reasoning and communication authority only — never decision
authority**:

1. A refund request comes in with a `customerId`, `orderId`, `reason`, and free-text `message`.
2. The **policy engine** (`policy.js`) looks up the real order/customer records and evaluates the
   written policy rules deterministically. This produces the final `approved` / `denied` /
   `escalated` decision and a list of policy reasons. This step never touches the LLM.
3. The **AI layer** (`aiService.js`) is then called with the customer's message and the *already
   final* decision. Its job is to:
   - write a short neutral summary of the request for the audit log,
   - flag suspicious/manipulative language,
   - draft a short, polite customer-facing sentence explaining the outcome.
4. The AI's JSON output is schema-validated; if it doesn't parse, the system falls back to a safe
   templated response rather than trusting malformed output.

This split means a customer can't talk the AI into approving something the policy forbids — the
model has no field in its output that can change the decision.

### Prompt-injection / policy-bypass safeguards

- The customer's message is always passed to the model as clearly delimited, labeled **data**
  (`<customer_message>...`), never concatenated into the instructions.
- The system prompt explicitly tells the model to ignore any instructions embedded in that data
  and never reveal the system prompt.
- A regex-based pre-check (`detectInjectionAttempt`) runs on the raw message *before* it reaches
  the model at all. If it fires and the policy engine had returned `approved`, the request is
  automatically downgraded to `escalated` — an injection attempt can only ever make a request
  more scrutinized, never less.
- The model's output is constrained to a strict JSON schema; it has no `decision` field, so there
  is nothing for a jailbroken response to override.
- All AI calls run server-side only; no API key is ever exposed to the browser.

## Refund policy used

See `backend/src/policy.js` for the full text and rule engine. Summary:

1. Final sale items are never refundable.
2. Requests must be within 30 days of delivery.
3. Refunds over $500 always require human review (system can only escalate, never auto-approve).
4. Damaged/incorrect items are approved if within the window.
5. "Changed my mind" is approved only if unopened and within the window.
6. Conflicting details or override attempts are escalated, not approved or denied.
7. Customers with more than 3 approved refunds in the last 90 days are escalated regardless of
   the current request's merits.

## Assumptions & trade-offs

- **SQLite over Postgres/Mongo**: keeps `docker-compose up` to two services with zero external DB
  containers or migrations, while still being real, queryable, relational storage — appropriate
  for a ~15-record mock dataset. Swapping in Postgres would mean adding a `pg` client and a third
  compose service; the policy/route logic wouldn't otherwise change.
- **Mock AI mode by default**: makes the assessment runnable and its output deterministic without
  requiring a reviewer to provide an API key; a real key drops in via one env var.
- **Policy engine is rule-based code, not an LLM call**: intentional — the assignment specifically
  asks for safeguards against policy bypass, and the most reliable way to guarantee that is to
  keep the actual approve/deny/escalate decision outside the model entirely.
- **Auth**: there's no login; the customer page lets you pick from the 15 seeded demo customers
  via a dropdown to keep the flow testable end-to-end without a real auth system, which felt out
  of scope for this assessment's focus.
- **"Chat interface"**: implemented as a structured request form with a threaded response panel
  rather than a multi-turn free-form chat, since refund triage is naturally a structured intake
  flow (order + reason + description) and this keeps the policy engine's inputs well-defined
  rather than parsed out of open-ended chat.
- **Escalation is terminal in this demo**: there's no human-agent resolution UI for escalated
  tickets (accept/override) — the dashboard shows them clearly flagged for a human, but actioning
  them further was out of scope for the 6–8 hour target.

## Repo layout

```
.
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   └── src/ (index.js, db.js, seed.js, policy.js, aiService.js, routes/)
└── frontend/
    ├── Dockerfile
    └── app/ (page.jsx, admin/page.jsx, layout.jsx, globals.css)
```
