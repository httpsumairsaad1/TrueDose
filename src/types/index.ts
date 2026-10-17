export type Role = 'elder' | 'caregiver' | 'system';

export type Scope = 'dose_status' | 'gate_status' | 'gate_lock';

export type GrantStatus = 'none' | 'pending' | 'active' | 'denied' | 'revoked' | 'expired';

export interface Grant {
  id: string;
  elderId: string;
  caregiverId: string;
  scope: Scope;
  status: GrantStatus;
  createdAt: string;
  expiresAt?: string;
}

export type PipelineNodeId = 
  | 'msgIn' 
  | 'intent' 
  | 'mcpCall' 
  | 'consent' 
  | 'service' 
  | 'audit' 
  | 'replyOut';

export type NodeStatus = 
  | 'idle' 
  | 'working' 
  | 'ok' 
  | 'waiting' 
  | 'denied' 
  | 'skipped' 
  | 'expired';

export interface PipelineStageState {
  node: PipelineNodeId;
  status: NodeStatus;
  label?: string;
  note?: string;
}

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export type GateState = 'unknown' | 'locked' | 'unlocked' | 'closing';

export type PillSlotState = 'logged' | 'missed' | 'today' | 'future';

export interface PillDay {
  dayName: string;
  dateStr: string;
  state: PillSlotState;
  loggedAt?: string;
}

export interface AuditEntry {
  index: number;
  ts: string;
  actor: string;
  action: string;
  target: string;
  result: 'ok' | 'denied' | 'pending' | 'revoked' | 'error';
  plainText: string;
  prevHash: string;
  hash: string;
  tampered?: boolean;
}

export interface ToolCallLog {
  id: string;
  tool: string;
  caller: string;
  args: Record<string, unknown>;
  latencyMs: number;
  status: 'ok' | 'pending' | 'denied' | 'error';
  speakable: string;
  data: Record<string, unknown>;
  timestamp: string;
  rawJsonRpcRequest?: string;
  rawJsonRpcResponse?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'grandma' | 'daughter' | 'alexa';
  channel: 'voice' | 'sms' | 'system';
  text: string;
  timeStr: string;
  isDelivered?: boolean;
  isConsentPrompt?: boolean;
  consentQuestion?: string;
  options?: { id: string; label: string; primary?: boolean }[];
  audioPlayed?: boolean;
}

export interface NarrationState {
  step: number;
  of: number;
  text: string;
  focusedPane?: 'messages' | 'scene' | 'trace' | 'all';
}

export interface PrivacyReceipt {
  scenarioTitle: string;
  whatWasShared: string[];
  withWhom: string;
  untilWhen: string;
  whatStayedPrivate: string[];
  consentEnforced: boolean;
  undoWindowUsed: boolean;
  auditVerified: boolean;
}

export type TransportState = 
  | 'ready' 
  | 'playing' 
  | 'paused' 
  | 'awaiting_input' 
  | 'finished' 
  | 'error';

export type ScenarioId = 's1' | 's2' | 's3' | 's4' | 's5';

export interface SimEvent {
  v: number;
  seq: number;
  runId: string;
  scenarioId: ScenarioId;
  t: number;
  type: 
    | 'clock'
    | 'sms'
    | 'voice'
    | 'orb_state'
    | 'pipeline_stage'
    | 'tool_call'
    | 'tool_result'
    | 'consent_state'
    | 'scene_action'
    | 'audit_entry'
    | 'narration'
    | 'awaiting_input'
    | 'scenario_end'
    | 'error';
  payload: Record<string, any>;
}
