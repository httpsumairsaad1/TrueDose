import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Subtitles, 
  FastForward 
} from 'lucide-react';
import { TransportState } from '../../types';
import strings from '../../strings/en.json';

interface TransportBarProps {
  transportState: TransportState;
  currentBeat: number;
  totalBeats: number;
  speed: number;
  onSetSpeed: (speed: number) => void;
  onPlayPause: () => void;
  onNext: () => void;
  onBack: () => void;
  onReset: () => void;
  isSoundOn: boolean;
  onToggleSound: () => void;
  isCaptionsOn: boolean;
  onToggleCaptions: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  transportState,
  currentBeat,
  totalBeats,
  speed,
  onSetSpeed,
  onPlayPause,
  onNext,
  onBack,
  onReset,
  isSoundOn,
  onToggleSound,
  isCaptionsOn,
  onToggleCaptions,
}) => {
  const isPlaying = transportState === 'playing';
  const isAwaitingInput = transportState === 'awaiting_input';
  const isFinished = transportState === 'finished';

  const nextSpeed = () => {
    if (speed === 1) onSetSpeed(2);
    else if (speed === 2) onSetSpeed(0.5);
    else onSetSpeed(1);
  };

  return (
    <div 
      className="bg-white border-b border-[#eaeded] px-4 py-2 shadow-xs sticky top-[89px] z-20"
      role="toolbar"
      aria-label="Simulation Playback Controls"
    >
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Playback Stepping & Controls */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={onReset}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
            title="Reset Scenario to Start (Key: R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back */}
          <button
            onClick={onBack}
            disabled={currentBeat <= 1 || isAwaitingInput}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Beat (Key: B or Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* PROMINENT PLAY / PAUSE BUTTON (Amazon Orange #FF9900) */}
          <button
            onClick={onPlayPause}
            disabled={isAwaitingInput}
            className={`px-6 py-2.5 rounded-lg font-black text-xs flex items-center gap-2.5 transition-all shadow-sm cursor-pointer transform hover:-translate-y-0.2 active:translate-y-0 ${
              isAwaitingInput
                ? 'bg-amber-100 text-amber-800 border-2 border-amber-300 cursor-not-allowed opacity-90'
                : isFinished
                ? 'bg-[#FF9900] text-[#131921] hover:bg-[#e88b00] ring-2 ring-[#FF9900]/30'
                : isPlaying
                ? 'bg-[#131921] text-white hover:bg-[#232f3e] border border-gray-700 ring-2 ring-[#131921]/20'
                : 'bg-[#FF9900] text-[#131921] hover:bg-[#e88b00] ring-2 ring-[#FF9900]/30'
            }`}
            title="Play / Pause Simulation (Key: Space)"
          >
            {isFinished ? (
              <>
                <RotateCcw className="w-4 h-4 text-[#131921]" />
                <span className="uppercase tracking-wider">Play Again</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="uppercase tracking-wider">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-[#131921]" />
                <span className="uppercase tracking-wider">Play Simulation</span>
              </>
            )}
          </button>

          {/* Step Next */}
          <button
            onClick={onNext}
            disabled={isAwaitingInput || currentBeat >= totalBeats}
            className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Beat (Key: N or Right Arrow)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={nextSpeed}
            className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-mono font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1 cursor-pointer"
            title="Cycle Playback Speed (0.5x, 1x, 2x)"
          >
            <FastForward className="w-3.5 h-3.5 text-[#FF9900]" />
            <span>{speed}x</span>
          </button>
        </div>

        {/* Center: Timeline Scrubber & Progress */}
        <div className="flex-1 max-w-md mx-2 flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-gray-600 whitespace-nowrap">
            Beat {currentBeat} of {totalBeats}
          </span>
          <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-[#FF9900] transition-all duration-300 rounded-full shadow-xs"
              style={{ width: `${totalBeats > 0 ? (currentBeat / totalBeats) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Right: Audio & Captions Quick Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onToggleCaptions}
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              isCaptionsOn 
                ? 'bg-[#fff8e7] text-[#b12704] border-[#FF9900]' 
                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
            title="Toggle Captions (Key: C)"
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>Captions</span>
          </button>

          <button
            onClick={onToggleSound}
            className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer font-bold ${
              isSoundOn 
                ? 'bg-[#fff8e7] text-[#b12704] border-[#FF9900]' 
                : 'text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
            title="Toggle Chime & Speech Synthesis (Key: M)"
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-[#FF9900]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundOn ? 'Sound On' : 'Muted'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
