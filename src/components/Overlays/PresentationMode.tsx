import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ScenarioId } from '../../types';

interface PresentationModeProps {
  onClose: () => void;
  onSelectScenario: (id: ScenarioId) => void;
  onPlay: () => void;
  currentScenario: ScenarioId;
  currentBeat: number;
  totalBeats: number;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  onClose,
  onSelectScenario,
  onPlay,
  currentScenario,
  currentBeat,
  totalBeats,
}) => {
  const [countdown, setCountdown] = useState<number | null>(3);
  const [directorStage, setDirectorStage] = useState<'countdown' | 'running' | 'complete'>('countdown');

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 1) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 1) {
      const timer = setTimeout(() => {
        setCountdown(null);
        setDirectorStage('running');
        onSelectScenario('s3');
        onPlay();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, onPlay, onSelectScenario]);

  return (
    <div className="fixed inset-0 z-50 bg-[#131921]/95 text-white flex flex-col justify-between p-8 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar: Title & Director Tracker */}
      <div className="flex items-center justify-between border-b border-[#232f3e] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#FF9900] text-[#131921] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              TrueDose — Presentation Mode (Demo Director)
            </h2>
            <p className="text-xs text-gray-400">
              Automated Walkthrough: S3 (Voice Consent) → S4 (60s Undo) → S5 (Revoke) → Cryptographic Proof
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-[#232f3e] hover:bg-[#2e3b4a] text-gray-300 hover:text-white transition-colors cursor-pointer"
          title="Exit Presentation Mode (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Director Center Area */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto my-8">
        {directorStage === 'countdown' && countdown !== null && (
          <div className="space-y-4">
            <span className="text-xs uppercase font-mono tracking-widest text-[#FF9900] font-bold">
              Demo Director Starting In
            </span>
            <div className="text-8xl font-black text-[#FF9900] font-mono animate-pulse">
              {countdown}
            </div>
            <p className="text-sm text-gray-400">
              Clean 1080p recording view...
            </p>
          </div>
        )}

        {directorStage === 'running' && (
          <div className="space-y-6 w-full">
            <div className="p-6 rounded-2xl bg-[#1c2530] border border-[#2e3b4a] shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#2e3b4a] pb-3">
                <span className="font-mono uppercase text-[#FF9900] font-bold">● LIVE DEMO RUNNING</span>
                <span>Beat {currentBeat} of {totalBeats}</span>
              </div>

              <div className="text-left space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Now Showing: Scenario 3 — Consent-Gated Gate Check</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Notice how Daughter asks to check the gate, but the real MCP server holds the pipeline at <strong>Consent</strong> until Grandma approves by voice.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#FF9900] transition-all duration-300"
                  style={{ width: `${totalBeats > 0 ? (currentBeat / totalBeats) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  onSelectScenario('s4');
                  onPlay();
                }}
                className="px-4 py-2 rounded-xl bg-[#232f3e] hover:bg-[#2e3b4a] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Jump to S4: Undo Ring (60s)
              </button>

              <button
                onClick={() => {
                  onSelectScenario('s5');
                  onPlay();
                }}
                className="px-4 py-2 rounded-xl bg-[#232f3e] hover:bg-[#2e3b4a] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Jump to S5: Voice Revoke
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] text-xs font-bold transition-colors cursor-pointer"
              >
                Return to Interactive Stage
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#232f3e] pt-4 flex items-center justify-between text-xs text-gray-400">
        <span>Alexa+ is simulated. MCP server is real. Mock data. Not a medical device.</span>
        <span>Press Esc to exit</span>
      </div>
    </div>
  );
};
