import React, { useState } from 'react';
import { 
  AuditEntry, 
  PipelineStageState, 
  ToolCallLog, 
  Grant,
  PrivacyReceipt
} from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Minus, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  AlertTriangle, 
  Download,
  Terminal,
  Activity,
  GitBranch,
  Save,
  RotateCcw,
  Layers,
  Lock,
  ArrowRight
} from 'lucide-react';

interface TracePaneProps {
  pipeline: PipelineStageState[];
  toolCalls: ToolCallLog[];
  auditChain: AuditEntry[];
  grants: Grant[];
  isDevTrace: boolean;
  onToggleDevTrace: () => void;
  chainVerifyStatus: {
    tested: boolean;
    valid?: boolean;
    message?: string;
    tamperedIndex?: number;
  };
  onVerifyChain: () => void;
  onTamperTest: () => void;
  onRestoreAudit: () => void;
  privacyReceipt: PrivacyReceipt | null;
  isFocused?: boolean;
}

export const TracePane: React.FC<TracePaneProps> = ({
  pipeline,
  toolCalls,
  auditChain,
  isDevTrace,
  onToggleDevTrace,
  chainVerifyStatus,
  onVerifyChain,
  onTamperTest,
  onRestoreAudit,
  privacyReceipt,
  isFocused = false,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'mindmap' | 'audit'>('pipeline');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);

  // Save Pipeline State as JSON file
  const handleSavePipelineState = () => {
    const statePayload = {
      timestamp: new Date().toISOString(),
      service: 'TrueDose MCP Server',
      protocolVersion: '2025-11-25',
      pipeline: pipeline.map(p => ({ node: p.node, status: p.status, label: p.label })),
      toolCalls,
      auditChain,
      receipt: privacyReceipt,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(statePayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truedose-pipeline-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <section 
      className={`bg-white rounded-xl border transition-all duration-300 flex flex-col h-full shadow-xs overflow-hidden ${
        isFocused 
          ? 'border-[#FF9900] ring-2 ring-[#FF9900]/25' 
          : 'border-[#eaeded]'
      }`}
      aria-label="Backend Trace and Architecture Pipeline"
    >
      {/* Pane Header with Navigation Tabs */}
      <div className="border-b border-[#eaeded] px-4 py-2 bg-[#fbfcfc] flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pipeline'
                ? 'bg-white text-[#0f1111] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>Pipeline Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'mindmap'
                ? 'bg-white text-[#0f1111] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#007185]" />
            <span>Architecture Mindmap</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audit'
                ? 'bg-white text-[#0f1111] shadow-2xs'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Audit Ledger</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePipelineState}
            className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#fff8e7] hover:bg-[#ffe1a6] text-[#b12704] border border-[#FF9900] flex items-center gap-1 transition-colors cursor-pointer"
            title="Save Pipeline Execution State as JSON"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Pipeline</span>
          </button>

          <button
            onClick={onToggleDevTrace}
            className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium cursor-pointer"
          >
            {isDevTrace ? 'Dev Mode' : 'Plain'}
          </button>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        
        {/* ===================== VIEW 1: REAL PIPELINE FLOW ===================== */}
        {activeTab === 'pipeline' && (
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Real Pipeline Node-and-Connector Flow Structure */}
            <div className="bg-[#f9fafb] p-3.5 rounded-xl border border-gray-300 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#FF9900]" />
                  Real Pipeline Execution Structure
                </span>
                <span className="text-[11px] text-gray-500 font-mono">Streamable HTTP (JSON-RPC)</span>
              </div>

              {/* Connected Sequential Pipeline Nodes */}
              <div className="flex items-center justify-between overflow-x-auto py-2 gap-1.5">
                {pipeline.map((stage, idx) => {
                  const isLast = idx === pipeline.length - 1;
                  const isSelected = selectedNode === stage.node;

                  let icon = <div className="w-2.5 h-2.5 rounded-full border border-gray-400" />;
                  let nodeColor = 'bg-white border-gray-300 text-gray-600';

                  if (stage.status === 'ok') {
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                    nodeColor = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (stage.status === 'waiting') {
                    icon = <Clock className="w-4 h-4 text-[#FF9900] animate-pulse" />;
                    nodeColor = 'bg-[#fff8e7] border-[#FF9900] text-[#b12704] font-bold shadow-xs';
                  } else if (stage.status === 'denied') {
                    icon = <XCircle className="w-4 h-4 text-rose-600" />;
                    nodeColor = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                  } else if (stage.status === 'skipped') {
                    icon = <Minus className="w-4 h-4 text-gray-400" />;
                    nodeColor = 'bg-gray-100 border-gray-200 text-gray-400';
                  } else if (stage.status === 'working') {
                    icon = <Loader2 className="w-4 h-4 text-[#FF9900] animate-spin" />;
                    nodeColor = 'bg-[#fff8e7] border-[#FF9900] text-[#b12704] font-bold';
                  }

                  return (
                    <React.Fragment key={stage.node}>
                      {/* Individual Stage Node */}
                      <button
                        onClick={() => setSelectedNode(isSelected ? null : stage.node)}
                        className={`px-2.5 py-2 rounded-lg border flex flex-col items-center justify-center min-w-[75px] max-w-[95px] text-center transition-all cursor-pointer shrink-0 ${nodeColor} ${
                          isSelected ? 'ring-2 ring-[#FF9900] scale-105 shadow-md' : 'hover:border-[#FF9900]'
                        }`}
                        title={`Click to inspect ${stage.label || stage.node}`}
                      >
                        <div className="mb-1">{icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-tight truncate w-full">
                          {stage.label || stage.node}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500 capitalize mt-0.5">
                          {stage.status}
                        </span>
                      </button>

                      {/* Directional Connector Arrow */}
                      {!isLast && (
                        <div className="flex items-center justify-center shrink-0 px-0.5 text-gray-400">
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF9900]" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Node Inspector Callout */}
              {selectedNode && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-[#FF9900] text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between font-bold text-gray-900 border-b pb-1">
                    <span>Node Details: {selectedNode}</span>
                    <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-black">✕</button>
                  </div>
                  <p className="text-gray-600">
                    {selectedNode === 'consent' && 'Consent Engine: Single source of truth. Grants are default-denied unless the elder grants voice approval.'}
                    {selectedNode === 'msgIn' && 'Message Inbound: Receives voice transcript from elder or SMS message from caregiver.'}
                    {selectedNode === 'intent' && 'Intent Mapper: Matches natural voice/SMS requests to certified MCP tool calls.'}
                    {selectedNode === 'mcpCall' && 'MCP Tool Invocation: Calls registered tools via JSON-RPC 2.0 over Streamable HTTP.'}
                    {selectedNode === 'service' && 'Physical Actuator Service: Connects to mock hardware with 2-step confirmation and 60-second undo window.'}
                    {selectedNode === 'audit' && 'Hash-Chained Audit: Appends immutable SHA-256 block linked to prevHash.'}
                    {selectedNode === 'replyOut' && 'Outbound Dispatch: Formats neutral, factual reply back to speaker or SMS.'}
                  </p>
                </div>
              )}
            </div>

            {/* Inline Privacy & Action Receipt (NO POPUP!) */}
            {privacyReceipt && (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 shadow-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-black text-emerald-950 uppercase">
                      Execution Complete — Privacy & Action Receipt
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800">
                    Scenario: {privacyReceipt.scenarioTitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Shared With Consent:</span>
                    <ul className="list-disc list-inside text-emerald-800 font-medium">
                      {privacyReceipt.whatWasShared.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <span className="text-[10px] text-gray-500 mt-1 block">Recipient: {privacyReceipt.withWhom}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                    <span className="font-bold text-gray-900 block mb-1">Kept 100% Private:</span>
                    <ul className="list-disc list-inside text-gray-700">
                      {privacyReceipt.whatStayedPrivate.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* MCP Calls Log */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#007185]" />
                  Live Tool Calls ({toolCalls.length})
                </span>
                <span className="text-[10px] text-gray-400 font-mono">JSON-RPC 2.0</span>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-gray-200 rounded-lg p-1.5 bg-gray-50">
                {toolCalls.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 italic">
                    Ready for next execution step...
                  </p>
                ) : (
                  toolCalls.map((call) => {
                    const isExpanded = expandedCallId === call.id;
                    return (
                      <div key={call.id} className="bg-white rounded border border-gray-200 text-xs overflow-hidden shadow-2xs">
                        <button
                          onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                          className="w-full px-2.5 py-1.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                            <span className="font-mono font-bold text-[#007185]">{isDevTrace ? call.tool : call.tool.replace(/_/g, ' ')}</span>
                            <span className="text-gray-400 font-mono text-[10px]">{call.latencyMs}ms</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            call.status === 'ok' ? 'bg-emerald-100 text-emerald-800' : (call.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                          }`}>
                            {call.status}
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="p-2.5 bg-[#131921] text-gray-200 font-mono text-[11px] border-t border-gray-800 space-y-1">
                            <div><span className="text-gray-400">Speakable:</span> <span className="text-[#FF9900]">"{call.speakable}"</span></div>
                            {call.rawJsonRpcRequest && <pre className="text-sky-300 text-[10px] overflow-x-auto">{call.rawJsonRpcRequest}</pre>}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* ===================== VIEW 2: ARCHITECTURE MINDMAP EXPLORER ===================== */}
        {activeTab === 'mindmap' && (
          <div className="flex-1 flex flex-col gap-3 bg-[#f8fafc] p-4 rounded-xl border border-gray-300 overflow-x-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-black text-gray-900 uppercase flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-[#FF9900]" />
                Interactive Architecture Mindmap
              </span>
              <span className="text-[11px] text-gray-500">Live State Mapping</span>
            </div>

            {/* Mindmap Tree Structure */}
            <div className="space-y-4 py-2 font-sans text-xs">
              
              {/* Root Node */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-[#131921] text-white font-black shadow-xs">
                  TrueDose Orchestrator
                </div>
                <span className="text-gray-400">─── Streamable HTTP (2025-11-25)</span>
              </div>

              {/* Branch 1: Inbound Personas */}
              <div className="pl-6 border-l-2 border-gray-300 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Grandma (Elder Persona)
                  </span>
                  <span className="text-gray-500 text-[11px]">→ Voice Channel (Sole owner of access grants)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Daughter (Caregiver Persona)
                  </span>
                  <span className="text-gray-500 text-[11px]">→ SMS Channel (Requires active grant to read any elder state)</span>
                </div>
              </div>

              {/* Branch 2: Consent State Machine */}
              <div className="pl-6 border-l-2 border-gray-300 space-y-2">
                <div className="p-3 rounded-lg bg-white border border-gray-300 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-[#b12704]">
                    <ShieldCheck className="w-4 h-4 text-[#FF9900]" />
                    <span>Consent Engine (State Machine)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center pt-1">
                    <div className="p-1 rounded bg-gray-100 text-gray-600">1. DEFAULT DENY</div>
                    <div className="p-1 rounded bg-amber-100 text-amber-800">2. PENDING VOICE</div>
                    <div className="p-1 rounded bg-emerald-100 text-emerald-800">3. ACTIVE (24h)</div>
                    <div className="p-1 rounded bg-rose-100 text-rose-800">4. VOICE REVOKED</div>
                  </div>
                </div>
              </div>

              {/* Branch 3: Physical Actuators */}
              <div className="pl-6 border-l-2 border-gray-300 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-300">
                    Pillbox Service
                  </span>
                  <span className="text-gray-500 text-[11px]">→ Timestamp logs only · Gentle escalation ladder</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded border border-gray-300">
                    Front Gate Actuator
                  </span>
                  <span className="text-gray-500 text-[11px]">→ Two-step confirmation · 60-second voice undo</span>
                </div>
              </div>

              {/* Branch 4: SHA-256 Ledger */}
              <div className="pl-6 border-l-2 border-gray-300">
                <div className="p-2.5 rounded-lg bg-[#131921] text-white flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400">Cryptographic Hash Chain: SHA-256 Append-Only</span>
                  <span className="text-[#FF9900]">{auditChain.length} Blocks Verified</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===================== VIEW 3: AUDIT LEDGER ===================== */}
        {activeTab === 'audit' && (
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-gray-900">
                  Hash-Chained Audit Ledger ({auditChain.length} Blocks)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={onVerifyChain}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 cursor-pointer"
                >
                  Verify Hashes
                </button>
                <button
                  onClick={onTamperTest}
                  className="px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-900 hover:bg-rose-200 border border-rose-300 cursor-pointer"
                >
                  Tamper Test
                </button>
                <button
                  onClick={onRestoreAudit}
                  className="p-1 rounded text-gray-500 hover:text-black cursor-pointer"
                  title="Restore Chain"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {chainVerifyStatus.tested && (
              <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
                chainVerifyStatus.valid
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300 animate-pulse'
              }`}>
                {chainVerifyStatus.valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{chainVerifyStatus.message}</span>
              </div>
            )}

            <div className="space-y-1.5 max-h-[280px] overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200">
              {auditChain.map((entry) => (
                <div
                  key={`${entry.index}-${entry.hash}`}
                  className={`p-2.5 rounded bg-white border text-xs shadow-2xs ${
                    entry.tampered
                      ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30'
                      : 'border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5 font-mono">
                    <span className="font-bold text-gray-700">Block #{entry.index}</span>
                    <span className="text-[#007185]">hash: {entry.hash.slice(0, 10)}...</span>
                  </div>
                  <p className="font-bold text-[11px] text-[#0f1111]">{entry.plainText}</p>
                  <div className="text-[9px] text-gray-400 font-mono mt-0.5 truncate">
                    prevHash: {entry.prevHash.slice(0, 14)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
