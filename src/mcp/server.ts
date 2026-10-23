import { AuditEntry, Grant, GrantStatus, Scope } from '../types';
import { computeEntryHash } from './audit';

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

export interface McpCallResult {
  tool: string;
  caller: string;
  args: Record<string, unknown>;
  latencyMs: number;
  status: 'ok' | 'pending' | 'denied' | 'error';
  speakable: string;
  data: Record<string, unknown>;
}

export class TrueDoseMcpServer {
  private grants: Map<string, Grant> = new Map();
  private doseLogs: { elderId: string; takenAt: string; day: string }[] = [];
  private gateState: 'locked' | 'unlocked' = 'unlocked';
  private auditLog: AuditEntry[] = [];
  private pendingActions: {
    id: string;
    action: string;
    requestedBy: string;
    expiresAt: number;
    undone: boolean;
    previousState: string;
  }[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.grants.clear();
    this.doseLogs = [];
    this.gateState = 'locked'; // Mock initial state
    this.auditLog = [];
    this.pendingActions = [];

    // Seed mock initial week data (MOCK)
    this.seedMockData();
  }

  private seedMockData() {
    const today = new Date().toISOString().split('T')[0];
    // Seed 6 prior days as logged
    for (let i = 6; i >= 1; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      this.doseLogs.push({
        elderId: 'grandma',
        takenAt: `${dayStr}T08:02:15.000Z`,
        day: dayStr,
      });
    }
  }

  public getTools(): McpToolDefinition[] {
    return [
      {
        name: 'log_dose',
        description: 'Record that a medication dose was taken (timestamp only). Caller must be the elder.',
        inputSchema: {
          type: 'object',
          properties: {
            time: { type: 'string', description: 'ISO timestamp or relative time string' },
          },
        },
      },
      {
        name: 'get_dose_status',
        description: 'Check if medication was logged for today or a specific date. Requires active consent.',
        inputSchema: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'YYYY-MM-DD or "today"' },
          },
        },
      },
      {
        name: 'request_access',
        description: 'Caregiver asks the elder for permission to view data or perform an action.',
        inputSchema: {
          type: 'object',
          properties: {
            scope: {
              type: 'string',
              description: 'The permission scope requested',
              enum: ['dose_status', 'gate_status', 'gate_lock'],
            },
            durationHours: { type: 'string', description: 'Duration requested (e.g. 24)' },
          },
          required: ['scope'],
        },
      },
      {
        name: 'grant_or_deny_access',
        description: 'Elder approves or rejects a pending access request. Voice-controlled consent.',
        inputSchema: {
          type: 'object',
          properties: {
            scope: { type: 'string', description: 'The scope to decide on' },
            decision: { type: 'string', description: 'grant or deny', enum: ['grant', 'deny'] },
            durationHours: { type: 'string', description: 'Duration in hours if granted' },
          },
          required: ['scope', 'decision'],
        },
      },
      {
        name: 'revoke_access',
        description: 'Elder revokes a previously granted access immediately.',
        inputSchema: {
          type: 'object',
          properties: {
            scope: { type: 'string', description: 'The scope to revoke' },
            caregiverId: { type: 'string', description: 'Caregiver identifier' },
          },
          required: ['scope'],
        },
      },
      {
        name: 'check_gate_status',
        description: 'Read the current status of the mock front gate. Requires active consent.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'lock_gate',
        description: 'Lock the mock front gate. Requires confirmation and 60-second undo capability.',
        inputSchema: {
          type: 'object',
          properties: {
            confirmed: { type: 'string', description: 'Confirmation flag ("true" or "yes")' },
          },
        },
      },
      {
        name: 'undo_last_action',
        description: 'Reverse the last physical action if requested within 60 seconds.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_audit_log',
        description: 'Retrieve plain-language entries from the tamper-evident hash-chained audit log.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_escalation_policy',
        description: 'Explain the gentle notification ladder in plain, calm words.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  public async appendAudit(
    actor: string,
    action: string,
    target: string,
    result: 'ok' | 'denied' | 'pending' | 'revoked' | 'error',
    plainText: string
  ): Promise<AuditEntry> {
    const index = this.auditLog.length;
    const ts = new Date().toISOString();
    const prevHash = index === 0
      ? '0000000000000000000000000000000000000000000000000000000000000000'
      : this.auditLog[index - 1].hash;

    const hash = await computeEntryHash(index, ts, actor, action, target, result, plainText, prevHash);

    const entry: AuditEntry = {
      index,
      ts,
      actor,
      action,
      target,
      result,
      plainText,
      prevHash,
      hash,
    };

    this.auditLog.push(entry);
    return entry;
  }

  public getAuditChain(): AuditEntry[] {
    return [...this.auditLog];
  }

  public getGrants(): Grant[] {
    return Array.from(this.grants.values());
  }

  public setGrant(scope: Scope, status: GrantStatus, hours: number = 24) {
    const id = `grant_${scope}`;
    const now = new Date();
    const expires = new Date(now.getTime() + hours * 3600 * 1000);
    this.grants.set(scope, {
      id,
      elderId: 'grandma',
      caregiverId: 'daughter',
      scope,
      status,
      createdAt: now.toISOString(),
      expiresAt: status === 'active' ? expires.toISOString() : undefined,
    });
  }

  public isGrantActive(scope: Scope): boolean {
    const grant = this.grants.get(scope);
    if (!grant) return false;
    if (grant.status !== 'active') return false;
    if (grant.expiresAt && new Date(grant.expiresAt) < new Date()) {
      grant.status = 'expired';
      return false;
    }
    return true;
  }

  public async callTool(
    toolName: string,
    args: Record<string, any>,
    caller: 'elder' | 'caregiver' = 'caregiver'
  ): Promise<McpCallResult> {
    const start = performance.now();

    switch (toolName) {
      case 'log_dose': {
        const todayStr = new Date().toISOString().split('T')[0];
        const already = this.doseLogs.find(l => l.day === todayStr);
        if (already) {
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'log_dose',
            caller: 'elder',
            args,
            latencyMs,
            status: 'ok',
            speakable: 'Already logged at 8:02.',
            data: { alreadyLogged: true, takenAt: already.takenAt },
          };
        }

        const now = new Date().toISOString();
        this.doseLogs.push({ elderId: 'grandma', takenAt: now, day: todayStr });
        await this.appendAudit(
          'Grandma',
          'log_dose',
          'medication_status',
          'ok',
          'Grandma logged her morning dose (time only)'
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'log_dose',
          caller: 'elder',
          args,
          latencyMs,
          status: 'ok',
          speakable: 'Got it. Logged for this morning.',
          data: { success: true, timestamp: now },
        };
      }

      case 'get_dose_status': {
        // Requires consent
        if (!this.isGrantActive('dose_status')) {
          await this.appendAudit(
            'Daughter',
            'get_dose_status',
            'medication_status',
            'denied',
            'Request blocked: no permission from Grandma'
          );
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'get_dose_status',
            caller,
            args,
            latencyMs,
            status: 'denied',
            speakable: "I can't share that without Grandma's permission. Want me to ask her?",
            data: { error: 'PERMISSION_DENIED', scope: 'dose_status' },
          };
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const logged = this.doseLogs.some(l => l.day === todayStr);

        await this.appendAudit(
          'Daughter',
          'get_dose_status',
          'medication_status',
          'ok',
          `Checked medication status with permission: ${logged ? 'logged' : 'not logged yet'}`
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'get_dose_status',
          caller,
          args,
          latencyMs,
          status: 'ok',
          speakable: logged ? 'Logged for today.' : 'Not logged yet today.',
          data: { isLogged: logged, date: todayStr },
        };
      }

      case 'request_access': {
        const scope = args.scope as Scope;
        this.setGrant(scope, 'pending');
        await this.appendAudit(
          'Daughter',
          'request_access',
          scope,
          'pending',
          `Access requested for ${scope}; waiting for Grandma's voice consent`
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'request_access',
          caller,
          args,
          latencyMs,
          status: 'pending',
          speakable: 'Grandma needs to say yes first.',
          data: { scope, status: 'pending', requiresVoiceConsent: true },
        };
      }

      case 'grant_or_deny_access': {
        const scope = args.scope as Scope;
        const decision = args.decision === 'grant';
        const hours = parseInt(args.durationHours || '24', 10);

        if (decision) {
          this.setGrant(scope, 'active', hours);
          await this.appendAudit(
            'Grandma',
            'grant_access',
            scope,
            'ok',
            `Grandma approved access to ${scope} for Daughter (24 hours)`
          );
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'grant_or_deny_access',
            caller: 'elder',
            args,
            latencyMs,
            status: 'ok',
            speakable: 'Grandma said yes. Access granted for 24 hours.',
            data: { scope, status: 'active', hours },
          };
        } else {
          this.setGrant(scope, 'denied');
          await this.appendAudit(
            'Grandma',
            'deny_access',
            scope,
            'denied',
            `Grandma declined access to ${scope} for Daughter`
          );
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'grant_or_deny_access',
            caller: 'elder',
            args,
            latencyMs,
            status: 'denied',
            speakable: 'Grandma chose not to share that right now.',
            data: { scope, status: 'denied' },
          };
        }
      }

      case 'revoke_access': {
        const scope = args.scope as Scope;
        const grant = this.grants.get(scope);
        if (!grant || grant.status !== 'active') {
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'revoke_access',
            caller: 'elder',
            args,
            latencyMs,
            status: 'ok',
            speakable: "There's nothing to stop sharing right now.",
            data: { revoked: false },
          };
        }

        grant.status = 'revoked';
        await this.appendAudit(
          'Grandma',
          'revoke_access',
          scope,
          'revoked',
          `Grandma revoked Daughter's access to ${scope} immediately`
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'revoke_access',
          caller: 'elder',
          args,
          latencyMs,
          status: 'ok',
          speakable: 'Done. She can no longer see that.',
          data: { scope, status: 'revoked' },
        };
      }

      case 'check_gate_status': {
        if (!this.isGrantActive('gate_status')) {
          await this.appendAudit(
            'Daughter',
            'check_gate_status',
            'gate_status',
            'denied',
            'Request blocked: no permission from Grandma'
          );
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'check_gate_status',
            caller,
            args,
            latencyMs,
            status: 'denied',
            speakable: "I can't share that without Grandma's permission. Want me to ask her?",
            data: { error: 'PERMISSION_DENIED', scope: 'gate_status' },
          };
        }

        await this.appendAudit(
          'Daughter',
          'check_gate_status',
          'gate_status',
          'ok',
          `Gate status checked: ${this.gateState} (mock device)`
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'check_gate_status',
          caller,
          args,
          latencyMs,
          status: 'ok',
          speakable: `The gate is ${this.gateState}.`,
          data: { status: this.gateState, mock: true },
        };
      }

      case 'lock_gate': {
        const isConfirmed = args.confirmed === 'true' || args.confirmed === 'yes' || args.confirmed === true;

        if (!isConfirmed) {
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'lock_gate',
            caller,
            args,
            latencyMs,
            status: 'pending',
            speakable: 'Lock the front gate now? Reply yes to confirm.',
            data: { needsConfirmation: true },
          };
        }

        const prev = this.gateState;
        this.gateState = 'locked';

        const actionId = `action_${Date.now()}`;
        this.pendingActions.push({
          id: actionId,
          action: 'lock_gate',
          requestedBy: caller,
          expiresAt: Date.now() + 60000,
          undone: false,
          previousState: prev,
        });

        await this.appendAudit(
          caller === 'elder' ? 'Grandma' : 'Daughter',
          'lock_gate',
          'gate_lock',
          'ok',
          'Gate lock requested and confirmed; 60s undo window active'
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'lock_gate',
          caller,
          args,
          latencyMs,
          status: 'ok',
          speakable: 'Done. You can undo this for 60 seconds.',
          data: { locked: true, actionId, undoWindowSeconds: 60, mock: true },
        };
      }

      case 'undo_last_action': {
        const lastAction = this.pendingActions[this.pendingActions.length - 1];
        const now = Date.now();

        if (!lastAction || lastAction.undone || now > lastAction.expiresAt) {
          const latencyMs = Math.round(performance.now() - start);
          return {
            tool: 'undo_last_action',
            caller,
            args,
            latencyMs,
            status: 'denied',
            speakable: 'The undo window has ended.',
            data: { undone: false },
          };
        }

        lastAction.undone = true;
        this.gateState = 'unlocked';

        await this.appendAudit(
          caller === 'elder' ? 'Grandma' : 'Daughter',
          'undo_last_action',
          lastAction.action,
          'ok',
          'Lock undone by Grandma; gate returned to unlocked'
        );

        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'undo_last_action',
          caller,
          args,
          latencyMs,
          status: 'ok',
          speakable: 'Done. Action reversed.',
          data: { undone: true, restoredState: 'unlocked' },
        };
      }

      case 'get_audit_log': {
        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'get_audit_log',
          caller: 'elder',
          args,
          latencyMs,
          status: 'ok',
          speakable: `There are ${this.auditLog.length} verified entries in your audit log.`,
          data: { entries: this.auditLog },
        };
      }

      case 'get_escalation_policy': {
        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: 'get_escalation_policy',
          caller,
          args,
          latencyMs,
          status: 'ok',
          speakable: 'Step 1 is a reminder to Grandma. Step 2 is a calm message to Daughter. Never emergency calls.',
          data: {
            step1: 'Gentle reminder to elder',
            step2: 'Calm check-in message to family (if grant exists)',
            step3: 'Stop. No automatic emergency calls.',
          },
        };
      }

      default: {
        const latencyMs = Math.round(performance.now() - start);
        return {
          tool: toolName,
          caller,
          args,
          latencyMs,
          status: 'error',
          speakable: "I couldn't do that just now.",
          data: { error: 'UNKNOWN_TOOL' },
        };
      }
    }
  }

  /**
   * Handle JSON-RPC 2.0 requests over Streamable HTTP.
   */
  public async handleJsonRpc(body: any): Promise<any> {
    const { jsonrpc, id, method, params } = body;
    if (jsonrpc !== '2.0') {
      return { jsonrpc: '2.0', id: id || null, error: { code: -32600, message: 'Invalid Request' } };
    }

    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-11-25',
          serverInfo: { name: 'truedose-mcp-server', version: '1.0.0' },
          capabilities: { tools: {} },
        },
      };
    }

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: this.getTools() },
      };
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs, caller } = params || {};
      const result = await this.callTool(name, toolArgs || {}, caller || 'caregiver');
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            { type: 'text', text: result.speakable },
          ],
          structuredData: result.data,
          metadata: {
            latencyMs: result.latencyMs,
            status: result.status,
            caller: result.caller,
          },
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: 'Method not found' },
    };
  }
}

