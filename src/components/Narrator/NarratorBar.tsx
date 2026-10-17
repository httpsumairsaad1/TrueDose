import React from 'react';
import { NarrationState } from '../../types';
import { Sparkles } from 'lucide-react';

interface NarratorBarProps {
  narration: NarrationState;
  totalSteps: number;
}

export const NarratorBar: React.FC<NarratorBarProps> = ({ narration, totalSteps }) => {
  const stepsCount = totalSteps > 0 ? totalSteps : narration.of;

  return (
    <div 
      className="bg-[#fff8e7] text-[#0f1111] px-4 py-2 border-b border-[#ffe1a6] flex items-center justify-between gap-4 shadow-xs"
      role="region"
      aria-label="Scenario Narrator"
      aria-live="polite"
    >
      <div className="max-w-[1700px] mx-auto w-full flex items-center justify-between gap-4">
        {/* Step Indicator & Text */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#FF9900] text-[#131921] text-xs font-black font-mono whitespace-nowrap shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step {narration.step} of {stepsCount}</span>
          </div>
          <p className="text-sm font-semibold tracking-normal text-[#0f1111]">
            {narration.text}
          </p>
        </div>

        {/* Visual Progress Dots */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0" aria-hidden="true">
          {Array.from({ length: stepsCount }).map((_, idx) => {
            const isCompleted = idx + 1 < narration.step;
            const isCurrent = idx + 1 === narration.step;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-6 bg-[#FF9900]'
                    : isCompleted
                    ? 'w-2 bg-[#b12704]'
                    : 'w-2 bg-amber-200'
                }`}
                title={`Step ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
