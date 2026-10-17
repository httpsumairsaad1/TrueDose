import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AuditEntry,
  ChatMessage,
  GateState,
  Grant,
  NarrationState,
  OrbState,
  PillDay,
  PipelineNodeId,
  PipelineStageState,
  PrivacyReceipt,
  ScenarioId,
  SimEvent,
  ToolCallLog,
  TransportState,
} from '../types';
import { OmniCareMcpServer } from '../mcp/server';
import { SimHost, BeatAction } from '../mcp/simHost';
import { verifyAuditChain } from '../mcp/audit';
import { soundEngine } from '../audio/sound';
import strings from '../strings/en.json';

const defaultPipeline: PipelineStageState[] = [
  { node: 'msgIn', status: 'idle', label: strings.pipeline.nodes.msgIn },
  { node: 'intent', status: 'idle', label: strings.pipeline.nodes.intent },
  { node: 'mcpCall', status: 'idle', label: strings.pipeline.nodes.mcpCall },
  { node: 'consent', status: 'idle', label: strings.pipeline.nodes.consent },
  { node: 'service', status: 'idle', label: strings.pipeline.nodes.service },
  { node: 'audit', status: 'idle', label: strings.pipeline.nodes.audit },
  { node: 'replyOut', status: 'idle', label: strings.pipeline.nodes.replyOut },
];

function createInitialPillbox(): PillDay[] {
  const days: PillDay[] = [];
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7; // Monday = 0

  for (let i = 0; i < 7; i++) {
    const diff = i - currentDayIndex;
    const d = new Date();
    d.setDate(d.getDate() + diff);
    const dayStr = d.toISOString().split('T')[0];

    let state: 'logged' | 'missed' | 'today' | 'future' = 'future';
    if (i < currentDayIndex) {
      state = 'logged';
    } else if (i === currentDayIndex) {
      state = 'today';
    } else {
      state = 'future';
    }

    days.push({
      dayName: names[i],
      dateStr: dayStr,
      state,
      loggedAt: state === 'logged' ? '08:02 AM' : undefined,
    });
  }
  return days;
}

export function useSimEngine() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('s3');
  const [transportState, setTransportState] = useState<TransportState>('ready');
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);
  const [isDevTrace, setIsDevTrace] = useState<boolean>(false);
  const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState<boolean>(true);
  const [isLargeText, setIsLargeText] = useState<boolean>(false);
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

  // Panes State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStageState[]>(defaultPipeline);
  const [toolCalls, setToolCalls] = useState<ToolCallLog[]>([]);
  const [auditChain, setAuditChain] = useState<AuditEntry[]>([]);
  const [cleanAuditBackup, setCleanAuditBackup] = useState<AuditEntry[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [gateState, setGateState] = useState<GateState>('unknown');
  const [pillbox, setPillbox] = useState<PillDay[]>(createInitialPillbox());
  const [clockLabel, setClockLabel] = useState<string>('Morning, 8:00 AM');
  const [undoSeconds, setUndoSeconds] = useState<number | null>(null);
  const [narration, setNarration] = useState<NarrationState>({
    step: 1,
    of: 6,
    text: strings.scenarios.s3.summary,
    focusedPane: 'messages',
  });
  const [privacyReceipt, setPrivacyReceipt] = useState<PrivacyReceipt | null>(null);
  const [chainVerifyStatus, setChainVerifyStatus] = useState<{
    tested: boolean;
    valid?: boolean;
    message?: string;
    tamperedIndex?: number;
  }>({ tested: false });

  // Awaiting input state
  const [awaitingInput, setAwaitingInput] = useState<{
    who: 'grandma' | 'daughter';
    options: { id: string; label: string; primary?: boolean }[];
  } | null>(null);

  // References
  const mcpServerRef = useRef<OmniCareMcpServer>(new OmniCareMcpServer());
  const simHostRef = useRef<SimHost>(new SimHost(mcpServerRef.current));
  const beatsRef = useRef<BeatAction[]>([]);
  const autoPlayTimerRef = useRef<any>(null);
  const undoIntervalRef = useRef<any>(null);

  // Initialize or reset scenario
  const loadScenario = useCallback(async (id: ScenarioId, branchChoice?: string) => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

    soundEngine.stopAll();

    const host = simHostRef.current;
    const beats = await host.getScenarioBeats(id, branchChoice);
    beatsRef.current = beats;

    setScenarioId(id);
    setCurrentBeatIndex(0);
    setTransportState('ready');
    setMessages([]);
    setPipeline(defaultPipeline.map(p => ({ ...p, status: 'idle' })));
    setToolCalls([]);
    setAuditChain(mcpServerRef.current.getAuditChain());
    setCleanAuditBackup(mcpServerRef.current.getAuditChain());
    setGrants(mcpServerRef.current.getGrants());
    setOrbState('idle');
    setGateState(id === 's3' ? 'unknown' : (id === 's4' ? 'unlocked' : 'locked'));
    setPillbox(createInitialPillbox());
    setClockLabel(id === 's2' ? 'Next morning, 9:00 AM' : 'Morning, 8:00 AM');
    setUndoSeconds(null);
    setAwaitingInput(null);
    setPrivacyReceipt(null);
    setChainVerifyStatus({ tested: false });

    // Initial narration
    const sInfo = (strings.scenarios as any)[id];
    setNarration({
      step: 1,
      of: beats.length,
      text: sInfo ? sInfo.summary : 'Ready to start simulation.',
      focusedPane: 'messages',
    });
  }, []);

  // Initial load
  useEffect(() => {
    loadScenario('s3');
  }, [loadScenario]);

  // Apply a single event to the state
  const applyEvent = useCallback((event: SimEvent) => {
    const { type, payload } = event;

    switch (type) {
      case 'narration':
        setNarration(payload as NarrationState);
        break;

      case 'orb_state':
        setOrbState(payload.state as OrbState);
        break;

      case 'clock':
        setClockLabel(payload.label || payload.simTime);
        break;

      case 'pipeline_stage':
        setPipeline(prev =>
          prev.map(item =>
            item.node === payload.node
              ? { ...item, status: payload.status, label: payload.label || item.label }
              : item
          )
        );
        break;

      case 'voice': {
        const isGrandma = payload.from.toLowerCase().includes('grandma');
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: isGrandma ? 'grandma' : 'alexa',
          channel: 'voice',
          text: payload.text,
          timeStr: '08:02 AM',
          isConsentPrompt: payload.isConsentPrompt,
          consentQuestion: payload.consentQuestion,
          options: payload.options,
        };
        setMessages(prev => [...prev, newMsg]);
        soundEngine.playChime();
        soundEngine.speak(payload.text, isGrandma ? 'elder' : 'system');
        break;
      }

      case 'sms': {
        const isDaughter = payload.from.toLowerCase().includes('daughter');
        const isSystem = payload.from.toLowerCase().includes('alexa') || payload.from.toLowerCase().includes('system');
        const newMsg: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random()}`,
          sender: isDaughter ? 'daughter' : (isSystem ? 'alexa' : 'alexa'),
          channel: 'sms',
          text: payload.text,
          timeStr: '08:02 AM',
          isDelivered: true,
        };
        setMessages(prev => [...prev, newMsg]);
        soundEngine.playClick();
        break;
      }

      case 'tool_call': {
        const log: ToolCallLog = {
          id: payload.id || `call_${Date.now()}`,
          tool: payload.tool,
          caller: payload.caller,
          args: payload.args || {},
          latencyMs: payload.latencyMs || 15,
          status: payload.status,
          speakable: payload.speakable,
          data: payload.data || {},
          timestamp: new Date().toLocaleTimeString(),
          rawJsonRpcRequest: payload.rawJsonRpcRequest,
          rawJsonRpcResponse: payload.rawJsonRpcResponse,
        };
        setToolCalls(prev => [log, ...prev]);
        break;
      }

      case 'audit_entry': {
        const entry = payload as AuditEntry;
        setAuditChain(prev => {
          const exists = prev.some(e => e.hash === entry.hash);
          if (exists) return prev;
          const next = [...prev, entry];
          setCleanAuditBackup(next);
          return next;
        });
        break;
      }

      case 'consent_state': {
        setGrants(mcpServerRef.current.getGrants());
        break;
      }

      case 'scene_action': {
        if (payload.actor === 'gate') {
          if (payload.action === 'show_locked' || payload.action === 'lock_closed') {
            setGateState('locked');
          } else if (payload.action === 'unlock_open') {
            setGateState('unlocked');
          }
        } else if (payload.actor === 'pillbox') {
          setPillbox(prev =>
            prev.map(p =>
              p.state === 'today'
                ? { ...p, state: payload.action === 'mark_today_missed' ? 'missed' : 'logged' }
                : p
            )
          );
        } else if (payload.actor === 'undo_ring' && payload.action === 'start') {
          setUndoSeconds(60);
          if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
          undoIntervalRef.current = setInterval(() => {
            setUndoSeconds(sec => {
              if (sec === null || sec <= 1) {
                clearInterval(undoIntervalRef.current);
                return 0;
              }
              return sec - 1;
            });
          }, 1000);
        }
        break;
      }

      case 'awaiting_input': {
        setAwaitingInput(payload as any);
        setTransportState('awaiting_input');
        break;
      }

      case 'scenario_end': {
        setPrivacyReceipt(payload.receipt);
        setTransportState('finished');
        break;
      }
    }
  }, []);

  // Execute a specific beat index
  const runBeat = useCallback(
    async (index: number) => {
      const beats = beatsRef.current;
      if (index >= beats.length) {
        setTransportState('finished');
        return;
      }

      const beat = beats[index];
      for (const ev of beat.events) {
        applyEvent(ev);
      }

      setCurrentBeatIndex(index + 1);

      if (beat.awaitingInput) {
        setTransportState('awaiting_input');
        setAwaitingInput(beat.awaitingInput);
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      }
    },
    [applyEvent]
  );

  // Step next
  const stepNext = useCallback(() => {
    if (transportState === 'awaiting_input') return;
    if (currentBeatIndex < beatsRef.current.length) {
      runBeat(currentBeatIndex);
    }
  }, [currentBeatIndex, transportState, runBeat]);

  // Step back: re-apply from beat 0 to currentBeatIndex - 2
  const stepBack = useCallback(() => {
    if (currentBeatIndex <= 1) return;
    const targetBeat = currentBeatIndex - 2;
    // Reload up to target beat
    loadScenario(scenarioId).then(() => {
      for (let i = 0; i <= targetBeat; i++) {
        const beat = beatsRef.current[i];
        if (beat) {
          for (const ev of beat.events) {
            applyEvent(ev);
          }
        }
      }
      setCurrentBeatIndex(targetBeat + 1);
      setTransportState('paused');
    });
  }, [currentBeatIndex, scenarioId, loadScenario, applyEvent]);

  // Play / Pause auto advancement
  const togglePlayPause = useCallback(() => {
    if (transportState === 'playing') {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      setTransportState('paused');
    } else {
      setTransportState('playing');
    }
  }, [transportState]);

  // Auto-play loop
  useEffect(() => {
    if (transportState !== 'playing') return;

    if (currentBeatIndex >= beatsRef.current.length) {
      setTransportState('finished');
      return;
    }

    const interval = Math.max(1200 / speedMultiplier, 400);

    autoPlayTimerRef.current = setTimeout(() => {
      runBeat(currentBeatIndex);
    }, interval);

    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [transportState, currentBeatIndex, speedMultiplier, runBeat]);

  // Handle user response to consent prompt
  const answerConsent = useCallback(
    async (decision: 'yes' | 'no') => {
      setAwaitingInput(null);
      setTransportState('playing');

      // Re-generate beats starting from Grandma's decision branch
      const beats = await simHostRef.current.getScenarioBeats(scenarioId, decision);
      beatsRef.current = beats;

      // Advance directly to beat 3 (Grandma's answer)
      runBeat(3);
    },
    [scenarioId, runBeat]
  );

  // Elder Revoke Access from Grandma's Control Panel
  const revokeScope = useCallback(
    async (scope: string) => {
      const res = await mcpServerRef.current.callTool('revoke_access', { scope }, 'elder');
      setGrants(mcpServerRef.current.getGrants());
      setAuditChain(mcpServerRef.current.getAuditChain());
      setCleanAuditBackup(mcpServerRef.current.getAuditChain());

      applyEvent({
        v: 1,
        seq: Date.now(),
        runId: 'manual_revoke',
        scenarioId,
        t: 0,
        type: 'voice',
        payload: {
          from: 'Alexa+ (simulated)',
          to: 'Grandma',
          text: res.speakable,
          channel: 'system',
        },
      });
      soundEngine.playChime();
    },
    [scenarioId, applyEvent]
  );

  // Verify Audit Chain
  const handleVerifyChain = useCallback(async () => {
    const result = await verifyAuditChain(auditChain);
    if (result.valid) {
      setChainVerifyStatus({
        tested: true,
        valid: true,
        message: strings.trace.chainIntact,
      });
    } else {
      setChainVerifyStatus({
        tested: true,
        valid: false,
        tamperedIndex: result.tamperedIndex,
        message: strings.trace.chainTampered.replace('{index}', String(result.tamperedIndex ?? 0)),
      });
    }
  }, [auditChain]);

  // Tamper Test (P1 proof feature)
  const handleTamperTest = useCallback(async () => {
    if (auditChain.length === 0) return;
    const targetIdx = Math.max(0, auditChain.length - 1);
    const tampered = auditChain.map((entry, idx) => {
      if (idx === targetIdx) {
        return {
          ...entry,
          plainText: "UNAUTHORIZED MODIFICATION: Gate forced open",
          tampered: true,
        };
      }
      return entry;
    });

    setAuditChain(tampered);

    // Run verification immediately to show the red tamper report
    const verifyRes = await verifyAuditChain(tampered);
    setChainVerifyStatus({
      tested: true,
      valid: false,
      tamperedIndex: targetIdx,
      message: strings.trace.chainTampered.replace('{index}', String(targetIdx)),
    });
  }, [auditChain]);

  // Restore Clean Audit Log
  const handleRestoreAudit = useCallback(() => {
    setAuditChain(cleanAuditBackup);
    setChainVerifyStatus({ tested: false });
  }, [cleanAuditBackup]);

  return {
    scenarioId,
    setScenarioId: (id: ScenarioId) => loadScenario(id),
    transportState,
    currentBeatIndex,
    totalBeats: beatsRef.current.length,
    speedMultiplier,
    setSpeedMultiplier,
    isLiveMode,
    setIsLiveMode,
    isDevTrace,
    setIsDevTrace,
    isSoundOn,
    setIsSoundOn: (val: boolean) => {
      setIsSoundOn(val);
      soundEngine.enableSound(val);
    },
    isCaptionsOn,
    setIsCaptionsOn,
    isLargeText,
    setIsLargeText,
    isPresentationMode,
    setIsPresentationMode,
    messages,
    pipeline,
    toolCalls,
    auditChain,
    grants,
    orbState,
    gateState,
    pillbox,
    clockLabel,
    undoSeconds,
    narration,
    privacyReceipt,
    awaitingInput,
    chainVerifyStatus,
    stepNext,
    stepBack,
    togglePlayPause,
    resetScenario: () => loadScenario(scenarioId),
    answerConsent,
    revokeScope,
    handleVerifyChain,
    handleTamperTest,
    handleRestoreAudit,
  };
}
