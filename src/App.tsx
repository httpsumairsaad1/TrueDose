import React, { useState, useEffect, useCallback } from 'react';
import { useSimEngine } from './store/simStore';
import { Header } from './components/Header/Header';
import { NarratorBar } from './components/Narrator/NarratorBar';
import { MessagesPane } from './components/MessagesPane/MessagesPane';
import { ScenePane } from './components/ScenePane/ScenePane';
import { TracePane } from './components/TracePane/TracePane';
import { TransportBar } from './components/Transport/TransportBar';
import { StartOverlay } from './components/Overlays/StartOverlay';
import { HelpDrawer } from './components/Overlays/HelpDrawer';
import { OptionsDrawer } from './components/Overlays/OptionsDrawer';
import { LandingPage } from './components/LandingPage/LandingPage';
import strings from './strings/en.json';

export default function App() {
  const engine = useSimEngine();

  // Current view: 'landing' (the modern landing page requested) or 'simulation' (the interactive stage)
  const [currentView, setCurrentView] = useState<'landing' | 'simulation'>('landing');

  // Overlay states
  const [showStartOverlay, setShowStartOverlay] = useState<boolean>(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState<boolean>(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState<boolean>(false);

  // Keyboard shortcut listener (active in simulation view)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setShowStartOverlay(false);
        setShowHelpDrawer(false);
        setShowOptionsDrawer(false);
        return;
      }

      if (currentView !== 'simulation') {
        return;
      }

      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        engine.togglePlayPause();
        return;
      }

      if ((e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') && !e.shiftKey) {
        e.preventDefault();
        engine.stepNext();
        return;
      }

      if (e.key === 'b' || e.key === 'B' || e.key === 'ArrowLeft') {
        e.preventDefault();
        engine.stepBack();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        engine.resetScenario();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        engine.setIsSoundOn(!engine.isSoundOn);
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        engine.setIsCaptionsOn(!engine.isCaptionsOn);
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        engine.setIsDevTrace(!engine.isDevTrace);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShowHelpDrawer(prev => !prev);
        return;
      }

      // 1 to 5: switch scenario
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const idMap: Record<string, any> = { '1': 's1', '2': 's2', '3': 's3', '4': 's4', '5': 's5' };
        engine.setScenarioId(idMap[e.key]);
        return;
      }

      // Consent quick answer: Y or Shift+N when awaiting input
      if (engine.awaitingInput) {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          engine.answerConsent('yes');
        } else if (e.key === 'N' && e.shiftKey) {
          e.preventDefault();
          engine.answerConsent('no');
        }
      }
    },
    [engine, currentView]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLaunchSimulation = () => {
    setCurrentView('simulation');
    engine.setScenarioId('s3');
    engine.setIsSoundOn(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartDemo = (withSound: boolean) => {
    engine.setIsSoundOn(withSound);
    setShowStartOverlay(false);
    engine.setScenarioId('s3');
    engine.togglePlayPause();
  };

  const exportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(engine.auditChain, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truedose-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const focusedPane = engine.narration.focusedPane || 'all';

  return (
    <div className={`min-h-screen flex flex-col bg-[#f7f9fa] text-[#0f1111] ${engine.isLargeText ? 'text-lg' : 'text-base'}`}>
      
      {/* 1. Global Header with View Switcher */}
      <Header
        currentScenario={engine.scenarioId}
        onSelectScenario={engine.setScenarioId}
        isLiveMode={engine.isLiveMode}
        onToggleLive={() => engine.setIsLiveMode(!engine.isLiveMode)}
        isDevTrace={engine.isDevTrace}
        onToggleDevTrace={() => engine.setIsDevTrace(!engine.isDevTrace)}
        onOpenHelp={() => setShowHelpDrawer(true)}
        onOpenOptions={() => setShowOptionsDrawer(true)}
        currentView={currentView}
        onSetView={setCurrentView}
      />

      {/* 2. Main Content Routing: Landing Page or Live Simulation Stage */}
      {currentView === 'landing' ? (
        <LandingPage onLaunchSimulation={handleLaunchSimulation} />
      ) : (
        <>
          {/* PLAY / PAUSE & TRANSPORT CONTROLS (PROMINENTLY AT THE TOP ABOVE THE 3 PANES!) */}
          <TransportBar
            transportState={engine.transportState}
            currentBeat={engine.currentBeatIndex}
            totalBeats={engine.totalBeats}
            speed={engine.speedMultiplier}
            onSetSpeed={engine.setSpeedMultiplier}
            onPlayPause={engine.togglePlayPause}
            onNext={engine.stepNext}
            onBack={engine.stepBack}
            onReset={engine.resetScenario}
            isSoundOn={engine.isSoundOn}
            onToggleSound={() => engine.setIsSoundOn(!engine.isSoundOn)}
            isCaptionsOn={engine.isCaptionsOn}
            onToggleCaptions={() => engine.setIsCaptionsOn(!engine.isCaptionsOn)}
          />

          {/* Narrator Bar */}
          <NarratorBar
            narration={engine.narration}
            totalSteps={engine.totalBeats}
          />

          {/* Main Stage: The Three-Pane Layout (Right Below Transport Controls) */}
          <main className="flex-1 p-3 md:p-4 max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 overflow-hidden items-stretch">
            {/* Pane A: Messages */}
            <div className="lg:col-span-4 h-full min-h-[420px]">
              <MessagesPane
                messages={engine.messages}
                grants={engine.grants}
                isAwaitingInput={engine.transportState === 'awaiting_input'}
                onConsentAnswer={engine.answerConsent}
                onRevokeGrant={engine.revokeScope}
                isFocused={focusedPane === 'messages' || focusedPane === 'all'}
                isLargeText={engine.isLargeText}
              />
            </div>

            {/* Pane B: Scene (3D Bedside, Horizontal Pillbox, Front Gate) */}
            <div className="lg:col-span-4 h-full min-h-[420px]">
              <ScenePane
                orbState={engine.orbState}
                gateState={engine.gateState}
                pillbox={engine.pillbox}
                clockLabel={engine.clockLabel}
                undoSeconds={engine.undoSeconds}
                isFocused={focusedPane === 'scene' || focusedPane === 'all'}
              />
            </div>

            {/* Pane C: Trace (Real Connected Pipeline, Architecture Mindmap, Inline Receipt) */}
            <div className="lg:col-span-4 h-full min-h-[420px]">
              <TracePane
                pipeline={engine.pipeline}
                toolCalls={engine.toolCalls}
                auditChain={engine.auditChain}
                grants={engine.grants}
                isDevTrace={engine.isDevTrace}
                onToggleDevTrace={() => engine.setIsDevTrace(!engine.isDevTrace)}
                chainVerifyStatus={engine.chainVerifyStatus}
                onVerifyChain={engine.handleVerifyChain}
                onTamperTest={engine.handleTamperTest}
                onRestoreAudit={engine.handleRestoreAudit}
                privacyReceipt={engine.privacyReceipt}
                isFocused={focusedPane === 'trace' || focusedPane === 'all'}
              />
            </div>
          </main>

          {/* Clean Amazon Footer Notice */}
          <div className="bg-white text-gray-500 py-2.5 px-4 text-center text-xs border-t border-[#eaeded]">
            <span className="font-bold text-[#0f1111]">{strings.app.disclaimer}</span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="text-[#b12704] font-semibold">Alexa+ Track (Simulated MCP path)</span>
            <span className="mx-2 text-gray-300">·</span>
            <span>AWS Builder & Open Source Challenges</span>
          </div>
        </>
      )}

      {/* Modals & Drawers */}
      {showStartOverlay && (
        <StartOverlay
          onStart={handleStartDemo}
          onDismiss={() => setShowStartOverlay(false)}
        />
      )}

      {showHelpDrawer && (
        <HelpDrawer onClose={() => setShowHelpDrawer(false)} />
      )}

      {showOptionsDrawer && (
        <OptionsDrawer
          onClose={() => setShowOptionsDrawer(false)}
          isSoundOn={engine.isSoundOn}
          onToggleSound={() => engine.setIsSoundOn(!engine.isSoundOn)}
          isCaptionsOn={engine.isCaptionsOn}
          onToggleCaptions={() => engine.setIsCaptionsOn(!engine.isCaptionsOn)}
          isLargeText={engine.isLargeText}
          onToggleLargeText={() => engine.setIsLargeText(!engine.isLargeText)}
          isDevTrace={engine.isDevTrace}
          onToggleDevTrace={() => engine.setIsDevTrace(!engine.isDevTrace)}
          onVerifyChain={engine.handleVerifyChain}
          onTamperTest={engine.handleTamperTest}
          onRestoreAudit={engine.handleRestoreAudit}
          onExportAuditJson={exportAuditJson}
        />
      )}
    </div>
  );
}
