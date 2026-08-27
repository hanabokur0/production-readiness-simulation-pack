# Production Readiness Simulation Pack

> Turn production experience into reusable, testable scenarios.

`production-readiness-simulation-pack` (PRSP) is a lightweight gate between a PoC and a production candidate.
It does **not** claim that a simulation makes software production-safe. Instead, it converts common production risks into explicit scenarios, required evidence, and reproducible gate results.

## Why

AI-assisted development has made prototypes dramatically cheaper. The bottleneck moves from **"can we build it?"** to:

- What can break in production?
- Which risks have actually been tested?
- What evidence is still missing?
- Is the current artifact ready to be promoted to the next phase?

PRSP treats experienced operators' failure knowledge as a reusable scenario library rather than leaving it only as tacit knowledge.

## Core flow

```text
PoC
 ↓
app_manifest.yaml
 ↓
Scenario selection
 ↓
Readiness simulation
 ↓
Grader
 ↓
PASS / REVIEW / HOLD / REJECT
 ↓
simulation_receipt.yaml
 ↓
Fix / collect evidence / rerun
 ↓
Production Candidate
```

## Gate semantics

| Gate | Meaning |
|---|---|
| `PASS` | Required evidence exists and the declared check passes. |
| `REVIEW` | A human or specialist should review the result. Not an automatic failure. |
| `HOLD` | Evidence is missing or the condition is not yet verified. **Unknown != Failed.** |
| `REJECT` | A known critical condition fails and promotion should stop. |
| `SKIP` | Scenario does not apply to this application. |

The overall gate is **not an average score**. A critical HOLD or REJECT cannot be hidden by many unrelated PASS results.

## v0.1 scope

v0.1 is intentionally small:

- 30 reusable scenarios across 11 production domains
- YAML app manifest
- YAML scenario schema
- YAML simulation receipt
- Rule-based local simulator
- Browser demo for GitHub Pages
- CI smoke validation

This version validates **declared controls and evidence states**. Later versions can replace declarations with executable adapters.

## Domains

```text
authentication
authorization
failure / chaos
observability
security
billing
customer support
migration
SLA / SLO
load / capacity
legal / compliance routing
```

## Quick start

Requirements: Node.js 20+

```bash
npm install
npm test
npm run simulate
```

Run against another manifest:

```bash
node src/cli.js path/to/app_manifest.yaml
```

The CLI writes a YAML receipt to stdout.

## Example

```yaml
app:
  id: demo-saas
  stage: poc

auth:
  enabled: true
  token_expiry_tested: true
  logout_invalidation_tested: false

billing:
  enabled: true
  payment_failure_tested: true
  duplicate_webhook_tested: false
```

A missing or false verification can produce:

```yaml
scenario_id: AUTH-002
status: HOLD
reason: logout_invalidation_tested is not verified
```

The point is not to say "the app is bad." The point is to say **exactly what is still unknown before promotion**.

## Repository layout

```text
.
├─ README.md
├─ package.json
├─ schemas/
│  ├─ app_manifest.schema.yaml
│  ├─ scenario.schema.yaml
│  └─ simulation_receipt.schema.yaml
├─ scenarios/
│  ├─ auth/
│  ├─ authorization/
│  ├─ failure/
│  ├─ observability/
│  ├─ security/
│  ├─ billing/
│  ├─ support/
│  ├─ migration/
│  ├─ sla/
│  ├─ load/
│  └─ legal/
├─ examples/
│  ├─ app_manifest.yaml
│  └─ simulation_receipt.yaml
├─ src/
│  ├─ engine.js
│  └─ cli.js
├─ docs/
│  ├─ index.html
│  ├─ app.js
│  └─ style.css
└─ tests/
   └─ smoke.test.js
```

## Scenario model

Each scenario contains:

```yaml
id: BILL-001
domain: billing
title: Duplicate webhook is idempotent
severity: critical
applies_when:
  path: billing.enabled
  operator: equals
  value: true
checks:
  - path: billing.duplicate_webhook_tested
    operator: equals
    value: true
    on_fail: HOLD
evidence_required:
  - duplicate webhook test receipt
```

The scenario library is deliberately adapter-agnostic. The same scenario can later be executed by Stripe Test Clocks, a mock server, Playwright, a chaos tool, a load generator, or a human review.

## Promotion rule

Default v0.1 promotion policy:

```text
REJECT exists                 -> REJECT
critical HOLD exists          -> HOLD
other HOLD exists             -> HOLD
REVIEW exists                 -> REVIEW
otherwise                     -> PASS
```

Teams can later add profiles for different risk levels.

## Roadmap

### v0.1 — Model simulation
Manifest + scenario library + gate + receipt.

### v0.2 — Mock adapters
HTTP failures, OAuth mock, database fault fixtures, webhook replay.

### v0.3 — Sandbox adapters
Billing sandbox, email sandbox, test database, external API sandbox.

### v0.4 — Fault injection
Staging chaos, latency injection, rate limiting, dependency failure.

### v0.5 — CI/CD promotion gate
Run PRSP automatically before deployment and retain signed receipts.

### v0.6 — Scenario registry
Import scenario packs from teams and convert incident postmortems into reusable regression scenarios.

## Non-goals

PRSP does not:

- certify legal compliance;
- replace penetration testing;
- replace SRE/security/legal specialists;
- prove that production incidents cannot happen;
- turn a self-declaration into verified evidence.

Its job is narrower: **make production-readiness uncertainty explicit, testable, routable, and repeatable.**

## Design principles

```text
generator != grader != gate != executor
unknown != failed
simulation != certification
experience -> scenario -> evidence -> receipt
```

## License

MIT
