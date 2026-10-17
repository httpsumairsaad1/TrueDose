import React from 'react';
import { GateState, OrbState, PillDay } from '../../types';
import { Lock, Unlock, HelpCircle, Sun, Moon, Undo2, ShieldCheck, CheckCircle2, AlertCircle, Home } from 'lucide-react';
import { LivingRoom3D } from './LivingRoom3D';
import strings from '../../strings/en.json';

interface ScenePaneProps {
  orbState: OrbState;
  gateState: GateState;
  pillbox: PillDay[];
  clockLabel: string;
  undoSeconds: number | null;
  isFocused?: boolean;
}

export const ScenePane: React.FC<ScenePaneProps> = ({
  orbState,
  gateState,
  pillbox,
  clockLabel,
  undoSeconds,
  isFocused = false,
}) => {
  const isNight = clockLabel.toLowerCase().includes('night') || clockLabel.toLowerCase().includes('evening');
  const isGateLocked = gateState === 'locked';
  const isGateUnlocked = gateState === 'unlocked';

  return (
    <section
      className={`bg-white rounded-xl border transition-all duration-300 flex flex-col h-full shadow-xs overflow-hidden ${
        isFocused
          ? 'border-[#FF9900] ring-2 ring-[#FF9900]/25'
          : 'border-[#eaeded]'
      }`}
      aria-label={`Scene: Gate is ${gateState}, Alexa orb is ${orbState}`}
    >
      {/* Clean Pane Header without meta/library names */}
      <div className="border-b border-[#eaeded] px-4 py-2.5 flex items-center justify-between bg-[#fbfcfc]">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-[#FF9900]" />
          <span className="font-bold text-sm text-[#0f1111]">
            B. Scene — Home Environment & Hardware
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-mono font-bold">
            MOCK
          </span>
        </div>

        {/* Simulated Time Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs">
          {isNight ? (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#FF9900]" />
          )}
          <span>{clockLabel}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        
        {/* 1. TOP: Closeup Bedside Scene (Grandma on bed, nightstand with meds & Alexa, faraway daughter) */}
        <LivingRoom3D orbState={orbState} />

        {/* 2. MIDDLE: HORIZONTAL PILLBOX (Bold, Full-Width 7-Day Medication Strip) */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-300 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
              <span className="text-xs font-black text-[#0f1111] uppercase tracking-wide">
                Weekly Pillbox (Horizontal 7-Day Strip)
              </span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              Timestamp-only logging · No medical advice
            </span>
          </div>

          {/* 7 Horizontal Daily Slots */}
          <div className="grid grid-cols-7 gap-2">
            {pillbox.map((slot, idx) => {
              const isLogged = slot.state === 'logged';
              const isMissed = slot.state === 'missed';
              const isToday = slot.state === 'today';

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex flex-col items-center justify-between min-h-[90px] transition-all relative ${
                    isLogged
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-2xs'
                      : isMissed
                      ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                      : isToday
                      ? 'bg-[#fff8e7] border-[#FF9900] ring-2 ring-[#FF9900]/30 shadow-xs'
                      : 'bg-gray-50/60 border-gray-200 text-gray-400'
                  }`}
                >
                  {/* Slot Top: Day Header */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold border-b border-black/5 pb-1 mb-1">
                    <span className="font-mono">{slot.dayName}</span>
                    {isLogged && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isMissed && <AlertCircle className="w-3 h-3 text-amber-600" />}
                  </div>

                  {/* Visual SVG Pill Capsule */}
                  <div className="my-1 flex items-center justify-center">
                    {isLogged ? (
                      <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="24" height="12" rx="6" fill="#067d62" stroke="#045a47" strokeWidth="1.5" />
                        <path d="M13 1V13" stroke="#ffffff" strokeWidth="1.5" />
                        <rect x="1" y="1" width="12" height="12" rx="6" fill="#34d399" />
                      </svg>
                    ) : isMissed ? (
                      <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="24" height="12" rx="6" stroke="#b12704" strokeWidth="1.5" strokeDasharray="2 2" />
                      </svg>
                    ) : isToday ? (
                      <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse">
                        <rect x="1" y="1" width="24" height="12" rx="6" fill="#FF9900" stroke="#b12704" strokeWidth="1.5" />
                        <path d="M13 1V13" stroke="#131921" strokeWidth="1.5" />
                      </svg>
                    ) : (
                      <svg width="26" height="14" viewBox="0 0 26 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="24" height="12" rx="6" stroke="#d5dbdb" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>

                  {/* Slot Bottom: Status Label */}
                  <div className="w-full text-center">
                    <span className={`text-[10px] font-bold block leading-tight ${
                      isLogged 
                        ? 'text-emerald-700' 
                        : isMissed 
                        ? 'text-amber-800' 
                        : isToday 
                        ? 'text-[#b12704]' 
                        : 'text-gray-400'
                    }`}>
                      {isLogged ? '08:02 AM' : isMissed ? 'MISSED' : isToday ? 'TODAY' : 'FUTURE'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. BOTTOM: HORIZONTAL FRONT GATE (Bold, Professional Full-Width Gate View) */}
        <div className="bg-white p-3.5 rounded-xl border border-gray-300 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF9900]" />
              <span className="text-xs font-black text-[#0f1111] uppercase tracking-wide">
                Front Gate (Horizontal Hardware Actuator Simulator)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 60s Undo Active Ring Badge */}
              {undoSeconds !== null && undoSeconds > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#fff8e7] border-2 border-[#FF9900] shadow-xs animate-pulse">
                  <Undo2 className="w-4 h-4 text-[#FF9900]" />
                  <span className="text-xs font-mono font-black text-[#b12704]">
                    UNDO WINDOW: {undoSeconds}s ACTIVE
                  </span>
                </div>
              )}

              <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono font-bold">
                MOCK DEVICE
              </span>
            </div>
          </div>

          {/* Full-Width Horizontal Architectural Gate Graphic */}
          <div className="relative w-full h-[110px] bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-between px-6 py-2">
            
            {/* Left Brick Pillar */}
            <div className="w-10 h-full bg-[#37475a] rounded-sm flex flex-col justify-between p-1 shadow-md shrink-0">
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
            </div>

            {/* Central Animated Gate Bars Structure */}
            <div className="flex-1 mx-4 h-full relative flex items-center justify-center">
              <div className="w-full h-16 border-y-4 border-[#131921] relative flex items-center justify-around px-4 bg-white/40">
                {/* Horizontal Diagonal cross braces */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <line x1="0" y1="0" x2="50%" y2="100%" stroke="#131921" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="0" y2="100%" stroke="#131921" strokeWidth="2" />
                    <line x1="50%" y1="0" x2="100%" y2="100%" stroke="#131921" strokeWidth="2" />
                    <line x1="100%" y1="0" x2="50%" y2="100%" stroke="#131921" strokeWidth="2" />
                  </svg>
                </div>

                {/* Vertical Steel Bars */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-full bg-[#131921] rounded-xs shadow-xs" />
                ))}

                {/* Central Heavy Duty Padlock Widget */}
                <div className={`absolute z-20 px-4 py-2 rounded-xl flex items-center gap-2.5 shadow-md border-2 transition-all ${
                  isGateLocked
                    ? 'bg-emerald-600 text-white border-emerald-800'
                    : isGateUnlocked
                    ? 'bg-amber-500 text-black border-amber-700'
                    : 'bg-[#232f3e] text-white border-gray-600'
                }`}>
                  {isGateLocked ? (
                    <Lock className="w-5 h-5 text-white" />
                  ) : isGateUnlocked ? (
                    <Unlock className="w-5 h-5 text-black animate-bounce" />
                  ) : (
                    <HelpCircle className="w-5 h-5 text-amber-300" />
                  )}

                  <div className="text-left font-sans">
                    <span className="text-xs font-black block leading-none">
                      {isGateLocked ? 'GATE LOCKED' : isGateUnlocked ? 'GATE UNLOCKED' : 'STATUS PROTECTED'}
                    </span>
                    <span className="text-[10px] font-medium opacity-90 leading-tight">
                      {isGateLocked 
                        ? 'Hardware Bolt Engaged' 
                        : isGateUnlocked 
                        ? '60s Voice Undo Available' 
                        : 'Awaiting Elder Voice Consent'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Brick Pillar */}
            <div className="w-10 h-full bg-[#37475a] rounded-sm flex flex-col justify-between p-1 shadow-md shrink-0">
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
              <div className="h-2 bg-gray-400/40 rounded-xs" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
            <span>Two-step physical confirmation required</span>
            <span>Grandma can reverse at any time: "Alexa, undo"</span>
          </div>
        </div>

      </div>
    </section>
  );
};
