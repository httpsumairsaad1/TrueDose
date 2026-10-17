# What I Built — OmniCare Mesh

> **Amazon Developer Hackathon:** Build, Ship, Shape  
> **Track:** Alexa+ (Simulated-experience path, backed by a real MCP server)  
> **Challenges:** AWS Builder & Open Source

---

## Pre-Existing Work vs. What Was Built

### Pre-Existing Work
- None. This repository was built entirely from scratch during the hackathon following the specifications in `AGENTS.md`.

### What Was Built
1. **Self-Hosted MCP Server (`server.ts` & `src/mcp/server.ts`):**
   - Implements MCP Specification 2025-11-25 over Streamable HTTP (JSON-RPC 2.0).
   - 10 distinct tools: `log_dose`, `get_dose_status`, `request_access`, `grant_or_deny_access`, `revoke_access`, `check_gate_status`, `lock_gate`, `undo_last_action`, `get_audit_log`, `get_escalation_policy`.
   - Real consent state machine (Pending, Active, Denied, Revoked, Expired).
   - Two-step confirmation and 60-second undo capability for physical world actuators.

2. **Cryptographic SHA-256 Audit Chain (`src/mcp/audit.ts`):**
   - Append-only hash-chained ledger where every block links to `prevHash`.
   - In-browser verification re-computing all digests.
   - Interactive Tamper Test demonstrating cryptographic failure reporting.

3. **Simulation Stage (`src/App.tsx` & components):**
   - **Messages Pane:** Voice chat (waveform, captions, elder typography) and SMS chat (delivery ticks).
   - **Scene Pane:** Geometric faceless figures (Grandma & Daughter), animated Alexa+ voice orb, 7-slot pillbox, mock front gate with 60s countdown ring.
   - **Trace Pane:** 7-stage live visual execution pipeline, real JSON-RPC call logs with expandable payloads, and hash chain viewer.
   - **Transport Bar:** Play/pause, beat stepping (Next/Back), speed multiplier (0.5x, 1x, 2x), event scrubber.
   - **Demo Director / Presentation Mode:** 3-2-1 pre-roll countdown, enlarged text, automated scenario progression under 3 minutes.
   - **Security Drills ("Try to break it"):** 4 live drills testing safety invariants against the real MCP server.
