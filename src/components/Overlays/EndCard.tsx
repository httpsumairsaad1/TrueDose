import React from 'react';
import { PrivacyReceipt, ScenarioId } from '../../types';
import { ShieldCheck, Check, Lock, ArrowRight, X } from 'lucide-react';
import strings from '../../strings/en.json';

interface EndCardProps {
  receipt: PrivacyReceipt;
  currentScenario: ScenarioId;
  onNextScenario: (id: ScenarioId) => void;
  onClose: () => void;
}

export const EndCard: React.FC<EndCardProps> = ({
  receipt,
  currentScenario,
  onNextScenario,
  onClose,
}) => {
  const getNextScenarioId = (current: ScenarioId): ScenarioId => {
    if (current === 's1') return 's2';
    if (current === 's2') return 's3';
    if (current === 's3') return 's4';
    if (current === 's4') return 's5';
    return 's3';
  };

  const nextId = getNextScenarioId(currentScenario);
  const nextInfo = (strings.scenarios as any)[nextId];

  return (
    <div className="fixed inset-0 z-50 bg-[#131921]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-[#16191f] rounded-2xl max-w-lg w-full p-6 border border-[#eaeded] dark:border-[#2a3439] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="receipt-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 id="receipt-title" className="text-base font-bold text-[#0f1111] dark:text-white">
              {strings.overlays.privacyReceiptTitle}
            </h3>
            <span className="text-xs text-gray-500 font-medium">
              Scenario: {receipt.scenarioTitle}
            </span>
          </div>
        </div>

        <div className="space-y-3 my-5 text-xs">
          {/* Shared Data */}
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>What Was Shared (With Active Consent):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-emerald-800 dark:text-emerald-200 pl-1 font-medium">
              {receipt.whatWasShared.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
              <span>Recipient: {receipt.withWhom}</span>
              <span>Expiry: {receipt.untilWhen}</span>
            </div>
          </div>

          {/* Kept Private */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-[#232f3e] border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-500" />
              <span>What Stayed Private & Shielded:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400 pl-1">
              {receipt.whatStayedPrivate.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            Review Simulation
          </button>

          <button
            onClick={() => {
              onClose();
              onNextScenario(nextId);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FF9900] hover:bg-[#e88b00] text-[#131921] font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Next: {nextInfo.title}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#131921]" />
          </button>
        </div>
      </div>
    </div>
  );
};
