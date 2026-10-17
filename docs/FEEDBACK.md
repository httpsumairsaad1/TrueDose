# Product Feedback: MCP & Alexa+ Integration

> **Project:** OmniCare Mesh  
> **Evaluation Date:** October 2026

---

## 1. Model Context Protocol (MCP) Streamable HTTP Transport (Spec 2025-11-25)

### Strengths
- **Decoupled Architecture:** Having clear JSON-RPC methods (`tools/list`, `tools/call`, `initialize`) makes building self-hosted servers straightforward.
- **Speakable Output Pattern:** Returning both human-speakable text (`content: [{ type: 'text', text: '...' }]`) and `structuredData` in a single envelope allows voice assistants to reply naturally while client UIs update state.

### Friction & Suggestions
1. **Human-in-the-Loop Pausing:** The standard MCP `tools/call` assumes synchronous tool execution. In safety-critical contexts (like voice consent or physical actuator confirmation), a tool needs to yield a `pending` state with an expectation of asynchronous resumption.
   - *Suggestion:* Introduce a formal `pending_confirmation` status in the MCP standard response metadata, specifying `requiredCallerRole` and `timeoutSeconds`.
2. **Streaming Headers in HTTP:** Some cloud load balancers buffer JSON responses unless explicit `transfer-encoding: chunked` or SSE headers are sent. Specifying standard headers for Streamable HTTP in the official specification documentation would prevent cross-cloud edge cases.

---

## 2. Alexa+ Simulated Experience Path

### Strengths
- **Testing Without Hardware:** The simulated path allows rapid iteration on voice UX, visual feedback, and caregiver SMS bridges without requiring physical hardware deployment.
- **Multi-Party Choreography:** Voice experiences often involve more than one user (e.g. elder speaking to Alexa, caregiver texting from outside). Showing this two-sided dialogue side by side was essential for family trust.

### Friction & Suggestions
- **Confirmation Timeouts:** Older adults need longer to answer voice prompts (often 10–20 seconds instead of the standard 5-second voice assistant reprompt). The simulation explicitly addresses this with non-rushed consent dialogs and persistent control panels.
