import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Subtitles, 
  Type, 
  ShieldAlert, 
  CheckCircle2, 
  Download, 
  RotateCcw,
  Sparkles,
  Lock
} from 'lucide-react';
import { OmniCareMcpServer } from '../../mcp/server';
import { verifyAuditChain } from '../../mcp/audit';

interface OptionsDrawerProps {
  onClose: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
  isCaptionsOn: boolean;
  onToggleCaptions: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  isDevTrace: boolean;
  onToggleDevTrace: () => void;
  onVerifyChain: () => void;
  onTamperTest: () => void;
  onRestoreAudit: () => void;
  onExportAuditJson: () => void;
}

export const OptionsDrawer: React.FC<OptionsDrawerProps> = ({
  onClose,
  isSoundOn,
  onToggleSound,
  isCaptionsOn,
  onToggleCaptions,
  isLargeText,
  onToggleLargeText,
  isDevTrace,
  onToggleDevTrace,
  onVerifyChain,
  onTamperTest,
  onRestoreAudit,
  onExportAuditJson,
}) => {
  const [drillOutput, setDrillOutput] = React.useState<string | null>(null);

  const runQuickDrill = async (drillType: string) => {
    const testMcp = new OmniCareMcpServer();
    if (drillType === 'unauthorized') {
      const res = await testMcp.callTool('check_gate_status', {}, 'caregiver');
      setDrillOutput(`[Drill 1 - Default Deny]: Result: ${res.status.toUpperCase()}. Server replied: "${res.speakable}" (Zero elder data disclosed)`);
    } else if (drillType === 'unconfirmed') {
      const res = await testMcp.callTool('lock_gate', { confirmed: false }, 'caregiver');
      setDrillOutput(`[Drill 2 - Two-Step Safety]: Result: ${res.status.toUpperCase()}. Server replied: "${res.speakable}" (Hardware not actuated)`);
    } else if (drillType === 'tamper') {
      onTamperTest();
      setDrillOutput(`[Drill 3 - Tamper Test]: Modified audit block #0 in local stage. Verification will now catch the cryptographic mismatch.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#16191f] h-full shadow-2xl p-6 overflow-y-auto border-l border-[#eaeded] dark:border-[#2a3439] flex flex-col justify-between"
        role="dialog"
        aria-labelledby="options-title"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#eaeded] dark:border-[#2a3439] mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
              <h2 id="options-title" className="font-bold text-base text-[#0f1111] dark:text-white">
                Detailed Options & Exploration Deck
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
            All detailed simulator settings, accessibility adjustments, and security invariant tests in one clean place.
          </p>

          {/* Section 1: Audio & Accessibility */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Audio & Display Preferences
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#232f3e] border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  {isSoundOn ? <Volume2 className="w-4 h-4 text-[#FF9900]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                  <div>
                    <span className="text-xs font-semibold block text-[#0f1111] dark:text-white">Chimes & Speech Synthesis</span>
                    <span className="text-[11px] text-gray-500">Audio playback for voice turns</span>
                  </div>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    isSoundOn ? 'bg-[#FF9900] text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isSoundOn ? 'Enabled' : 'Muted'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#232f3e] border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <Subtitles className="w-4 h-4 text-[#007185]" />
                  <div>
                    <span className="text-xs font-semibold block text-[#0f1111] dark:text-white">Real-Time Captions</span>
                    <span className="text-[11px] text-gray-500">Always visible transcript text</span>
                  </div>
                </div>
                <button
                  onClick={onToggleCaptions}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    isCaptionsOn ? 'bg-[#FF9900] text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isCaptionsOn ? 'On' : 'Off'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#232f3e] border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                  <Type className="w-4 h-4 text-[#534ab7]" />
                  <div>
                    <span className="text-xs font-semibold block text-[#0f1111] dark:text-white">Elder-First Larger Font</span>
                    <span className="text-[11px] text-gray-500">High-legibility typography</span>
                  </div>
                </div>
                <button
                  onClick={onToggleLargeText}
                  className={`px-3 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${
                    isLargeText ? 'bg-[#FF9900] text-black' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {isLargeText ? 'Large' : 'Normal'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Consent Invariant Drills */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center justify-between">
              <span>Security Invariant Drills</span>
              <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
            </h3>
            <p className="text-[11px] text-gray-500 mb-2">
              Click to fire live requests against the MCP server and observe the default-deny rules:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => runQuickDrill('unauthorized')}
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16191f] hover:border-[#FF9900] text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Drill 1: Ask without permission</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Tests immediate default-deny gating on sensitive hardware reads.</p>
              </button>

              <button
                onClick={() => runQuickDrill('unconfirmed')}
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16191f] hover:border-[#FF9900] text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-between">
                  <span>Drill 2: Actuate without confirmation</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">Tests two-step physical actuator confirmation safety rule.</p>
              </button>

              <button
                onClick={() => runQuickDrill('tamper')}
                className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 hover:border-rose-400 text-left text-xs transition-colors cursor-pointer"
              >
                <div className="font-semibold text-rose-800 dark:text-rose-300 flex items-center justify-between">
                  <span>Drill 3: Tamper with audit log</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">Modifies log text in memory; SHA-256 integrity check immediately catches it.</p>
              </button>
            </div>

            {drillOutput && (
              <div className="mt-3 p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200 leading-relaxed">
                {drillOutput}
              </div>
            )}
          </div>

          {/* Section 3: Audit Log & Cryptographic Verification */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
              Audit Chain Actions
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={onVerifyChain}
                className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-100 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verify Hashes</span>
              </button>

              <button
                onClick={onRestoreAudit}
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#232f3e] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-100 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Chain</span>
              </button>

              <button
                onClick={onExportAuditJson}
                className="col-span-2 p-2.5 rounded-lg bg-white dark:bg-[#16191f] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold flex items-center justify-center gap-1.5 hover:border-[#FF9900] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log (JSON)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#eaeded] dark:border-[#2a3439] flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
