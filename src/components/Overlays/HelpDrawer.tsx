import React from 'react';
import { X, Keyboard, ShieldAlert, Layers } from 'lucide-react';
import strings from '../../strings/en.json';

interface HelpDrawerProps {
  onClose: () => void;
}

export const HelpDrawer: React.FC<HelpDrawerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1d232b] h-full shadow-2xl p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-700 animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-labelledby="help-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <h3 id="help-title" className="font-bold text-lg text-slate-900 dark:text-white">
              {strings.overlays.helpTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. What Each Pane Means */}
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-600" />
            The Three Panes
          </h4>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <strong className="text-slate-900 dark:text-white block mb-0.5">A. Messages Pane:</strong>
              Two-sided channel view. Grandma communicates via voice; Daughter communicates via SMS. Contains Grandma's active consent prompts and Control Panel.
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <strong className="text-slate-900 dark:text-white block mb-0.5">B. Scene Pane:</strong>
              Physical home illustration. Features Grandma, Daughter, Alexa+ orb, 7-day medication pillbox, and the mock gate with a 60-second undo ring.
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <strong className="text-slate-900 dark:text-white block mb-0.5">C. Trace Pane:</strong>
              Live execution pipeline and calls log. Shows real JSON-RPC tool calls, voice consent gating, and a cryptographically chained SHA-256 audit log.
            </div>
          </div>
        </div>

        {/* 2. Keyboard Shortcuts */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4 text-indigo-600" />
            Keyboard Shortcuts
          </h4>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>Space</span>
              <span className="text-slate-500">Play/Pause</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>N / →</span>
              <span className="text-slate-500">Next beat</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>B / ←</span>
              <span className="text-slate-500">Previous beat</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>R</span>
              <span className="text-slate-500">Reset</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>1 - 5</span>
              <span className="text-slate-500">Scenarios</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>Y / N</span>
              <span className="text-slate-500">Consent Yes/No</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>M</span>
              <span className="text-slate-500">Mute/Unmute</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>T</span>
              <span className="text-slate-500">Plain/Dev view</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>P</span>
              <span className="text-slate-500">Presentation</span>
            </div>
            <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between">
              <span>Esc</span>
              <span className="text-slate-500">Close overlay</span>
            </div>
          </div>
        </div>

        {/* 3. Honest Simulation Disclosure */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Honest Simulation Notice</span>
          </div>
          <p>
            Alexa+ and Ring hardware are simulated. The Model Context Protocol (MCP) server, tool routing, consent validation, and SHA-256 audit log are real.
          </p>
          <p className="font-semibold">
            Mock data only. Not a medical device.
          </p>
        </div>
      </div>
    </div>
  );
};
