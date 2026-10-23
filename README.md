# TrueDose

> **Consent-first family check-in orchestrator**, built as a self-hosted Model Context Protocol (MCP) server and demonstrated through a single web page called the **Simulation Stage**.
>
> **Hackathon Track:** Alexa+ (Simulated-experience path, backed by a real MCP server)  
> **Mini Challenges:** AWS Builder & Open Source

---

## 1. Concept & Story

Most eldercare technologies prioritize giving caregivers *more surveillance* (continuous video, location tracking, automated alerts). **TrueDose** turns this model upside down: **the elder stays in complete control**.

### The Story
1. **Calm Daily Check-ins:** Grandma says *"Alexa, I took my morning pill."* The next day she forgets and receives a gentle, private reminder first.
2. **Consent-Gated Inquiries:** When her daughter texts asking *"Is Grandma's front gate locked?"*, the server holds the pipeline until Grandma provides voice consent. If Grandma says *"No, not now"*, zero elder data is leaked.
3. **Safety Invariants & Undo:** Any action that alters the physical world (like locking the gate) requires two-step confirmation and maintains a **60-second undo window** callable by Grandma's voice.
4. **Tamper-Evident Audit Chain:** Every single grant, denial, revoke, read, and actuator trigger writes an immutable block to a SHA-256 hash-chained audit log that Grandma can inspect or revoke at any time.

---

## 2. Hard Safety Rules

1. **Not a medical device:** Never diagnoses, prescribes, or calculates dosage.
2. **Mock data only:** All data, hardware devices, and characters are simulated and clearly marked `MOCK`.
3. **Default deny:** No caregiver can access elder information without an active, unexpired grant.
4. **Gentle escalation only:** Reminder to elder first $\to$ calm check-in to family after grace period $\to$ stop. No automatic emergency calls.
5. **Data minimization:** Timestamps only; zero free-text health logs.
6. **Neutral, calm language:** Factual replies without guilt, panic, or alarms.

---

## 3. Architecture

```
 Browser: Simulation Stage (React + Vite + TypeScript)
 +--------------------+ +--------------------+ +--------------------+
 | A. Messages        | | B. Scene           | | C. Trace           |
 | Grandma (Voice)    | | House, mock gate,  | | 7-node pipeline,   |
 | Daughter (SMS)     | | animated orb,      | | JSON-RPC logs,     |
 | Consent Card & Revoke | pillbox, undo ring | SHA-256 audit chain |
 +--------------------+ +--------------------+ +--------------------+
                          ▲
                          │ Streamable HTTP (JSON-RPC 2.0)
                          ▼
 Express + TypeScript Backend (/mcp & /api/sim/*)
 +---------------------------------------------------------------+
 | TrueDose MCP Server (Spec: 2025-11-25)                        |
 | Tools: log_dose, get_dose_status, request_access,            |
 | grant_or_deny_access, revoke_access, check_gate_status,       |
 | lock_gate, undo_last_action, get_audit_log, escalation_policy |
 +---------------------------------------------------------------+
                          │
          +---------------+---------------+
          ▼                               ▼
    Consent Engine               Cryptographic Audit Chain
 (Active, Denied, Revoked)            (SHA-256 Hashes)
```

---

## 4. The 5 Scenarios

| # | Scenario | Duration | Key Invariant Demonstrated |
|---|---|---|---|
| **1** | **Morning pill** | ~25s | Elder logs own dose; family is not bothered (privacy preserved). |
| **2** | **Missed dose ladder** | ~40s | Gentle reminder to elder $\to$ grace period $\to$ calm check-in to daughter $\to$ stops at step 2. |
| **3** | **Consent-gated gate check** | ~45s | Pipeline halts at **Consent**; Grandma approves for 24h or declines. |
| **4** | **Lock with confirm & undo** | ~45s | 2-step confirmation required; 60-second active undo ring allows voice reversal. |
| **5** | **No grant & voice revoke** | ~35s | Default deny on unauthorized check; instant voice revocation by Grandma. |

---

## 5. Differentiators & Judge Highlights

- **D1. Narrator Bar:** Guidance on every beat with pane focus indicator.
- **D2. The Consent Moment:** High-prominence consent card with 44px touch targets.
- **D3. Plain vs. Developer Trace:** Flip between human sentences and raw JSON-RPC 2.0 payloads.
- **D4. Verify & Tamper Test:** In-browser cryptographic SHA-256 chain verification. Click **Tamper test** to see the system immediately flag the modified block.
- **D5. Privacy Receipt:** Summarizes what was shared, with whom, and what stayed private.
- **D6. Try To Break It:** 4 automated drills testing safety invariants against the real MCP server.
- **D7. Grandma's Control Panel:** Live grant registry with instant voice/button revocation.
- **D8. Presentation Mode (P):** Clean director view with 3-2-1 pre-roll countdown under 3 minutes.

---

## 6. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- npm

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test the Real MCP Endpoint
```bash
# Health check
curl http://localhost:3000/api/health

# List MCP tools via JSON-RPC 2.0
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Test consent gating (returns PERMISSION_DENIED)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"check_gate_status","arguments":{}}}'
```

---

## 7. License

Licensed under the [Apache License, Version 2.0](LICENSE).

---
*Disclaimer: Alexa+ and Ring are simulated. The MCP server, cryptographic audit log, and consent engine are real. Mock data only. Not a medical device.*
