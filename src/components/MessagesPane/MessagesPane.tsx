import React, { useEffect, useRef } from 'react';
import { 
  Mic, 
  Smartphone, 
  Check, 
  ShieldAlert, 
  Radio, 
  Trash2,
  Clock,
  Sparkles
} from 'lucide-react';
import { ChatMessage, Grant } from '../../types';
import strings from '../../strings/en.json';

interface MessagesPaneProps {
  messages: ChatMessage[];
  grants: Grant[];
  isAwaitingInput: boolean;
  onConsentAnswer: (decision: 'yes' | 'no') => void;
  onRevokeGrant: (scope: string) => void;
  isFocused?: boolean;
  isLargeText?: boolean;
}

export const MessagesPane: React.FC<MessagesPaneProps> = ({
  messages,
  grants,
  isAwaitingInput,
  onConsentAnswer,
  onRevokeGrant,
  isFocused = false,
  isLargeText = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAwaitingInput]);

  const activeGrants = grants.filter(g => g.status === 'active');

  return (
    <section 
      className={`bg-white dark:bg-[#16191f] rounded-xl border transition-all duration-300 flex flex-col h-full shadow-xs ${
        isFocused 
          ? 'border-[#FF9900] ring-2 ring-[#FF9900]/20' 
          : 'border-[#eaeded] dark:border-[#2a3439]'
      }`}
      aria-label="Messages Pane"
    >
      {/* Pane Header */}
      <div className="border-b border-[#eaeded] dark:border-[#2a3439] p-3 flex items-center justify-between bg-gray-50/70 dark:bg-[#1c2530] rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#0f1111] dark:text-white">
            A. Messages
          </span>
          <span className="text-xs text-gray-500">
            Voice & SMS
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 text-[#534ab7] dark:text-[#b0abf5] font-semibold">
            <Mic className="w-3.5 h-3.5" /> Grandma
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-[#007185] dark:text-[#43b3c4] font-semibold">
            <Smartphone className="w-3.5 h-3.5" /> Daughter
          </span>
        </div>
      </div>

      {/* Two-Column Chat Stream */}
      <div 
        ref={scrollRef}
        className="p-4 flex-1 overflow-y-auto space-y-3.5 min-h-[380px]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <Radio className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs">{strings.messages.emptyPrompt}</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'grandma') {
              return (
                <div key={msg.id} className="flex flex-col items-start max-w-[88%]">
                  <div className="flex items-center gap-1.5 text-xs text-[#534ab7] dark:text-[#b0abf5] font-semibold mb-1">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Grandma (Voice)</span>
                    <span className="text-gray-400 font-mono text-[10px]">{msg.timeStr}</span>
                  </div>
                  <div className={`p-3 rounded-2xl rounded-tl-xs bg-[#f3f2ff] dark:bg-[#242240] text-[#0f1111] dark:text-white border border-indigo-200 dark:border-indigo-900 ${isLargeText ? 'text-lg leading-relaxed' : 'text-sm'}`}>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#534ab7] animate-pulse shrink-0" />
                      <p className="font-medium">{msg.text}</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.sender === 'daughter') {
              return (
                <div key={msg.id} className="flex flex-col items-end ml-auto max-w-[88%]">
                  <div className="flex items-center gap-1.5 text-xs text-[#007185] dark:text-[#43b3c4] font-semibold mb-1">
                    <span className="text-gray-400 font-mono text-[10px]">{msg.timeStr}</span>
                    <span>Daughter (SMS)</span>
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tr-xs bg-[#eef6f8] dark:bg-[#13282c] text-[#0f1111] dark:text-white border border-cyan-200 dark:border-cyan-900 text-sm">
                    <p>{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#007185] dark:text-[#43b3c4]">
                      <Check className="w-3 h-3" />
                      <span>{strings.messages.delivered}</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Alexa+ simulated message
            return (
              <div key={msg.id} className="flex flex-col items-center my-1.5 max-w-[94%] mx-auto w-full">
                <div className="w-full flex items-center justify-between text-xs text-gray-500 mb-1 px-1">
                  <div className="flex items-center gap-1.5 text-[#b12704] dark:text-[#FF9900] font-semibold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" />
                    <span>{strings.app.badges.simulated}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">{msg.timeStr}</span>
                </div>
                <div className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-[#1c2530] border border-gray-200 dark:border-gray-700 text-sm text-[#0f1111] dark:text-white">
                  <p>{msg.text}</p>

                  {/* Active Voice Consent Card */}
                  {msg.isConsentPrompt && isAwaitingInput && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#16191f] p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2.5 text-[#b12704] dark:text-[#FF9900] font-bold text-xs">
                        <ShieldAlert className="w-4 h-4 text-[#FF9900]" />
                        <span>Voice Consent Required</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                        {strings.consent.question}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onConsentAnswer('yes')}
                          className="px-4 py-2 min-h-[44px] rounded-lg bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-bold text-xs transition-colors shadow-xs flex-1 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4 text-[#131921]" />
                          <span>{strings.consent.yesLabel}</span>
                        </button>
                        <button
                          onClick={() => onConsentAnswer('no')}
                          className="px-4 py-2 min-h-[44px] rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium text-xs transition-colors flex-1 flex items-center justify-center gap-2 cursor-pointer border border-gray-300 dark:border-gray-700"
                        >
                          <span>{strings.consent.noLabel}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Grandma's Control Panel (Clean Amazon Style) */}
      <div className="border-t border-[#eaeded] dark:border-[#2a3439] p-3 bg-gray-50/70 dark:bg-[#1c2530] rounded-b-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#534ab7] dark:text-[#b0abf5]">
            <Clock className="w-3.5 h-3.5" />
            <span>Grandma's Privacy Control Panel</span>
          </div>
          <span className="text-[11px] text-gray-500">Elder Autonomy</span>
        </div>

        {activeGrants.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            {strings.controlPanel.empty}
          </p>
        ) : (
          <div className="space-y-1.5">
            {activeGrants.map(grant => {
              const scopeLabel = grant.scope === 'dose_status' 
                ? strings.controlPanel.scopeDose 
                : (grant.scope === 'gate_status' ? strings.controlPanel.scopeGate : strings.controlPanel.scopeLock);
              
              return (
                <div 
                  key={grant.id}
                  className="flex items-center justify-between bg-white dark:bg-[#16191f] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-900 dark:text-white">{scopeLabel}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">Daughter (24h grant)</span>
                  </div>
                  <button
                    onClick={() => onRevokeGrant(grant.scope)}
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Elder Voice or Tap Revocation"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{strings.controlPanel.revokeBtn}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
