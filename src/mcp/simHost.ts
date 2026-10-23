import { ScenarioId, SimEvent } from '../types';
import { TrueDoseMcpServer } from './server';

export interface BeatAction {
  events: SimEvent[];
  awaitingInput?: {
    who: 'grandma' | 'daughter';
    options: { id: string; label: string; primary?: boolean }[];
    timeoutMs?: number;
  };
}

export class SimHost {
  private mcp: TrueDoseMcpServer;
  private seq = 0;
  private runId = 'run_1';

  constructor(mcpServer: TrueDoseMcpServer) {
    this.mcp = mcpServer;
  }

  private nextSeq(): number {
    return ++this.seq;
  }

  public reset(scenarioId: ScenarioId) {
    this.seq = 0;
    this.runId = `run_${Date.now()}`;
    this.mcp.reset();

    // Specific scenario setup
    if (scenarioId === 's2') {
      // Scenario 2 starts with Daughter having an active dose_status grant
      this.mcp.setGrant('dose_status', 'active', 24);
    } else if (scenarioId === 's4') {
      // Scenario 4 starts with Daughter having an active gate_lock grant
      this.mcp.setGrant('gate_lock', 'active', 24);
    }
  }

  /**
   * Generates the events for each beat of the given scenario.
   */
  public async getScenarioBeats(
    scenarioId: ScenarioId,
    branchChoice?: string
  ): Promise<BeatAction[]> {
    this.reset(scenarioId);
    const beats: BeatAction[] = [];

    switch (scenarioId) {
      case 's1': {
        // Beat 1: Grandma says "Alexa, I took my morning pill."
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1000,
              type: 'narration',
              payload: { step: 1, of: 3, text: "Grandma speaks to Alexa+ in the kitchen.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1200,
              type: 'orb_state',
              payload: { state: 'listening' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1500,
              type: 'voice',
              payload: { from: 'Grandma', text: "Alexa, I took my morning pill.", channel: 'voice' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1800,
              type: 'pipeline_stage',
              payload: { node: 'msgIn', status: 'ok', label: 'Voice received' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2000,
              type: 'scene_action',
              payload: { actor: 'grandma', action: 'taking_pill' },
            },
          ],
        });

        // Beat 2: MCP call log_dose, Alexa confirms quietly, pillbox ticks
        const logRes = await this.mcp.callTool('log_dose', { time: '08:02' }, 'elder');
        const auditChain1 = this.mcp.getAuditChain();
        const latestAudit1 = auditChain1[auditChain1.length - 1];

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2500,
              type: 'narration',
              payload: { step: 2, of: 3, text: "Alexa+ processes own-data request: no caregiver consent needed.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2700,
              type: 'orb_state',
              payload: { state: 'thinking' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2900,
              type: 'pipeline_stage',
              payload: { node: 'intent', status: 'ok', label: 'log_dose' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3100,
              type: 'pipeline_stage',
              payload: { node: 'mcpCall', status: 'ok', label: 'log_dose()' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3300,
              type: 'pipeline_stage',
              payload: { node: 'consent', status: 'skipped', label: 'Skipped (own data)' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3500,
              type: 'pipeline_stage',
              payload: { node: 'service', status: 'ok', label: 'Dose recorded' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3700,
              type: 'pipeline_stage',
              payload: { node: 'audit', status: 'ok', label: 'Audit logged' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3800,
              type: 'tool_call',
              payload: {
                id: 'call_1',
                tool: 'log_dose',
                caller: 'elder',
                args: { time: '08:02' },
                latencyMs: 14,
                status: 'ok',
                speakable: logRes.speakable,
                data: logRes.data,
                rawJsonRpcRequest: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'log_dose', arguments: { time: '08:02' }, caller: 'elder' } }, null, 2),
                rawJsonRpcResponse: JSON.stringify({ jsonrpc: '2.0', id: 1, result: { content: [{ type: 'text', text: logRes.speakable }], structuredData: logRes.data } }, null, 2),
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3900,
              type: 'audit_entry',
              payload: latestAudit1,
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4100,
              type: 'orb_state',
              payload: { state: 'speaking' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4300,
              type: 'voice',
              payload: { from: 'Alexa+ (simulated)', text: "Got it. Logged for this morning.", channel: 'system' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4500,
              type: 'scene_action',
              payload: { actor: 'pillbox', action: 'mark_today_logged' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4700,
              type: 'pipeline_stage',
              payload: { node: 'replyOut', status: 'ok', label: 'Reply spoken' },
            },
          ],
        });

        // Beat 3: Notice in Daughter's column: quiet check-in, no message needed
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5000,
              type: 'narration',
              payload: { step: 3, of: 3, text: "Privacy preserved: no message sent to family because nothing needed attention.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5200,
              type: 'sms',
              payload: { from: 'System', to: 'Daughter', text: "No message sent. Nothing needed family's attention.", isNotice: true },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5500,
              type: 'orb_state',
              payload: { state: 'idle' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6000,
              type: 'scenario_end',
              payload: {
                receipt: {
                  scenarioTitle: "Morning pill",
                  whatWasShared: ["Logged dose for today (timestamp only)"],
                  withWhom: "Elder private store (none shared with family)",
                  untilWhen: "N/A",
                  whatStayedPrivate: ["Health details", "Medication name", "Caregiver inbox left undisturbed"],
                  consentEnforced: true,
                  undoWindowUsed: false,
                  auditVerified: true,
                },
              },
            },
          ],
        });
        break;
      }

      case 's2': {
        // Missed dose, gentle ladder
        // Beat 1: Clock jumps to "Next morning, 9:00"
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1000,
              type: 'narration',
              payload: { step: 1, of: 6, text: "Next morning, 9:00 AM. Grandma's pill is not logged yet. Escalation ladder begins.", focusedPane: 'scene' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1200,
              type: 'clock',
              payload: { simTime: '09:00', label: "Next morning, 9:00 AM" },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1400,
              type: 'scene_action',
              payload: { actor: 'pillbox', action: 'mark_today_missed' },
            },
          ],
        });

        // Beat 2: Gentle reminder to Grandma first
        await this.mcp.appendAudit(
          'System',
          'escalation_step1',
          'reminder_to_grandma',
          'ok',
          'Friendly reminder sent to Grandma (Ladder Step 1)'
        );
        const audit2 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1800,
              type: 'narration',
              payload: { step: 2, of: 6, text: "Step 1: Gentle reminder directly to Grandma. Quiet chime, no family alert yet.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2000,
              type: 'orb_state',
              payload: { state: 'speaking' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2200,
              type: 'voice',
              payload: {
                from: 'Alexa+ (simulated)',
                to: 'Grandma',
                text: "Friendly reminder: this morning's pill isn't logged yet.",
                channel: 'system',
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2500,
              type: 'audit_entry',
              payload: audit2[audit2.length - 1],
            },
          ],
        });

        // Beat 3: 30-minute grace period skips
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2800,
              type: 'narration',
              payload: { step: 3, of: 6, text: "30-minute grace period elapses to allow Grandma time to take her pill.", focusedPane: 'scene' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3000,
              type: 'clock',
              payload: { simTime: '09:30', label: "Next morning, 9:30 AM (grace period over)" },
            },
          ],
        });

        // Beat 4: Step 2 - Calm check-in SMS to Daughter (only because grant exists!)
        await this.mcp.appendAudit(
          'System',
          'escalation_step2',
          'caregiver_notice',
          'ok',
          'Calm check-in message sent to Daughter (Ladder Step 2, active grant)'
        );
        const audit3 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3400,
              type: 'narration',
              payload: { step: 4, of: 6, text: "Step 2: Calm message to Daughter. Strictly factual, non-alarming language.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3600,
              type: 'sms',
              payload: {
                from: 'Alexa+ (simulated)',
                to: 'Daughter',
                text: "Grandma hasn't logged this morning's pill yet. This is just a check-in, not an emergency.",
                channel: 'sms',
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3800,
              type: 'scene_action',
              payload: { actor: 'daughter', action: 'reading' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4000,
              type: 'audit_entry',
              payload: audit3[audit3.length - 1],
            },
          ],
        });

        // Beat 5: Daughter asks "Did she log it?" -> Alexa replies factual
        const statusRes = await this.mcp.callTool('get_dose_status', { date: 'today' }, 'caregiver');
        const audit4 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4400,
              type: 'narration',
              payload: { step: 5, of: 6, text: "Daughter texts for factual status; MCP server verifies active grant.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4600,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Did she log it?", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4800,
              type: 'pipeline_stage',
              payload: { node: 'consent', status: 'ok', label: 'Grant active' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5000,
              type: 'tool_call',
              payload: {
                id: 'call_dose_status',
                tool: 'get_dose_status',
                caller: 'caregiver',
                args: { date: 'today' },
                latencyMs: 12,
                status: 'ok',
                speakable: statusRes.speakable,
                data: statusRes.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5200,
              type: 'audit_entry',
              payload: audit4[audit4.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5400,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: "Not logged yet today.", channel: 'sms' },
            },
          ],
        });

        // Beat 6: Stop. No further steps, no emergency calls.
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5800,
              type: 'narration',
              payload: { step: 6, of: 6, text: "Hard Safety Rule: Ladder stops after step 2. No automatic emergency calls.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6000,
              type: 'pipeline_stage',
              payload: { node: 'replyOut', status: 'ok', label: 'Ladder complete' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6300,
              type: 'scenario_end',
              payload: {
                receipt: {
                  scenarioTitle: "Missed dose, gentle ladder",
                  whatWasShared: ["Today's medication status: Not logged yet"],
                  withWhom: "Daughter (Caregiver)",
                  untilWhen: "Active 24h grant",
                  whatStayedPrivate: ["No medical records", "No location data", "Zero 911/emergency escalation"],
                  consentEnforced: true,
                  undoWindowUsed: false,
                  auditVerified: true,
                },
              },
            },
          ],
        });
        break;
      }

      case 's3': {
        // Core Scenario: Consent-Gated Gate Check
        // Beat 1: Daughter asks "Is Grandma's gate locked?"
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1000,
              type: 'narration',
              payload: { step: 1, of: 6, text: "Daughter sends an SMS asking about Grandma's front gate.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1200,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Is Grandma's gate locked?", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1500,
              type: 'pipeline_stage',
              payload: { node: 'msgIn', status: 'ok', label: 'SMS received' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1700,
              type: 'scene_action',
              payload: { actor: 'flight', action: 'phone_to_orb' },
            },
          ],
        });

        // Beat 2: Intent check & pending request
        const reqAccess = await this.mcp.callTool('request_access', { scope: 'gate_status' }, 'caregiver');
        const auditChain3 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2000,
              type: 'narration',
              payload: { step: 2, of: 6, text: "Caregiver has no active grant. MCP server creates a pending grant and pauses.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2200,
              type: 'orb_state',
              payload: { state: 'thinking' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2400,
              type: 'pipeline_stage',
              payload: { node: 'intent', status: 'ok', label: 'request_access' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2600,
              type: 'pipeline_stage',
              payload: { node: 'mcpCall', status: 'ok', label: 'request_access()' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2800,
              type: 'pipeline_stage',
              payload: { node: 'consent', status: 'waiting', label: 'Paused for Grandma' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2900,
              type: 'tool_call',
              payload: {
                id: 'call_req_access',
                tool: 'request_access',
                caller: 'caregiver',
                args: { scope: 'gate_status' },
                latencyMs: 16,
                status: 'pending',
                speakable: reqAccess.speakable,
                data: reqAccess.data,
                rawJsonRpcRequest: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'request_access', arguments: { scope: 'gate_status' } } }, null, 2),
                rawJsonRpcResponse: JSON.stringify({ jsonrpc: '2.0', id: 2, result: { content: [{ type: 'text', text: reqAccess.speakable }], structuredData: reqAccess.data } }, null, 2),
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3000,
              type: 'audit_entry',
              payload: auditChain3[auditChain3.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3200,
              type: 'consent_state',
              payload: { scope: 'gate_status', status: 'pending' },
            },
          ],
        });

        // Beat 3: The Consent Pause! Alexa tells Daughter & asks Grandma
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3500,
              type: 'narration',
              payload: { step: 3, of: 6, text: "The Consent Moment: Pipeline is paused. Alexa+ asks Grandma for voice consent.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3700,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: "Grandma needs to say yes first.", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3900,
              type: 'orb_state',
              payload: { state: 'speaking' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4100,
              type: 'voice',
              payload: {
                from: 'Alexa+ (simulated)',
                to: 'Grandma',
                text: "Allow your daughter to check the gate?",
                channel: 'system',
                isConsentPrompt: true,
                consentQuestion: "Allow your daughter to check the gate?",
                options: [
                  { id: 'yes', label: 'Yes, for 24 hours', primary: true },
                  { id: 'no', label: 'No, not now' },
                ],
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4300,
              type: 'scene_action',
              payload: { actor: 'consent_bubble', action: 'show' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4500,
              type: 'awaiting_input',
              payload: {
                who: 'grandma',
                options: [
                  { id: 'yes', label: 'Yes, for 24 hours', primary: true },
                  { id: 'no', label: 'No, not now' },
                ],
                timeoutMs: 30000,
              },
            },
          ],
          awaitingInput: {
            who: 'grandma',
            options: [
              { id: 'yes', label: 'Yes, for 24 hours', primary: true },
              { id: 'no', label: 'No, not now' },
            ],
            timeoutMs: 30000,
          },
        });

        // Beat 4 & 5 Branch depending on Grandma's decision!
        const isYes = branchChoice !== 'no';

        if (isYes) {
          // Branch 4a: Grandma says Yes
          const grantRes = await this.mcp.callTool('grant_or_deny_access', { scope: 'gate_status', decision: 'grant', durationHours: '24' }, 'elder');
          const auditBranchYes = this.mcp.getAuditChain();

          beats.push({
            events: [
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5000,
                type: 'narration',
                payload: { step: 4, of: 6, text: "Grandma grants permission for 24 hours. Voice consent recorded in audit chain.", focusedPane: 'trace' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5200,
                type: 'voice',
                payload: { from: 'Grandma', text: "Alexa, yes, for 24 hours.", channel: 'voice' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5400,
                type: 'pipeline_stage',
                payload: { node: 'consent', status: 'ok', label: 'Granted (24h)' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5600,
                type: 'tool_call',
                payload: {
                  id: 'call_grant',
                  tool: 'grant_or_deny_access',
                  caller: 'elder',
                  args: { scope: 'gate_status', decision: 'grant', durationHours: '24' },
                  latencyMs: 15,
                  status: 'ok',
                  speakable: grantRes.speakable,
                  data: grantRes.data,
                },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5800,
                type: 'audit_entry',
                payload: auditBranchYes[auditBranchYes.length - 1],
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6000,
                type: 'consent_state',
                payload: { scope: 'gate_status', status: 'active', expiresAt: 'in 24 hours' },
              },
            ],
          });

          // Beat 5a: Gate status checked and returned!
          const gateRes = await this.mcp.callTool('check_gate_status', {}, 'caregiver');
          const auditGate = this.mcp.getAuditChain();

          beats.push({
            events: [
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6300,
                type: 'narration',
                payload: { step: 5, of: 6, text: "With active grant, check_gate_status reads mock hardware.", focusedPane: 'scene' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6500,
                type: 'pipeline_stage',
                payload: { node: 'service', status: 'ok', label: 'Gate service: locked' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6700,
                type: 'scene_action',
                payload: { actor: 'gate', action: 'show_locked' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6900,
                type: 'tool_call',
                payload: {
                  id: 'call_check_gate',
                  tool: 'check_gate_status',
                  caller: 'caregiver',
                  args: {},
                  latencyMs: 18,
                  status: 'ok',
                  speakable: gateRes.speakable,
                  data: gateRes.data,
                },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7100,
                type: 'audit_entry',
                payload: auditGate[auditGate.length - 1],
              },
            ],
          });

          // Beat 6a: Reply to Daughter & Privacy Receipt
          beats.push({
            events: [
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7400,
                type: 'narration',
                payload: { step: 6, of: 6, text: "Factual reply delivered to Daughter. Every step logged in the hash chain.", focusedPane: 'messages' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7600,
                type: 'sms',
                payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: "The gate is locked.", channel: 'sms' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7800,
                type: 'pipeline_stage',
                payload: { node: 'replyOut', status: 'ok', label: 'Reply sent' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 8200,
                type: 'scenario_end',
                payload: {
                  receipt: {
                    scenarioTitle: "Consent-gated gate check (Approved)",
                    whatWasShared: ["Front gate status: Locked (mock)"],
                    withWhom: "Daughter (Caregiver)",
                    untilWhen: "24 hours from consent",
                    whatStayedPrivate: ["Camera video feed", "Doorbell visitor faces", "Inside home motion logs"],
                    consentEnforced: true,
                    undoWindowUsed: false,
                    auditVerified: true,
                  },
                },
              },
            ],
          });
        } else {
          // Branch 4b: Grandma says No!
          const denyRes = await this.mcp.callTool('grant_or_deny_access', { scope: 'gate_status', decision: 'deny' }, 'elder');
          const auditBranchNo = this.mcp.getAuditChain();

          beats.push({
            events: [
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5000,
                type: 'narration',
                payload: { step: 4, of: 6, text: "Grandma says No. Access denied. Zero elder data is leaked.", focusedPane: 'trace' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5200,
                type: 'voice',
                payload: { from: 'Grandma', text: "Alexa, no, not now.", channel: 'voice' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5400,
                type: 'pipeline_stage',
                payload: { node: 'consent', status: 'denied', label: 'Consent Denied' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5600,
                type: 'pipeline_stage',
                payload: { node: 'service', status: 'skipped', label: 'Blocked: not reached' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 5800,
                type: 'tool_call',
                payload: {
                  id: 'call_deny',
                  tool: 'grant_or_deny_access',
                  caller: 'elder',
                  args: { scope: 'gate_status', decision: 'deny' },
                  latencyMs: 14,
                  status: 'denied',
                  speakable: denyRes.speakable,
                  data: denyRes.data,
                },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6000,
                type: 'audit_entry',
                payload: auditBranchNo[auditBranchNo.length - 1],
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6200,
                type: 'consent_state',
                payload: { scope: 'gate_status', status: 'denied' },
              },
            ],
          });

          // Beat 5b: Neutral reply to Daughter
          beats.push({
            events: [
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6500,
                type: 'narration',
                payload: { step: 5, of: 6, text: "Calm, neutral reply to Daughter. No guilt, no diagnostic or alarm wording.", focusedPane: 'messages' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 6700,
                type: 'sms',
                payload: {
                  from: 'Alexa+ (simulated)',
                  to: 'Daughter',
                  text: "Grandma chose not to share that right now.",
                  channel: 'sms',
                },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7000,
                type: 'pipeline_stage',
                payload: { node: 'replyOut', status: 'ok', label: 'Neutral denial sent' },
              },
              {
                v: 1,
                seq: this.nextSeq(),
                runId: this.runId,
                scenarioId,
                t: 7400,
                type: 'scenario_end',
                payload: {
                  receipt: {
                    scenarioTitle: "Consent-gated gate check (Declined)",
                    whatWasShared: ["Nothing"],
                    withWhom: "Daughter (Caregiver)",
                    untilWhen: "N/A",
                    whatStayedPrivate: ["Gate status kept 100% private per Grandma's choice"],
                    consentEnforced: true,
                    undoWindowUsed: false,
                    auditVerified: true,
                  },
                },
              },
            ],
          });
        }
        break;
      }

      case 's4': {
        // Lock with confirm and undo
        // Beat 1: Daughter texts "Lock the gate."
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1000,
              type: 'narration',
              payload: { step: 1, of: 5, text: "Physical actions require two-step confirmation and 60-second undo.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1200,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Lock the gate.", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1500,
              type: 'pipeline_stage',
              payload: { node: 'intent', status: 'ok', label: 'lock_gate' },
            },
          ],
        });

        // Beat 2: Confirmation required
        const lockReq = await this.mcp.callTool('lock_gate', { confirmed: false }, 'caregiver');

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1800,
              type: 'narration',
              payload: { step: 2, of: 5, text: "Safety confirmation requested before physical actuator moves.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2000,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: lockReq.speakable, channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2300,
              type: 'scene_action',
              payload: { actor: 'gate', action: 'waiting_confirm' },
            },
          ],
        });

        // Beat 3: Daughter confirms "Yes." -> Gate swings closed, padlock locks
        const lockConfirmed = await this.mcp.callTool('lock_gate', { confirmed: true }, 'caregiver');
        const auditLock = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2700,
              type: 'narration',
              payload: { step: 3, of: 5, text: "Confirmation received. Mock gate swings closed. 60-second undo window opened.", focusedPane: 'scene' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2900,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Yes.", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3200,
              type: 'scene_action',
              payload: { actor: 'gate', action: 'lock_closed' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3400,
              type: 'tool_call',
              payload: {
                id: 'call_lock_gate',
                tool: 'lock_gate',
                caller: 'caregiver',
                args: { confirmed: true },
                latencyMs: 22,
                status: 'ok',
                speakable: lockConfirmed.speakable,
                data: lockConfirmed.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3600,
              type: 'audit_entry',
              payload: auditLock[auditLock.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3800,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: lockConfirmed.speakable, channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4000,
              type: 'scene_action',
              payload: { actor: 'undo_ring', action: 'start', seconds: 60 },
            },
          ],
        });

        // Beat 4: Grandma says "Alexa, undo."
        const undoRes = await this.mcp.callTool('undo_last_action', {}, 'elder');
        const auditUndo = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4500,
              type: 'narration',
              payload: { step: 4, of: 5, text: "Grandma exercises voice override: 'Alexa, undo'.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4700,
              type: 'voice',
              payload: { from: 'Grandma', text: "Alexa, undo.", channel: 'voice' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4900,
              type: 'tool_call',
              payload: {
                id: 'call_undo',
                tool: 'undo_last_action',
                caller: 'elder',
                args: {},
                latencyMs: 16,
                status: 'ok',
                speakable: undoRes.speakable,
                data: undoRes.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5100,
              type: 'audit_entry',
              payload: auditUndo[auditUndo.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5300,
              type: 'scene_action',
              payload: { actor: 'gate', action: 'unlock_open' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5500,
              type: 'voice',
              payload: { from: 'Alexa+ (simulated)', to: 'Grandma', text: "Done. Gate lock reversed.", channel: 'system' },
            },
          ],
        });

        // Beat 5: Final state & receipt
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6000,
              type: 'narration',
              payload: { step: 5, of: 5, text: "Elder retains ultimate control of physical actuators at all times.", focusedPane: 'scene' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6300,
              type: 'scenario_end',
              payload: {
                receipt: {
                  scenarioTitle: "Lock with confirm and undo",
                  whatWasShared: ["Gate lock action"],
                  withWhom: "Daughter & Grandma",
                  untilWhen: "Reversed within 60-second window",
                  whatStayedPrivate: ["No permanent lock lock-out; elder override preserved"],
                  consentEnforced: true,
                  undoWindowUsed: true,
                  auditVerified: true,
                },
              },
            },
          ],
        });
        break;
      }

      case 's5': {
        // No grant, then revoke
        // Beat 1: Daughter asks for gate status without permission -> Denied
        const deniedDirect = await this.mcp.callTool('check_gate_status', {}, 'caregiver');
        const auditChain5 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1000,
              type: 'narration',
              payload: { step: 1, of: 6, text: "Default Deny: Daughter asks for gate status with no active grant.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1200,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Is the gate locked?", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1500,
              type: 'pipeline_stage',
              payload: { node: 'consent', status: 'denied', label: 'Default Deny' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1700,
              type: 'tool_call',
              payload: {
                id: 'call_blocked_1',
                tool: 'check_gate_status',
                caller: 'caregiver',
                args: {},
                latencyMs: 12,
                status: 'denied',
                speakable: deniedDirect.speakable,
                data: deniedDirect.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 1900,
              type: 'audit_entry',
              payload: auditChain5[auditChain5.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2100,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: deniedDirect.speakable, channel: 'sms' },
            },
          ],
        });

        // Beat 2: Setup beat - Later Grandma grants 24h access
        this.mcp.setGrant('gate_status', 'active', 24);
        await this.mcp.appendAudit(
          'Grandma',
          'grant_access',
          'gate_status',
          'ok',
          'Grandma allowed access for 24 hours'
        );
        const auditGrant2 = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2600,
              type: 'narration',
              payload: { step: 2, of: 6, text: "Grandma previously granted 24-hour access. Grant is active.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 2800,
              type: 'consent_state',
              payload: { scope: 'gate_status', status: 'active', expiresAt: 'in 24 hours' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3000,
              type: 'audit_entry',
              payload: auditGrant2[auditGrant2.length - 1],
            },
          ],
        });

        // Beat 3: Grandma revokes by voice: "Alexa, stop sharing with my daughter."
        const revokeRes = await this.mcp.callTool('revoke_access', { scope: 'gate_status' }, 'elder');
        const auditRevoke = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3500,
              type: 'narration',
              payload: { step: 3, of: 6, text: "Grandma revokes access at any time with a single voice command.", focusedPane: 'messages' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3700,
              type: 'voice',
              payload: { from: 'Grandma', text: "Alexa, stop sharing with my daughter.", channel: 'voice' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 3900,
              type: 'tool_call',
              payload: {
                id: 'call_revoke',
                tool: 'revoke_access',
                caller: 'elder',
                args: { scope: 'gate_status' },
                latencyMs: 14,
                status: 'ok',
                speakable: revokeRes.speakable,
                data: revokeRes.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4100,
              type: 'audit_entry',
              payload: auditRevoke[auditRevoke.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4300,
              type: 'consent_state',
              payload: { scope: 'gate_status', status: 'revoked' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 4500,
              type: 'voice',
              payload: { from: 'Alexa+ (simulated)', to: 'Grandma', text: "Done. She can no longer see that.", channel: 'system' },
            },
          ],
        });

        // Beat 4: Daughter asks again -> Immediately blocked
        const blockedAgain = await this.mcp.callTool('check_gate_status', {}, 'caregiver');
        const auditBlocked = this.mcp.getAuditChain();

        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5000,
              type: 'narration',
              payload: { step: 4, of: 6, text: "Daughter asks again. Revocation takes effect immediately without lag.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5200,
              type: 'sms',
              payload: { from: 'Daughter', to: 'Alexa+ (simulated)', text: "Can I check the gate now?", channel: 'sms' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5400,
              type: 'pipeline_stage',
              payload: { node: 'consent', status: 'denied', label: 'Revoked (blocked)' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5600,
              type: 'tool_call',
              payload: {
                id: 'call_blocked_again',
                tool: 'check_gate_status',
                caller: 'caregiver',
                args: {},
                latencyMs: 11,
                status: 'denied',
                speakable: blockedAgain.speakable,
                data: blockedAgain.data,
              },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 5800,
              type: 'audit_entry',
              payload: auditBlocked[auditBlocked.length - 1],
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6000,
              type: 'sms',
              payload: { from: 'Alexa+ (simulated)', to: 'Daughter', text: blockedAgain.speakable, channel: 'sms' },
            },
          ],
        });

        // Beat 5 & 6: Audit Drawer opening & Summary
        beats.push({
          events: [
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 6500,
              type: 'narration',
              payload: { step: 5, of: 6, text: "Every grant, revoke, and blocked attempt is immutably recorded.", focusedPane: 'trace' },
            },
            {
              v: 1,
              seq: this.nextSeq(),
              runId: this.runId,
              scenarioId,
              t: 7000,
              type: 'scenario_end',
              payload: {
                receipt: {
                  scenarioTitle: "No grant, then revoke",
                  whatWasShared: ["Temporarily gate status, then revoked"],
                  withWhom: "Daughter (Caregiver)",
                  untilWhen: "Revoked immediately by Grandma",
                  whatStayedPrivate: ["Gate status instantly blocked upon revoke"],
                  consentEnforced: true,
                  undoWindowUsed: false,
                  auditVerified: true,
                },
              },
            },
          ],
        });
        break;
      }
    }

    return beats;
  }
}
