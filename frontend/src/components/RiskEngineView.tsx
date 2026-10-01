"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ArrowRight, 
  Sliders, 
  FileText, 
  Play, 
  Layers, 
  Activity, 
  Lock, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Flame, 
  Info,
  ShieldCheck,
  RotateCcw
} from "lucide-react";
import { 
  api, 
  RiskEvaluationRequest, 
  RiskEvaluationResult, 
  DeterministicRuleInfo 
} from "@/lib/api";

export const RiskEngineView: React.FC = () => {
  // Preset scenarios
  const [activeScenario, setActiveScenario] = useState<string>("5x_spike");

  // Form inputs
  const [amount, setAmount] = useState<number>(32500);
  const [recipient, setRecipient] = useState<string>("Offshore Crypto LLC");
  const [channel, setChannel] = useState<string>("UPI");
  const [isNewRecipient, setIsNewRecipient] = useState<boolean>(true);
  const [burstCount, setBurstCount] = useState<number>(4);
  const [hour, setHour] = useState<number>(2); // 2 AM (off-hours)
  const [selectedKeyword, setSelectedKeyword] = useState<string>("crypto");

  // State for evaluation result & rules
  const [evalResult, setEvalResult] = useState<RiskEvaluationResult | null>(null);
  const [rules, setRules] = useState<DeterministicRuleInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"simulator" | "rules" | "pipeline">("simulator");

  // Pre-load rules
  useEffect(() => {
    api.getRiskRules()
      .then((data) => setRules(data))
      .catch((err) => console.warn("Failed to fetch risk rules:", err));

    // Run initial evaluation
    handleEvaluate({
      amount: 32500,
      recipient: "Offshore Crypto LLC",
      channel: "UPI",
      force_new_recipient: true,
      burst_count_override: 4,
      timestamp: "2026-10-01 02:41:00"
    });
  }, []);

  const applyPreset = (presetKey: string) => {
    setActiveScenario(presetKey);

    if (presetKey === "5x_spike") {
      // Prompt example 1: if amount > normal_amount * 5 -> flag("Unusually high amount")
      setAmount(35000); // 5x+ of normal ₹6,500
      setRecipient("Global Electronics Mart");
      setIsNewRecipient(false);
      setBurstCount(1);
      setHour(14);
      handleEvaluate({
        amount: 35000,
        recipient: "Global Electronics Mart",
        channel: "UPI",
        force_new_recipient: false,
        burst_count_override: 1,
        timestamp: "2026-10-01 14:30:00"
      });
    } else if (presetKey === "new_recipient") {
      // Prompt example 2: if new_recipient -> flag("New recipient")
      setAmount(4200);
      setRecipient("Unknown Payee P2P #891");
      setIsNewRecipient(true);
      setBurstCount(1);
      setHour(11);
      handleEvaluate({
        amount: 4200,
        recipient: "Unknown Payee P2P #891",
        channel: "IMPS",
        force_new_recipient: true,
        burst_count_override: 1,
        timestamp: "2026-10-01 11:15:00"
      });
    } else if (presetKey === "rapid_transactions") {
      // Prompt example 3: if many_transactions_in_short_period -> flag("Rapid transactions")
      setAmount(2500);
      setRecipient("Quick Reload Hub");
      setIsNewRecipient(false);
      setBurstCount(5);
      setHour(16);
      handleEvaluate({
        amount: 2500,
        recipient: "Quick Reload Hub",
        channel: "UPI",
        force_new_recipient: false,
        burst_count_override: 5,
        timestamp: "2026-10-01 16:45:00"
      });
    } else if (presetKey === "triad_scam") {
      // Compound all 3 prompt examples together + off hours
      setAmount(45000);
      setRecipient("Offshore Crypto Escrow LLC");
      setIsNewRecipient(true);
      setBurstCount(4);
      setHour(2);
      handleEvaluate({
        amount: 45000,
        recipient: "Offshore Crypto Escrow LLC",
        channel: "UPI",
        force_new_recipient: true,
        burst_count_override: 4,
        timestamp: "2026-10-01 02:30:00"
      });
    } else if (presetKey === "safe_tx") {
      // Safe routine transaction
      setAmount(850);
      setRecipient("Amazon India");
      setIsNewRecipient(false);
      setBurstCount(0);
      setHour(15);
      handleEvaluate({
        amount: 850,
        recipient: "Amazon India",
        channel: "CARD",
        force_new_recipient: false,
        burst_count_override: 0,
        timestamp: "2026-10-01 15:20:00"
      });
    }
  };

  const handleEvaluate = async (customPayload?: Partial<RiskEvaluationRequest>) => {
    setLoading(true);
    const dateFormatted = `2026-10-01 ${String(hour).padStart(2, "0")}:30:00`;
    const payload: RiskEvaluationRequest = {
      amount: customPayload?.amount ?? Number(amount),
      recipient: customPayload?.recipient ?? recipient,
      channel: customPayload?.channel ?? channel,
      timestamp: customPayload?.timestamp ?? dateFormatted,
      force_new_recipient: customPayload?.force_new_recipient ?? isNewRecipient,
      burst_count_override: customPayload?.burst_count_override ?? burstCount
    };

    try {
      const res = await api.evaluateRisk(payload);
      setEvalResult(res);
    } catch (err) {
      console.error("Risk evaluation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER: PHASE 7 RISK ENGINE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Phase 7 — Deterministic Risk Engine
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Sequential Pipeline: Transaction ➔ Validation ➔ Rules ➔ Risk Indicators ➔ Risk Score
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "simulator"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "pipeline"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pipeline Architecture
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "rules"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Rule Catalog ({rules.length})
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          PRESET SCENARIOS (EXACT EXAMPLES FROM SPEC)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Quick Scenario Presets (Deterministic Rules Verification):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => applyPreset("5x_spike")}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "5x_spike"
                ? "bg-amber-500/10 border-amber-500/50 text-white shadow-md shadow-amber-500/10"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>amount &gt; 5x normal</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">RULE 1</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">₹35,000 Outflow</div>
            <div className="text-[10px] text-slate-500 mt-0.5">flag("Unusually high amount")</div>
          </button>

          <button
            onClick={() => applyPreset("new_recipient")}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "new_recipient"
                ? "bg-indigo-500/10 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold text-indigo-400 flex items-center justify-between">
              <span>new_recipient</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20">RULE 2</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">First-Time Payee</div>
            <div className="text-[10px] text-slate-500 mt-0.5">flag("New recipient")</div>
          </button>

          <button
            onClick={() => applyPreset("rapid_transactions")}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "rapid_transactions"
                ? "bg-cyan-500/10 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold text-cyan-400 flex items-center justify-between">
              <span>rapid_transactions</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20">RULE 3</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">5 Tx in 10 mins</div>
            <div className="text-[10px] text-slate-500 mt-0.5">flag("Rapid transactions")</div>
          </button>

          <button
            onClick={() => applyPreset("triad_scam")}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "triad_scam"
                ? "bg-rose-500/10 border-rose-500/50 text-white shadow-md shadow-rose-500/10"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
              <span>Compound Triad</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20">CRITICAL</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">5x + New + Burst</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Digital arrest / Coercion</div>
          </button>

          <button
            onClick={() => applyPreset("safe_tx")}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeScenario === "safe_tx"
                ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10"
                : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Routine Safe Tx</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">PASS</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">₹850 Verified Payee</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Decision: APPROVE</div>
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 1: LIVE SIMULATOR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Simulation Input Parameters (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">Transaction Input Parameters</h2>
                </div>
                <button
                  onClick={() => applyPreset(activeScenario)}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Transaction Amount (₹ / USD)</label>
                  <span className="text-slate-500 text-[11px]">Normal baseline: ~₹6,500</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter amount..."
                  />
                </div>
                {/* Multiplier Quick Shortcuts */}
                <div className="flex items-center space-x-2 pt-1 text-[11px]">
                  <span className="text-slate-500">Quick:</span>
                  <button onClick={() => setAmount(6500)} className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                    1x (₹6.5k)
                  </button>
                  <button onClick={() => setAmount(19500)} className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                    3x (₹19.5k)
                  </button>
                  <button onClick={() => setAmount(35000)} className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    5x Spike (₹35k)
                  </button>
                  <button onClick={() => setAmount(65000)} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    10x (₹65k)
                  </button>
                </div>
              </div>

              {/* Recipient / Merchant */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Recipient / Beneficiary Name</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Amazon, Offshore Crypto LLC, Unknown"
                />
              </div>

              {/* New Recipient Toggle */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">New Recipient?</div>
                  <div className="text-[11px] text-slate-500">Triggers if beneficiary has 0 past history</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRecipient(!isNewRecipient)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isNewRecipient
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isNewRecipient ? "YES (Flag)" : "NO (Known)"}
                </button>
              </div>

              {/* Velocity Burst Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Transactions in Past 10 Minutes</label>
                  <span className="font-mono text-cyan-400 font-bold">{burstCount} transfers</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={burstCount}
                  onChange={(e) => setBurstCount(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0 (Normal)</span>
                  <span>2 (Moderate)</span>
                  <span className="text-cyan-400 font-bold">3+ (Rapid Trigger)</span>
                  <span className="text-rose-400 font-bold">5+ (Critical Burst)</span>
                </div>
              </div>

              {/* Execution Time (Off-Hours) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Time of Day (Hour: {hour}:00)</label>
                  <span className={`text-[11px] font-semibold ${1 <= hour && hour < 5 ? "text-rose-400" : "text-emerald-400"}`}>
                    {1 <= hour && hour < 5 ? "⚠️ Off-Hours (01:00 - 05:00)" : "✓ Normal Business Hours"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payment Channel</label>
                <div className="grid grid-cols-4 gap-2">
                  {["UPI", "IMPS", "CARD", "CRYPTO_GATEWAY"].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannel(ch)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                        channel === ch
                          ? "bg-cyan-600 text-white border-cyan-500"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Evaluate Button */}
              <button
                onClick={() => handleEvaluate()}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{loading ? "Evaluating Deterministic Pipeline..." : "Evaluate Transaction Risk Pipeline"}</span>
              </button>

            </div>
          </div>

          {/* RIGHT: Live Pipeline Results (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {evalResult ? (
              <div className="space-y-4">
                
                {/* 1. Decision & Score Executive Banner */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  evalResult.risk_level === "CRITICAL"
                    ? "bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/50"
                    : evalResult.risk_level === "HIGH"
                    ? "bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/50"
                    : evalResult.risk_level === "MODERATE"
                    ? "bg-indigo-950/40 border-indigo-500/50"
                    : "bg-emerald-950/40 border-emerald-500/50"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <span>Risk Engine Pipeline Outcome:</span>
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`text-2xl sm:text-3xl font-black font-mono ${
                          evalResult.risk_level === "CRITICAL" ? "text-rose-400" :
                          evalResult.risk_level === "HIGH" ? "text-amber-400" :
                          evalResult.risk_level === "MODERATE" ? "text-indigo-400" : "text-emerald-400"
                        }`}>
                          {evalResult.decision}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          evalResult.risk_level === "CRITICAL" ? "bg-rose-500/20 text-rose-300 border-rose-500/40" :
                          evalResult.risk_level === "HIGH" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" :
                          evalResult.risk_level === "MODERATE" ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" :
                          "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}>
                          {evalResult.risk_level} THREAT TIER
                        </span>
                      </div>
                    </div>

                    {/* Risk Score Dial */}
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="text-xs text-slate-400 font-semibold">Composite Score</div>
                      <div className={`text-4xl font-black font-mono ${
                        evalResult.risk_score >= 85 ? "text-rose-400" :
                        evalResult.risk_score >= 60 ? "text-amber-400" :
                        evalResult.risk_score >= 30 ? "text-indigo-400" : "text-emerald-400"
                      }`}>
                        {evalResult.risk_score}
                        <span className="text-base text-slate-500 font-sans">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Step-by-Step Pipeline Bar */}
                  <div className="grid grid-cols-5 gap-1.5 mt-5 pt-4 border-t border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Step 1</div>
                      <div className="text-xs font-bold text-cyan-400 mt-0.5">Payload</div>
                      <div className="text-[10px] text-slate-500">₹{amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Step 2</div>
                      <div className={`text-xs font-bold mt-0.5 ${evalResult.validation.is_valid ? "text-emerald-400" : "text-rose-400"}`}>
                        {evalResult.validation.is_valid ? "✓ Valid" : "✗ Error"}
                      </div>
                      <div className="text-[10px] text-slate-500">Schema Check</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Step 3</div>
                      <div className="text-xs font-bold text-indigo-400 mt-0.5">8 Rules</div>
                      <div className="text-[10px] text-slate-500">Evaluated</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Step 4</div>
                      <div className={`text-xs font-bold mt-0.5 ${evalResult.risk_indicators.length > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {evalResult.risk_indicators.length} Flags
                      </div>
                      <div className="text-[10px] text-slate-500">Indicators</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Step 5</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">{evalResult.risk_score} pts</div>
                      <div className="text-[10px] text-slate-500">{evalResult.decision}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Triggered Risk Indicators List */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-rose-400" />
                      <h3 className="text-base font-bold text-white">
                        Triggered Risk Indicators ({evalResult.risk_indicators.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Deterministic Engine Flags
                    </span>
                  </div>

                  {evalResult.risk_indicators.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                      <div className="text-sm font-bold text-white">Clean Operational Bill of Health</div>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        All deterministic security rules evaluated cleanly. No anomalous spike, new payee flags, or burst velocity detected.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {evalResult.risk_indicators.map((ind, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${
                            ind.severity === "CRITICAL"
                              ? "bg-rose-950/30 border-rose-500/40 text-slate-200"
                              : ind.severity === "HIGH"
                              ? "bg-amber-950/30 border-amber-500/40 text-slate-200"
                              : ind.severity === "MEDIUM"
                              ? "bg-indigo-950/30 border-indigo-500/40 text-slate-200"
                              : "bg-slate-900/80 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                                ind.severity === "CRITICAL" ? "bg-rose-500/30 text-rose-300" :
                                ind.severity === "HIGH" ? "bg-amber-500/30 text-amber-300" :
                                ind.severity === "MEDIUM" ? "bg-indigo-500/30 text-indigo-300" :
                                "bg-slate-800 text-slate-400"
                              }`}>
                                {ind.severity}
                              </span>
                              <span className="font-bold text-xs text-white">
                                {ind.flag}
                              </span>
                            </div>
                            <span className="text-xs font-mono font-bold text-rose-400">
                              +{ind.score_contribution} pts
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed pl-1">
                            {ind.description}
                          </p>

                          {ind.metadata && Object.keys(ind.metadata).length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400 pt-1 pl-1">
                              {Object.entries(ind.metadata).map(([k, v]) => (
                                <span key={k} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  {k}: <strong className="text-slate-200">{String(v)}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Actionable Recommendations */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Security Engine Recommendations:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {evalResult.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Running evaluation...</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 2: PIPELINE ARCHITECTURE VIEW
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "pipeline" && (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Layers className="h-6 w-6 text-cyan-400" />
              <span>Phase 7 Deterministic Pipeline Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic fraud detection executes linearly with guaranteed zero-hallucination compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Stage 1</div>
              <h3 className="text-sm font-bold text-white">Transaction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inbound payload containing amount, recipient, channel, timestamp, and device identifiers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2">
              <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Stage 2</div>
              <h3 className="text-sm font-bold text-white">Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type safety, strictly positive amount (&gt; 0), finite values, non-empty payee verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-2">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Stage 3</div>
              <h3 className="text-sm font-bold text-white">Deterministic Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluation across 8 mathematical rule boundaries (amount spike &gt; 5x, new payee, velocity bursts).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-2">
              <div className="text-[10px] font-mono text-rose-400 uppercase font-bold">Stage 4</div>
              <h3 className="text-sm font-bold text-white">Risk Indicators</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generation of human-readable flags, severity tiers, and telemetry metadata vectors.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Stage 5</div>
              <h3 className="text-sm font-bold text-white">Risk Score & Action</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Score consolidation (0-100) and automated decisioning: APPROVE, REVIEW, STEP-UP, or BLOCK.
              </p>
            </div>

          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-cyan-400 font-bold">// Deterministic Evaluation Code Implementation</div>
            <pre className="text-slate-400 overflow-x-auto leading-relaxed">
{`if amount > normal_amount * 5:
    flag("Unusually high amount", severity="HIGH", score=+40)

if new_recipient:
    flag("New recipient", severity="MEDIUM", score=+25)

if many_transactions_in_short_period:
    flag("Rapid transactions", severity="HIGH", score=+35)

if new_recipient and (amount > normal_amount * 5) and many_transactions_in_short_period:
    flag("Triad scam signature", severity="CRITICAL", score=+25)`}
            </pre>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 3: DETERMINISTIC RULE CATALOG
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "rules" && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <span>Deterministic Rules Registry</span>
              </h2>
              <p className="text-xs text-slate-400">
                All production fraud detection heuristics, scoring weights, and formula specifications
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
              {rules.length} REGISTERED RULES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {rules.map((rule) => (
              <div
                key={rule.rule_id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                      rule.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                      rule.severity === "HIGH" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      rule.severity === "MEDIUM" ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" :
                      "bg-slate-800 text-slate-400"
                    }`}>
                      {rule.severity}
                    </span>
                    <span className="text-xs font-bold text-white">{rule.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Weight: {rule.weight}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 font-mono text-[11px] text-amber-300">
                  {rule.formula}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {rule.description}
                </p>

                <div className="text-[10px] text-slate-500 font-mono">
                  ID: {rule.rule_id} • Category: {rule.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
