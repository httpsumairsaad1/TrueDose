import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Mic, 
  Lock, 
  RotateCcw, 
  FileText, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Layers, 
  Cpu, 
  HeartHandshake,
  Smartphone,
  EyeOff,
  GitBranch,
  Terminal,
  ShieldAlert
} from 'lucide-react';

interface LandingPageProps {
  onLaunchSimulation: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchSimulation }) => {
  return (
    <div className="bg-[#ffffff] text-[#0f1111] min-h-screen">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffaf0] via-[#ffffff] to-[#ffffff] border-b border-[#eaeded] pt-12 pb-16 md:py-20 px-4">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#FF9900" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="max-w-[1240px] mx-auto relative z-10 text-center">
          
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#fff8e7] text-[#b12704] border border-[#ffe1a6] flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FF9900] animate-pulse" />
              Alexa+ (simulated)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300">
              MOCK Data
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Not a medical device
            </span>
          </div>

          {/* Project Name & Hero Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0f1111] tracking-tight leading-[1.1] mb-6">
            TrueDose
          </h1>

          {/* Purpose / Pitch */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-normal leading-relaxed mb-8">
            A <strong className="text-[#0f1111] font-bold">consent-first family check-in orchestrator</strong> for Alexa+, built as a self-hosted Model Context Protocol (MCP) server where the <span className="text-[#b12704] font-bold">elder stays in control</span>.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <button
              onClick={onLaunchSimulation}
              className="px-8 py-3.5 rounded-xl bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-black text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-current text-[#131921]" />
              <span>View Live Demo & Docs</span>
              <ArrowRight className="w-5 h-5 text-[#131921]" />
            </button>

            <a
              href="#what-is-this"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-base transition-all border border-gray-300 hover:border-gray-400 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#007185]" />
              <span>Read Architecture Overview</span>
            </a>
          </div>

          {/* Hero Visual Preview Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-[#eaeded] shadow-xl p-4 sm:p-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-600 ml-2">TrueDose · Simulation Stage Snapshot</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#b12704] bg-[#fff8e7] px-2 py-0.5 rounded border border-[#ffe1a6]">
                Spec: 2025-11-25 (Streamable HTTP)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#f3f2ff] border border-purple-200">
                <div className="flex items-center gap-1.5 font-bold text-[#534ab7] mb-1">
                  <Mic className="w-4 h-4" />
                  <span>Grandma (Voice Channel)</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Grandma logs her morning pill quietly. Family is not alerted because no action is required.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fff8e7] border border-[#FF9900]/40">
                <div className="flex items-center gap-1.5 font-bold text-[#b12704] mb-1">
                  <Lock className="w-4 h-4 text-[#FF9900]" />
                  <span>The Voice Consent Pause</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  When Daughter asks about the front gate, the MCP pipeline halts until Grandma approves aloud.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#eef6f8] border border-teal-200">
                <div className="flex items-center gap-1.5 font-bold text-[#007185] mb-1">
                  <RotateCcw className="w-4 h-4" />
                  <span>60-Second Voice Undo</span>
                </div>
                <p className="text-gray-600 text-[11px] leading-relaxed">
                  Locking the gate opens a 60-second active window. Grandma can reverse it instantly: <em>"Alexa, undo."</em>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 2. WHAT IS THIS? (THE SIMULATION STAGE)                         */}
      {/* ============================================================== */}
      <section id="what-is-this" className="py-16 md:py-24 px-4 bg-[#f8f9fa] border-b border-[#eaeded]">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF9900] bg-[#fff8e7] px-3 py-1 rounded-full border border-[#ffe1a6]">
              Interactive Simulation Stage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1111] tracking-tight mt-3 mb-4">
              What Is TrueDose?
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              An interactive web-based simulation backed by a <strong className="text-[#0f1111]">real self-hosted Model Context Protocol (MCP) server</strong> running over Streamable HTTP.
            </p>
          </div>

          {/* The Core Innovation Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-[#FF9900] shadow-sm mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-[#b12704] block mb-1">
                  The Core Architectural Shift
                </span>
                <h3 className="text-2xl font-black text-[#0f1111] mb-2">
                  Most eldercare apps give family <span className="underline decoration-red-400">more access</span>.<br className="hidden sm:inline" />
                  TrueDose gives the elder <span className="text-[#067d62] underline decoration-emerald-400">more control</span>.
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Traditional solutions rely on surveillance cameras, continuous wearables, and panicky notifications. TrueDose inverts the paradigm: the elder owns their data and grants time-limited, revocable permissions with clear audit trails.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={onLaunchSimulation}
                  className="px-6 py-3 rounded-xl bg-[#131921] hover:bg-[#232f3e] text-white font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Launch Live Simulation</span>
                  <ArrowRight className="w-4 h-4 text-[#FF9900]" />
                </button>
              </div>
            </div>
          </div>

          {/* The Three Components of the Simulation Stage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Component 1 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#534ab7] flex items-center justify-center font-bold mb-4">
                  <Mic className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0f1111] mb-2">
                  1. Messages Channel
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Side-by-side view showing Grandma speaking to Alexa+ in the kitchen, and Daughter receiving quiet, factual check-ins via SMS. Includes Grandma's voice consent cards and real-time privacy control panel.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#534ab7]">Elder Voice + Caregiver SMS</span>
            </div>

            {/* Component 2 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#b12704] flex items-center justify-center font-bold mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0f1111] mb-2">
                  2. Animated Physical Scene
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Closeup bedside scene with Grandma propped in bed, nightstand with meds and glowing Alexa+ speaker, distant doorway daughter view, horizontal 7-day pillbox strip, and mock front gate with active 60s undo countdown.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#b12704]">3D Bedside + Actuator Hardware</span>
            </div>

            {/* Component 3 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#007185] flex items-center justify-center font-bold mb-4">
                  <Server className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-[#0f1111] mb-2">
                  3. Live Backend Trace
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  A real connected 7-stage execution pipeline over JSON-RPC 2.0. Shows actual tool calls, voice consent gating, and a cryptographically chained SHA-256 tamper-evident ledger that users can inspect and save.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#007185]">Real MCP Calls + Hash Ledger</span>
            </div>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 3. THE CORE CONCEPT & RULES                                    */}
      {/* ============================================================== */}
      <section className="py-16 md:py-24 px-4 bg-white border-b border-[#eaeded]">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#067d62] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Safety Guarantees
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1111] tracking-tight mt-3 mb-4">
              The Consent-First Concept & Hard Safety Rules
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              Every sensitive action or read requires explicit voice consent from the elder, is fully audited via a hash-chained log, and can be undone within 60 seconds.
            </p>
          </div>

          {/* Grid of Safety Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Rule 1 */}
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs mb-3">
                  01
                </div>
                <h4 className="font-bold text-sm text-[#0f1111] mb-2">
                  Voice Consent Before Sharing
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Default state is <strong>deny</strong>. No caregiver can view medication status or gate locks without an active, unexpired grant issued by Grandma's voice.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 mt-4 font-bold">DEFAULT DENY INVARIANT</span>
            </div>

            {/* Rule 2 */}
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs mb-3">
                  02
                </div>
                <h4 className="font-bold text-sm text-[#0f1111] mb-2">
                  Two-Step Confirmation & 60s Undo
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Physical actuators (like locking the gate) require explicit confirmation and keep an active 60-second undo window for voice reversal.
                </p>
              </div>
              <span className="text-[10px] font-mono text-amber-700 mt-4 font-bold">REVERSIBLE ACTUATORS</span>
            </div>

            {/* Rule 3 */}
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-black text-xs mb-3">
                  03
                </div>
                <h4 className="font-bold text-sm text-[#0f1111] mb-2">
                  Gentle Escalation Only
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The escalation ladder is strictly bounded: gentle reminder to Grandma first, then calm SMS to family. <em>Never automatic 911 or emergency calls.</em>
                </p>
              </div>
              <span className="text-[10px] font-mono text-blue-700 mt-4 font-bold">STRICTLY BOUNDED LADDER</span>
            </div>

            {/* Rule 4 */}
            <div className="p-5 rounded-xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-black text-xs mb-3">
                  04
                </div>
                <h4 className="font-bold text-sm text-[#0f1111] mb-2">
                  Cryptographic Audit Chain
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Every grant, denial, revoke, and actuator event writes an immutable SHA-256 block linked to <code className="text-[11px] font-mono">prevHash</code>. Tampering is mathematically detected.
                </p>
              </div>
              <span className="text-[10px] font-mono text-purple-700 mt-4 font-bold">SHA-256 INTEGRITY</span>
            </div>

          </div>

          {/* Privacy & Mock Data Banner */}
          <div className="mt-8 p-4 rounded-xl bg-[#fff8e7] border border-[#ffe1a6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#0f1111]">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#FF9900] shrink-0" />
              <span>
                <strong>Data Minimization Guarantee:</strong> Stores timestamps only. No free-text medical records, no video feed storage, and exclusively fictional mock datasets.
              </span>
            </div>
            <span className="font-mono text-gray-600 text-[11px] whitespace-nowrap">
              Not a medical device
            </span>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. HOW IT WORKS (STEP-BY-STEP FLOW)                            */}
      {/* ============================================================== */}
      <section className="py-16 md:py-24 px-4 bg-[#f8f9fa] border-b border-[#eaeded]">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-[#FF9900] bg-[#fff8e7] px-3 py-1 rounded-full border border-[#ffe1a6]">
              Execution Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0f1111] tracking-tight mt-3 mb-4">
              How It Works: The 4-Step Orchestration
            </h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
              From morning medication logging to physical gate control, watch how voice consent and audit chains safeguard family dignity.
            </p>
          </div>

          {/* Connected 4 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-black text-[#FF9900] block mb-2">
                  STEP 01
                </span>
                <h4 className="text-lg font-black text-[#0f1111] mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#534ab7]" />
                  <span>Voice Logging</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  The elder logs a dose or morning status update by speaking directly to Alexa+: <em className="text-gray-900 font-medium">"Alexa, I took my morning pill."</em> Alexa confirms quietly. No message is sent to family because nothing requires attention.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Tool: log_dose</span>
                <span className="text-emerald-700 font-bold">Privacy Kept</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-black text-[#FF9900] block mb-2">
                  STEP 02
                </span>
                <h4 className="text-lg font-black text-[#0f1111] mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#007185]" />
                  <span>Calm Check-in</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Caregivers receive factual, non-alarming SMS updates only if an active permission grant exists. If Grandma forgets, she gets a private reminder first before family receives a calm check-in.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Tool: get_dose_status</span>
                <span className="text-blue-700 font-bold">Gentle Ladder</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border-2 border-[#FF9900] shadow-md relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-black text-[#b12704] block mb-2">
                  STEP 03 (CORE)
                </span>
                <h4 className="text-lg font-black text-[#0f1111] mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#FF9900]" />
                  <span>Voice Consent Prompt</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  When Daughter asks about home hardware (e.g. <em>"Is Grandma's gate locked?"</em>), the MCP pipeline pauses at the Consent stage. Alexa asks Grandma aloud: <em className="text-gray-900 font-medium">"Allow your daughter to check the gate?"</em>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-[#b12704] font-mono font-bold">
                <span>Tool: request_access</span>
                <span>Voice Pause</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-black text-[#FF9900] block mb-2">
                  STEP 04
                </span>
                <h4 className="text-lg font-black text-[#0f1111] mb-2 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>Transparent Audit & Undo</span>
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Every step updates a verifiable SHA-256 audit chain. When a physical action occurs (like locking the gate), a 60-second voice undo window opens so Grandma can reverse it instantly.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                <span>Tool: undo_last_action</span>
                <span className="text-emerald-700 font-bold">60s Window</span>
              </div>
            </div>

          </div>

          {/* Interactive Demo Callout */}
          <div className="mt-12 text-center">
            <button
              onClick={onLaunchSimulation}
              className="px-8 py-3.5 rounded-xl bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-bold text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Try These 4 Steps Live on the Simulation Stage</span>
              <ArrowRight className="w-4 h-4 text-[#131921]" />
            </button>
          </div>

        </div>
      </section>


      {/* ============================================================== */}
      {/* 5. HACKATHON & ARCHITECTURE FOOTER                             */}
      {/* ============================================================== */}
      <footer className="bg-[#131921] text-gray-300 py-12 px-4 border-t border-gray-800">
        <div className="max-w-[1240px] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800 text-xs">
            {/* Col 1: Brand & Identity */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#FF9900] text-[#131921] flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-white">TrueDose</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed text-[11px]">
                Consent-first family check-in orchestrator, built as a self-hosted Model Context Protocol (MCP) server over Streamable HTTP with Alexa+ (simulated).
              </p>
              <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono text-gray-400">
                <span className="px-2 py-0.5 rounded bg-gray-800">Apache-2.0 License</span>
                <span className="px-2 py-0.5 rounded bg-gray-800">MCP Spec 2025-11-25</span>
                <span className="px-2 py-0.5 rounded bg-gray-800">AWS App Runner / ECS</span>
              </div>
            </div>

            {/* Col 2: Hackathon Tracks */}
            <div className="space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wide block mb-1">
                Hackathon Details
              </span>
              <p className="text-gray-400 text-[11px]">
                <strong>Event:</strong> Amazon Developer Hackathon: Build, Ship, Shape
              </p>
              <p className="text-gray-400 text-[11px]">
                <strong>Primary Track:</strong> Alexa+ (Simulated-experience path backed by real MCP server)
              </p>
              <p className="text-[#FF9900] text-[11px] font-medium">
                <strong>Mini Challenges:</strong> AWS Builder & Open Source
              </p>
            </div>

            {/* Col 3: Documentation & Links */}
            <div className="space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wide block mb-1">
                Documentation & Specs
              </span>
              <ul className="space-y-1.5 text-gray-400 text-[11px]">
                <li>
                  <a href="#what-is-this" className="hover:text-white transition-colors">
                    · Simulation Stage Guide
                  </a>
                </li>
                <li>
                  <button onClick={onLaunchSimulation} className="hover:text-[#FF9900] transition-colors text-left cursor-pointer">
                    · Launch 5 Demo Scenarios
                  </button>
                </li>
                <li>
                  <span className="text-gray-400">· AWS Deployment (`docs/AWS.md`)</span>
                </li>
                <li>
                  <span className="text-gray-400">· Feedback & Friction Log (`docs/`)</span>
                </li>
                <li>
                  <span className="text-gray-400">· WCAG 2.2 AA (`docs/ACCESSIBILITY.md`)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
            <span>
              Alexa+ is simulated. MCP server is real. Mock data exclusively. Not a medical device.
            </span>
            <span>
              Built with Google AI Studio & Amazon Developer Hackathon
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
};
