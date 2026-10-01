"use client";

import React, { useState, useEffect } from "react";
import { AlertOctagon, PhoneCall, Copy, Check, X, ShieldAlert, Shield } from "lucide-react";
import { api, EmergencyActionGuide } from "@/lib/api";

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({ isOpen, onClose }) => {
  const [guide, setGuide] = useState<EmergencyActionGuide | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      api.getEmergencyGuide("unauthorized_debit")
        .then((data) => {
          setGuide(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLetter = () => {
    if (guide?.sample_dispute_letter) {
      navigator.clipboard.writeText(guide.sample_dispute_letter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950 border border-rose-500/50 shadow-2xl shadow-rose-950/60 p-6 md:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Banner */}
        <div className="flex items-center space-x-3 text-rose-500 mb-6">
          <div className="p-3 bg-rose-950/60 border border-rose-600/40 rounded-xl">
            <AlertOctagon className="h-8 w-8 text-rose-400 animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">EMERGENCY FRAUD SOS PROTOCOL</h2>
            <p className="text-sm text-rose-400/90 font-medium">Act within the "Golden Hour" (first 120 mins) to freeze illicit funds</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading emergency protocol...</div>
        ) : (
          <div className="space-y-6">
            {/* Quick Hotline Callouts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guide?.hotlines.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    <PhoneCall className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">{h.name}</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{h.number}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step-by-Step Checklist */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Immediate 5-Step Triage Checklist</span>
              </h3>
              <div className="space-y-2">
                {guide?.step_by_step_checklist.map((step, idx) => (
                  <div key={idx} className="text-sm text-slate-300 flex items-start space-x-2.5">
                    <span className="inline-block mt-0.5 h-2 w-2 rounded-full bg-cyan-400 shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto Dispute Letter */}
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-semibold text-slate-200">
                  Automated Bank Dispute Notice (Regulation Zero-Liability)
                </div>
                <button
                  onClick={handleCopyLetter}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied to Clipboard" : "Copy Letter"}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {guide?.sample_dispute_letter}
              </pre>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors"
              >
                Close Protocol
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
