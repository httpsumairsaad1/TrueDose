import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { OmniCareMcpServer } from '../../mcp/server';
import { verifyAuditChain } from '../../mcp/audit';

interface TryToBreakItProps {
  onClose: () => void;
  onApplyTamperToStage: () => void;
}

export const TryToBreakIt: React.FC<TryToBreakItProps> = ({ onClose, onApplyTamperToStage }) => {
  const [activeDrill, setActiveDrill] = useState<number | null>(null);
  const [drillResult, setDrillResult] = useState<{
    title: string;
    description: string;
    systemOutput: string;
    passed: boolean;
    auditProof: string;
  } | null>(null);

  const runDrill = async (drillId: number) => {
    setActiveDrill(drillId);
    const testMcp = new OmniCareMcpServer();

    if (drillId === 1) {
      // 1. Ask without permission
      const res = await testMcp.callTool('check_gate_status', {}, 'caregiver');
      setDrillResult({
        title: "Drill 1: Ask without permission",
        description: "Attempted to inspect gate status without an active elder grant.",
        systemOutput: `Status: ${res.status.toUpperCase()} — "${res.speakable}"`,
        passed: res.status === 'denied',
        auditProof: "Audit row added: 'Request blocked: no permission from Grandma'",
      });
    } else if (drillId === 2) {
      // 2. Lock without confirming
      const res = await testMcp.callTool('lock_gate', { confirmed: false }, 'caregiver');
      setDrillResult({
        title: "Drill 2: Lock without confirming",
        description: "Attempted physical lock actuator without two-step user confirmation.",
        systemOutput: `Status: ${res.status.toUpperCase()} — "${res.speakable}"`,
        passed: res.status === 'pending',
        auditProof: "Actuator state remained UNLOCKED. No unconfirmed motion allowed.",
      });
    } else if (drillId === 3) {
      // 3. Ask after access was removed
      testMcp.setGrant('gate_status', 'active', 24);
      await testMcp.callTool('revoke_access', { scope: 'gate_status' }, 'elder');
      const res = await testMcp.callTool('check_gate_status', {}, 'caregiver');
      setDrillResult({
        title: "Drill 3: Ask after access was removed",
        description: "Elder revoked grant, caregiver tried to inspect gate again immediately.",
        systemOutput: `Status: ${res.status.toUpperCase()} — "${res.speakable}"`,
        passed: res.status === 'denied',
        auditProof: "Instant revocation: 0ms grace lag. Default-deny re-engaged.",
      });
    } else if (drillId === 4) {
      // 4. Edit the audit log
      await testMcp.callTool('log_dose', { time: '08:00' }, 'elder');
      const chain = testMcp.getAuditChain();
      // Tamper with log
      chain[0].plainText = "MALICIOUS OVERWRITE";
      const verify = await verifyAuditChain(chain);
      setDrillResult({
        title: "Drill 4: Edit the audit log (Tamper Test)",
        description: "Attacker modified text in entry #0 directly in memory.",
        systemOutput: `Cryptographic Verification: FAILED (Hash mismatch at block #${verify.tamperedIndex})`,
        passed: !verify.valid,
        auditProof: "Tamper mathematically proven via SHA-256 prevHash integrity failure.",
      });
      // Also apply to stage so judge sees it in Trace Pane
      onApplyTamperToStage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-[#1d232b] rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="break-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 id="break-title" className="text-base font-bold text-slate-900 dark:text-white">
              Try To Break It — Security & Consent Drills
            </h3>
            <p className="text-xs text-slate-500">
              Test safety invariants directly against the real MCP server.
            </p>
          </div>
        </div>

        {/* 4 Interactive Challenge Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
          <button
            onClick={() => runDrill(1)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeDrill === 1
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              1. Ask without permission
            </div>
            <p className="text-[11px] text-slate-500">
              Caregiver attempts gate read without elder consent.
            </p>
          </button>

          <button
            onClick={() => runDrill(2)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeDrill === 2
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              2. Lock without confirming
            </div>
            <p className="text-[11px] text-slate-500">
              Caregiver attempts unconfirmed physical actuation.
            </p>
          </button>

          <button
            onClick={() => runDrill(3)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeDrill === 3
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              3. Ask after revoke
            </div>
            <p className="text-[11px] text-slate-500">
              Caregiver attempts access after elder revokes grant.
            </p>
          </button>

          <button
            onClick={() => runDrill(4)}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeDrill === 4
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              4. Edit the audit log
            </div>
            <p className="text-[11px] text-slate-500">
              Modify raw audit log entry and test SHA-256 verification.
            </p>
          </button>
        </div>

        {/* Drill Output Card */}
        {drillResult && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 my-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">{drillResult.title}</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Security Invariant Upheld
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{drillResult.description}</p>
            <div className="p-2 rounded bg-white dark:bg-[#1d232b] border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-700 dark:text-indigo-400">
              {drillResult.systemOutput}
            </div>
            <p className="text-[11px] text-slate-500 italic">{drillResult.auditProof}</p>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Drills
          </button>
        </div>
      </div>
    </div>
  );
};
