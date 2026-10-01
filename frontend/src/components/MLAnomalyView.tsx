"use client";

import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Binary, 
  GitBranch, 
  Gauge, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Play, 
  Layers, 
  Clock, 
  DollarSign, 
  UserCheck, 
  Activity, 
  RotateCcw,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { 
  api, 
  MLAnomalyDetectionRequest, 
  MLAnomalyDetectionResult, 
  MLModelInfo 
} from "@/lib/api";

export const MLAnomalyView: React.FC = () => {
  // Simulator State: The 6 canonical features
  const [amount, setAmount] = useState<number>(3850);
  const [recipient, setRecipient] = useState<string>("Offshore Crypto LLC");
  const [channel, setChannel] = useState<string>("UPI");
  const [hour, setHour] = useState<number>(2.5); // 02:30 AM
  const [txFreq, setTxFreq] = useState<number>(4); // 4 transfers in 2h
  const [recipientFreq, setRecipientFreq] = useState<number>(0.0); // New recipient (0%)
  const [dailyCount, setDailyCount] = useState<number>(6); // 6 transfers today

  // Manual override toggle
  const [useCustomFeatures, setUseCustomFeatures] = useState<boolean>(false);
  const [customZScore, setCustomZScore] = useState<number>(4.2);

  // Model & Inference State
  const [result, setResult] = useState<MLAnomalyDetectionResult | null>(null);
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retraining, setRetraining] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"inference" | "features" | "architecture">("inference");

  useEffect(() => {
    api.getMLModelInfo()
      .then((info) => setModelInfo(info))
      .catch((err) => console.warn("Failed to load ML model info:", err));

    runInference();
  }, []);

  const runInference = async (overrideParams?: Partial<MLAnomalyDetectionRequest>) => {
    setLoading(true);
    const dateFormatted = `2026-10-01 ${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")}:00`;
    
    const payload: MLAnomalyDetectionRequest = {
      amount: overrideParams?.amount ?? amount,
      recipient: overrideParams?.recipient ?? recipient,
      channel: overrideParams?.channel ?? channel,
      timestamp: dateFormatted,
      feature_overrides: useCustomFeatures ? {
        transaction_amount: amount,
        transaction_frequency: txFreq,
        time_of_day: hour,
        recipient_frequency: recipientFreq,
        amount_deviation: customZScore,
        daily_transaction_count: dailyCount
      } : undefined
    };

    try {
      const res = await api.detectMLAnomaly(payload);
      setResult(res);
    } catch (err) {
      console.error("ML Detection inference error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: "normal" | "night_burst" | "spike" | "account_takeover") => {
    if (preset === "normal") {
      setAmount(450);
      setRecipient("Amazon India");
      setHour(14.5); // 2:30 PM
      setTxFreq(1);
      setRecipientFreq(0.45);
      setDailyCount(2);
      setCustomZScore(0.2);
      setUseCustomFeatures(false);
      runInference({ amount: 450, recipient: "Amazon India" });
    } else if (preset === "night_burst") {
      setAmount(8500);
      setRecipient("Unverified Telegram Bot P2P");
      setHour(2.75); // 02:45 AM
      setTxFreq(5);
      setRecipientFreq(0.0);
      setDailyCount(7);
      setCustomZScore(3.8);
      setUseCustomFeatures(true);
      runInference({ amount: 8500, recipient: "Unverified Telegram Bot P2P" });
    } else if (preset === "spike") {
      setAmount(42000);
      setRecipient("Offshore LLC Remittance");
      setHour(11.0);
      setTxFreq(2);
      setRecipientFreq(0.0);
      setDailyCount(3);
      setCustomZScore(6.5);
      setUseCustomFeatures(true);
      runInference({ amount: 42000, recipient: "Offshore LLC Remittance" });
    } else if (preset === "account_takeover") {
      setAmount(2200);
      setRecipient("Mule Carding Splitter #4");
      setHour(3.2);
      setTxFreq(6);
      setRecipientFreq(0.0);
      setDailyCount(9);
      setCustomZScore(2.4);
      setUseCustomFeatures(true);
      runInference({ amount: 2200, recipient: "Mule Carding Splitter #4" });
    }
  };

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await api.retrainMLModel();
      if (modelInfo) {
        setModelInfo({ ...modelInfo, training_samples_count: res.training_samples_count });
      }
      runInference();
    } catch (err) {
      console.error("Retrain error:", err);
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Binary className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Phase 8 — ML Anomaly Detection
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Scikit-Learn Isolation Forest • 6 Canonical Feature Dimensions • Tree Path Length Scoring
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("inference")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "inference"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Isolation Forest Inference
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "features"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            6 Feature Vectors
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "architecture"
                ? "bg-cyan-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Model Architecture
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          QUICK SCENARIO PRESETS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Select Isolation Forest Test Benchmark:</span>
          </span>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="text-[11px] text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <RefreshCw className={`h-3 w-3 ${retraining ? "animate-spin" : ""}`} />
            <span>{retraining ? "Retraining Forest..." : "Retrain on Live Ledger"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset("normal")}
            className="p-3 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-emerald-500/50 text-left transition-all group"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>Routine Shopping</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">INLIER</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">₹450 • 2:30 PM • Amazon</div>
            <div className="text-[10px] text-slate-500 mt-0.5">High recipient freq (0.45)</div>
          </button>

          <button
            onClick={() => applyPreset("spike")}
            className="p-3 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>Statistical 10x Spike</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">OUTLIER</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">₹42,000 • +6.5σ deviation</div>
            <div className="text-[10px] text-slate-500 mt-0.5">amount_deviation anomaly</div>
          </button>

          <button
            onClick={() => applyPreset("night_burst")}
            className="p-3 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-rose-500/50 text-left transition-all group"
          >
            <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
              <span>Dormant 2 AM Burst</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20">CRITICAL</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">5 tx/window • 02:45 AM</div>
            <div className="text-[10px] text-slate-500 mt-0.5">velocity + off-peak temporal</div>
          </button>

          <button
            onClick={() => applyPreset("account_takeover")}
            className="p-3 rounded-xl border bg-slate-950/70 border-slate-800 hover:border-indigo-500/50 text-left transition-all group"
          >
            <div className="text-xs font-bold text-indigo-400 flex items-center justify-between">
              <span>Account Takeover</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20">FRAUD</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-mono">9 tx today • New Payee</div>
            <div className="text-[10px] text-slate-500 mt-0.5">daily_transaction_count: 9</div>
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 1: LIVE INFERENCE RUNNER
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "inference" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: 6 Features Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-base font-bold text-white">6 Feature Dimensions</h2>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <span>Custom Z-Score:</span>
                  <input
                    type="checkbox"
                    checked={useCustomFeatures}
                    onChange={(e) => setUseCustomFeatures(e.target.checked)}
                    className="accent-cyan-500"
                  />
                </div>
              </div>

              {/* Feature 1: transaction_amount */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">1. transaction_amount</span>
                  <span className="font-mono text-cyan-400 font-bold">₹{amount.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Feature 2: transaction_frequency */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">2. transaction_frequency (rolling window)</span>
                  <span className="font-mono text-cyan-400 font-bold">{txFreq} transfers</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={txFreq}
                  onChange={(e) => setTxFreq(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Feature 3: time_of_day */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">3. time_of_day (0.0 to 24.0h)</span>
                  <span className="font-mono text-cyan-400 font-bold">{hour.toFixed(1)}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="23.9"
                  step="0.5"
                  value={hour}
                  onChange={(e) => setHour(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Feature 4: recipient_frequency */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">4. recipient_frequency (0.0 to 1.0)</span>
                  <span className="font-mono text-cyan-400 font-bold">{(recipientFreq * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={recipientFreq}
                  onChange={(e) => setRecipientFreq(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Feature 5: amount_deviation (Z-Score) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">5. amount_deviation (z-score)</span>
                  <span className="font-mono text-cyan-400 font-bold">+{customZScore.toFixed(1)}σ</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="8"
                  step="0.2"
                  value={customZScore}
                  disabled={!useCustomFeatures}
                  onChange={(e) => setCustomZScore(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Feature 6: daily_transaction_count */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">6. daily_transaction_count</span>
                  <span className="font-mono text-cyan-400 font-bold">{dailyCount} today</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={dailyCount}
                  onChange={(e) => setDailyCount(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Recipient Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Recipient Identifier</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Inference Button */}
              <button
                onClick={() => runInference()}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-600/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                <Cpu className="h-4 w-4" />
                <span>{loading ? "Computing Tree Paths..." : "Run Isolation Forest Inference"}</span>
              </button>

            </div>
          </div>

          {/* RIGHT: Model Output & Anomaly Score (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {result ? (
              <div className="space-y-4">
                
                {/* 1. Anomaly Gauge Banner */}
                <div className={`p-6 rounded-2xl border transition-all ${
                  result.is_anomaly
                    ? "bg-rose-950/40 border-rose-500/50 shadow-xl shadow-rose-950/50"
                    : "bg-emerald-950/40 border-emerald-500/50 shadow-xl shadow-emerald-950/50"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Isolation Forest Prediction:
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`text-2xl sm:text-3xl font-black font-mono ${
                          result.is_anomaly ? "text-rose-400" : "text-emerald-400"
                        }`}>
                          {result.is_anomaly ? "ANOMALOUS OUTLIER" : "NORMAL INLIER"}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          result.is_anomaly 
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40" 
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        }`}>
                          {result.confidence_percent}% CONFIDENCE
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        Raw Decision Function: <strong className="text-white">{result.raw_decision_score}</strong>
                        {result.raw_decision_score < 0 ? " (Negative = Root Cut Outlier)" : " (Positive = Deep Leaf Inlier)"}
                      </div>
                    </div>

                    {/* Radial / Score Box */}
                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                      <div className="text-xs text-slate-400 font-semibold">Anomaly Score</div>
                      <div className={`text-5xl font-black font-mono ${
                        result.anomaly_score >= 60 ? "text-rose-400" : "text-emerald-400"
                      }`}>
                        {result.anomaly_score}
                        <span className="text-lg text-slate-500 font-sans">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Isolation Tree Path Length Representation */}
                  <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300 font-mono">
                      <span>Average Tree Isolation Depth</span>
                      <span>{result.is_anomaly ? "Short Path (Few Splits = Outlier)" : "Long Path (Many Splits = Normal)"}</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          result.is_anomaly ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-emerald-400"
                        }`}
                        style={{ width: `${result.anomaly_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. The 6 Engineered Feature Cards Grid */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-cyan-400" />
                      <h3 className="text-base font-bold text-white">Engineered Feature Vectors (Numpy 1x6)</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Scikit-Learn Feature Matrix
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">transaction_amount</div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        ₹{result.features.transaction_amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">Value magnitude</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">transaction_frequency</div>
                      <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                        {result.features.transaction_frequency} tx
                      </div>
                      <div className="text-[10px] text-slate-500">Rolling 2h window</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">time_of_day</div>
                      <div className="text-lg font-bold text-amber-400 font-mono mt-1">
                        {result.features.time_of_day.toFixed(2)}h
                      </div>
                      <div className="text-[10px] text-slate-500">Hour in decimal</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">recipient_frequency</div>
                      <div className="text-lg font-bold text-indigo-400 font-mono mt-1">
                        {(result.features.recipient_frequency * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-500">Payee interaction ratio</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">amount_deviation</div>
                      <div className={`text-lg font-bold font-mono mt-1 ${
                        result.features.amount_deviation >= 3 ? "text-rose-400" : "text-emerald-400"
                      }`}>
                        +{result.features.amount_deviation.toFixed(2)} std-dev
                      </div>
                      <div className="text-[10px] text-slate-500">Z-Score baseline delta</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">daily_transaction_count</div>
                      <div className="text-lg font-bold text-sky-400 font-mono mt-1">
                        {result.features.daily_transaction_count} tx
                      </div>
                      <div className="text-[10px] text-slate-500">Cumulative today</div>
                    </div>

                  </div>
                </div>

                {/* 3. Feature Attributions & Explanations */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Isolation Forest Attribution Flags:</span>
                  </div>
                  {result.anomaly_flags.length === 0 ? (
                    <div className="text-xs text-emerald-400 font-medium">
                      ✓ No dimensional anomalies identified. All 6 features reside comfortably within normal inlier clusters.
                    </div>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-300">
                      {result.anomaly_flags.map((flag, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
                <div className="h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <span>Running Scikit-Learn Isolation Forest inference...</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 2: THE 6 FEATURE VECTORS GUIDE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "features" && (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Layers className="h-6 w-6 text-cyan-400" />
              <span>The 6 Canonical Feature Dimensions for Anomaly Detection</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Extracted deterministically from transaction streams and ledger history before passing into Scikit-Learn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">1. transaction_amount</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Raw monetary value of the debit/credit. Serves as the primary magnitude metric for detecting catastrophic liquidation drains.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">2. transaction_frequency</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rolling 2-hour velocity window count. Detects rapid-fire bot automation, smurfing, and coerced panic transfers under duress.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">3. time_of_day</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Continuous 24-hour decimal clock representation (<code className="text-amber-300">hour + minute/60.0</code>). Catches off-peak late night account takeovers (01:00 - 05:00 AM).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">4. recipient_frequency</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Historical payee familiarity ratio (<code className="text-amber-300">past_tx_to_payee / total_history</code>). 0.00 immediately highlights first-time mule wallets.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">5. amount_deviation</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Statistical Z-Score deviation (<code className="text-amber-300">(amount - mean) / std_dev</code>). Measures standard deviations above the user's regular debit baseline.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-cyan-400 font-mono">6. daily_transaction_count</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Total transactions initiated across the calendar day. Discovers volume spikes exceeding regular behavioral patterns.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          TAB 3: MODEL ARCHITECTURE
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeTab === "architecture" && (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <GitBranch className="h-6 w-6 text-cyan-400" />
              <span>Scikit-Learn Isolation Forest Architecture</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Unsupervised anomaly detection partitioning feature spaces with ensemble decision trees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Estimators</div>
              <div className="text-2xl font-black text-cyan-400 font-mono mt-1">100 Trees</div>
              <div className="text-[10px] text-slate-500 mt-1">Randomized feature subspace</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Contamination</div>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">8.0%</div>
              <div className="text-[10px] text-slate-500 mt-1">Expected anomaly boundary</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Input Shape</div>
              <div className="text-2xl font-black text-indigo-400 font-mono mt-1">6 Dimensions</div>
              <div className="text-[10px] text-slate-500 mt-1">Normalized continuous vector</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold">Score Metric</div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">0 - 100 Scale</div>
              <div className="text-[10px] text-slate-500 mt-1">Derived from path length</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-cyan-400 font-bold">// Scikit-Learn Isolation Forest Implementation</div>
            <pre className="text-slate-400 overflow-x-auto leading-relaxed">
{`from sklearn.ensemble import IsolationForest

model = IsolationForest(
    n_estimators=100,
    contamination=0.08,
    random_state=42,
    max_samples="auto"
)
model.fit(X) # X shape: (N, 6)

raw_score = model.decision_function(X_tx)
prediction = model.predict(X_tx) # -1 = Outlier, +1 = Inlier`}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
