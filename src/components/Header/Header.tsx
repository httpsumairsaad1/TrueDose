import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  SlidersHorizontal,
  Layers,
  Sparkles,
  Layout,
  Tv
} from 'lucide-react';
import { ScenarioId } from '../../types';

interface HeaderProps {
  currentScenario: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  isLiveMode: boolean;
  onToggleLive: () => void;
  isDevTrace: boolean;
  onToggleDevTrace: () => void;
  onOpenHelp: () => void;
  onOpenOptions: () => void;
  currentView: 'landing' | 'simulation';
  onSetView: (view: 'landing' | 'simulation') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onSelectScenario,
  isLiveMode,
  onToggleLive,
  isDevTrace,
  onToggleDevTrace,
  onOpenHelp,
  onOpenOptions,
  currentView,
  onSetView,
}) => {
  const scenarios: { id: ScenarioId; num: number; title: string; subtitle: string; tag: string }[] = [
    { id: 's1', num: 1, title: 'Morning Pill', subtitle: 'Elder Autonomy', tag: '25s' },
    { id: 's2', num: 2, title: 'Missed Dose Ladder', subtitle: 'Gentle Escalation', tag: '40s' },
    { id: 's3', num: 3, title: 'Consent-Gated Gate Check', subtitle: 'Voice Permission (Core)', tag: '45s' },
    { id: 's4', num: 4, title: 'Lock With Confirm & Undo', subtitle: 'Actuator Safety & 60s Undo', tag: '45s' },
    { id: 's5', num: 5, title: 'Default Deny & Revoke', subtitle: 'Instant Voice Revocation', tag: '35s' },
  ];

  return (
    <header className="bg-white border-b border-[#eaeded] sticky top-0 z-30 shadow-xs">
      {/* Top Brand & View Switcher Bar */}
      <div className="border-b border-[#f2f4f6] px-4 py-2">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onSetView('landing')}
              className="flex items-center gap-3 text-left cursor-pointer group"
              title="Return to Landing Page Overview"
            >
              <div className="w-9 h-9 rounded-lg bg-[#FF9900] text-[#131921] flex items-center justify-center font-black shadow-xs group-hover:bg-[#e88b00] transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-[#0f1111] group-hover:text-[#FF9900] transition-colors">
                    TrueDose
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#fff8e7] text-[#b12704] font-bold border border-[#ffe1a6]">
                    Alexa+ (Simulated MCP)
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono">
                    MOCK
                  </span>
                </div>
                <p className="text-[11px] text-[#565959]">
                  Consent-First Eldercare Orchestrator · AWS Builder & Open Source
                </p>
              </div>
            </button>
          </div>

          {/* Center: Clean View Switcher (Landing Page vs Simulation Stage) */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => onSetView('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-white text-[#0f1111] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-[#007185]" />
              <span>Project Overview</span>
            </button>

            <button
              onClick={() => onSetView('simulation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'simulation'
                  ? 'bg-[#FF9900] text-[#131921] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Live Simulation Stage</span>
            </button>
          </div>

          {/* Quick Actions & Exploration Deck */}
          <div className="flex items-center gap-2.5">
            {/* Live MCP Status */}
            <button
              onClick={onToggleLive}
              className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLiveMode 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="Toggle Live MCP Server vs Replay"
            >
              <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
              <span className="hidden sm:inline">{isLiveMode ? 'LIVE MCP SERVER' : 'REPLAY MODE'}</span>
            </button>

            {/* Dev / Plain Trace Mode */}
            <button
              onClick={onToggleDevTrace}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                isDevTrace 
                  ? 'bg-[#fff8e7] text-[#b12704] border-[#FF9900]' 
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title="Switch between Plain Story and JSON-RPC Developer trace"
            >
              {isDevTrace ? 'Dev Mode' : 'Plain'}
            </button>

            {/* Options & Drills Drawer */}
            <button
              onClick={onOpenOptions}
              className="px-3 py-1 rounded-md text-xs font-bold bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Explore all detailed security drills and audit tools"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#131921]" />
              <span className="hidden sm:inline">Options & Drills</span>
            </button>

            {/* Help */}
            <button
              onClick={onOpenHelp}
              className="p-1.5 text-gray-500 hover:text-black transition-colors cursor-pointer"
              title="Guide (Key: ?)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent 5 Demo Scenarios Strip (Visible when in Simulation View) */}
      {currentView === 'simulation' && (
        <div className="bg-[#fafbfb] px-4 py-2 border-t border-[#f0f2f4]">
          <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-2 overflow-x-auto">
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-gray-500 shrink-0 mr-1">
              <Layers className="w-4 h-4 text-[#FF9900]" />
              <span>5 Demo Scenarios:</span>
            </div>

            <div className="flex items-center gap-2 flex-1 overflow-x-auto py-0.5">
              {scenarios.map((sc) => {
                const isSelected = currentScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => onSelectScenario(sc.id)}
                    className={`px-3 py-1.5 rounded-lg text-left transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#FF9900] shadow-xs ring-2 ring-[#FF9900]/25'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isSelected ? 'bg-[#FF9900] text-[#131921]' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {sc.num}
                      </span>
                      <span className="text-xs font-bold text-[#0f1111]">
                        {sc.title}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        ({sc.tag})
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate max-w-[170px] mt-0.5">
                      {sc.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
