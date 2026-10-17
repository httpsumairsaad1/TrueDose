import React from 'react';
import { ShieldCheck, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import strings from '../../strings/en.json';

interface StartOverlayProps {
  onStart: (withSound: boolean) => void;
  onDismiss: () => void;
}

export const StartOverlay: React.FC<StartOverlayProps> = ({ onStart, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#131921]/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-[#16191f] rounded-2xl max-w-lg w-full p-8 border border-[#eaeded] dark:border-[#2a3439] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="start-title"
        aria-describedby="start-desc"
      >
        <div className="w-12 h-12 rounded-xl bg-[#131921] text-[#FF9900] flex items-center justify-center mb-6 shadow-sm border border-[#232f3e]">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 id="start-title" className="text-2xl font-bold text-[#0f1111] dark:text-white tracking-tight mb-2">
          {strings.overlays.startTitle}
        </h2>

        <p id="start-desc" className="text-base text-gray-700 dark:text-gray-300 font-medium mb-6">
          {strings.overlays.startLine}
        </p>

        <div className="bg-gray-50 dark:bg-[#232f3e] p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 text-xs text-gray-700 dark:text-gray-300 space-y-2">
          <p className="font-bold text-[#0f1111] dark:text-white">
            Three views at a glance:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>A. Messages:</strong> Grandma speaks via voice; Daughter texts via SMS.</li>
            <li><strong>B. Scene:</strong> Physical home animation with gate, orb, and pillbox.</li>
            <li><strong>C. Trace:</strong> Real Streamable HTTP MCP server, voice consent, and hash-chained audit log.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onStart(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#131921]" />
            <span>Start demo (with sound)</span>
            <ArrowRight className="w-4 h-4 ml-auto text-[#131921]" />
          </button>

          <button
            onClick={() => onStart(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gray-300 dark:border-gray-700"
          >
            <VolumeX className="w-4 h-4" />
            <span>Start silent</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
          <span>{strings.app.disclaimer}</span>
          <button
            onClick={onDismiss}
            className="hover:text-black dark:hover:text-white underline cursor-pointer"
          >
            Explore directly
          </button>
        </div>
      </div>
    </div>
  );
};
