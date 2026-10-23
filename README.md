# TrueDose

> **Safety Invariant Notice:** All data and hardware simulations are clearly tagged as MOCK and strictly non-diagnostic ("Not a medical device").

---

## Project Description: TrueDose

### 1. What TrueDose Does

TrueDose is a consent-first family check-in orchestrator for Alexa+, built as a self-hosted Model Context Protocol (MCP) server.

Most eldercare technology defaults to surveillance: continuous video feeds, invasive location trackers, and automated panic alerts that disempower older adults. TrueDose turns this paradigm upside down: the elder stays in complete control.

* **Preserves Dignity & Privacy:** The elder logs daily routines (like morning medications) simply by speaking to Alexa+. If tasks are completed on schedule, family members are never unnecessarily pinged.
* **Explicit Voice Consent:** If a family caregiver asks about home or medication status (e.g., *"Is Mom's medication taken?"* or *"Is the front gate locked?"*), TrueDose halts the pipeline and requires explicit, real-time voice consent from the elder before any information is shared or any device is actuated.
* **Two-Step Confirmation & Instant Undo:** Any action that alters physical hardware requires explicit confirmation and opens a 60-second active voice undo window, giving the elder immediate authority to reverse accidental commands.
* **Tamper-Evident SHA-256 Audit Chain:** Every single consent grant, denial, revocation, status query, and hardware action is permanently recorded in a cryptographically linked SHA-256 hash chain that can be verified and audited in real time.

---

## 2. Technical Implementation & Code Entry Points

To ensure TrueDose actively utilizes the required Model Context Protocol (MCP) technology rather than just conceptual descriptions, the core runtime imports the official MCP SDK, registers tools with strict JSON-RPC schemas, and launches via a production entry point.

### MCP Server Entry Point (`src/server.ts`)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from "@modelcontextprotocol/sdk/types.js";
import { ConsentEngine } from "./engine/consent.js";
import { AuditChain } from "./crypto/audit.js";

// Initialize the TrueDose MCP Server instance
const server = new Server(
  {
    name: "truedose-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register available tools for Alexa+ and Caregivers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "log_dose",
      description: "Log morning/evening medication taken by elder via voice.",
      inputSchema: {
        type: "object",
        properties: { doseId: { type: "string" }, timestamp: { type: "string" } },
        required: ["doseId"],
      },
    },
    {
      name: "check_gate_status",
      description: "Caregiver query requiring explicit elder voice consent.",
      inputSchema: {
        type: "object",
        properties: { caregiverId: { type: "string" } },
        required: ["caregiverId"],
      },
    },
    {
      name: "lock_gate",
      description: "Actuate hardware lock with 60-second undo window.",
      inputSchema: {
        type: "object",
        properties: { action: { type: "string" } },
        required: ["action"],
      },
    },
  ],
}));

// Tool execution handler with Consent Enforcement & Audit Logging
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "log_dose") {
    AuditChain.record("LOG_DOSE", args);
    return { content: [{ type: "text", text: "Dose successfully logged. Privacy preserved." }] };
  }
  
  if (name === "check_gate_status") {
    const hasConsent = await ConsentEngine.verifyOrPromptElder("gate_status", args);
    if (!hasConsent) {
      return { content: [{ type: "text", text: "PERMISSION_DENIED: Elder declined or ignored request." }], isError: true };
    }
    return { content: [{ type: "text", text: "Gate status: Locked (MOCK)" }] };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start transport entry point
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TrueDose MCP Server running on stdio transport.");
}

main().catch((error) => {
  console.error("Server startup error:", error);
  process.exit(1);
});
```

### MCP Client / Host Configuration (`mcp.json`)

To load the TrueDose MCP server configuration into your local agent or host environment, use the following config:

```json
{
  "mcpServers": {
    "truedose": {
      "command": "node",
      "args": ["dist/server.js"],
      "env": {
        "NODE_ENV": "production",
        "SAFETY_MODE": "strict-consent"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

---

## 3. How It Works (Step-by-Step Flow)

```
[ Elder Voice / Alexa+ ]  <--->  [ TrueDose MCP Server ]  <--->  [ Caregiver / SMS ]
           │                                │                              │
           │                                ▼                              │
           │                     [ Consent & Grant Engine ]                │
           │                     (Default Deny / Time-bound)               │
           │                                │                              │
           ▼                                ▼                              ▼
[ 3D Living Room Scene ]           [ SHA-256 Audit Chain ]         [ Real-Time Trace ]
```

### Step 1: Voice Logging (Autonomous & Private)
The elder speaks naturally to Alexa+: *"Alexa, I took my morning pill."*
* TrueDose's MCP tool `log_dose` records the timestamped event.
* Alexa+ acknowledges softly with neutral, affirming confirmation.
* Zero notifications are sent to caregivers—privacy is preserved because everything is on track.

### Step 2: Gentle Escalation Ladder
If a routine dose is missed past the expected window:
* **Level 1 (Elder Only):** Alexa+ plays a gentle, private audio reminder directly to the elder.
* **Level 2 (Calm Check-in):** Only if the grace period expires without confirmation does TrueDose deliver a factual, neutral check-in to designated family contacts.
* **Hard Safety Rule:** TrueDose never places automated emergency calls or emits screeching alarms.

### Step 3: Consent-Gated Inquiries (Default Deny)
When a caregiver sends a query (e.g., *"Check gate status"*):
1. The caregiver request enters TrueDose as a JSON-RPC 2.0 tool invocation (`check_gate_status`).
2. The MCP pipeline checks active grants in the Consent Engine.
3. If no active grant exists, TrueDose prompts the elder directly: *"Daughter is asking to check the front gate. Do you approve for 24 hours?"*
4. If approved, a time-scoped grant is minted. If declined or ignored, TrueDose returns `PERMISSION_DENIED` with zero data disclosure.

### Step 4: Actuation with 60-Second Undo Ring
When an action is approved (e.g., locking the gate):
* A two-step safety check confirms intent.
* Once actuated, an animated countdown ring begins.
* Grandma can say *"Alexa, undo that"* within 60 seconds to immediately roll back the hardware state.

### Step 5: Cryptographic Audit Trail
Every action—authorized, denied, revoked, or undone—is hashed with its predecessor block (`previousHash + timestamp + payload + caller`). Anyone can run the in-browser **Verify Chain** tool to validate the cryptographic integrity of the logs.

---

## 4. Key Architecture & Differentiators

* **Real MCP Server (Streamable HTTP & Stdio):** Implements JSON-RPC 2.0 endpoints supporting tools like `log_dose`, `get_dose_status`, `request_access`, `grant_or_deny_access`, `revoke_access`, `check_gate_status`, `lock_gate`, and `undo_last_action`.
* **Interactive 3D Simulation Stage:** Built with Three.js depicting the elder's bedroom and living space, showing real-time feedback loops between voice commands, device statuses, and caregiver SMS channels.
* **"Try to Break It" Verification Engine:** Includes built-in automated stress-test drills that allow judges and developers to test Default-Deny, Two-Step Confirmation, and SHA-256 tampering detection against the live server.
* **Safety Invariant:** All data and hardware simulations are clearly tagged as MOCK and strictly non-diagnostic ("Not a medical device").
